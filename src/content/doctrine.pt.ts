/**
 * Versão portuguesa de src/content/doctrine.ts (mesma estrutura).
 * Traduzida dos textos oficiais em francês; as versões em lingala, kikongo,
 * suaíli e tshiluba dos textos da Lei são retomadas tal como estão.
 */
import * as FR from './doctrine';

const native = (id: string) => FR.lawTexts.find((l) => l.id === id)!.versions.filter((v) => v.lang !== 'Français' && v.lang !== 'English');

export const doctrineSource: string = 'Documentos oficiais da EBNM/KCC, Direção da Sede, Kinshasa (2004-2015). Tradução portuguesa dos textos franceses.';

export const specificities: typeof FR.specificities = [
  { label: 'Livro de trabalho', value: 'A Bíblia (Torá)' },
  { label: 'Religião', value: 'O KCCismo' },
  { label: 'Doutrina', value: 'O KCCismo' },
  { label: 'Aderente', value: 'O KCCista' },
  { label: 'Linha mestra', value: 'O monoteísmo radical' },
  { label: 'Deus', value: 'O Eterno, único Deus verdadeiro' },
];

export const kccApparition: typeof FR.kccApparition = {
  title: 'A aparição do KCC',
  date: '12 de abril de 1958, Boma',
  paragraphs: [
    'Na noite de 12 de abril de 1958, estando no seu quarto em Boma, o Profeta DIZOLELE-MPUNGU WAFIDUSWA Isaac teve uma visão: o céu abriu-se e apareceram três sinais, KCC, escritos em ouro.',
    'Logo ouviu uma voz que lhe disse: «Lê e interpreta estes sinais.» Como não conseguiu, a mesma voz leu-os e interpretou-os na sua língua materna, o kikongo. Depois da interpretação, os sinais desapareceram.',
    'Estes três sinais proféticos formam um todo indivisível: há a MENSAGEM e as suas duas qualidades, BOA e NOVA. A cor dourada exprime o valor desta mensagem. Seja qual for a língua, estas três consoantes pronunciam-se sempre «kasese».',
    'O KCCismo, doutrina e religião da Igreja, provém do KCC. Não é uma palavra inventada pela razão humana: foi o próprio Eterno que mostrou estes sinais ao seu Profeta para a salvação da humanidade.',
  ],
  letters: [
    { letter: 'K', kikongo: 'Nkanda', fr: 'Carta, livro, mensagem' },
    { letter: 'C', kikongo: 'Wambote', fr: 'Boa' },
    { letter: 'C', kikongo: 'Wampa', fr: 'Nova' },
  ],
  meaning: 'KCC = «Nkanda Wambote Wampa»: Boa Nova Mensagem (Bon Nouveau Message).',
};

export const oracle: typeof FR.oracle = {
  title: 'O Oráculo de 15 de abril de 2003',
  quote: '«Sejam quais forem os milagres que realize, um homem não pode ser Deus.»',
  paragraphs: [
    'Foi a 15 de abril de 2003 que o Eterno dirigiu este oráculo ao seu Profeta. Logo a sua inteligência se abriu e ele recebeu luz sobre o conhecimento do único Deus verdadeiro.',
    'O Eterno ordenou-lhe que proclamasse este oráculo, como recomendou ao Profeta Isaías (Is. 8:11-16). Por ele, a Igreja saiu do culto aos deuses estrangeiros para se apegar apenas ao Eterno e entrar na sua santa Aliança.',
    'O Oráculo anuncia o cumprimento do que o KCC tinha predito (Is. 42:9): a restauração da fé num Deus único, Criador do céu, da terra e de tudo o que neles há, único Redentor, a quem devemos glorificar, adorar, orar e em quem devemos confiar (Is. 43:10-11; 45:20-22).',
  ],
  attributes: ['Criador', 'Invisível', 'Imaterial', 'Incomparável', 'Sem imagem nem representação', 'Salvador', 'Soberano', 'Senhor', 'Redentor', 'Omnipotente', 'Omnisciente', 'Omnipresente', 'Imutável', 'Eterno', 'Um'],
};

