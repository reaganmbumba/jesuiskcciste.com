/** Versão portuguesa de src/content/liturgie.ts (mesma estrutura). Os textos em lingala e kikongo mantêm-se no original. */
import type { Rite } from './liturgie';

export const liturgyIntro = {
  title: 'Os ritos e as cerimónias',
  quote: 'No KCCismo, os ritos e as cerimónias são atos sagrados que conferem à liturgia da Église Bon Nouveau Message (KCC) a solenidade e a glória destinadas ao Eterno Deus.',
  paragraphs: [
    'O oficiante consagrado a estes atos deve interiorizá-los e executá-los com competência e inspiração, sob a orientação do Eterno Deus. Por isso o Chefe Espiritual reuniu-os numa brochura, instrumento de trabalho para o culto sabático, a purificação, a primeira unção, o enterro, a bênção das crianças, a bênção nupcial, os Atos de Aliança e a dedicação dos templos.',
    'Os fundamentos bíblicos e doutrinais de cada cerimónia estão definidos no grande livro do KCCismo. Todas as orações terminam com a aclamação da assembleia.',
  ],
  acclamation: 'Aleluia! Vem, Senhor Eterno, pelo Teu Santo Nome.',
  source: 'Textos litúrgicos 2014, Église Bon Nouveau Message (KCC), o Chefe Espiritual.',
};

