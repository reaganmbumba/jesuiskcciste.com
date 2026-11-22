/**
 * Réglages partagés des notifications (site et Worker Cloudflare).
 * La clé publique VAPID n'est pas un secret : le navigateur en a besoin pour
 * s'abonner. Sa clé privée est le secret VAPID_PRIVATE_KEY du Worker.
 * Changer cette paire de clés désabonne tous les téléphones : ne pas y toucher.
 */
export const VAPID_PUBLIC_KEY = 'BCzua2ZUf0St1qZ-ffObxxud1CcJ3Y5INr7yEvoFkbTJ2WN0ELq4RcGpSaIQZSpVW33JYr_HKe9wh-e_63T56gk';
export const VAPID_SUBJECT = 'https://jesuiskcciste.com';

/** Sujets que la personne peut choisir. */
export const TOPICS = ['direct', 'communiques', 'predications'] as const;
export type Topic = (typeof TOPICS)[number];