export const professionOfFaith: typeof FR.professionOfFaith = {
  title: 'A Profissão de fé',
  rite: 'A assembleia levanta-se, com a mão direita erguida, e declara:',
  articles: [
    'Creio no Eterno Deus, de quem provém toda a vida. Ele é Um, Senhor dos senhores, Criador do céu, da terra e de tudo o que neles há.',
    'Creio na salvação que, pela sua graça, pela sua misericórdia e em seu Nome, o Eterno Deus ofereceu a toda a humanidade pela sua Aliança e pela sua Lei.',
    'Creio na Santa Palavra de Deus revelada aos seus profetas para a salvação da humanidade.',
    'Creio na imortalidade da alma e na vida eterna.',
    'Creio na remissão dos pecados pelo Eterno, pelo cumprimento da sua Lei e em seu Nome.',
    'Creio no juízo divino, na recompensa dos justos e no castigo eterno dos incrédulos.',
    'Creio que o Ungido de Deus DIZOLELE-MPUNGU WAFIDUSWA Isaac é Profeta enviado pelo Eterno Deus.',
    'Creio que a Église Bon Nouveau Message (KCC) vem de Deus, e que ela é una, santa e profética.',
  ],
  church: [
    { t: 'Una', d: 'Porque o seu fundador invisível, o Eterno, é um, e o seu fundador visível é um.' },
    { t: 'Santa', d: 'Porque é fruto da inspiração de Deus, que é santo.' },
    { t: 'Profética', d: 'Porque o seu fundador é Profeta e os seus ensinamentos provêm da linhagem dos profetas do Eterno.' },
  ],
};

export const lawTexts: typeof FR.lawTexts = [
  {
    id: 'alliance',
    title: 'As dez Palavras da Aliança',
    intro: 'O povo entra na Aliança do Eterno reconhecendo o Eterno como o único Deus verdadeiro e aceitando as suas Palavras.',
    versions: [
      { lang: 'Português (tradução)', items: [
        'Eu sou o Eterno, o vosso Deus: não terás outros deuses além de mim.',
        'Não farás para ti imagens esculpidas, não te prostrarás diante delas nem as servirás.',
        'Não invocarás em vão o nome do Eterno teu Deus, nem para apoiar a mentira.',
        'Lembra-te do dia de sábado para o santificar.',
        'Honra teu pai e tua mãe.',
        'Não matarás.',
        'Não cometerás adultério.',
        'Não furtarás.',
        'Não mentirás.',
        'Não cobiçarás nem o homem, nem a mulher, nem coisa alguma que pertença ao teu próximo.',
      ] },
      ...native('alliance'),
      FR.lawTexts[0].versions.find((v) => v.lang === 'English')!,
    ],
  },
  {
    id: 'commandements',
    title: 'Os sete mandamentos da Igreja',
    intro: 'Estabelecidos pelo Chefe Espiritual em Kinshasa, a 18 de fevereiro de 2015.',
    versions: [
      { lang: 'Português (tradução)', items: [
        'Não beber bebidas embriagantes nem fumar.',
        'Não consultar feiticeiros, adivinhos nem os mortos.',
        'Participar no culto do sábado e dos dias santos.',
        'Participar na comunhão fraterna e nas ofertas pacíficas anuais.',
        'Reconhecer que o casamento é uma união sagrada a preservar.',
        'Permanecer santo.',
        'Amar a Igreja, protegê-la e apoiá-la.',
      ] },
      ...native('commandements'),
    ],
  },
  {
    id: 'objectifs',
    title: 'Os cinco objetivos do ensino religioso',
    intro: 'Toda a pregação, seja qual for o auditório, deve visar um destes cinco objetivos (circular do Chefe Espiritual, 2014).',
    versions: [
      { lang: 'Português (tradução)', items: [
        'Revelar à humanidade o único Deus verdadeiro, o Eterno.',
        'Converter as almas perdidas ao Eterno Deus.',
        'Levar os homens a obedecer à Palavra do Eterno Deus e a cumprir a sua lei.',
        'Preservar os fiéis das falsas doutrinas.',
        'Ensinar os fiéis a viver no temor do Eterno para merecerem o reino dos céus.',
      ] },
      ...native('objectifs'),
    ],
  },
];

