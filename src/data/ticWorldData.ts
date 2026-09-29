import {
  BadgeDefinition,
  ChatMessage,
  CurriculumModule,
  LevelDefinition,
  Mission,
  NpcCharacter,
  ShopItem,
  WorldInteractiveObject,
  ZoneId,
} from '../types/world';

import hardwareDiagramImg from '../assets/images/diagram_motherboard_hardware_1790701279311.jpg';
import worldMapBannerImg from '../assets/images/banner_tic_world_map_1790701291132.jpg';
import badgeInsigniaImg from '../assets/images/badge_insignia_showcase_1790701301683.jpg';

export const GENERATED_ASSETS = {
  hardwareDiagram: hardwareDiagramImg,
  worldMapBanner: worldMapBannerImg,
  badgeInsignia: badgeInsigniaImg,
};

export interface ZoneMetadata {
  id: ZoneId;
  name: string;
  subtitle: string;
  description: string;
  spawnPoint: [number, number, number];
  center: [number, number, number];
  radius: number;
  accentHex: string;
  subLocations: string[];
}

export const ZONES_DATA: Record<ZoneId, ZoneMetadata> = {
  praca_central: {
    id: 'praca_central',
    name: 'Praça Central',
    subtitle: 'Ponto de Encontro e Portais do Mundo TIC',
    description:
      'O coração do TIC World. Aqui encontras o Painel de Boas-Vindas, o Mapa do Mundo, o Placar de XP, o Professor TIC, a mascote RoboTIC e os portais de acesso rápido para todas as zonas.',
    spawnPoint: [0, 0, 6],
    center: [0, 0, 0],
    radius: 24,
    accentHex: '#0ea5e9',
    subLocations: ['Painel de Boas-Vindas', 'Mapa Holográfico', 'Placar de XP', 'Anel de Portais'],
  },
  academia_tic: {
    id: 'academia_tic',
    name: 'Academia TIC',
    subtitle: 'Campus Principal de Aulas e Laboratórios',
    description:
      'O grande edifício académico a norte da Praça Central. Reúne seis salas e laboratórios especializados onde aprendes Hardware, Sistemas Operativos, Internet, Segurança Digital e Programação.',
    spawnPoint: [0, 0, -40],
    center: [0, 0, -52],
    radius: 26,
    accentHex: '#10b981',
    subLocations: [
      'Sala de Informática',
      'Laboratório de Hardware',
      'Laboratório de Internet',
      'Sala de Segurança Digital',
      'Oficina de Programação',
      'Centro de Projetos',
    ],
  },
  cidade_digital: {
    id: 'cidade_digital',
    name: 'Cidade Digital',
    subtitle: 'Metrópole de Cidadania, Biblioteca e Loja Virtual',
    description:
      'Uma avenida tecnológica a este da Praça Central com Biblioteca Digital, Centro de Segurança, Loja Virtual de personalização de avatar e o Centro de Cidadania Digital.',
    spawnPoint: [42, 0, 0],
    center: [54, 0, 0],
    radius: 24,
    accentHex: '#f59e0b',
    subLocations: [
      'Biblioteca Digital',
      'Centro de Tecnologia',
      'Loja Virtual',
      'Centro de Segurança',
      'Praça da Cidadania',
    ],
  },
  ilha_criatividade: {
    id: 'ilha_criatividade',
    name: 'Ilha da Criatividade',
    subtitle: 'Estúdio Multimédia e Criação de Conteúdos',
    description:
      'Uma ilha criativa a oeste dedicada ao design de cartazes digitais, apresentações multimédia, combinação de texto e imagem e exposição de trabalhos dos alunos.',
    spawnPoint: [-42, 0, 0],
    center: [-54, 0, 0],
    radius: 22,
    accentHex: '#ec4899',
    subLocations: ['Estúdio Multimédia', 'Galeria de Cartazes', 'Bancada de Apresentações'],
  },
  arena_desafios: {
    id: 'arena_desafios',
    name: 'Arena dos Desafios',
    subtitle: 'Estádio de Quizzes e Competições TIC',
    description:
      'A cúpula de treino a sul da Praça Central onde podes testar os teus conhecimentos em desafios rápidos multi-módulo para ganhar XP extra e BitMoedas.',
    spawnPoint: [0, 0, 40],
    center: [0, 0, 52],
    radius: 22,
    accentHex: '#6366f1',
    subLocations: ['Pódio de Quizzes', 'Terminal de Desafio Rápido', 'Quadro de Campeões'],
  },
};

export const LEVELS_DATA: LevelDefinition[] = [
  {
    level: 1,
    title: 'Explorador Digital',
    minXp: 0,
    maxXp: 200,
    perkDescription: 'Acesso à Praça Central, Academia TIC e primeiros desafios de Hardware.',
  },
  {
    level: 2,
    title: 'Aprendiz TIC',
    minXp: 200,
    maxXp: 450,
    perkDescription: 'Desbloqueia artigos de personalização de Nível 2 na Loja Virtual.',
  },
  {
    level: 3,
    title: 'Técnico Júnior',
    minXp: 450,
    maxXp: 750,
    perkDescription: 'Reconhecimento técnico de computadores e acesso completo aos laboratórios.',
  },
  {
    level: 4,
    title: 'Navegador Web',
    minXp: 750,
    maxXp: 1100,
    perkDescription: 'Especialista em motores de pesquisa e avaliação crítica de fontes.',
  },
  {
    level: 5,
    title: 'Cyber Guard',
    minXp: 1100,
    maxXp: 1500,
    perkDescription: 'Defensor de segurança digital, privacidade e combate ao phishing.',
  },
  {
    level: 6,
    title: 'Programador Júnior',
    minXp: 1500,
    maxXp: 3000,
    perkDescription: 'Estatuto máximo do 5.º ano: domínio de algoritmos, lógica e criação digital.',
  },
];

