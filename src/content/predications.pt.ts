/** Versão portuguesa de src/content/predications.ts (mesma estrutura). */
import type { Sermon } from './predications';

export const sermonThemes: Record<Sermon['theme'], string> = {
  alliance: 'A Aliança',
  prophete: 'O Profeta',
  salut: 'A salvação',
  parole: 'A Palavra',
};

export const sermons: Sermon[] = [
  {
    id: 'notion-alliance',
    title: 'A noção de Aliança',
    text: 'Êxodo 24:1-11',
    place: 'Templo Central KCC (Kinshasa)',
    theme: 'alliance',
    keyPoint: 'O sangue não é a Aliança: são as dez Palavras que constituem a Aliança.',
    paragraphs: [
      'Na sua soberania, o Eterno estabeleceu com Israel, por Moisés, uma Aliança regida pelos dez mandamentos. Moisés leu-a ao povo que, compreendendo que tratar com o Eterno é uma graça e motivo de alegria, a aceitou livremente.',
      'Para a Aliança, o Eterno não impõe nada a ninguém: deixa ao povo a liberdade de aceitar ou recusar. O sangue dos animais oferecidos, que Moisés aspergiu sobre o povo e sobre o altar, é o símbolo que prova que a Aliança foi aceite; mas são as dez Palavras que constituem a Aliança.',
      'Depois das ofertas, Israel comeu numa grande festa em memória da Aliança. Na nossa geração comemos uma refeição simbólica, o «pão da Aliança», para exprimir a nossa gratidão, e depois damos uma oferta. Abramos os corações para receber esta Aliança e as bênçãos do Eterno.',
    ],
  },
  {
    id: 'fete-alliance-2013',
    title: 'A festa da Aliança',
    text: 'Deuteronómio 1:1-4',
    date: '7 de julho de 2013',
    theme: 'alliance',
    keyPoint: 'É na lei que se encontra o céu.',
    paragraphs: [
      'Quarenta anos depois da saída do Egito, Moisés recorda a Lei a uma nova geração que não tinha estado no Sinai: «Esta lei não foi dada só aos que estavam no Horeb, mas a todos vós que aqui estais», isto é, a toda a humanidade.',
      'A saída do Egito só tinha trazido a Israel uma salvação material; a Aliança trouxe-lhe a salvação espiritual. Por Aliança entende-se a Lei do Eterno: os dez mandamentos, mas também os seus preceitos, regras e estatutos. Pode-se conhecer o Nome do Eterno sem aceitar a sua Lei; para ter a salvação, é preciso aceitar a sua Lei.',
      'O Profeta recorda que, no início do seu chamamento, quis fugir da Lei, mas o Eterno reteve-o. Tornámo-nos o seu povo porque amamos a sua Lei: alegremo-nos com a Aliança e saibamos o seu valor.',
    ],
  },
  {
    id: 'precision-alliance',
    title: 'Precisão sobre a Aliança do Eterno',
    text: 'Génesis 9:9-11; Génesis 17:9-14; Êxodo 20:1-14',
    date: '2012 (carta circular)',
    theme: 'alliance',
    keyPoint: 'A Aliança do Horeb é a raiz principal da salvação de toda a criatura humana.',
    paragraphs: [
      'Desde a criação, o Eterno concluiu várias alianças: com Noé, todos os seres vivos e a terra; com Abraão; com Israel; com David. No caminho do KCC, concluiu também alianças connosco.',
      'Mas a Aliança concluída no monte Horeb com Israel continua a ser a mais importante, porque é a raiz da salvação de todos os homens sem distinção. «A própria razão da minha vinda entre vós é introduzir-vos, pelo Oráculo de 15 de abril de 2003, nesta Aliança.» Todos são convidados a permanecer nela e a comemorar todos os anos a festa da Aliança.',
    ],
  },
  {
    id: 'ezechiel-2',
    title: 'Não temas, prega esta palavra',
    text: 'Ezequiel 2:6-10 e 3:1-8',
    place: 'Templo Central KCC',
    theme: 'prophete',
    keyPoint: 'Recebei gratuitamente esta mensagem, sem sacrifício, e obedecei-lhe.',
    paragraphs: [
      'A Ezequiel, o Eterno anuncia que encontrará espinhos e escorpiões, uma casa rebelde: «Não os temas. Quer ouçam quer recusem, tu prega.» Esta boa palavra tem o sabor do mel.',
      'O Profeta testemunha que o Eterno o preparou da mesma maneira: em visão, fê-lo passar entre jiboias, búfalos e cães ferozes, imagens dos corações resistentes que iria encontrar. No caminho atiraram-lhe pedras e prenderam-no; arriscou a morte, mas o Eterno protegeu-o para que a mensagem chegasse. Três anos depois do seu chamamento, o Eterno deu-lhe o KCC: Nkanda Wambote Wampa.',
      '«Foi pela vossa salvação que tanto arrisquei. Recebei esta mensagem gratuitamente, sem sacrifício, e não a estragueis com os vossos comportamentos. A mensagem é dar a conhecer ao mundo quem é o Eterno, quem é Deus: temamo-lo, obedeçamos-lhe e creiamos nele.»',
    ],
  },
  {
    id: 'mer-rouge-2015',
    title: 'O Eterno, nosso Deus e nossa salvação',
    text: 'Êxodo 14:30-31 e 15:1-2',
    date: 'Sábado, 4 de maio de 2015',
    place: 'Paróquia de Ozone (Kinshasa)',
    theme: 'salut',
    keyPoint: 'A exemplo de Israel, louvamos o Eterno e tomamo-lo como nosso Deus e nossa salvação.',
    paragraphs: [
      'Diante do mar Vermelho, perseguido pelos egípcios, Israel viu o Eterno libertá-lo; teve fé no Eterno e em Moisés, seu servo, e cantou: «O Eterno é a minha força e o meu cântico, Ele foi a minha salvação.»',
      'O Chefe Espiritual compara este relato com a longa luta pelo reconhecimento jurídico da Igreja: o pedido foi primeiro rejeitado e muitos queriam destruir o projeto; pelo caminho, o Eterno avisou-o para não confiar o processo a uma pessoa mal-intencionada. Por fim, a personalidade civil foi obtida: «Foi o Eterno que nos ajudou; por nós mesmos era praticamente impossível.»',
      'A salvação de que fala a profissão de fé é a salvação espiritual, oferecida pela Aliança: saber o que se pode fazer e o que não se deve fazer. Quem pratica a lei, a justiça e a virtude viverá (Ezequiel 18:21-22).',
    ],
  },
  {
    id: 'paque-kcciste',
    title: 'A Páscoa KCCista, festa da libertação',
    text: 'Deuteronómio 16:1; Êxodo 12:2; Êxodo 13:4-7',
    theme: 'salut',
    keyPoint: 'A Páscoa KCCista celebra-se pelos Atos de Aliança e pelo pão da Aliança.',
    paragraphs: [
      'Na Torá, a Páscoa é uma festa recomendada pelo Eterno aos hebreus em memória da sua libertação do Egito: uma refeição em honra do Eterno. A palavra «Páscoa» tem o sentido de saída, de libertação espiritual, política, social e religiosa.',
      'Pelo Oráculo de 15 de abril de 2003, o Eterno revelou que um homem não pode ser Deus, sejam quais forem os milagres que realize. Este oráculo fez a Igreja sair do culto do homem para entrar no culto do Eterno e na sua Aliança: uma grande libertação espiritual.',
      'É esta saída que os KCCistas comemoram na festa da libertação. Celebra-se pelos Atos de Aliança, durante os quais se come o pão da Aliança em memória da Aliança concluída entre o Eterno e o seu povo pelas dez Palavras.',
    ],
  },
  {
    id: 'lumiere-eternel',
    title: 'Caminhemos na luz do Eterno',
    text: 'Isaías 2:5',
    date: '14 de agosto de 2012',
    place: 'Templo Central KCC, abertura do seminário da juventude da Europa',
    theme: 'parole',
    keyPoint: 'Tudo o que o Eterno nos ensina através do Profeta para a nossa salvação chama-se KCCismo.',
    paragraphs: [
      '«Casa de Jacob, vinde, caminhemos na luz do Eterno.» Por luz do Eterno entende-se a sua doutrina: as suas palavras, os seus ensinamentos e a sua lei. Israel compromete-se a que a sua maneira de agir, de falar e de se comportar seja conforme à doutrina do Eterno.',
      'A exemplo de Israel, o KCCista deve viver na sua geração o que o Eterno lhe ensina através do Profeta colocado entre nós. O juramento do Profeta di-lo: «Mena mu bibila, mena mu kia»; «kia» é a luz de que se trata. Somos chamados a tornar-nos discípulos do Eterno e de mais ninguém.',
    ],
  },
  {
    id: 'quel-livre',
    title: 'Que livro usar para pregar a Palavra?',
    text: 'Isaías 2:5',
    date: '26 de abril de 2014',
    place: 'Seminário de formação dos servos, Kinshasa',
    theme: 'parole',
    keyPoint: 'A EBNM prega com a Torá, a Bíblia hebraica, do Génesis ao segundo livro das Crónicas.',
    paragraphs: [
      'Todo o servo (apóstolo, pregador, discípulo, diaconisa) deve saber que livro usar para pregar. É a Bíblia; mas existem várias bíblias e várias traduções.',
      'Para evitar as confusões criadas pelos tradutores, a Igreja adotou a Torá, a Bíblia hebraica, que começa pelo Génesis e termina no segundo livro das Crónicas, o livro dos cumprimentos. O Chefe Espiritual precisa que as outras bíblias não são más e que usá-las não é pecado: esta escolha serve a unidade e a fiabilidade do ensino.',
    ],
  },
];