export const sacraments: typeof FR.sacraments = [
  { t: 'A confissão', d: 'O Eterno não pede nenhum sacrifício para perdoar: pede a decisão de deixar definitivamente de pecar e a sinceridade na confissão. Ele perdoa em seu próprio Nome.' },
  { t: 'A Primeira Unção', d: 'Sacramento pelo qual o homem reconhece o Eterno como seu único Deus e se compromete a amá-lo e servi-lo de todo o coração, de toda a alma e de todas as forças (Dt 29:9-12). Recebe-se uma só vez: é irreversível.' },
  { t: 'Os Atos de Aliança', d: 'Cerimónia em que o povo reconhece o Eterno como o único Deus verdadeiro, aceita as Palavras da Aliança e se compromete a honrar apenas o Eterno e a praticar as suas ordenanças, preceitos e mandamentos.' },
];

export const feasts: typeof FR.feasts = [
  { date: '1 de março', t: 'Nascimento do Profeta', d: 'Nascido a 1 de março de 1930 em Makaba (Luozi). Dia santo.' },
  { date: '8 de março', t: 'Nascimento da Igreja', d: 'Chamamento do Profeta, a 8 de março de 1955. Dia santo.' },
  { date: '12 de abril', t: 'Aparição do KCC', d: 'Os sinais KCC aparecem em Boma, a 12 de abril de 1958.' },
  { date: '15 de abril', t: 'Festa da Libertação (Oráculo)', d: 'Proclamação do Oráculo, a 15 de abril de 2003. Dia santo.' },
  { date: '30 de abril', t: 'Reconhecimento jurídico', d: 'Personalidade civil concedida pela Ordenança n.º 128-80 de 30 de abril de 1980.' },
  { date: 'Todos os anos', t: 'Festa da Aliança', d: 'Comemoração anual da entrada na Aliança do Eterno.' },
];

export const sabbathService: typeof FR.sabbathService = [
  { part: 'I. Introdução', steps: ['Saudação de paz', 'Hino de conjunto', 'Oração de invocação', 'Receção', 'Leitura da carta', 'Coro(s)', 'Hino de conjunto', 'Profissão de fé'] },
  { part: 'II. Palavra do Eterno', steps: ['Leitura bíblica', 'Juramento do Profeta (hino)', 'Hino de conjunto', 'Pregação', 'Oração de ação de graças', 'Coro(s)', 'Bênçãos diversas'] },
  { part: 'III. Ofertas e diversos', steps: ['Hinos de conjunto', 'Coro(s)', 'Oração pelas ofertas', 'Anúncios'] },
  { part: 'IV. Fim do culto', steps: ['Hino de conjunto', 'Palavra e oração ou bênção final'] },
];

export const prophetOath: typeof FR.prophetOath = {
  title: 'O Juramento do Profeta',
  paragraphs: [
    'Em 1966, um grupo de autoridades religiosas missionárias pediu ao Profeta que jurasse publicamente, diante de uma assembleia de mais de 500 pessoas, que mudaria a sua maneira de pregar.',
    'Nessa mesma noite o céu reagiu: um grupo de anjos veio ensinar-lhe um hino. No momento marcado, em vez de ceder, cantou esse hino com lágrimas nos olhos, com o Apóstolo UNKEBA. O seu conteúdo é um juramento: pregar apenas a verdade que se encontra na Bíblia. Com o Oráculo de 15 de abril, a Igreja compreendeu que essa Bíblia é a Torá.',
    'Este juramento é uma recomendação divina que todo o servo deve meditar antes de pregar. Por isso, em todo o grande culto, este hino é cantado antes da pregação.',
  ],
};

export const nameOfGod: typeof FR.nameOfGod = {
  title: 'Precisão sobre o nome do nosso Deus',
  paragraphs: [
    'Quando Moisés perguntou a Deus o seu nome, Deus respondeu: «Eu sou o Ser invariável.» E acrescentou: «Eu sou o Eterno, o Deus de vossos pais, o Deus de Abraão, de Isaac e de Jacob. Este é o meu nome para sempre, este será o meu título de geração em geração» (Êxodo 3:14-15).',
    'Na nossa época, para salvar as almas da idolatria, o mesmo Deus apareceu ao Profeta DIZOLELE e indicou-lhe o seu nome, recomendando-lhe que lesse o Salmo 136: «Dai graças ao Eterno, porque ele é bom, porque a sua misericórdia dura para sempre.»',
    'Desde 8 de março de 1955, o Profeta ensina ao mundo o Eterno: como adorá-lo, servi-lo, temê-lo e apoiar-se nele. Para o KCCista, o nosso Deus chama-se o Eterno.',
  ],
};