export const BADGES_DATA: BadgeDefinition[] = [
  {
    id: 'primeiro_login',
    title: 'Primeiro Login',
    description: 'Entraste pela primeira vez no TIC World e iniciaste a tua jornada no 5.º ano.',
    criteria: 'Entrar na plataforma TIC World.',
    category: 'Iniciação',
  },
  {
    id: 'explorador',
    title: 'Explorador',
    description: 'Visitaste pelo menos 3 zonas diferentes do mundo virtual educativo.',
    criteria: 'Explorar 3 zonas do mapa 3D.',
    category: 'Exploração',
  },
  {
    id: 'mestre_hardware',
    title: 'Mestre do Hardware',
    description: 'Identificaste e instalaste todos os componentes essenciais do computador.',
    criteria: 'Concluir a missão O Computador Misterioso.',
    category: 'Módulo 1 · Computadores',
  },
  {
    id: 'navegador_seguro',
    title: 'Navegador Seguro',
    description: 'Ajudaste o Explorador Web a distinguir fontes fiáveis de notícias falsas.',
    criteria: 'Concluir a missão Detetive da Web.',
    category: 'Módulo 2 · Internet',
  },
  {
    id: 'guardiao_digital',
    title: 'Guardião Digital',
    description: 'Detetaste tentativas de phishing e criaste palavras-passe de alta segurança.',
    criteria: 'Concluir a missão Escudo Anti-Phishing.',
    category: 'Módulo 3 · Segurança',
  },
  {
    id: 'programador',
    title: 'Programador',
    description: 'Programaste o RoboTIC utilizando sequências, ciclos e condições lógicas.',
    criteria: 'Concluir a missão Algoritmo em Ação.',
    category: 'Módulo 5 · Programação',
  },
  {
    id: 'criador_digital',
    title: 'Criador Digital',
    description: 'Criaste e publicaste o teu primeiro cartaz educativo na Ilha da Criatividade.',
    criteria: 'Concluir a missão Estúdio Criativo TIC.',
    category: 'Módulo 6 · Criatividade',
  },
];

