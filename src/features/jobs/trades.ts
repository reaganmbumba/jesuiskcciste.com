import type { Tri } from '@/i18n';

/**
 * Les domaines les plus recherchés en RD Congo et en Angola (liste donnée par
 * Reagan le 11/11/2026), plus les stages pour les jeunes. Une offre est classée
 * dans un domaine quand son titre contient l'un des mots ci-dessous, en
 * français, en portugais ou en anglais. Sert à mettre ces offres en avant
 * chaque jour (worker/jobs.ts) et aux raccourcis de la page /emplois.
 */
export interface Trade { key: string; label: Tri; words: RegExp }

const T = (key: string, fr: string, en: string, pt: string, words: RegExp): Trade => ({ key, label: { fr, en, pt }, words });

export const TRADES: Trade[] = [
  T('informatique', 'Informatique et nouvelles technologies', 'IT and new technologies', 'Informática e novas tecnologias',
    /(informati|développeur|desenvolvedor|developer|programm|programad|\bIT\b|réseau|redes|network|cyber|sécurité informatique|application|app mobile|mobile|data|données|dados|intelligence artificielle|inteligência artificial|\bIA\b|\bAI\b|machine learning|digital|numérique|software|logiciel|web|système|sistemas|systems|helpdesk|support technique)/i),
  T('sante', 'Santé et médecine', 'Health and medicine', 'Saúde e medicina',
    /(médecin|médic|medic|doctor|infirmi|enfermei|nurse|pharmac|farmac|laborant|laborat|sage-femme|parteira|midwife|radiolog|kiné|fisioterap|physiotherap|santé|saúde|health|sanitaire|hospital|hôpital|clinic|nutrition)/i),
  T('mines', 'Mines, pétrole et énergie', 'Mining, oil and energy', 'Minas, petróleo e energia',
    /(minier|mineur|mining|mineira|mina\b|mine\b|géolog|geólog|geolog|pétrol|petról|petroleum|oil|gas\b|gás|énergie|energia|energy|électric|eletric|electric|solaire|solar|renouvelable|renovável|renewable|\bHSE\b|QHSE|sécurité industrielle|segurança industrial|maintenance industrielle|manutenção industrial|environnement|ambiental|environment|drill|foreur)/i),
  T('commerce', 'Commerce et marketing', 'Sales and marketing', 'Comércio e marketing',
    /(commercial|vente|ventes|vendeu|vendedor|vendas|sales|marketing|community manager|communication|comunicação|clientèle|client|cliente|customer|business develop|développement commercial|caxeiro|caixeiro|loja|boutique)/i),
  T('finance', 'Finance et comptabilité', 'Finance and accounting', 'Finanças e contabilidade',
    /(comptab|contabil|accountant|accounting|audit|contrôleur de gestion|controller|controll|financ|crédit|crédito|credit|caissier|caixa|cashier|fiscal|tax\b|trésor|tesour|banc|banque|bank)/i),
  T('btp', 'BTP et construction', 'Building and construction', 'Construção civil',
    /(génie civil|genie civil|engenharia civil|civil engineer|architect|arquitet|conducteur des travaux|chef de chantier|chantier|obra|bâtiment|batiment|construction|construção|building|plombier|canalizador|plumber|dessinateur|desenhador|draftsman|maçon|pedreiro|\bBTP\b|topograph)/i),
  T('logistique', 'Logistique et transport', 'Logistics and transport', 'Logística e transporte',
    /(logisti|achat|compras|procurement|purchas|stock|armaz|entrepôt|warehouse|magasin|douane|alfândega|customs|transport|chauffeur|motorista|driver|approvision|supply chain|chaîne d.approvisionnement|fleet|flotte)/i),
  T('agriculture', 'Agriculture et agroalimentaire', 'Agriculture and food', 'Agricultura e agroalimentar',
    /(agronom|agricol|agrícol|agricult|agro|vétérinaire|veterinár|veterinar|élevage|pecuári|livestock|exploitation agricole|fazenda|alimentaire|alimentar|food|semence|sementes)/i),
  T('administration', 'Administration et gestion', 'Administration and management', 'Administração e gestão',
    /(administrati|secrétaire|secretári|secretary|assistant|assistente|ressources humaines|recursos humanos|human resources|\bRH\b|\bHR\b|recrut|recruit|juriste|jurista|jurídic|legal|lawyer|gestionnaire de projet|chef de projet|project manager|gestor de projeto|coordinat|coordenador|office manager|réception|recepcion)/i),
  T('enseignement', 'Enseignement et formation', 'Teaching and training', 'Ensino e formação',
    /(enseignant|enseignement|professeur|professor|teacher|formateur|formador|trainer|pédagog|pedagóg|éducat|educad|educator|école|escola|université|universidade|university|anglais|inglês|english)/i),
  T('stage', 'Stages et premiers emplois', 'Internships and first jobs', 'Estágios e primeiro emprego',
    /\b(stage|stagiaire|estágio|estagi|intern(ship)?|trainee|jeune diplômé|recém[- ]formad|graduate)/i),
];

/** Domaines d'une offre (clés de TRADES), d'après son titre et sa catégorie. */
export function jobTrades(j: { title: string; organization?: string | null; category?: string | null }): string[] {
  const text = `${j.title} ${j.category ?? ''}`;
  return TRADES.filter((t) => t.words.test(text)).map((t) => t.key);
}
