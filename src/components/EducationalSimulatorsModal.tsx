import React, { useState } from 'react';
import { ActivityType, CreativeProject, Mission } from '../types/world';
import { GENERATED_ASSETS, MISSIONS_DATA } from '../data/ticWorldData';
import { BlockCodingView, CreativeStudioView } from './BlockCodingSimulator';
import {
  CheckCircle2,
  Cpu,
  FolderOpen,
  Globe,
  HelpCircle,
  Lock,
  ShieldAlert,
  Trophy,
  Users,
  X,
} from 'lucide-react';

interface EducationalSimulatorsModalProps {
  activityType: ActivityType | null;
  missionId?: string;
  existingProjects: CreativeProject[];
  onSaveCreativeProject: (proj: Omit<CreativeProject, 'id' | 'createdAt'>) => void;
  onCompleteActivity: (activityType: ActivityType, missionId?: string) => void;
  onClose: () => void;
}

const HARDWARE_PARTS = [
  {
    id: 'cpu',
    name: 'CPU (Processador)',
    slot: 'Socket Central da Placa-Mãe',
    role: 'O "cérebro" do computador que executa cálculos e instruções dos programas.',
    category: 'Interno',
  },
  {
    id: 'ram',
    name: 'Memória RAM',
    slot: 'Ranuras DDR de Memória',
    role: 'Guarda temporariamente os dados dos programas abertos (perde tudo ao desligar).',
    category: 'Interno',
  },
  {
    id: 'ssd',
    name: 'Armazenamento SSD',
    slot: 'Conetor NVMe / SATA',
    role: 'Guarda permanentemente o Sistema Operativo, documentos, fotos e jogos.',
    category: 'Interno',
  },
  {
    id: 'monitor',
    name: 'Monitor',
    slot: 'Porta HDMI / DisplayPort',
    role: 'Periférico de SAÍDA que apresenta imagens, textos e vídeos no ecrã.',
    category: 'Periférico de Saída',
  },
  {
    id: 'teclado',
    name: 'Teclado',
    slot: 'Porta USB A',
    role: 'Periférico de ENTRADA utilizado para escrever texto e comandos.',
    category: 'Periférico de Entrada',
  },
  {
    id: 'rato',
    name: 'Rato',
    slot: 'Porta USB B',
    role: 'Periférico de ENTRADA que move o cursor e permite clicar em objetos.',
    category: 'Periférico de Entrada',
  },
];

const FILES_ITEMS = [
  { id: 'f1', name: 'Trabalho_TIC_5Ano.docx', folder: 'Documentos', hint: 'Ficheiro de texto processado' },
  { id: 'f2', name: 'Fotografia_Escola.png', folder: 'Imagens', hint: 'Ficheiro gráfico de imagem' },
  { id: 'f3', name: 'Hino_Academia.mp3', folder: 'Áudio e Música', hint: 'Ficheiro de som comprimido' },
  { id: 'f4', name: 'Impressora 3D / Papel', folder: 'Periférico de Saída', hint: 'Recebe dados do PC para o exterior' },
  { id: 'f5', name: 'Microfone de Estúdio', folder: 'Periférico de Entrada', hint: 'Envia a tua voz para dentro do PC' },
  { id: 'f6', name: 'Pen USB / Ecrã Tátil', folder: 'Periférico Misto (E/S)', hint: 'Tanto envia como recebe informação' },
];

