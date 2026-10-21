/** Versão portuguesa de src/content/catechisme.ts (mesma estrutura). */
import type { CatechismGroup } from './catechisme';

export const catechismIntro = {
  title: 'O Catecismo do KCCismo',
  paragraphs: [
    'O catecismo é uma instrução religiosa: o resumo das verdades, das crenças e dos princípios fundamentais de uma religião, tal como já foram escritos ou proferidos por uma autoridade religiosa reconhecida.',
    'A Église Bon Nouveau Message (KCC) é uma obra de origem divina, nascida a 8 de março de 1955. Através de várias revelações, o Eterno Deus serviu-se do Profeta DIZOLELE para realizar esta obra: pôs nele a sua Palavra, como sempre fez com os seus profetas, para salvar a humanidade.',
    'Esta Palavra apareceu-lhe a 12 de abril de 1958 em Boma, pelo sinal KCC, que o próprio Eterno interpretou e qualificou de Mensagem Boa e Nova. A doutrina que dela emana chama-se KCCismo. Para facilitar o seu estudo, a Igreja resumiu-a em perguntas e respostas.',
  ],
};

export const catechism: CatechismGroup[] = [
  {
    id: 'croyances',
    title: 'As crenças',
    items: [
      { q: 'O que se entende por crença?', a: 'Uma crença é uma firme convicção na existência, no papel e no poder do ser ou do objeto sobre a vida de quem nele funda a sua fé.' },
      { q: 'Qual é a origem das crenças da EBNM?', a: 'São de origem divina: as inspirações do Eterno ao seu Profeta e as revelações do Eterno aos profetas bíblicos.' },
      { q: 'O que diz a primeira crença?', a: 'Creio no Eterno Deus de quem toda a vida procede. Ele é Um, Senhor dos senhores, Criador do céu, da terra e de tudo o que neles existe.' },
      { q: 'O que significa «de quem toda a vida procede»?', a: 'Trata-se da vida espiritual e da vida material.' },
      { q: 'O que significa «Criador do céu, da terra e de tudo o que neles existe»?', a: 'Trata-se de tudo o que existe, o visível e o invisível.' },
      { q: 'Qual é o sentido de «Ele é Um»?', a: 'Ao lado do Eterno não há outro, e nada se lhe assemelha. Ele conhece tudo o que existe e abrange toda a existência; só Ele pode tudo sobre tudo, e nada lhe resiste.' },
      { q: 'O que diz a segunda crença?', a: 'Creio na salvação que, pela sua graça, pela sua misericórdia e em seu Nome, o Eterno ofereceu à humanidade.' },
      { q: 'De que salvação se trata?', a: 'Da salvação espiritual, a salvação da alma. O Eterno ofereceu-a a toda a humanidade pela Aliança concluída com Israel: ela ensina-nos o que podemos fazer e o que não devemos fazer. Quem pratica a lei, a justiça e a virtude viverá (Ezequiel 18:21-22).' },
      { q: 'O que diz a terceira crença?', a: 'Creio na Santa Palavra de Deus revelada aos seus profetas para a salvação da humanidade.' },
      { q: 'De que Palavra se trata?', a: 'Da Palavra que o próprio Eterno transmitiu à humanidade pelos seus profetas, registada nas Sagradas Escrituras (a Bíblia hebraica).' },
      { q: 'O que diz a quarta crença?', a: 'Creio na imortalidade da alma e na vida eterna.' },
      { q: 'O que significa a imortalidade da alma?', a: 'A alma permanece imortal. No dia da morte, o corpo físico e a alma separam-se: o corpo volta à terra e a alma volta ao Eterno para aí viver eternamente; a do incrédulo vai para o castigo eterno.' },
      { q: 'A que se refere a vida eterna?', a: 'À glória de Deus: uma vida em que as almas dos justos viverão eternamente.' },
      { q: 'O que diz a crença sobre a remissão dos pecados?', a: 'Creio na remissão dos pecados pelo Eterno, pelo cumprimento da sua Lei e em seu Nome.' },
      { q: 'Que sacrifício pede o Eterno para perdoar?', a: 'Nenhum sacrifício. Pede a decisão de deixar definitivamente todo o pecado e a sinceridade na confissão.' },
      { q: 'O Eterno perdoa em nome de um espírito, de uma pessoa ou de uma coisa?', a: 'Não. O Eterno perdoa no seu próprio Nome.' },
      { q: 'O que diz a crença sobre o juízo?', a: 'Creio no juízo divino, na recompensa dos justos e no castigo eterno dos incrédulos.' },
      { q: 'O que é o juízo divino?', a: 'É o poder que o Eterno tem sobre o homem de o recompensar ou castigar, quando, onde e como quiser.' },
      { q: 'O que é a recompensa dos justos?', a: 'É o que o justo recebe do Eterno depois de o ter servido com justiça.' },
      { q: 'O que é o castigo eterno?', a: 'É o inferno: as punições espirituais que recebe do Eterno o incrédulo que desprezou a sua Lei durante toda a vida na terra.' },
      { q: 'O que diz a crença sobre o Profeta?', a: 'Creio que o Ungido do Eterno, DIZOLELE-MPUNGU WAFIDUSWA Isaac, é Profeta enviado pelo Eterno Deus.' },
      { q: 'Porque é preciso crer no Profeta?', a: 'Porque é uma recomendação que o Eterno faz desde os tempos antigos para a salvação: é pelo profeta que o Eterno traça o caminho da salvação, dando a sua Palavra.' },
      { q: 'O que diz a última crença?', a: 'Creio que a Église Bon Nouveau Message (KCC) vem de Deus, e que é una, santa e profética.' },
      { q: 'Porque é a Igreja una, santa e profética?', a: 'Una, porque o seu fundador invisível, o Eterno, é um e o seu fundador visível é um. Santa, porque é fruto da inspiração de Deus, que é santo. Profética, porque o seu fundador é Profeta e os seus ensinamentos provêm da linhagem dos profetas do Eterno.' },
    ],
  },
  {
    id: 'enseignement',
    title: 'O ensinamento',
    items: [
      { q: 'Na doutrina, o que se entende por ensinamento?', a: 'Os estatutos, ordenanças, preceitos e disciplinas definidos pelo Eterno através dos seus profetas para regular as relações entre o Eterno e os homens.' },
      { q: 'Quais são as fontes do ensinamento da EBNM?', a: 'A Bíblia (Torá) e o Profeta: as suas revelações, recomendações e oráculos sobre o verdadeiro sentido dos conceitos religiosos, as inovações litúrgicas e a interpretação das Escrituras.' },
    ],
  },
  {
    id: 'fetes',
    title: 'Festas e sacramentos',
    items: [
      { q: 'Quais são as festas eclesiásticas da EBNM?', a: 'As festas da Igreja são:', list: ['O nascimento do Profeta: 1 de março', 'O nascimento da Igreja: 8 de março', 'A aparição do KCC: 12 de abril', 'A festa da libertação (o Oráculo): 15 de abril', 'O reconhecimento jurídico: 30 de abril'] },
      { q: 'Quais destas festas são dias santos?', a: '1 de março, 8 de março e 15 de abril.' },
      { q: 'Quando nasceu o Profeta?', a: 'A 1 de março de 1930.' },
      { q: 'Quando nasceu a Igreja?', a: 'A 8 de março de 1955.' },
      { q: 'Quando apareceu o KCC?', a: 'A 12 de abril de 1958.' },
      { q: 'Quando foi a Igreja reconhecida juridicamente?', a: 'A 30 de abril de 1980.' },
      { q: 'Quando foi dado o Oráculo?', a: 'A 15 de abril de 2003.' },
      { q: 'Quantos sacramentos administra a EBNM?', a: 'Três sacramentos:', list: ['A confissão (purificação)', 'A Primeira Unção', 'Os Atos de Aliança'] },
      { q: 'O que significa a Primeira Unção?', a: 'É o sacramento pelo qual o homem reconhece o Eterno como seu único Deus e se compromete a amá-lo e servi-lo de todo o coração, de toda a alma e com todas as forças; por seu lado, o Eterno imprime o seu Nome na alma do beneficiário.' },
      { q: 'Quantas vezes se pode receber a Primeira Unção?', a: 'Uma única vez na Igreja, porque este sacramento tem caráter irreversível.' },
      { q: 'O que se entende por sacramento dos Atos de Aliança?', a: 'É a cerimónia em que o povo reconhece o Eterno como o único verdadeiro Deus, aceita as Palavras da Aliança e se compromete a honrar só o Eterno e a praticar as suas ordenanças, preceitos e mandamentos.' },
    ],
  },
  {
    id: 'alliance',
    title: 'A Aliança e os mandamentos',
    items: [
      { q: 'Quais são as Palavras da Aliança?', a: 'As dez Palavras da Aliança são:', list: ['Eu sou o Eterno, vosso Deus: não terás outro deus além de mim.', 'Não farás imagens esculpidas, não te prostrarás diante delas nem as servirás.', 'Não invocarás o Nome do Eterno teu Deus em vão nem em apoio da mentira.', 'Lembra-te do dia de sábado para o santificar.', 'Honra teu pai e tua mãe.', 'Não matarás.', 'Não cometerás adultério.', 'Não roubarás.', 'Não mentirás.', 'Não cobiçarás o homem, a mulher nem coisa alguma do teu próximo.'] },
      { q: 'Quais são os mandamentos da Igreja?', a: 'Os sete mandamentos da Igreja são:', list: ['Não beber bebidas embriagantes nem fumar.', 'Não consultar feiticeiros, adivinhos nem os mortos.', 'Participar no culto do sábado e dos dias santos.', 'Participar na comunhão fraterna e nas ofertas pacíficas anuais.', 'Reconhecer que o casamento é uma união sagrada a preservar.', 'Permanecer santo.', 'Amar a Igreja, protegê-la e apoiá-la.'] },
    ],
  },
  {
    id: 'vrai-dieu',
    title: 'O verdadeiro Deus, o Eterno',
    items: [
      { q: 'Qual é o Oráculo do Eterno Deus ao Profeta DIZOLELE-MPUNGU WAFIDUSWA Isaac?', a: '«Sejam quais forem os milagres que realize, um homem não pode ser Deus.»' },
      { q: 'Quando deu o Eterno este Oráculo?', a: 'A 15 de abril de 2003.' },
      { q: 'O que quer o Eterno Deus neste Oráculo?', a: 'O Eterno apresentou-se como o único verdadeiro Deus a quem orar, servir, glorificar e venerar.' },
      { q: 'Como se pode compreender o Eterno?', a: 'Através dos seus atributos.' },
      { q: 'Quais são esses atributos?', a: 'O Eterno é:', list: ['Criador', 'Invisível', 'Imaterial', 'Incomparável, semelhante a nenhum ser', 'Sem imagem nem representação, sem forma concebível pela inteligência humana', 'Salvador', 'Soberano', 'Senhor', 'Redentor', 'Omnipotente', 'Omnisciente', 'Omnipresente', 'Imutável', 'Eterno', 'Um'] },
    ],
  },
];

export const neophytePath = {
  title: 'O percurso do neófito',
  intro: 'Para se tornar membro, todo o novo convertido recebe três sacramentos. Eis o que os responsáveis paroquiais lhe ensinam antes de cada um.',
  steps: [
    { name: 'A Purificação', learn: ['As dez Palavras da Aliança', 'Os sete mandamentos da Igreja', 'A Profissão de fé', 'A oração de purificação', 'Os cinco objetivos do ensino religioso'] },
    { name: 'A Primeira Unção', learn: ['Os compromissos a assumir perante o Eterno, na presença do seu povo'] },
    { name: 'Os Atos de Aliança', learn: ['As orações das cerimónias, tal como constam dos textos litúrgicos'] },
  ],
  source: 'Circular da Direção da Sede aos responsáveis paroquiais, 2014.',
};

export const catechismSource: string = 'O Catecismo, Direção da Sede da EBNM, Kinshasa.';