export const rites: Rite[] = [
  {
    id: 'sabbat',
    title: 'O culto sabático',
    when: 'Cada sábado',
    summary: 'O culto ordinário do sábado decorre em quatro partes, da oração de invocação à bênção final. A Profissão de fé é declarada por toda a assembleia, de pé, com a mão direita levantada.',
    programme: [
      { part: 'I. Introdução', steps: ['Saudação de paz', 'Cântico de conjunto', 'Oração de invocação', 'Receção', 'Leitura da carta', 'Coro(s)', 'Cântico de conjunto', 'Profissão de fé'] },
      { part: 'II. Palavra do Eterno', steps: ['Leitura bíblica', 'Juramento do Profeta', 'Cântico de conjunto', 'Pregação', 'Oração de ação de graças', 'Coro(s)', 'Diversas bênçãos'] },
      { part: 'III. Ofertas e diversos', steps: ['Cânticos de conjunto', 'Coro(s)', 'Oração pelas ofertas', 'Anúncios'] },
      { part: 'IV. Fim do culto', steps: ['Cântico de conjunto', 'Palavra e oração ou bênção final'] },
    ],
  },
  {
    id: 'purification',
    title: 'A purificação (confissão)',
    when: 'Primeiro sacramento do neófito',
    summary: 'O confessante confessa os seus pecados diante do Eterno e de testemunhas; depois o oficiante pronuncia a absolvição em Nome do Eterno. O Eterno não pede nenhum sacrifício: apenas a decisão sincera de não voltar a pecar.',
    programme: [{ steps: ['Cântico', 'Oração de abertura', 'Chamada do confessante', 'Início da confissão', 'Confissão dos pecados', 'Fim da confissão', 'Palavra do oficiante', 'Absolvição dos pecados', 'Saída do confessante', 'Cântico', 'Oração de encerramento'] }],
    texts: [
      { title: 'Maloba ya ntubela', lang: 'Lingala', tab: true, lines: [], parts: [
        { title: 'Maloba ya ebandeli', lines: ['Na kombo nayo Monsantu Yawe,', 'na fukami liboso bua yo pona ko ntubela masumu nanga', 'mpo tete na zua bilimbisi.'] },
        { title: 'Maloba ma bosilisi', lines: ['Na kombo nayo Mosantu, oh Yawe, na sengi,', 'olimbisa ngai na mabunga ma ngai manso.', 'Tika ete ejala bongo na kombo nayo Mosantu.'] },
        { title: 'Maloba ma bolimbisi', lines: ['Solo, tondimi ete yo Yawe Njambe Mokeli mwa biso, ojali bulee,', 'pe olimbisi ye na mabunga naye manso.', 'Tika ete ezala bango na kombo nayo Mosantu.', 'Alléluia !! Yaka Nkolo Yawe na nkombo nayo Mosantu.'] },
      ] },
      { title: 'Mpova za mpedoso', lang: 'Kikongo', tab: true, lines: [], parts: [
        { title: 'Mpova ya ntete', lines: ['Mu nkumbu aku ya nlongo, oh Yaveh,', 'mfukamene va ntadisi aku mukulomba ngiambudulu mu ntulumunu zami', 'mu tambula ngiambudulu kua ngeye.'] },
        { title: 'Mpova mu manisi', lines: ['Mu nkumbu aku ya nlongo, ngieti kulomba mutu', 'ngiambudila masumu mami mamosono mayavengi.', 'Bika buakala bobo mu nkumbu aku ya nlongo.'] },
        { title: 'Mpova ya ngiambudulu', lines: ['Mukedika, tulekele minu vo ngeye Yave Nzambi eto, wena wa nlongo', 'ye meni kunyambudila mu ntulumunu zandi.', 'Bika buakala bobo mu nkumbu aku ya nlongo.', 'Alléluia !! Wiza Mfumu Yaveh, mu nkumbu aku ya nlongo.'] },
      ] },
      { title: 'Início da confissão', lines: ['Pelo Teu Santo Nome, Eterno Deus,', 'ajoelho-me diante de Ti', 'para confessar os meus pecados', 'a fim de ser perdoado.'] },
      { title: 'Fim da confissão', lines: ['Pelo Teu Santo Nome, Eterno,', 'por tudo o que conheço', 'e por tudo o que já não recordo,', 'peço-Te, ó Eterno Deus, que me perdoes pelo Teu Santo Nome,', 'e a vós também, suas testemunhas,', 'porque resolvi não voltar a fazê-lo.', 'Sim, que assim seja pelo Teu Santo Nome.'] },
      { title: 'Absolvição', lines: ['Na verdade, cremos que Tu, Eterno Deus, nosso Criador, és santo e queres que o Teu povo seja santo.', 'O nosso irmão (a nossa irmã) acaba de confessar todos os seus pecados para obter o Teu perdão. Sim, creio que lho concedeste pelo Teu Nome.', 'Às testemunhas: «Quereis também que seja perdoado?» – «Sim, queremos que seja perdoado em Nome do Eterno Deus.»', 'Levanta-te, crê e alegra-te, porque os teus pecados são perdoados pelo Eterno Deus. Sim, que assim seja pelo Seu Santo Nome.'] },
    ],
    notes: ['A oração de arrependimento (confissão e absolvição) diz-se também em lingala, «Maloba ya ntubela», e em kikongo, «Mpova za mpedoso».'],
  },
  {
    id: 'onction',
    title: 'A Primeira Unção',
    when: 'Ao sábado às 15 h, durante um culto paroquial (circular de 3 de março de 2015)',
    bible: 'Deuteronómio 29:9-12; Números 6:22-27',
    summary: 'Pela Primeira Unção, o homem entra na Aliança do Eterno e leva na sua alma o Nome do Eterno. Só se recebe uma vez. O conselho paroquial organiza este culto depois de uma boa preparação dos neófitos; para uma ou duas pessoas, a unção pode ser dada no fim do culto sabático. Cada beneficiário recebe um «Cartão da Primeira Unção», numerado e registado na paróquia.',
    programme: [{ steps: ['Cântico', 'Oração de invocação', 'Cântico', 'Pregação (Deut. 29:9-12)', 'Oração de ação de graças', 'Chamada nominal', 'Receção do oficiante', 'Declaração', 'Aplausos', 'Unção', 'Apresentação', 'Anúncios', 'Bênção final'] }],
    texts: [
      { title: 'Declaração do beneficiário', lang: 'Français', tab: true, lines: ['L’Éternel est notre Dieu, l’Éternel est un !', 'J’aimerai et servirai l’Éternel mon Dieu', 'de tout mon cœur,', 'de toute mon âme', 'et de toute ma force.', 'Qu’il en soit ainsi au Nom de l’Éternel !'] },
      { title: 'Tradução portuguesa', lang: 'Português', tab: true, lines: ['O Eterno é o nosso Deus, o Eterno é um!', 'Amarei e servirei o Eterno meu Deus', 'de todo o meu coração,', 'de toda a minha alma', 'e com todas as minhas forças.', 'Que assim seja em Nome do Eterno!'] },
      { title: 'Litatoli', lang: 'Lingala', tab: true, lines: ['Yawe azali Nzambe na biso, Yawe azali se moko', 'Nakolinga mpe kosalela Yawe Nzambe na ngai', 'na motema na ngai mobimba,', 'na molimo na ngai mobimba', 'mpe na makasi na ngai nyonso.', 'Tika ete ezala bongo na nkombo na Yawe !'] },
      { title: 'Mpova', lang: 'Kikongo', tab: true, lines: ['Yave i Nzambi eto, Yave wena umosi kaka', 'Mono ngina zola ye sadila Yave Nzambi ami', 'mu ntim’ami wa mvimba,', 'mu muel’ami wa mvimba', 'ye mu ngolo zami zazo.', 'Bika buakala bobo mu nkumbu a Yave !'] },
      { title: 'Unção (bênção)', lang: 'Português', lines: ['Que o Eterno te abençoe e te guarde!', 'Que o Eterno faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti!', 'Que o Eterno volte para ti o seu olhar e te conceda a paz, hoje e para sempre!', 'Que assim seja em Nome do Eterno!'] },
      { title: 'Apresentação à assembleia', lang: 'Português', lines: ['Estes irmãos e irmãs declararam diante do Eterno e do seu povo que o Eterno nosso Deus é um, e comprometeram-se a amá-lo e a servi-lo de todo o coração e com todas as suas forças.', '«Quereis recebê-los e acolhê-los?» – «Sim!»'] },
    ],
  },
  {
    id: 'alliance',
    title: 'Os Atos de Aliança',
    when: 'Festa da Aliança, celebrada todos os anos',
    bible: 'Êxodo 24:3-8',
    summary: 'Durante os Atos de Aliança, o povo reconhece o Eterno como o único verdadeiro Deus, aceita as Palavras da Aliança e compromete-se a praticar as suas ordenanças, preceitos e mandamentos. Faz-se memória da conclusão da Aliança no Sinai e come-se o «pão da Aliança», refeição simbólica de gratidão. É também a Páscoa KCCista, a festa da libertação.',
    programme: [
      { part: 'Louvor', steps: ['Entrada do oficiante', 'Cântico «Yawe yo Mokeli na biso»', 'Oração de invocação', 'Coro', 'Cântico «Nzela na Yawe ezali sembo»'] },
      { part: 'Memória da Aliança', steps: ['Leitura de Êxodo 24:3-8', 'Interpretação', 'A Aliança do Eterno por Israel para toda a humanidade', 'Declaração da divindade do Eterno', 'Intercessão', 'Renovação do perdão do Eterno'] },
      { part: 'Pão da Aliança', steps: ['Oração de consagração', 'Apresentação', 'Distribuição', 'Ordem de comer o pão da Aliança', 'Oração individual'] },
      { part: 'Encerramento', steps: ['Ofertas', 'Cânticos', 'Oração final', 'Palavra do responsável', 'Encerramento'] },
    ],
    texts: [
      { title: 'Oração de invocação', lines: ['Senhor Eterno, damos-Te graças por nos teres oferecido a ocasião de nos reunirmos diante de Ti, neste lugar santo, para comemorar a Tua bondade e a Tua benevolência, Tu que nos indicaste o caminho da salvação.', 'Pela Tua santa Aliança tornámo-nos o Teu povo, por quem o Teu santo Nome deve ser glorificado e a Tua Aliança honrada. Digna-Te, Senhor Eterno, receber as nossas ações de graças.', 'Está connosco nesta celebração, e que o Teu divino poder nos acompanhe. Que assim seja pelo Teu Santo Nome.'] },
      { title: 'Declaração ao povo (2 de julho de 2014)', lines: ['Tomai consciência e reconhecei que esta Aliança foi aceite com alegria pela assembleia dos filhos de Israel, que disse: «Obedeceremos e poremos em prática tudo o que o Eterno, nosso Deus, ordenou.»', 'Sabei que, depois da consagração por Moisés, as Palavras desta Aliança foram santificadas e tornadas eternamente imutáveis em benefício de toda a humanidade.', 'Fique também claro que o sangue não é a Aliança do Eterno: são os dez mandamentos. Esta Aliança permanece eternamente.'] },
    ],
  },
  {
    id: 'enfants',
    title: 'A bênção das crianças',
    when: 'Apresentação dos recém-nascidos (programa de 18 de fevereiro de 2015)',
    summary: 'Segundo a Palavra do Eterno, todo o recém-nascido deve ser apresentado ao Eterno Deus para Lhe pertencer. Os pais trazem a criança ao lugar santo; o oficiante abençoa-a, apresenta-a à assembleia, entrega um certificado de bênção e aconselha os pais.',
    programme: [{ steps: ['Chamada nominal', 'Receção do oficiante', 'Declaração', 'Cântico', 'Bênção', 'Apresentação das crianças', 'Entrega dos certificados', 'Conselhos do oficiante aos pais', 'Regresso dos pais aos seus lugares', 'Fim da cerimónia'] }],
    texts: [
      { title: 'Declaração', lines: ['Segundo a Palavra do Eterno, «recomenda-se que todo o recém-nascido seja apresentado ao Eterno Deus para que Lhe pertença».', 'Assim, esta criança aqui presente, diante do Eterno e neste lugar santo, foi trazida para que Ele a acolha e a abençoe. Que isto se cumpra pelo Seu Santo Nome, Eterno!'] },
      { title: 'Bênção', lines: ['Senhor Eterno, damos-Te graças por nos teres dado esta criança. Sabemos que os filhos são fruto da Tua graça.', 'Pedimos-Te que abençoes esta criança pela Tua graça e no Teu Santo Nome, Eterno, para que Te pertença e Te sirva toda a vida.', 'Que assim seja pelo Teu Santo Nome!'] },
    ],
  },
  {
    id: 'mariage',
    title: 'O culto de casamento',
    summary: 'A bênção nupcial compreende dois interrogatórios dos esposos, a bênção e a colocação das alianças. O culto está centrado só na glória do Eterno: não deve tornar-se um serão musical.',
    programme: [
      { part: 'Louvor e meditação', steps: ['Cântico', 'Oração de invocação', 'Coro', 'Pregação', 'Oração de ação de graças', 'Ofertas'] },
      { part: 'Bênção nupcial', steps: ['Apresentação do casal', 'Primeiro interrogatório (o esposo, depois a esposa)', 'Segundo interrogatório (a esposa, depois o esposo)', 'Bênção e colocação das alianças', 'Bênção do casal ajoelhado'] },
      { part: 'Fim', steps: ['Anúncios', 'Assinatura dos documentos do casamento', 'Palavra e bênção final', 'Animação e entrega dos presentes'] },
    ],
    texts: [
      { title: 'As perguntas aos esposos', lines: ['Viste a tua esposa (o teu esposo)?', 'Queres que ela (ele) se torne tua esposa (teu esposo) no Eterno?', 'Queres realmente que ela (ele) seja unida(o) a ti em Nome do Eterno, para que vos torneis um?', 'Continuarás a amá-la(o) toda a vida, nas dificuldades como nos sofrimentos?'] },
      { title: 'Bênção das alianças', lines: ['Eterno, que estas alianças se tornem sinais da sua união pelo casamento. Que assim seja pelo Teu Santo Nome!'] },
      { title: 'Bênção do casal', lines: ['Eterno Deus santo, sabemos que o casamento vem de Ti desde o princípio, segundo a Tua palavra: «O homem deixará pai e mãe, unir-se-á à sua mulher, e os dois serão um.»', 'Eles estão presentes neste lugar santo, diante de Ti e de muitas testemunhas, para serem unidos. Pela Tua graça, abençoa-os durante toda a vida; abençoa os frutos do seu trabalho e os frutos das suas entranhas; abençoa o seu casamento e protege-o até ao fim da sua vida.', 'De agora em diante já não são dois, mas um. Que assim seja em Nome do Eterno!'] },
    ],
    notes: [
      'O número de coros que intervêm não deve ultrapassar sete, e a hora de início e de fim deve ser respeitada (circular de 2016).',
      'Depois da bênção nupcial, o casal KCCista não convida os membros da Igreja a cantar os cânticos religiosos numa festa que mistura a glória ao Eterno, divindades estrangeiras e danças profanas.',
      'A aliança do casamento são as palavras de compromisso pronunciadas diante de Deus, da Igreja e do cônjuge: amar-se definitivamente, apesar das dificuldades.',
    ],
  },
  {
    id: 'deuil',
    title: 'O velório e o enterro',
    bible: 'Génesis 3:19',
    summary: 'O velório em casa alterna animação, meditação e testemunhos. No dia do enterro, depois do culto e do levantamento do corpo, o oficiante pronuncia no cemitério, em voz alta, as palavras de enterro. Se a família quiser falar, dá-se-lhe primeiro todo o tempo necessário.',
    programme: [
      { part: 'Velório em casa', steps: ['Animação: saudação de paz, palavra de circunstância, cânticos', 'Meditação: cântico de louvor, oração, pregação, ação de graças', 'Leitura biográfica e testemunhos', 'Recolhimento'] },
      { part: 'Programa do dia', steps: ['Saudação de paz', 'Cântico e oração', 'Pregação', 'Intervenção da família', 'Leitura biográfica e testemunhos', 'Deposição de coroas de flores', 'Recolhimento', 'Levantamento do corpo'] },
      { part: 'No cemitério', steps: ['Palavra da família', 'Saudação de paz', 'Cântico', 'Palavras de enterro', 'Cântico', 'Saudação de paz'] },
    ],
    texts: [
      { title: 'Palavras de enterro', lines: ['Em Nome do Eterno Deus.', 'É preciso que este corpo mortal e corruptível morra, conforme a Palavra do Eterno: «Voltarás à terra de onde foste tirado, porque és pó e ao pó voltarás.»', 'Quem morre sem ter recebido o Eterno na sua alma e sem ter posto em prática as suas leis, a sua alma irá para o castigo eterno.', 'Mas quem tiver recebido o Eterno na sua alma e posto em prática as suas leis, a sua alma será salva e recebida na glória eterna.', 'Assim, que a tua alma seja salva e recebida na glória do Eterno. Sim, que assim seja em Nome do Eterno Deus. Aleluia!'] },
    ],
    notes: ['Depois das palavras de enterro não há mais intervenções, exceto os cânticos de conjunto enquanto se cobre a sepultura.'],
  },
  {
    id: 'dedicace',
    title: 'A dedicação de um templo',
    when: 'Exemplo: dedicação do templo de Malweka (Kinshasa), 11 de agosto de 2013',
    summary: 'Um novo templo é consagrado ao Eterno durante um culto presidido pelo Chefe Espiritual, seguido da cerimónia de dedicação propriamente dita.',
    programme: [
      { part: 'O culto', steps: ['Cântico de conjunto', 'Oração', 'Palavra de boas-vindas', 'Coros', 'Profissão de fé', 'Leitura bíblica', 'Juramento do Profeta', 'Pregação do Chefe Espiritual', 'Ofertas'] },
      { part: 'A dedicação', steps: ['Cântico «Ngolu monene ekiti na mokili oyo»', 'Discurso da paróquia', 'Dados técnicos do edifício', 'Corte da fita', 'Leitura da palavra de dedicação', 'Bênção do púlpito', 'Bênção final', 'Assinatura do livro de ouro'] },
    ],
  },
];