export const prophetTimeline: typeof FR.prophetTimeline = [
  { year: '1930', t: 'Nascimento', d: 'A 1 de março de 1930 em Makaba, setor de Kinkenge, território de Luozi (Baixo Congo, hoje Kongo Central).' },
  { year: '1940-1949', t: 'Estudos', d: 'Escolas protestantes de Makaba e de Luangu, depois a missão católica de Kidima. Mais tarde, estenodactilografia por correspondência (Institut national de sténographie de Bruxelas, 1957-1961).' },
  { year: '1950-1968', t: 'Vida profissional', d: 'Apontador, escriturário e depois secretário estenodactilógrafo em várias sociedades do Mayombe e de Boma, até à Société congolaise de surveillance (atual OCC).' },
  { year: '1955', t: 'O chamamento', d: 'De 8 a 13 de março de 1955, no acampamento Teli da sociedade Forakam (Seke-Banza), recebe aparições, visões e revelações. Tem 25 anos. O dia 8 de março de 1955 é a data de nascimento da Igreja.' },
  { year: '1956', t: 'Início da pregação', d: 'Após um tempo de fortalecimento pelo Eterno, começa a pregar a Palavra em Boma.' },
  { year: '1958', t: 'Aparição do KCC', d: 'A 12 de abril de 1958 em Boma, os três sinais KCC aparecem-lhe em letras de ouro.' },
  { year: '1958-1962', t: 'Missão no Manianga', d: 'Missão religiosa no Manianga.' },
  { year: '1966', t: 'O Juramento', d: 'Intimado a mudar a sua maneira de pregar, canta o hino recebido dos anjos, que se tornou o «Juramento do Profeta».' },
  { year: '1968', t: 'Ao serviço do Eterno', d: 'Deixa a vida profissional a 27 de fevereiro de 1968 e consagra-se inteiramente à Igreja nascente, como Fundador visível, Chefe Espiritual e Representante legal.' },
  { year: '1980', t: 'Reconhecimento jurídico', d: 'A Igreja obtém a personalidade civil pela Ordenança n.º 128-80 de 30 de abril de 1980, após 25 anos de existência.' },
  { year: '1976-2005', t: 'Missões', d: 'Kisangani, Bukavu, Lubumbashi; Bélgica, Suíça, Alemanha, França, Reino Unido; Angola (Luanda, Bengo, Soyo, Cabinda, Landana); Estados Unidos e Canadá; África do Sul. Seminário internacional de agricultura moderna em Israel (1989).' },
  { year: '2003', t: 'O Oráculo', d: '15 de abril de 2003: «Sejam quais forem os milagres que realize, um homem não pode ser Deus.»' },
  { year: '2005', t: 'Registo', d: 'A Igreja é registada no Ministério dos Assuntos Internos sob o n.º 0182 de 11 de outubro de 2005.' },
  { year: '2010', t: '«Mon Appel» (O meu chamamento)', d: 'Publicação do relato do seu chamamento, depois de «L’Éternel Dieu et le Salut de l’Humanité, Oracle» (2005).' },
];

export const prophetPortrait: typeof FR.prophetPortrait = [
  'A história do Profeta DIZOLELE-MPUNGU WAFIDUSWA Isaac não pode ser separada da história da Église Bon Nouveau Message (KCC), da qual é o Fundador visível e o Chefe Espiritual.',
  'Quando foi chamado, não pertencia a nenhuma Igreja. Como todos aqueles que o Eterno chama, resistiu primeiro, alegando que era apenas uma criança; teve de aceitar. Como os profetas antes dele, conheceu perseguições, calúnias, traições e prisões.',
  'Sabia que era Profeta mas nunca se proclamou como tal: foram a sua vida, as suas ações e a sua obra que o fizeram reconhecer como o eleito e o servo do Eterno (Is. 42:1).',
];

export const internationalPresence: typeof FR.internationalPresence = ['Angola: Luanda, Cabinda, Soyo', 'Congo-Brazzaville: Brazzaville, Pointe-Noire', 'Europa', 'África do Sul', 'América do Norte'];