export const seminars = [
  { date: '19 e 25 de abril de 2003', title: 'Seminário com os chefes de entidades', place: 'Direção da Sede, Kinshasa', d: 'Ensinamentos que se seguem ao Oráculo de 15 de abril de 2003: a vida depois da morte e o perdão dos pecados.' },
  { date: '16 de junho de 2008', title: 'Seminário das mamãs sobre a doutrina', place: 'Paróquia de Masina, Kinshasa', d: 'Os mandamentos da Igreja e a Aliança do Sinai: «A 15 de abril de 2003 recebemos a nossa constituição religiosa.»' },
  { date: '14 – 17 de agosto de 2012', title: 'Seminário da juventude da Europa', place: 'Templo Central KCC, Kinshasa', d: 'Tema: «O KCCismo, fruto de uma revelação divina». Origem da Igreja e dos sinais KCC, profissão de fé, sacramentos.' },
  { date: '26 de abril de 2014', title: 'Seminário de formação dos servos', place: 'Kinshasa', d: 'O livro de trabalho da Igreja (a Torá) e a noção de salvação no KCCismo.' },
  { date: '1 – 4 de abril de 2015', title: 'Seminário de formação dos servos da cidade de Kinshasa', place: 'Templo Central KCC', d: 'Quatro dias animados por Sua Eminência o Chefe Espiritual.' },
];

export const sermonsSource: string = 'Relatórios de seminários e notas de pregações, Direção da Sede da EBNM (2003-2015).';
