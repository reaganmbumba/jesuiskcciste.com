import { isDemoMode } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { repository, type Repository } from '@/services/repository';
import type { PagneOrder, PagneOrderStatus } from '@/types';

/**
 * Boutique des pagnes KCC (table `pagne_orders`).
 *
 * Le visiteur choisit ses modèles et remplit ses coordonnées. Au clic sur
 * « Commander », la commande :
 *   1. est enregistrée dans Supabase (visible dans Administration › Commandes de pagnes) ;
 *   2. est envoyée par e-mail à l'adresse de contact du site (service FormSubmit) ;
 *   3. s'ouvre dans WhatsApp, prête à être envoyée au numéro de contact du site.
 * Le vendeur rappelle ensuite le client pour le paiement et la livraison :
 * aucun paiement n'est demandé sur le site.
 */

export const PAGNE_PRICE = 25;
export const PAGNE_CURRENCY = 'USD';
export const MAX_PER_MODEL = 50;

export interface PagneModel { id: string; label: string; image: string; note?: string }

export const PAGNE_MODELS: PagneModel[] = [
  { id: 'apparition-kcc-1958', label: 'Apparition de KCC — 12 avril 1958', image: '/images/pagnes/apparition-kcc-1958.webp' },
  { id: 'kcc-68-ans', label: '68 ans de l’Église — 8 mars 1955', image: '/images/pagnes/kcc-68-ans.webp' },
  { id: 'bo-nsomi-1980', label: 'Bo Nsomi — 30 avril 1980', image: '/images/pagnes/bo-nsomi-1980.webp' },
  { id: 'bo-nsomi-portrait', label: 'Bo Nsomi — Prophète de l’Éternel', image: '/images/pagnes/bo-nsomi-portrait.webp' },
  { id: 'hommage-mission-accomplie', label: 'Hommage — Mission accomplie', image: '/images/pagnes/hommage-mission-accomplie.webp' },
  { id: 'oracle-2003', label: 'Oracle — 15 avril 2003', image: '/images/pagnes/oracle-2003.webp' },
  { id: 'sainte-convocation', label: 'La Sainte Convocation', image: '/images/pagnes/sainte-convocation.webp' },
  { id: 'sainte-convocation-langues', label: 'La Sainte Convocation (en plusieurs langues)', image: '/images/pagnes/sainte-convocation-langues.webp' },
  { id: 'autre', label: 'Autre modèle (à préciser)', image: '/images/pagnes/stock-modeles.webp', note: 'Décrivez le modèle voulu dans la remarque.' },
];

export const STOCK_PHOTOS = [
  { src: '/images/pagnes/stock-table.webp', alt: 'Pagnes KCC pliés sur une table' },
  { src: '/images/pagnes/stock-modeles.webp', alt: 'Différents modèles de pagnes KCC' },
  { src: '/images/pagnes/stock-pile.webp', alt: 'Pagnes KCC neufs sous emballage' },
];

export const ORDER_STATUS: Record<PagneOrderStatus, { label: string; tone: 'blue' | 'amber' | 'green' | 'neutral' | 'red' }> = {
  nouvelle: { label: 'Nouvelle', tone: 'blue' },
  contactee: { label: 'Client contacté', tone: 'amber' },
  payee: { label: 'Payée', tone: 'green' },
  livree: { label: 'Livrée', tone: 'neutral' },
  annulee: { label: 'Annulée', tone: 'red' },
};

export interface OrderLine { model: string; label: string; quantity: number }

export interface OrderInput {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  address: string;
  delivery: 'livraison' | 'retrait';
  note: string;
  items: OrderLine[];
}

export const orderQuantity = (items: OrderLine[]) => items.reduce((n, i) => n + i.quantity, 0);
export const orderTotal = (items: OrderLine[]) => orderQuantity(items) * PAGNE_PRICE;
export const usd = (n: number) => `${n.toLocaleString('fr-FR')} $`;