export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'mod1_computadores',
    number: 'Módulo 1',
    title: 'Computadores',
    subtitle: 'Hardware, Software, Periféricos e Sistema Operativo',
    zoneId: 'academia_tic',
    roomName: 'Laboratório de Hardware & Sala de Informática',
    topics: ['Hardware', 'Software', 'Periféricos', 'Sistemas Operativos', 'Ficheiros e Pastas'],
    summary:
      'Um computador funciona através da equipa perfeita entre a parte física (Hardware) e os programas (Software). Neste módulo aprendes o papel de cada componente interno e como organizar o teu trabalho em pastas.',
    keyConcepts: [
      {
        term: 'Hardware vs. Software',
        definition:
          'Hardware é toda a parte física em que podemos tocar; Software são os programas, aplicações e instruções.',
        example: 'O monitor e o teclado são Hardware; o Windows, o Linux e o navegador são Software.',
      },
      {
        term: 'CPU (Processador) e RAM',
        definition:
          'O CPU é o "cérebro" que calcula e executa instruções. A memória RAM guarda temporariamente os dados dos programas abertos.',
        example: 'Quando fechas um jogo sem gravar, os dados na RAM desaparecem; no disco SSD ficam guardados.',
      },
      {
        term: 'Periféricos (Entrada, Saída e Mistos)',
        definition:
          'Permitem comunicar com o computador: enviar dados (Entrada), receber resultados (Saída) ou ambos (Mistos).',
        example: 'Entrada: Rato, Teclado, Microfone. Saída: Monitor, Impressora, Colunas. Misto: Ecrã Tátil, Pen USB.',
      },
      {
        term: 'Ficheiros e Pastas',
        definition:
          'Os ficheiros guardam documentos (.docx), imagens (.png) ou áudio (.mp3), organizados dentro de pastas temáticas.',
        example: 'Criar uma pasta "TIC_5Ano" com subpastas para cada trabalho evita perder ficheiros importantes.',
      },
    ],
    missionIds: ['missao_hardware', 'missao_ficheiros'],
  },
  {
    id: 'mod2_internet',
    number: 'Módulo 2',
    title: 'Internet e Pesquisa',
    subtitle: 'Navegadores, Motores de Pesquisa e Fontes Fiáveis',
    zoneId: 'academia_tic',
    roomName: 'Laboratório de Internet',
    topics: ['Internet', 'Navegador', 'Motores de Pesquisa', 'Websites', 'Hiperligações', 'Pesquisa Eficaz'],
    summary:
      'A Internet é uma rede mundial de computadores. Para encontrar informação útil para os trabalhos escolares, precisamos de saber usar palavras-chave precisas e distinguir websites científicos ou institucionais de boatos.',
    keyConcepts: [
      {
        term: 'Navegador (Browser) vs. Motor de Pesquisa',
        definition:
          'O navegador é o programa instalado no computador para abrir páginas web; o motor de pesquisa é um website que procura conteúdos.',
        example: 'Chrome, Firefox e Edge são navegadores; Google, Bing e DuckDuckGo são motores de pesquisa.',
      },
      {
        term: 'URL e Hiperligações (Links)',
        definition:
          'O URL é o endereço único de uma página na Web. As hiperligações permitem saltar de uma página para outra com um clique.',
        example: 'https://www.dge.mec.pt — o cadeado HTTPS indica que a ligação entre o teu computador e o site é cifrada.',
      },
      {
        term: 'Avaliação de Informação Fiável',
        definition:
          'Nem tudo o que aparece na Internet é verdadeiro. Devemos verificar quem escreveu, a data, a finalidade e comparar fontes.',
        example: 'Um artigo de uma universidade (.edu / .pt) ou museu é mais fiável do que uma mensagem anónima sem autor.',
      },
    ],
    missionIds: ['missao_internet'],
  },
  {
    id: 'mod3_seguranca',
    number: 'Módulo 3',
    title: 'Segurança Digital',
    subtitle: 'Palavras-Passe, Phishing, Privacidade e Proteção',
    zoneId: 'academia_tic',
    roomName: 'Sala de Segurança Digital',
    topics: [
      'Palavras-passe',
      'Phishing',
      'Privacidade',
      'Dados Pessoais',
      'Comportamento Online',
      'Cibersegurança',
      'Cyberbullying',
    ],
    summary:
      'Proteger os teus dados pessoais na Internet é tão importante como trancar a porta de casa. Aprende a criar palavras-passe fortes, detetar mensagens fraudulentas (Phishing) e pedir ajuda a um adulto de confiança.',
    keyConcepts: [
      {
        term: 'Palavras-Passe Fortes',
        definition:
          'Uma palavra-passe segura deve ter pelo menos 10 a 12 caracteres, misturando letras maiúsculas, minúsculas, números e símbolos.',
        example: 'Evita "123456" ou o teu nome. Usa frases memoráveis como "Gato!Azul_Estuda5".',
      },
      {
        term: 'Phishing (Isco Digital)',
        definition:
          'Mensagens falsas que fingem ser de bancos, jogos ou escolas para roubar palavras-passe através de links suspeitos.',
        example: '"Ganhaste 10.000 moedas grátis! Clica já aqui e escreve a tua senha!" — Nunca deves clicar.',
      },
      {
        term: 'Dados Pessoais e Privacidade',
        definition:
          'Nome completo, morada, nome da escola, horário, número de telemóvel e fotografias privadas nunca devem ser partilhados com desconhecidos.',
        example: 'Nos jogos online, usa sempre um pseudónimo (nickname) em vez do teu nome real e morada.',
      },
    ],
    missionIds: ['missao_seguranca'],
  },
  {
    id: 'mod4_cidadania',
    number: 'Módulo 4',
    title: 'Cidadania Digital',
    subtitle: 'Respeito Online, Identidade Digital e Direitos',
    zoneId: 'cidade_digital',
    roomName: 'Praça da Cidadania Digital',
    topics: [
      'Respeito Online',
      'Identidade Digital',
      'Privacidade',
      'Comunicação Responsável',
      'Direitos e Deveres Digitais',
    ],
    summary:
      'Ser um bom cidadão digital significa tratar os outros na Internet com o mesmo respeito que temos na sala de aula, proteger a nossa pegada digital e respeitar os direitos de autor.',
    keyConcepts: [
      {
        term: 'Pegada e Identidade Digital',
        definition:
          'Tudo o que publicamos, comentamos ou partilhamos deixa um rasto na Internet chamado pegada digital.',
        example: 'Antes de publicar uma fotografia ou comentário, pensa: "Gostaria que toda a escola visse isto num cartaz?".',
      },
      {
        term: 'Combate ao Cyberbullying',
        definition:
          'Insultar, excluir ou gozar com colegas através de redes ou grupos de mensagens é cyberbullying. Não sejas espectador passivo.',
        example: 'Se vires alguém a ser atacado online: não partilhes, apoia o colega, guarda provas e fala com um professor ou encarregado de educação.',
      },
      {
        term: 'Direitos de Autor',
        definition:
          'Textos, fotografias, músicas e vídeos criados por outras pessoas têm autor. Não devemos copiar e fingir que fomos nós que fizemos (plágio).',
        example: 'Nos trabalhos de TIC, escreve pelas tuas próprias palavras e indica sempre as fontes consultadas.',
      },
    ],
    missionIds: ['missao_cidadania'],
  },
  {
    id: 'mod5_programacao',
    number: 'Módulo 5',
    title: 'Programação',
    subtitle: 'Algoritmos, Sequências, Ciclos e Condições por Blocos',
    zoneId: 'academia_tic',
    roomName: 'Oficina de Programação',
    topics: ['Ordenar Instruções', 'Descobrir Algoritmos', 'Sequências', 'Lógica', 'Condições', 'Ciclos'],
    summary:
      'Programar é ensinar o computador ou um robô a resolver problemas através de uma sequência clara e ordenada de instruções — um algoritmo.',
    keyConcepts: [
      {
        term: 'Algoritmo e Sequência',
        definition:
          'Conjunto finito de passos ordenados para realizar uma tarefa. A ordem das instruções altera completamente o resultado.',
        example: 'Para lavar os dentes: 1.º pôr pasta na escova; 2.º escovar; 3.º passar por água.',
      },
      {
        term: 'Ciclos (Repetições)',
        definition:
          'Permitem repetir um conjunto de instruções várias vezes sem termos de escrever o mesmo bloco repetidamente.',
        example: 'Em vez de usar 4 blocos "Avançar", usamos um bloco "Repetir 4 vezes: [Avançar]".',
      },
      {
        term: 'Condições (Se / Senão)',
        definition:
          'Permitem que o programa tome decisões diferentes consoante uma situação verdadeira ou falsa.',
        example: 'SE o caminho em frente estiver livre ENTÃO avança, SENÃO vira à direita.',
      },
    ],
    missionIds: ['missao_programacao'],
  },
  {
    id: 'mod6_criatividade',
    number: 'Módulo 6',
    title: 'Criatividade Digital',
    subtitle: 'Imagem, Texto, Apresentações e Criação Multimédia',
    zoneId: 'ilha_criatividade',
    roomName: 'Estúdio da Ilha da Criatividade',
    topics: ['Imagem', 'Texto', 'Apresentações', 'Multimédia', 'Criação de Conteúdos'],
    summary:
      'As ferramentas digitais permitem comunicar ideias através de cartazes, infográficos e apresentações. Um bom trabalho multimédia combina títulos claros, bom contraste de cores e pouco texto por diapositivo.',
    keyConcepts: [
      {
        term: 'Regras de uma Boa Apresentação',
        definition:
          'Cada diapositivo deve ter uma ideia principal, letras legíveis à distância e imagens que ajudem a explicar o tema.',
        example: 'Evita encher o ecrã com textos longos copiados da Internet; usa tópicos curtos (3 a 4 linhas).',
      },
      {
        term: 'Contraste e Legibilidade',
        definition:
          'Escolher cores de texto que se destaquem claramente do fundo para que todos consigam ler sem esforço.',
        example: 'Texto claro sobre fundo azul-escuro lê-se muito bem; texto amarelo sobre fundo branco é quase invisível.',
      },
    ],
    missionIds: ['missao_criatividade'],
  },
];

