import type { Tri } from '@/i18n';

/**
 * Les métiers les plus recherchés en RD Congo et en Angola. Une offre est
 * classée dans un métier quand son titre (ou son employeur) contient l'un des
 * mots ci-dessous, en français, en portugais ou en anglais. Sert à mettre ces
 * offres en avant chaque jour (worker/jobs.ts) et aux raccourcis de /emplois.
 */
export interface Trade { key: string; label: Tri; words: RegExp }

const T = (key: string, fr: string, en: string, pt: string, words: RegExp): Trade => ({ key, label: { fr, en, pt }, words });

export const TRADES: Trade[] = [
  T('stage', 'Stages et premiers emplois', 'Internships and first jobs', 'Estágios e primeiro emprego', /\b(stage|stagiaire|estágio|estagi|intern(ship)?|trainee|jeune diplômé|recém[- ]formad|junior|júnior)/i),
  T('compta', 'Comptabilité et finance', 'Accounting and finance', 'Contabilidade e finanças', /(comptab|contabil|accountant|financ|caissier|caixa|auditor|audit\b|fiscal|trésor|tesour|gestionnaire de fonds|banca|banque|bank)/i),
  T('admin', 'Secrétariat et administration', 'Administration and office', 'Secretariado e administração', /(secrétaire|secretári|secretary|assistant\(?e?\)? (de direction|administrati)|administrati|réception|recepcion|receptionist|office manager|ressources humaines|recursos humanos|\bRH\b|human resources)/i),
  T('sante', 'Santé', 'Health', 'Saúde', /(infirmi|enfermei|nurse|médecin|médic|medic|doctor|pharmac|farmac|santé|saúde|health|sage-femme|parteira|laborant|nutrition)/i),
  T('enseignement', 'Enseignement et formation', 'Teaching and training', 'Ensino e formação', /(enseignant|professeur|professor|teacher|formateur|formador|trainer|éducat|educad|école|escola)/i),
  T('informatique', 'Informatique et numérique', 'IT and digital', 'Informática e digital', /(informati|développeur|desenvolvedor|developer|programm|programad|\bIT\b|réseau|redes|network|data|digital|numérique|software|logiciel|web)/i),
  T('commerce', 'Vente et commerce', 'Sales and retail', 'Vendas e comércio', /(commercial|vente|vendeu|vendedor|sales|marketing|caxeiro|caixeiro|loja|boutique|client|cliente|customer)/i),
  T('chauffeur', 'Chauffeurs et transport', 'Drivers and transport', 'Motoristas e transporte', /(chauffeur|motorista|driver|conducteur|condutor|transport)/i),
  T('logistique', 'Logistique et achats', 'Logistics and procurement', 'Logística e compras', /(logisti|magasin|stock|armaz|approvision|procurement|achat|compras|supply)/i),
  T('technique', 'Ingénieurs et techniciens', 'Engineers and technicians', 'Engenheiros e técnicos', /(ingénieur|engenheir|engineer|technicien|técnico|technician|électric|eletric|electric|mécani|mecâni|mechanic|maintenance|manutenção|construction|construção|génie civil|btp|soudeur|plombier)/i),
  T('securite', 'Sécurité et gardiennage', 'Security', 'Segurança', /(sécurité|security|segurança|safety|gardien|vigil|guarda)/i),
  T('humanitaire', 'ONG et humanitaire', 'NGOs and humanitarian', 'ONG e humanitário', /(humanitaire|humanitarian|humanitári|protection|programme|program officer|\bWASH\b|\bEAH\b|\bONG\b|\bNGO\b|projet|project)/i),
];

/** Métiers d'une offre (clés de TRADES), d'après son titre et son employeur. */
export function jobTrades(j: { title: string; organization?: string | null; category?: string | null }): string[] {
  const text = `${j.title} ${j.category ?? ''}`;
  const out = TRADES.filter((t) => t.words.test(text)).map((t) => t.key);
  if (!out.includes('humanitaire') && /\b(ONG|NGO|UN[A-Z]+|OMS|WHO|PNUD|UNDP|UNICEF|UNHCR|HCR|PAM|WFP|Croix-Rouge|Red Cross|MSF|INSO|Solidarités|Oxfam|Caritas)\b/.test(j.organization ?? '')) out.push('humanitaire');
  return out;
}