/** Référence courte à citer au téléphone : PGN-7K3Q9M. */
export function newReference(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `PGN-${Array.from(bytes, (b) => chars[b % chars.length]).join('')}`;
}

/** Numéro au format international sans « + » ni espaces, pour wa.me. Un numéro congolais local (08…) devient 2438…. */
export function whatsappNumber(phone: string): string {
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 10 && d.startsWith('0')) d = `243${d.slice(1)}`;
  return d;
}

/** Texte de la commande, repris dans WhatsApp et dans l'e-mail. */
export function orderMessage(reference: string, o: OrderInput): string {
  const lines: (string | null)[] = [
    `🛍️ Nouvelle commande de pagnes KCC — ${reference}`,
    '',
    ...o.items.map((i) => `• ${i.quantity} × ${i.label}`),
    '',
    `Total : ${orderQuantity(o.items)} pagne(s) × ${PAGNE_PRICE} $ = ${usd(orderTotal(o.items))}`,
    '',
    `Nom : ${o.fullName.trim()}`,
    `Téléphone : ${o.phone.trim()}`,
    o.email.trim() ? `E-mail : ${o.email.trim()}` : null,
    `Ville : ${o.city.trim()}, ${o.country.trim()}`,
    o.delivery === 'livraison' ? `Livraison : ${o.address.trim() || 'adresse à préciser'}` : 'Retrait sur place',
    o.note.trim() ? `Remarque : ${o.note.trim()}` : null,
    '',
    'Envoyé depuis jesuiskcciste.com/boutique/pagnes',
  ];
  return lines.filter((l): l is string => l !== null).join('\n');
}

export function whatsappOrderUrl(sellerPhone: string, message: string): string {
  return `https://wa.me/${whatsappNumber(sellerPhone)}?text=${encodeURIComponent(message)}`;
}

/** Contrôle des champs. Renvoie un message par champ en erreur. */
export function validateOrder(o: OrderInput): Partial<Record<keyof OrderInput, string>> {
  const e: Partial<Record<keyof OrderInput, string>> = {};
  if (o.fullName.trim().length < 2) e.fullName = 'Indiquez votre nom complet.';
  if (o.phone.replace(/\D/g, '').length < 8) e.phone = 'Indiquez un numéro de téléphone (de préférence WhatsApp).';
  if (o.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(o.email.trim())) e.email = 'Adresse e-mail invalide.';
  if (o.city.trim().length < 2) e.city = 'Indiquez votre ville.';
  if (o.country.trim().length < 2) e.country = 'Indiquez votre pays.';
  if (o.delivery === 'livraison' && o.address.trim().length < 4) e.address = 'Indiquez l’adresse ou le quartier de livraison.';
  if (!o.items.length || orderQuantity(o.items) < 1) e.items = 'Choisissez au moins un pagne.';
  if (o.items.some((i) => i.model === 'autre') && !o.note.trim()) e.note = 'Décrivez le modèle « Autre » souhaité.';
  return e;
}

const db = () => {
  if (!supabase) throw new Error('Supabase non configuré');
  return supabase;
};

function missingTable(e: unknown): boolean {
  const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  return code === '42P01' || code === 'PGRST205' || /pagne_orders.*(does not exist|schema cache)/i.test(msg);
}

