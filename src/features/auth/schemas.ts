import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(10, 'Au moins 10 caractères.')
  .regex(/[A-Za-z]/, 'Au moins une lettre.')
  .regex(/\d/, 'Au moins un chiffre.');

export const loginSchema = z.object({
  email: z.string().trim().email('Adresse e-mail invalide.'),
  password: z.string().min(1, 'Mot de passe requis.'),
});

export const signupStep1 = z.object({
  firstName: z.string().trim().min(2, 'Prénom requis.').max(60),
  lastName: z.string().trim().min(2, 'Nom requis.').max(60),
  middleName: z.string().trim().max(60).optional().or(z.literal('')),
  phone: z.string().trim().regex(/^\+?[0-9 ]{8,18}$/, 'Numéro invalide (format international conseillé : +243…).').optional().or(z.literal('')),
});

export const signupStep2 = z.object({
  country: z.string().trim().min(2, 'Pays requis.'),
  city: z.string().trim().min(2, 'Ville requise.'),
  parishId: z.string().optional(),
  sectionId: z.string().optional(),
});

export const signupStep3 = z
  .object({
    email: z.string().trim().email('Adresse e-mail invalide.'),
    password: passwordSchema,
    confirm: z.string(),
    consent: z.literal(true, { errorMap: () => ({ message: 'Votre consentement est nécessaire.' }) }),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Les mots de passe ne correspondent pas.' });

export const signupSchema = signupStep1.merge(signupStep2).and(signupStep3);
export type SignupValues = z.infer<typeof signupStep1> & z.infer<typeof signupStep2> & { email: string; password: string; confirm: string; consent: boolean };
