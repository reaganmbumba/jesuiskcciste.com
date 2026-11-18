/**
 * Réglages partagés des notifications (site et Worker Cloudflare).
 * La clé publique VAPID n'est pas un secret : le navigateur en a besoin pour
 * s'abonner. Sa clé privée est le secret VAPID_PRIVATE_KEY du Worker.
 * Changer cette paire de clés désabonne tous les téléphones : ne pas y toucher.
 */
export const VAPID_PUBLIC_KEY = 'BNBGMm03nE731oJ8z1j9FROctpsOnQFLB8JHCnxLvwqjSfd1aUUE8n-Eh1RGdBQe015KBKCjr1T5vQNYmF9UkIM';
export const VAPID_SUBJECT = 'https://jesuiskcciste.com';

/** Sujets que la personne peut choisir. */
export const TOPICS = ['direct', 'communiques', 'predications'] as const;
export type Topic = (typeof TOPICS)[number];