let demoOrders: PagneOrder[] = [
  {
    id: 'pagne-demo-1', reference: 'PGN-EXEMPL', fullName: 'Client d’exemple', phone: '+243 800 000 000', email: null,
    city: 'Kinshasa', country: 'RD Congo', address: 'Gombe (exemple)', delivery: 'livraison',
    items: [{ model: 'oracle-2003', label: 'Oracle — 15 avril 2003', quantity: 2 }], quantity: 2, unitPrice: 25, total: 50,
    note: 'Commande de démonstration.', status: 'nouvelle', adminNote: null, createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

/** Enregistre la commande. Ne lit rien en retour : les visiteurs n'ont pas le droit de lire les commandes. */
export async function saveOrder(reference: string, o: OrderInput): Promise<'saved' | 'not-installed'> {
  const quantity = orderQuantity(o.items);
  const row = {
    reference, full_name: o.fullName.trim(), phone: o.phone.trim(), email: o.email.trim() || null,
    city: o.city.trim(), country: o.country.trim(), address: o.delivery === 'livraison' ? o.address.trim() || null : null,
    items: o.items, quantity, unit_price: PAGNE_PRICE, total: quantity * PAGNE_PRICE, delivery: o.delivery, note: o.note.trim() || null,
  };
  if (isDemoMode) {
    demoOrders = [{
      id: `pagne-demo-${Date.now()}`, reference, fullName: row.full_name, phone: row.phone, email: row.email, city: row.city, country: row.country,
      address: row.address, delivery: row.delivery, items: row.items, quantity, unitPrice: PAGNE_PRICE, total: row.total, note: row.note,
      status: 'nouvelle', adminNote: null, createdAt: new Date().toISOString(),
    }, ...demoOrders];
    return 'saved';
  }
  const { error } = await db().from('pagne_orders').insert(row);
  if (error) {
    if (missingTable(error)) return 'not-installed';
    throw error;
  }
  return 'saved';
}

/**
 * E-mail de la commande via FormSubmit (gratuit, sans compte).
 * La toute première commande déclenche un e-mail « Activate form » à
 * l'adresse de contact : il faut cliquer sur le lien une seule fois.
 */
export async function emailOrder(sellerEmail: string, reference: string, o: OrderInput): Promise<boolean> {
  if (isDemoMode || !sellerEmail) return false;
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(sellerEmail)}`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `Commande de pagnes ${reference} — ${usd(orderTotal(o.items))}`,
        _template: 'box',
        _captcha: 'false',
        ...(o.email.trim() ? { _replyto: o.email.trim() } : {}),
        Référence: reference,
        Commande: o.items.map((i) => `${i.quantity} × ${i.label}`).join(' ; '),
        Total: `${orderQuantity(o.items)} pagne(s) — ${usd(orderTotal(o.items))}`,
        Nom: o.fullName.trim(),
        Téléphone: o.phone.trim(),
        'E-mail': o.email.trim() || '—',
        Ville: `${o.city.trim()}, ${o.country.trim()}`,
        Livraison: o.delivery === 'livraison' ? o.address.trim() : 'Retrait sur place',
        Remarque: o.note.trim() || '—',
        WhatsApp_du_client: `https://wa.me/${whatsappNumber(o.phone)}`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Dépôt pour l'administration (lecture, statut, note interne, suppression). */
export const pagneOrdersRepo: Repository<PagneOrder> = isDemoMode
  ? {
      ...repository<PagneOrder>('pagne_orders', [], 'pagne'),
      async all() { return [...demoOrders]; },
      async get(id) { return demoOrders.find((o) => o.id === id) ?? null; },
      async update(id, patch) {
        demoOrders = demoOrders.map((o) => (o.id === id ? { ...o, ...patch, id } : o));
        return demoOrders.find((o) => o.id === id)!;
      },
      async remove(id) { demoOrders = demoOrders.filter((o) => o.id !== id); },
    }
  : repository<PagneOrder>('pagne_orders', [], 'pagne', '*', ['createdAt', 'updatedAt', 'items', 'reference', 'quantity', 'total', 'unitPrice']);

export function orderErrorText(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  if (/row-level security|permission denied/i.test(msg) || code === '42501') return 'Votre compte n’a pas accès aux commandes (administration centrale requise).';
  if (missingTable(e)) return 'La rubrique n’est pas encore installée dans Supabase : collez le fichier « pagnes-a-coller-dans-supabase.sql » dans le SQL Editor, cliquez sur Run, puis réessayez.';
  if (/failed to fetch|network|load failed/i.test(msg)) return 'Connexion interrompue. Vérifiez votre réseau puis réessayez.';
  return msg ? `L’opération a échoué : ${msg}` : 'L’opération a échoué.';
}