const WEB_SOURCES = [
  {
    id: 'w1',
    url: 'https://www.dge.mec.pt/curriculo-tic-5ano',
    title: 'Direção-Geral da Educação — Aprendizagens Essenciais de TIC',
    snippet: 'Documento institucional oficial com os conteúdos de Tecnologias da Informação e Comunicação.',
    isReliable: true,
    explanation: 'Fonte oficial governamental (.mec.pt), com ligação segura HTTPS e autoria institucional clara.',
  },
  {
    id: 'w2',
    url: 'http://ganha-moedas-infinitas-ja.xyz/clique',
    title: 'URGENTE!! Ganha 99.999 computadores grátis se clicares em 30 segundos!',
    snippet: 'Partilha já a tua senha da escola para desbloquear o prémio secreto!',
    isReliable: false,
    explanation: 'Sinais claros de fraude/boato: sem HTTPS, domínio estranho, promessa irrealista e pedido de senha.',
  },
  {
    id: 'w3',
    url: 'https://www.ciencia-viva.pt/astronomia-sistema-solar',
    title: 'Ciência Viva — Guia do Sistema Solar para Jovens Investigadores',
    snippet: 'Artigo revisto por astrónomos portugueses, atualizado em 2026 com bibliografia científica.',
    isReliable: true,
    explanation: 'Fonte científica reconhecida, com autores identificados, data atualizada e protocolo HTTPS.',
  },
  {
    id: 'w4',
    url: 'https://blog-sem-autor-inventado.net/terra-quadrada',
    title: 'Cientistas secretos descobrem que os computadores funcionam a sumo de laranja',
    snippet: 'Ninguém sabe quem escreveu este texto, mas um amigo do meu primo garantiu que é verdade!',
    isReliable: false,
    explanation: 'Informação sem autor, sem provas científicas e com afirmações absurdas (notícia falsa / boato).',
  },
];

const SECURITY_CASES = [
  {
    id: 's1',
    sender: 'suporte-falso@jogos-gratis-premio.com',
    message:
      'Olá aluno! A tua conta vai ser apagada hoje! Clica já neste link estranho e escreve a tua palavra-passe para não perderes tudo.',
    question: 'Recebeste esta mensagem. Deves clicar no link?',
    correctChoice: 'Pedir ajuda',
    acceptableChoice: 'Não',
    explanation:
      'Trata-se de um ataque de Phishing que usa urgência falsa para roubar a tua senha. Nunca deves clicar ("Não") e deves avisar um professor ou encarregado de educação ("Pedir ajuda").',
  },
  {
    id: 's2',
    sender: 'Jogador_Misterioso_99 (Chat de Jogo)',
    message: 'Olá! Jogas muito bem! Qual é o teu nome completo, em que escola andas e qual é a tua morada?',
    question: 'Deves responder com os teus dados pessoais a este desconhecido?',
    correctChoice: 'Não',
    acceptableChoice: 'Pedir ajuda',
    explanation:
      'Nunca partilhes dados pessoais (nome completo, escola, morada, telefone) com desconhecidos online.',
  },
  {
    id: 's3',
    sender: 'Pop-up num site desconhecido',
    message: 'PARABÉNS! Foste o visitante n.º 1.000.000! Descarrega o ficheiro "Premio_Secreto.exe" para receberes um telemóvel.',
    question: 'Deves clicar para descarregar e abrir este programa?',
    correctChoice: 'Não',
    acceptableChoice: 'Pedir ajuda',
    explanation:
      'Ficheiros ".exe" desconhecidos podem conter vírus ou malware. Fecha a janela imediatamente.',
  },
];

const CITIZENSHIP_DILEMMAS = [
  {
    id: 'c1',
    scenario:
      'Num grupo de mensagens da turma, alguém publicou uma fotografia embaraçosa de um colega sem autorização e vários começaram a rir.',
    options: [
      { label: 'Partilhar a foto noutro grupo porque tem piada.', isCorrect: false },
      {
        label: 'Não partilhar, apoiar o colega em privado e avisar um adulto/professor.',
        isCorrect: true,
      },
      { label: 'Escrever um comentário a gozar também.', isCorrect: false },
    ],
    takeaway:
      'No combate ao cyberbullying, nunca devemos ser cúmplices. Apoiar a vítima e pedir ajuda a um adulto trava a agressão.',
  },
  {
    id: 'c2',
    scenario:
      'Estás a fazer um trabalho sobre História de Portugal para apresentar na aula e encontraste um texto excelente numa enciclopédia online.',
    options: [
      { label: 'Copiar e colar tudo exatamente igual e dizer que fui eu que escrevi.', isCorrect: false },
      {
        label: 'Ler, resumir pelas minhas próprias palavras e indicar o site na bibliografia.',
        isCorrect: true,
      },
      { label: 'Mudar apenas o título e apagar o nome do verdadeiro autor.', isCorrect: false },
    ],
    takeaway:
      'Respeitar os Direitos de Autor significa não cometer plágio: escreve pelas tuas palavras e cita sempre as fontes.',
  },
  {
    id: 'c3',
    scenario:
      'Terminaste de usar o computador da Biblioteca da escola depois de acederes à tua conta escolar.',
    options: [
      { label: 'Terminar sessão (Logout) e fechar o navegador antes de sair.', isCorrect: true },
      { label: 'Deixar a conta aberta para o próximo colega usar.', isCorrect: false },
      { label: 'Colar um papel no monitor com a minha palavra-passe.', isCorrect: false },
    ],
    takeaway:
      'Em computadores públicos ou da escola, termina sempre a sessão para proteger a tua identidade digital.',
  },
];

