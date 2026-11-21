import { HEURE_MONDE_FICHIERS, HEURE_MONDE_FUSEAUX } from './heureMondeFichiers';

/**
 * Jingle de l'heure « autour du monde » : à chaque heure pile (heure de la RDC), une voix de femme
 * annonce l'heure en RDC et dans une ville où vivent des KCCistes (Los Angeles, Paris, Luanda…).
 * La ville dépend de l'heure ; son heure locale est calculée ici (heure d'été comprise) et choisit
 * le bon fichier : /radio/heure-monde/hHH-LL.mp3 (HH = heure RDC, LL = heure de la ville).
 * Fabriqué par tools/heure-monde/ (voir LISEZ-MOI.md).
 */
const hourIn = (d: Date, timeZone: string) =>
  Number(new Intl.DateTimeFormat('fr-FR', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(d)) % 24;

/** Le fichier à jouer à l'heure pile de `d`, ou null (fichier absent : l'ancienne annonce prend le relais). */
export function worldHourFile(d: Date): string | null {
  if (!HEURE_MONDE_FUSEAUX.length) return null;
  const h = hourIn(d, 'Africa/Kinshasa');
  const local = hourIn(d, HEURE_MONDE_FUSEAUX[h % HEURE_MONDE_FUSEAUX.length]);
  const name = `h${String(h).padStart(2, '0')}-${String(local).padStart(2, '0')}`;
  return HEURE_MONDE_FICHIERS.includes(name) ? `/radio/heure-monde/${name}.mp3` : null;
}
