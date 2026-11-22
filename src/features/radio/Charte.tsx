import { useState } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/format';

/** Charte d'antenne : les règles que tout animateur de la radio s'engage à respecter. */
export const CHARTE: { titre: string; regles: string[] }[] = [
  { titre: 'Notre foi à l’antenne', regles: [
    'On salue toujours par « Paix à vous ».',
    'On prie l’Éternel (Yahwé) selon la doctrine du KCC, sans références ni récits d’autres confessions.',
    'On cite les enseignements du Prophète tels qu’ils sont, sans rien y ajouter ni en retrancher.',
    'On dit « Je suis KCCiste » (« ka-sé-siste »).',
  ] },
  { titre: 'Respect de l’Église', regles: [
    'On ne met pas à l’antenne les différends de la famille du Prophète, des responsables ou de la vie interne de l’Église.',
    'On ne juge personne et on ne règle pas de comptes à l’antenne.',
    'On n’annonce un fait de l’Église (date, décision, nomination) que s’il est confirmé par les responsables.',
  ] },
  { titre: 'Respect des auditeurs et des invités', regles: [
    'On ne lit jamais à l’antenne un numéro de téléphone, une adresse ou une information privée.',
    'Une intention de prière qui touche à la santé ou à la famille se lit avec discrétion (prénom seulement si la personne le souhaite).',
    'On prévient l’invité qu’il est à l’antenne avant de lui donner la parole.',
    'On coupe poliment un appel qui devient injurieux, politique ou hors sujet.',
  ] },
  { titre: 'Qualité de l’antenne', regles: [
    'On prépare son émission : sujet, chants et conduite prêts avant de passer en direct.',
    'On ne laisse pas de silence : un chant ou un jingle si l’on doit s’interrompre.',
    'On annonce l’émission suivante avant de rendre l’antenne.',
    'Pas de publicité ni d’annonce payante sans l’accord de l’administration.',
  ] },
];

export function Charte({ dark }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const c = dark
    ? { box: 'rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-white', hd: 'text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300', sub: 'text-white/60' }
    : { box: 'rounded border border-[#d3dae3] bg-white p-3 text-night', hd: 'text-[13px] font-bold uppercase tracking-wide text-[#2b3648]', sub: 'text-ink/65' };
  return (
    <section className={c.box}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={cn('flex w-full items-center justify-between gap-2', c.hd)}>
        <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" />Charte d’antenne</span>
        <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="mt-3 space-y-3 text-sm">
          {CHARTE.map((b) => (
            <div key={b.titre}>
              <p className="font-semibold">{b.titre}</p>
              <ul className={cn('mt-1 list-disc space-y-0.5 pl-5', c.sub)}>{b.regles.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