const ARENA_QUESTIONS = [
  {
    q: '1. Qual destes componentes guarda temporariamente os programas abertos e perde os dados quando o computador é desligado?',
    opts: ['Memória RAM', 'Disco SSD', 'Teclado', 'Monitor'],
    ans: 0,
  },
  {
    q: '2. O que significa a sigla "S" no protocolo seguro HTTPS visível na barra de endereços do navegador?',
    opts: ['Simples (Simple)', 'Seguro (Secure)', 'Secreto (Secret)', 'Sistema (System)'],
    ans: 1,
  },
  {
    q: '3. Qual destas palavras-passe é a mais forte e segura para proteger uma conta?',
    opts: ['12345678', 'joao2015', 'senha123', 'T!c_Mundo#2026_5Ano'],
    ans: 3,
  },
  {
    q: '4. Na programação por blocos, que estrutura usamos para executar a mesma instrução 5 vezes sem a repetir manualmente?',
    opts: ['Um Ciclo (Repetição)', 'Um Periférico de Saída', 'Um Ficheiro .mp3', 'Um Motor de Pesquisa'],
    ans: 0,
  },
  {
    q: '5. Qual destes dispositivos é simultaneamente um periférico de Entrada e de Saída (Misto)?',
    opts: ['Rato Ótico', 'Impressora', 'Ecrã Tátil (Touchscreen)', 'Microfone'],
    ans: 2,
  },
];