export const MISSIONS_DATA: Mission[] = [
  {
    id: 'missao_hardware',
    code: 'M1-A',
    title: 'O Computador Misterioso',
    description:
      'O Laboratório de Hardware recebeu componentes desmontados. Ajuda o Técnico Duarte a identificar e instalar os 6 elementos essenciais na bancada.',
    objective: 'Identificar e ligar CPU, RAM, Armazenamento SSD, Monitor, Teclado e Rato.',
    difficulty: 'Iniciante',
    xpReward: 120,
    coinReward: 60,
    moduleId: 'mod1_computadores',
    zoneId: 'academia_tic',
    roomName: 'Laboratório de Hardware',
    activityType: 'hardware_builder',
  },
  {
    id: 'missao_ficheiros',
    code: 'M1-B',
    title: 'Arrumação no Sistema Operativo',
    description:
      'A área de trabalho da Sala de Informática está cheia de ficheiros misturados e periféricos por classificar. Organiza tudo nas pastas certas!',
    objective: 'Classificar 6 ficheiros por extensão e distinguir periféricos de entrada, saída e mistos.',
    difficulty: 'Iniciante',
    xpReward: 100,
    coinReward: 50,
    moduleId: 'mod1_computadores',
    zoneId: 'academia_tic',
    roomName: 'Sala de Informática',
    activityType: 'files_organizer',
  },
  {
    id: 'missao_internet',
    code: 'M2-A',
    title: 'Detetive da Web',
    description:
      'Ajuda o Explorador Web a encontrar informação fiável para o trabalho de Ciências e TIC, filtrando páginas falsas e escolhendo as melhores palavras-chave.',
    objective: 'Avaliar 4 fontes web quanto à sua fiabilidade e construir pesquisas eficazes.',
    difficulty: 'Iniciante',
    xpReward: 130,
    coinReward: 65,
    moduleId: 'mod2_internet',
    zoneId: 'academia_tic',
    roomName: 'Laboratório de Internet',
    activityType: 'web_detective',
  },
  {
    id: 'missao_seguranca',
    code: 'M3-A',
    title: 'Escudo Anti-Phishing',
    description:
      'A Agente Cyber intercetou mensagens suspeitas enviadas aos alunos do 5.º ano. Analisa cada mensagem e cria uma palavra-passe impenetrável.',
    objective: 'Tomar a decisão certa em 4 casos de segurança e criar uma senha de nível máximo.',
    difficulty: 'Intermédio',
    xpReward: 150,
    coinReward: 80,
    moduleId: 'mod3_seguranca',
    zoneId: 'academia_tic',
    roomName: 'Sala de Segurança Digital',
    activityType: 'security_analyzer',
  },
  {
    id: 'missao_cidadania',
    code: 'M4-A',
    title: 'Conselho da Cidade Digital',
    description:
      'Na Praça da Cidadania surgiram situações no mural da escola sobre respeito online, direitos de autor e proteção de colegas.',
    objective: 'Resolver 4 dilemas de Cidadania Digital com empatia, segurança e responsabilidade.',
    difficulty: 'Intermédio',
    xpReward: 140,
    coinReward: 70,
    moduleId: 'mod4_cidadania',
    zoneId: 'cidade_digital',
    roomName: 'Praça da Cidadania',
    activityType: 'citizenship_dilemma',
  },
  {
    id: 'missao_programacao',
    code: 'M5-A',
    title: 'Algoritmo em Ação com o RoboTIC',
    description:
      'Na Oficina de Programação, o RoboTIC precisa das tuas instruções em blocos para recolher os cristais de dados e chegar ao portal energético.',
    objective: 'Programar 3 desafios visuais usando Sequências, Ciclos (Repetir) e Condições.',
    difficulty: 'Avançado',
    xpReward: 180,
    coinReward: 100,
    moduleId: 'mod5_programacao',
    zoneId: 'academia_tic',
    roomName: 'Oficina de Programação',
    activityType: 'block_coding',
  },
  {
    id: 'missao_criatividade',
    code: 'M6-A',
    title: 'Estúdio Criativo TIC',
    description:
      'Viaja até à Ilha da Criatividade e utiliza a bancada multimédia para criar um cartaz educativo com ótimo contraste, estrutura e mensagem clara.',
    objective: 'Conceber e publicar um cartaz digital completo no Portefólio da Turma.',
    difficulty: 'Intermédio',
    xpReward: 150,
    coinReward: 85,
    moduleId: 'mod6_criatividade',
    zoneId: 'ilha_criatividade',
    roomName: 'Estúdio Multimédia',
    activityType: 'creative_studio',
  },
  {
    id: 'missao_arena',
    code: 'ARENA-1',
    title: 'Torneio Relâmpago TIC 5.º Ano',
    description:
      'Entra na Arena dos Desafios e responde ao grande quiz multidisciplinar que junta Hardware, Internet, Segurança, Cidadania e Programação!',
    objective: 'Acertar pelo menos 5 em 6 questões no desafio global da Arena.',
    difficulty: 'Avançado',
    xpReward: 200,
    coinReward: 120,
    moduleId: 'mod1_computadores',
    zoneId: 'arena_desafios',
    roomName: 'Arena Central',
    activityType: 'arena_quiz',
  },
];

export const NPCS_DATA: NpcCharacter[] = [
  {
    id: 'npc_professor_tic',
    name: 'Professor TIC (Prof. Gonçalo)',
    role: 'Coordenador da Disciplina de TIC',
    zone: 'praca_central',
    position: [-5, 0, -4],
    skinColor: '#f1c27d',
    coatColor: '#0284c7',
    accentColor: '#38bdf8',
    promptText: 'Falar com o professor',
    shortBio: 'Dá as boas-vindas aos alunos do 5.º ano, explica como funciona o mundo virtual e atribui as principais missões curriculares.',
    initialNodeId: 'root',
    linkedMissionIds: ['missao_hardware', 'missao_ficheiros'],
    dialogueNodes: {
      root: {
        id: 'root',
        speaker: 'Professor TIC',
        text: 'Bem-vindo ao TIC World! Este mundo virtual foi construído para explorares os 6 módulos de TIC do 5.º ano de forma prática. O que gostarias de fazer agora?',
        educationalTakeaway:
          'Dica de TIC: A disciplina de TIC combina o conhecimento técnico dos computadores com a utilização segura, crítica e criativa da tecnologia.',
        options: [
          {
            label: 'Quero começar a minha primeira missão de Computadores!',
            nextNodeId: 'missao_intro',
          },
          {
            label: 'Como está organizado este mundo 3D?',
            nextNodeId: 'explicar_zonas',
          },
          {
            label: 'Abrir atividade: Arrumação no Sistema Operativo',
            triggerActivity: 'files_organizer',
            triggerMissionId: 'missao_ficheiros',
          },
        ],
      },
      missao_intro: {
        id: 'missao_intro',
        speaker: 'Professor TIC',
        text: 'Excelente iniciativa! A norte daqui fica a Academia TIC. Lá dentro, o Técnico Duarte precisa de ajuda na missão "O Computador Misterioso" para identificar o CPU, a RAM, o disco SSD e os periféricos.',
        educationalTakeaway:
          'Lembra-te: Hardware é a parte física do computador; Software são os programas e o sistema operativo.',
        options: [
          {
            label: 'Iniciar agora "O Computador Misterioso" (+120 XP)',
            triggerActivity: 'hardware_builder',
            triggerMissionId: 'missao_hardware',
          },
          {
            label: 'Voltar ao início da conversa',
            nextNodeId: 'root',
          },
        ],
      },
      explicar_zonas: {
        id: 'explicar_zonas',
        speaker: 'Professor TIC',
        text: 'Estamos na Praça Central. A Norte tens a Academia TIC com os laboratórios; a Este fica a Cidade Digital (com a Loja Virtual e Cidadania); a Oeste tens a Ilha da Criatividade; e a Sul a Arena dos Desafios!',
        options: [
          {
            label: 'Obrigado, Professor! Vou explorar (+15 XP)',
            xpBonus: 15,
          },
          {
            label: 'Voltar atrás',
            nextNodeId: 'root',
          },
        ],
      },
    },
  },
  {
    id: 'npc_robotic',
    name: 'RoboTIC',
    role: 'Mascote e Tutor de Algoritmos',
    zone: 'praca_central',
    position: [5.5, 0, -3.5],
    skinColor: '#38bdf8',
    coatColor: '#0f172a',
    accentColor: '#22d3ee',
    isRobot: true,
    promptText: 'Iniciar desafio',
    shortBio: 'A mascote robótica oficial do TIC World! Adora desafios de lógica, programação por blocos e quizzes rápidos.',
    initialNodeId: 'root',
    linkedMissionIds: ['missao_programacao', 'missao_arena'],
    dialogueNodes: {
      root: {
        id: 'root',
        speaker: 'RoboTIC',
        text: 'Bip-Bop! Olá, explorador do 5.º ano! Os meus circuitos funcionam com algoritmos bem ordenados. Queres programar os meus movimentos por blocos ou testar um desafio rápido?',
        educationalTakeaway:
          'Um algoritmo é uma sequência finita e ordenada de passos para resolver um problema sem ambiguidades.',
        options: [
          {
            label: 'Abrir Oficina de Programação por Blocos (+180 XP)',
            triggerActivity: 'block_coding',
            triggerMissionId: 'missao_programacao',
          },
          {
            label: 'O que são Ciclos e Condições na programação?',
            nextNodeId: 'explicar_logica',
          },
          {
            label: 'Entrar no Torneio Relâmpago da Arena (+200 XP)',
            triggerActivity: 'arena_quiz',
            triggerMissionId: 'missao_arena',
          },
        ],
      },
      explicar_logica: {
        id: 'explicar_logica',
        speaker: 'RoboTIC',
        text: 'É muito simples! Um CICLO (Repetir) evita que escrevas a mesma instrução 5 vezes seguidas. Uma CONDIÇÃO (Se / Senão) permite-me decidir: SE houver um obstáculo, desvio-me; SENÃO, continuo em frente!',
        options: [
          {
            label: 'Vamos experimentar na Oficina de Programação!',
            triggerActivity: 'block_coding',
            triggerMissionId: 'missao_programacao',
          },
          {
            label: 'Voltar atrás',
            nextNodeId: 'root',
          },
        ],
      },
    },
  },
  {
    id: 'npc_tecnico',
    name: 'Técnico Duarte',
    role: 'Especialista do Laboratório de Hardware',
    zone: 'academia_tic',
    position: [-8, 0, -48],
    skinColor: '#e0ac69',
    coatColor: '#059669',
    accentColor: '#34d399',
    promptText: 'Falar com o Técnico de Hardware',
    shortBio: 'Responsável pela manutenção e montagem de computadores na Academia TIC. Conhece cada circuito da placa-mãe.',
    initialNodeId: 'root',
    linkedMissionIds: ['missao_hardware', 'missao_ficheiros'],
    dialogueNodes: {
      root: {
        id: 'root',
        speaker: 'Técnico Duarte',
        text: 'Bem-vindo ao Laboratório de Hardware da Academia TIC! Temos aqui um computador desmontado em cima da bancada. Sabes distinguir os componentes internos dos periféricos?',
        educationalTakeaway:
          'O CPU processa os dados, a RAM guarda temporariamente o que está aberto e o SSD guarda os teus ficheiros de forma permanente.',
        options: [
          {
            label: 'Montar e identificar "O Computador Misterioso" (+120 XP)',
            triggerActivity: 'hardware_builder',
            triggerMissionId: 'missao_hardware',
          },
          {
            label: 'Praticar organização de Ficheiros e Periféricos (+100 XP)',
            triggerActivity: 'files_organizer',
            triggerMissionId: 'missao_ficheiros',
          },
          {
            label: 'Qual é a diferença entre RAM e Disco SSD?',
            nextNodeId: 'ram_vs_ssd',
          },
        ],
      },
      ram_vs_ssd: {
        id: 'ram_vs_ssd',
        speaker: 'Técnico Duarte',
        text: 'Pensa na memória RAM como a tua secretária de trabalho: é super rápida enquanto estás a estudar, mas quando desligas o computador ela fica vazia. O disco SSD é como a tua mochila ou armário: guarda os ficheiros mesmo com o computador desligado!',
        options: [
          {
            label: 'Percebi! Vou montar o computador agora.',
            triggerActivity: 'hardware_builder',
            triggerMissionId: 'missao_hardware',
          },
        ],
      },
    },
  },
  {
    id: 'npc_agente_cyber',
    name: 'Agente Cyber (Sofia)',
    role: 'Especialista em Cibersegurança e Cidadania',
    zone: 'cidade_digital',
    position: [48, 0, -7],
    skinColor: '#c68642',
    coatColor: '#d97706',
    accentColor: '#fbbf24',
    promptText: 'Falar com a Agente Cyber',
    shortBio: 'Protege a rede escolar contra esquemas de phishing, palavras-passe fracas e promove o respeito online na Cidade Digital.',
    initialNodeId: 'root',
    linkedMissionIds: ['missao_seguranca', 'missao_cidadania'],
    dialogueNodes: {
      root: {
        id: 'root',
        speaker: 'Agente Cyber',
        text: 'Alerta de segurança, jovem agente! Todos os dias circulam na Internet mensagens falsas que tentam enganar utilizadores distraídos. Estás pronto para treinar o teu olhar crítico?',
        educationalTakeaway:
          'Nunca partilhes a tua palavra-passe, morada ou número de telemóvel, e desconfia sempre de prémios milagrosos ou mensagens urgentes.',
        options: [
          {
            label: 'Iniciar missão "Escudo Anti-Phishing" (+150 XP)',
            triggerActivity: 'security_analyzer',
            triggerMissionId: 'missao_seguranca',
          },
          {
            label: 'Resolver dilemas de Cidadania Digital (+140 XP)',
            triggerActivity: 'citizenship_dilemma',
            triggerMissionId: 'missao_cidadania',
          },
          {
            label: 'O que devo fazer se encontrar cyberbullying?',
            nextNodeId: 'dica_cyberbullying',
          },
        ],
      },
      dica_cyberbullying: {
        id: 'dica_cyberbullying',
        speaker: 'Agente Cyber',
        text: 'Regra de ouro: 1.º Não respondas a provocações nem partilhes a agressão; 2.º Guarda uma captura de ecrã como prova; 3.º Bloqueia/denuncia a conta; 4.º Pede ajuda imediatamente aos teus pais ou a um professor!',
        options: [
          {
            label: 'Entendido! Vou treinar no simulador de Segurança.',
            triggerActivity: 'security_analyzer',
            triggerMissionId: 'missao_seguranca',
          },
        ],
      },
    },
  },
  {
    id: 'npc_explorador_web',
    name: 'Explorador Web (Miguel)',
    role: 'Especialista em Pesquisa e Criatividade Digital',
    zone: 'ilha_criatividade',
    position: [-48, 0, -5],
    skinColor: '#f1c27d',
    coatColor: '#db2777',
    accentColor: '#f472b6',
    promptText: 'Falar com o Explorador Web',
    shortBio: 'Navega pelos oceanos da World Wide Web à procura de fontes científicas fidedignas e ajuda os alunos a criar projetos multimédia.',
    initialNodeId: 'root',
    linkedMissionIds: ['missao_internet', 'missao_criatividade'],
    dialogueNodes: {
      root: {
        id: 'root',
        speaker: 'Explorador Web',
        text: 'Olá! Sabias que um motor de pesquisa encontra milhões de páginas num segundo, mas nem todas dizem a verdade? Depois de encontrares boa informação, podes transformá-la num cartaz incrível aqui na Ilha da Criatividade!',
        educationalTakeaway:
          'Antes de usar informação de um site num trabalho escolar, confirma sempre o autor, a data de publicação e se a fonte é oficial.',
        options: [
          {
            label: 'Ajudar na missão "Detetive da Web" (+130 XP)',
            triggerActivity: 'web_detective',
            triggerMissionId: 'missao_internet',
          },
          {
            label: 'Abrir o Estúdio Criativo de Cartazes (+150 XP)',
            triggerActivity: 'creative_studio',
            triggerMissionId: 'missao_criatividade',
          },
        ],
      },
    },
  },
];