export const EducationalSimulatorsModal: React.FC<EducationalSimulatorsModalProps> = ({
  activityType,
  missionId,
  existingProjects,
  onSaveCreativeProject,
  onCompleteActivity,
  onClose,
}) => {
  const [installedIds, setInstalledIds] = useState<string[]>([]);
  const [selectedPart, setSelectedPart] = useState(HARDWARE_PARTS[0]);
  const [classifiedIds, setClassifiedIds] = useState<string[]>([]);
  const [webVerdicts, setWebVerdicts] = useState<Record<string, boolean>>({});
  const [secAnswers, setSecAnswers] = useState<Record<string, string>>({});
  const [testPassword, setTestPassword] = useState('');
  const [citAnswers, setCitAnswers] = useState<Record<string, number>>({});
  const [arenaAnswers, setArenaAnswers] = useState<Record<number, number>>({});

  if (!activityType) return null;

  const linkedMission: Mission | undefined = MISSIONS_DATA.find(
    (m) => m.id === missionId || m.activityType === activityType
  );

  const calcPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 10) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };
  const pwdScore = calcPasswordStrength(testPassword);

  const completeNow = () => {
    onCompleteActivity(activityType, linkedMission?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Mobile grab handle */}
        <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="space-y-0.5 min-w-0">
            <div className="text-xs text-sky-700 font-semibold truncate">
              {linkedMission
                ? `Missão ${linkedMission.code} · ${linkedMission.roomName}`
                : 'Simulador Interativo TIC'}
              {linkedMission &&
                ` · +${linkedMission.xpReward} XP · +${linkedMission.coinReward} BitMoedas`}
            </div>
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 truncate">
              {linkedMission ? linkedMission.title : 'Laboratório Prático TIC 5.º Ano'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar atividade"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* 1A: HARDWARE BUILDER */}
          {activityType === 'hardware_builder' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 space-y-4">
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={GENERATED_ASSETS.hardwareDiagram}
                    alt="Diagrama Técnico da Placa-Mãe e Componentes de Hardware"
                    referrerPolicy="no-referrer"
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                  <div className="p-4 bg-white border-t border-slate-200 space-y-1">
                    <div className="text-xs font-mono font-bold text-emerald-700">
                      BANCADA TÉCNICA: {installedIds.length} / {HARDWARE_PARTS.length} COMPONENTES
                      INSTALADOS
                    </div>
                    <p className="text-xs text-slate-600">
                      Seleciona cada componente, lê a sua função no computador e toca em{' '}
                      <strong>Instalar na Bancada</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-sky-800">
                    <span className="font-bold flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-sky-600" /> {selectedPart.name}
                    </span>
                    <span className="font-medium">{selectedPart.category}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedPart.role}</p>
                  <div className="text-[11px] font-mono text-slate-500">
                    Local de Encaixe: {selectedPart.slot}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-3">
                <h3 className="text-sm font-display font-bold text-slate-900">
                  Componentes para Identificar e Instalar (6)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {HARDWARE_PARTS.map((part) => {
                    const isInstalled = installedIds.includes(part.id);
                    return (
                      <div
                        key={part.id}
                        onClick={() => setSelectedPart(part)}
                        className={`p-3.5 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between gap-2.5 ${
                          isInstalled
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : selectedPart.id === part.id
                            ? 'bg-sky-50 border-sky-400'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                            <span>{part.name}</span>
                            {isInstalled && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{part.category}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPart(part);
                            if (!isInstalled) setInstalledIds((prev) => [...prev, part.id]);
                          }}
                          className={`min-h-[42px] w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            isInstalled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sky-600 hover:bg-sky-500 text-white'
                          }`}
                        >
                          {isInstalled ? 'Instalado e Verificado ✓' : 'Instalar na Bancada'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {installedIds.length === HARDWARE_PARTS.length && (
                  <div className="pt-2">
                    <button
                      onClick={completeNow}
                      className="min-h-[48px] w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Concluir Missão "O Computador Misterioso"
                      (+120 XP)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 1B: FILES & PERIPHERALS ORGANIZER */}
          {activityType === 'files_organizer' && (
            <div className="space-y-5">
              <p className="text-xs text-slate-600">
                No Sistema Operativo é essencial organizar cada ficheiro na pasta correspondente à
                sua extensão e saber classificar os periféricos. Toca em cada item para o arquivar:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {FILES_ITEMS.map((item) => {
                  const done = classifiedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border space-y-2.5 ${
                        done
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <FolderOpen className="w-4 h-4 text-sky-600" /> {item.name}
                        </span>
                        {done && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-xs text-slate-600">{item.hint}</p>
                      <button
                        onClick={() => {
                          if (!done) setClassifiedIds((prev) => [...prev, item.id]);
                        }}
                        className={`min-h-[44px] w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          done
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-sky-600 hover:bg-sky-500 text-white'
                        }`}
                      >
                        {done ? `Arquivado em: ${item.folder} ✓` : `Mover para: ${item.folder}`}
                      </button>
                    </div>
                  );
                })}
              </div>

              {classifiedIds.length === FILES_ITEMS.length && (
                <button
                  onClick={completeNow}
                  className="min-h-[48px] w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" /> Concluir Arrumação no Sistema Operativo (+100
                  XP)
                </button>
              )}
            </div>
          )}

          {/* 2: WEB DETECTIVE */}
          {activityType === 'web_detective' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    Avalia os 4 resultados do motor de pesquisa: indica se cada página é{' '}
                    <strong>Fonte Fiável</strong> ou <strong>Boato / Suspeita</strong>.
                  </span>
                </span>
                <span className="font-mono font-bold text-sky-700">
                  {Object.keys(webVerdicts).length} / {WEB_SOURCES.length} avaliadas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WEB_SOURCES.map((src) => {
                  const chosen = webVerdicts[src.id];
                  const answered = chosen !== undefined;
                  const isRight = answered && chosen === src.isReliable;

                  return (
                    <div
                      key={src.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-mono text-sky-700 truncate">{src.url}</div>
                        <h4 className="text-sm font-display font-bold text-slate-900">
                          {src.title}
                        </h4>
                        <p className="text-xs text-slate-600">{src.snippet}</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setWebVerdicts((p) => ({ ...p, [src.id]: true }))}
                            className={`min-h-[42px] flex-1 py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer ${
                              answered && chosen === true
                                ? 'bg-emerald-600 text-white font-bold'
                                : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                            }`}
                          >
                            Fonte Fiável
                          </button>
                          <button
                            onClick={() => setWebVerdicts((p) => ({ ...p, [src.id]: false }))}
                            className={`min-h-[42px] flex-1 py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer ${
                              answered && chosen === false
                                ? 'bg-amber-600 text-white font-bold'
                                : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                            }`}
                          >
                            Boato / Não Fiável
                          </button>
                        </div>

                        {answered && (
                          <div
                            className={`p-2.5 rounded-xl text-xs ${
                              isRight
                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                                : 'bg-rose-50 text-rose-900 border border-rose-300'
                            }`}
                          >
                            <strong>{isRight ? 'Correto! ' : 'Atenção: '}</strong>
                            {src.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {Object.keys(webVerdicts).length === WEB_SOURCES.length && (
                <button
                  onClick={completeNow}
                  className="min-h-[48px] w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" /> Concluir Missão "Detetive da Web" (+130 XP)
                </button>
              )}
            </div>
          )}

          {/* 3: SECURITY & PHISHING ANALYZER */}
          {activityType === 'security_analyzer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-3">
                <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" /> Parte 1: Analisador de
                  Mensagens e Links
                </h3>
                {SECURITY_CASES.map((sc) => {
                  const ans = secAnswers[sc.id];
                  const isGood = ans === sc.correctChoice || ans === sc.acceptableChoice;
                  return (
                    <div
                      key={sc.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                    >
                      <div className="text-[11px] font-mono font-semibold text-amber-700">
                        De: {sc.sender}
                      </div>
                      <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200">
                        "{sc.message}"
                      </p>
                      <div className="text-xs font-bold text-slate-900">{sc.question}</div>
                      <div className="flex flex-wrap items-center gap-2">
                        {['Sim', 'Não', 'Pedir ajuda'].map((choice) => (
                          <button
                            key={choice}
                            onClick={() => setSecAnswers((p) => ({ ...p, [sc.id]: choice }))}
                            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                              ans === choice
                                ? 'bg-sky-600 text-white font-bold'
                                : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                            }`}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                      {ans && (
                        <div
                          className={`p-2.5 rounded-xl text-xs ${
                            isGood
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                              : 'bg-rose-50 text-rose-900 border border-rose-300'
                          }`}
                        >
                          <strong>{isGood ? 'Decisão Segura! ' : 'Perigo! '}</strong>
                          {sc.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-600" /> Parte 2: Testador de Palavra-Passe Forte
                </h3>
                <p className="text-xs text-slate-600">
                  Cria uma palavra-passe de teste (não uses a tua senha real!) que cumpra os 4
                  critérios de segurança:
                </p>
                <input
                  type="text"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Ex: Gato!Azul_TIC2026"
                  className="min-h-[44px] w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-xs font-mono text-slate-900"
                />
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Força da Palavra-Passe:</span>
                    <span className="font-mono font-bold text-sky-700">{pwdScore}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      style={{ width: `${pwdScore}%` }}
                      className="h-full bg-emerald-600 transition-all"
                    />
                  </div>
                </div>
                <ul className="space-y-1.5 text-xs">
                  <li
                    className={
                      testPassword.length >= 10
                        ? 'text-emerald-700 font-semibold'
                        : 'text-slate-500'
                    }
                  >
                    {testPassword.length >= 10 ? '✓' : '○'} Pelo menos 10 caracteres
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(testPassword)
                        ? 'text-emerald-700 font-semibold'
                        : 'text-slate-500'
                    }
                  >
                    {/[A-Z]/.test(testPassword) ? '✓' : '○'} Inclui letra MAIÚSCULA
                  </li>
                  <li
                    className={
                      /[0-9]/.test(testPassword)
                        ? 'text-emerald-700 font-semibold'
                        : 'text-slate-500'
                    }
                  >
                    {/[0-9]/.test(testPassword) ? '✓' : '○'} Inclui números (0-9)
                  </li>
                  <li
                    className={
                      /[^A-Za-z0-9]/.test(testPassword)
                        ? 'text-emerald-700 font-semibold'
                        : 'text-slate-500'
                    }
                  >
                    {/[^A-Za-z0-9]/.test(testPassword) ? '✓' : '○'} Inclui símbolos (!, @, #, _)
                  </li>
                </ul>

                {Object.keys(secAnswers).length === SECURITY_CASES.length && pwdScore >= 75 && (
                  <button
                    onClick={completeNow}
                    className="min-h-[48px] w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Concluir "Escudo Anti-Phishing" (+150 XP)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 4: DIGITAL CITIZENSHIP DILEMMAS */}
          {activityType === 'citizenship_dilemma' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  Escolhe a atitude correta de um verdadeiro Cidadão Digital em cada situação do
                  quotidiano escolar:
                </span>
              </div>

              {CITIZENSHIP_DILEMMAS.map((dil, idx) => {
                const picked = citAnswers[dil.id];
                return (
                  <div
                    key={dil.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="text-xs font-display font-bold text-slate-900">
                      Situação {idx + 1}: {dil.scenario}
                    </div>
                    <div className="space-y-2">
                      {dil.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => setCitAnswers((p) => ({ ...p, [dil.id]: oIdx }))}
                          className={`min-h-[44px] w-full text-left p-3 rounded-xl text-xs border transition-colors cursor-pointer ${
                            picked === oIdx
                              ? opt.isCorrect
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                                : 'bg-rose-50 border-rose-400 text-rose-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {picked !== undefined && (
                      <div className="text-xs text-sky-900 bg-sky-50 border border-sky-200 p-3 rounded-xl">
                        <strong>Reflexão de Cidadania:</strong> {dil.takeaway}
                      </div>
                    )}
                  </div>
                );
              })}

              {Object.keys(citAnswers).length === CITIZENSHIP_DILEMMAS.length && (
                <button
                  onClick={completeNow}
                  className="min-h-[48px] w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" /> Concluir "Conselho da Cidade Digital" (+140
                  XP)
                </button>
              )}
            </div>
          )}

          {/* 5: BLOCK CODING */}
          {activityType === 'block_coding' && <BlockCodingView onComplete={completeNow} />}

          {/* 6: CREATIVE STUDIO */}
          {activityType === 'creative_studio' && (
            <CreativeStudioView
              existingProjects={existingProjects}
              onSaveProject={onSaveCreativeProject}
              onComplete={completeNow}
            />
          )}

          {/* ARENA QUIZ */}
          {activityType === 'arena_quiz' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs">
                <span className="text-slate-800 flex items-center gap-2 font-medium">
                  <Trophy className="w-4 h-4 text-indigo-600" /> Responde às 5 questões globais de
                  TIC do 5.º Ano:
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  Corretas:{' '}
                  {ARENA_QUESTIONS.filter((q, i) => arenaAnswers[i] === q.ans).length} /{' '}
                  {ARENA_QUESTIONS.length}
                </span>
              </div>

              {ARENA_QUESTIONS.map((item, qIdx) => {
                const userAns = arenaAnswers[qIdx];
                return (
                  <div
                    key={qIdx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                  >
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{item.q}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.opts.map((optText, oIdx) => {
                        const selected = userAns === oIdx;
                        const isRight = oIdx === item.ans;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => setArenaAnswers((p) => ({ ...p, [qIdx]: oIdx }))}
                            className={`min-h-[44px] p-3 rounded-xl text-xs text-left border transition-colors cursor-pointer ${
                              selected
                                ? isRight
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                                  : 'bg-rose-50 border-rose-400 text-rose-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {optText}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {Object.keys(arenaAnswers).length === ARENA_QUESTIONS.length && (
                <button
                  onClick={completeNow}
                  className="min-h-[48px] w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" /> Concluir Torneio da Arena (+200 XP)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