export const WORLD_OBJECTS: WorldInteractiveObject[] = [
  // PRAÇA CENTRAL
  {
    id: 'obj_painel_boas_vindas',
    name: 'Painel de Boas-Vindas & Placar XP',
    type: 'board',
    zone: 'praca_central',
    position: [0, 0, -8],
    promptText: 'Consultar Placar de XP e Missões',
    description: 'Mostra o teu nível atual, medalhas conquistadas e o estado global do currículo de TIC do 5.º ano.',
    color: '#0ea5e9',
    linkedActivity: 'arena_quiz',
  },
  {
    id: 'obj_portal_academia',
    name: 'Portal para Academia TIC',
    type: 'portal',
    zone: 'praca_central',
    position: [0, 0, -17],
    promptText: 'Viajar para outra zona (Academia TIC)',
    description: 'Teletransporte direto para a entrada dos laboratórios da Academia TIC (Norte).',
    color: '#10b981',
    targetZoneId: 'academia_tic',
    targetPosition: [0, 0, -38],
  },
  {
    id: 'obj_portal_cidade',
    name: 'Portal para Cidade Digital',
    type: 'portal',
    zone: 'praca_central',
    position: [17, 0, 0],
    promptText: 'Viajar para outra zona (Cidade Digital)',
    description: 'Teletransporte direto para a Cidade Digital, Loja Virtual e Centro de Segurança (Este).',
    color: '#f59e0b',
    targetZoneId: 'cidade_digital',
    targetPosition: [40, 0, 0],
  },
  {
    id: 'obj_portal_ilha',
    name: 'Portal para Ilha da Criatividade',
    type: 'portal',
    zone: 'praca_central',
    position: [-17, 0, 0],
    promptText: 'Viajar para outra zona (Ilha da Criatividade)',
    description: 'Teletransporte direto para o Estúdio Multimédia na Ilha da Criatividade (Oeste).',
    color: '#ec4899',
    targetZoneId: 'ilha_criatividade',
    targetPosition: [-40, 0, 0],
  },
  {
    id: 'obj_portal_arena',
    name: 'Portal para Arena dos Desafios',
    type: 'portal',
    zone: 'praca_central',
    position: [0, 0, 17],
    promptText: 'Viajar para outra zona (Arena dos Desafios)',
    description: 'Teletransporte direto para a cúpula de quizzes e competições educativas (Sul).',
    color: '#6366f1',
    targetZoneId: 'arena_desafios',
    targetPosition: [0, 0, 38],
  },

  // ACADEMIA TIC (6 SALAS / ESTAÇÕES)
  {
    id: 'obj_lab_hardware_pc',
    name: 'Bancada do Laboratório de Hardware',
    type: 'computer',
    zone: 'academia_tic',
    room: 'lab_hardware',
    position: [-12, 0, -54],
    promptText: 'Interagir com computador (Montagem de Hardware)',
    description: 'Módulo 1: Identifica CPU, RAM, SSD, Monitor, Teclado e Rato na bancada técnica.',
    color: '#10b981',
    linkedMissionId: 'missao_hardware',
    linkedModuleId: 'mod1_computadores',
    linkedActivity: 'hardware_builder',
  },
  {
    id: 'obj_sala_informatica_pc',
    name: 'Terminal da Sala de Informática',
    type: 'computer',
    zone: 'academia_tic',
    room: 'sala_informatica',
    position: [-4, 0, -58],
    promptText: 'Interagir com computador (Ficheiros e Periféricos)',
    description: 'Módulo 1: Organiza ficheiros em pastas do Sistema Operativo e classifica periféricos.',
    color: '#06b6d4',
    linkedMissionId: 'missao_ficheiros',
    linkedModuleId: 'mod1_computadores',
    linkedActivity: 'files_organizer',
  },
  {
    id: 'obj_lab_internet_station',
    name: 'Consola do Laboratório de Internet',
    type: 'computer',
    zone: 'academia_tic',
    room: 'lab_internet',
    position: [4, 0, -58],
    promptText: 'Interagir com computador (Pesquisa Web Segura)',
    description: 'Módulo 2: Ajuda o Explorador Web a avaliar websites, hiperligações e motores de busca.',
    color: '#3b82f6',
    linkedMissionId: 'missao_internet',
    linkedModuleId: 'mod2_internet',
    linkedActivity: 'web_detective',
  },
  {
    id: 'obj_sala_seguranca_livro',
    name: 'Manual Holográfico de Segurança Digital',
    type: 'book',
    zone: 'academia_tic',
    room: 'sala_seguranca',
    position: [12, 0, -54],
    promptText: 'Estudar segurança digital',
    description: 'Módulo 3: Simulador de mensagens de Phishing e laboratório de palavras-passe fortes.',
    color: '#f59e0b',
    linkedMissionId: 'missao_seguranca',
    linkedModuleId: 'mod3_seguranca',
    linkedActivity: 'security_analyzer',
  },
  {
    id: 'obj_oficina_programacao_robot',
    name: 'Simulador de Algoritmos e Robótica',
    type: 'robot',
    zone: 'academia_tic',
    room: 'oficina_programacao',
    position: [0, 0, -48],
    promptText: 'Iniciar desafio (Programação por Blocos)',
    description: 'Módulo 5: Constrói algoritmos visuais com blocos de Sequência, Ciclo e Condição.',
    color: '#8b5cf6',
    linkedMissionId: 'missao_programacao',
    linkedModuleId: 'mod5_programacao',
    linkedActivity: 'block_coding',
  },

  // CIDADE DIGITAL
  {
    id: 'obj_loja_virtual_terminal',
    name: 'Loja Virtual & Personalização 3D',
    type: 'shop',
    zone: 'cidade_digital',
    position: [58, 0, 8],
    promptText: 'Abrir Loja Virtual e Personalizar Avatar',
    description: 'Troca as tuas BitMoedas por novos estilos de cabelo, camisolas e acessórios tecnológicos.',
    color: '#f59e0b',
  },
  {
    id: 'obj_centro_cidadania_livro',
    name: 'Terminal da Biblioteca & Cidadania Digital',
    type: 'book',
    zone: 'cidade_digital',
    position: [58, 0, -8],
    promptText: 'Estudar segurança digital e cidadania',
    description: 'Módulo 4: Resolve casos reais sobre convivência online, pegada digital e direitos de autor.',
    color: '#0ea5e9',
    linkedMissionId: 'missao_cidadania',
    linkedModuleId: 'mod4_cidadania',
    linkedActivity: 'citizenship_dilemma',
  },

  // ILHA DA CRIATIVIDADE
  {
    id: 'obj_bancada_criativa',
    name: 'Estúdio Multimédia de Cartazes Digitais',
    type: 'workbench',
    zone: 'ilha_criatividade',
    position: [-56, 0, 4],
    promptText: 'Interagir com computador (Estúdio Criativo)',
    description: 'Módulo 6: Cria cartazes e diapositivos educativos aplicando regras de contraste e design.',
    color: '#ec4899',
    linkedMissionId: 'missao_criatividade',
    linkedModuleId: 'mod6_criatividade',
    linkedActivity: 'creative_studio',
  },

  // ARENA DOS DESAFIOS
  {
    id: 'obj_podio_arena',
    name: 'Terminal Central da Arena dos Desafios',
    type: 'robot',
    zone: 'arena_desafios',
    position: [0, 0, 54],
    promptText: 'Iniciar desafio (Torneio TIC 5.º Ano)',
    description: 'Quiz interativo rápido sobre todos os módulos de TIC com bónus de XP e BitMoedas.',
    color: '#6366f1',
    linkedMissionId: 'missao_arena',
    linkedActivity: 'arena_quiz',
  },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shop_acc_ar_glasses',
    name: 'Óculos de Realidade Aumentada',
    category: 'accessory',
    value: 'ar_glasses',
    priceCoins: 50,
    requiredLevel: 1,
    description: 'Lentes holográficas ciano para ver dados técnicos no mundo 3D.',
    previewColor: '#22d3ee',
  },
  {
    id: 'shop_acc_headphones',
    name: 'Auscultadores Cyber Som',
    category: 'accessory',
    value: 'cyber_headphones',
    priceCoins: 70,
    requiredLevel: 1,
    description: 'Periférico de saída de áudio com iluminação lateral.',
    previewColor: '#f43f5e',
  },
  {
    id: 'shop_hair_visor',
    name: 'Capacete Visor Futuro',
    category: 'hairStyle',
    value: 'visor_tech',
    priceCoins: 90,
    requiredLevel: 2,
    description: 'Capacete leve de proteção usado pelos engenheiros da Cidade Digital.',
    previewColor: '#38bdf8',
  },
  {
    id: 'shop_acc_jetpack',
    name: 'Mochila Propulsora BitJet',
    category: 'accessory',
    value: 'jetpack',
    priceCoins: 120,
    requiredLevel: 2,
    description: 'Mochila tecnológica equipada com propulsores luminosos.',
    previewColor: '#f59e0b',
  },
  {
    id: 'shop_acc_antenna',
    name: 'Antena Transmissora RoboTIC',
    category: 'accessory',
    value: 'robo_antenna',
    priceCoins: 80,
    requiredLevel: 2,
    description: 'Inspirada na mascote RoboTIC para captar sinais de rede Wi-Fi.',
    previewColor: '#10b981',
  },
  {
    id: 'shop_shirt_emerald',
    name: 'Casaco Verde Circuito',
    category: 'shirtColor',
    value: '#059669',
    priceCoins: 40,
    requiredLevel: 1,
    description: 'Cor oficial dos especialistas do Laboratório de Hardware.',
    previewColor: '#059669',
  },
  {
    id: 'shop_shirt_crimson',
    name: 'Camisola Coral Criativo',
    category: 'shirtColor',
    value: '#e11d48',
    priceCoins: 40,
    requiredLevel: 1,
    description: 'Cor vibrante dos criadores da Ilha da Criatividade.',
    previewColor: '#e11d48',
  },
  {
    id: 'shop_shirt_gold',
    name: 'Fato Dourado Campeão da Arena',
    category: 'shirtColor',
    value: '#d97706',
    priceCoins: 110,
    requiredLevel: 3,
    description: 'Casaco de honra para os mestres dos desafios de TIC.',
    previewColor: '#d97706',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'Professor TIC',
    senderRole: 'Professor',
    text: 'Bem-vindos ao TIC World, turma do 5.º ano! Usem as teclas W, A, S, D para explorar a Praça Central ou aproximem-se de mim e carreguem em [E].',
    timestamp: '09:00',
    zoneId: 'praca_central',
    isSystemOrTip: true,
  },
  {
    id: 'msg-2',
    sender: 'Beatriz (5.º B)',
    senderRole: 'Aluna',
    text: 'Já concluí a missão "O Computador Misterioso" no Laboratório de Hardware! Não sabia que a memória RAM perdia os dados quando o PC desliga.',
    timestamp: '09:04',
    zoneId: 'academia_tic',
  },
  {
    id: 'msg-3',
    sender: 'Tomás (5.º A)',
    senderRole: 'Aluno',
    text: 'Alguém quer ir à Oficina de Programação ajudar a programar o RoboTIC com blocos de repetição?',
    timestamp: '09:07',
    zoneId: 'academia_tic',
  },
  {
    id: 'msg-4',
    sender: 'Agente Cyber',
    senderRole: 'Segurança Digital',
    text: 'Lembrete de Cidadania Digital: No chat da escola virtual usamos sempre linguagem respeitosa e nunca partilhamos palavras-passe nem dados pessoais!',
    timestamp: '09:10',
    zoneId: 'cidade_digital',
    isSystemOrTip: true,
  },
];

export const QUICK_SAFE_PHRASES = [
  'Olá a todos! Vou explorar a Academia TIC.',
  'Acabei de concluir uma missão e subi de XP!',
  'Lembrem-se: nunca cliquem em links suspeitos de phishing!',
  'Preciso de ajuda no desafio de programação por blocos.',
  'Já viram o cartaz que criei na Ilha da Criatividade?',
  'Qual é a diferença entre periféricos de entrada e de saída?',
];
