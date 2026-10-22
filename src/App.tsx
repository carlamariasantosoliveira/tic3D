import React, { useEffect, useState } from 'react';
import {
  ActivityType,
  AvatarConfig,
  ChatMessage,
  CreativeProject,
  MissionStatus,
  ModuleId,
  NpcCharacter,
  ShopItem,
  StudentProgress,
  WorldInteractiveObject,
  ZoneId,
} from './types/world';
import {
  BADGES_DATA,
  CURRICULUM_MODULES,
  GENERATED_ASSETS,
  INITIAL_CHAT_MESSAGES,
  LEVELS_DATA,
  MISSIONS_DATA,
  NPCS_DATA,
  ZONES_DATA,
} from './data/ticWorldData';
import { World3DCanvas } from './components/World3DCanvas';
import { EducationalSimulatorsModal } from './components/EducationalSimulatorsModal';
import {
  AvatarAndShopPanel,
  HowToPlayModal,
  NpcDialogueModal,
  WorldMapModal,
} from './components/WorldPanelsAndModals';
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Compass,
  GraduationCap,
  HelpCircle,
  ListChecks,
  Map,
  Play,
  Power,
  RotateCcw,
  Settings,
  Sparkles,
  Trophy,
  User,
  Users,
} from 'lucide-react';

const STORAGE_KEY = 'tic_world_5ano_state_v2';

const DEFAULT_PROGRESS: StudentProgress = {
  xp: 320,
  coins: 150,
  avatar: {
    name: 'Aluno(a)',
    skinColor: '#f1c27d',
    hairStyle: 'curto',
    hairColor: '#78350f',
    shirtColor: '#cbd5e1',
    pantsColor: '#1d4ed8',
    shoeColor: '#f8fafc',
    accessory: 'none',
  },
  currentZone: 'praca_central',
  currentPosition: [0, 0, 6],
  missionStatuses: {
    missao_hardware: 'em_progresso',
    missao_ficheiros: 'disponivel',
    missao_internet: 'disponivel',
    missao_seguranca: 'disponivel',
    missao_cidadania: 'disponivel',
    missao_programacao: 'disponivel',
    missao_criatividade: 'disponivel',
    missao_arena: 'disponivel',
  },
  activeMissionId: 'missao_hardware',
  unlockedBadges: ['primeiro_login'],
  discoveredObjects: [],
  visitedZones: ['praca_central'],
  talkedToNpcs: [],
  unlockedShopItemIds: ['shop_acc_ar_glasses'],
  creativeProjects: [
    {
      id: 'proj-demo-1',
      title: 'Cuidados com as Palavras-Passe',
      theme: 'Cibersegurança Escolar',
      headline: 'Protege a tua conta escolar todos os dias!',
      bulletPoints: [
        'Usa pelo menos 10 caracteres com letras, números e símbolos.',
        'Nunca partilhes a tua palavra-passe com ninguém.',
        'Termina sempre a sessão nos computadores da escola.',
      ],
      accentColor: '#0284c7',
      layoutStyle: 'infografico',
      createdAt: 'Hoje',
    },
  ],
  completedActivitiesCount: {},
};

type MainTab = 'mundo' | 'missoes' | 'curriculo' | 'avatar' | 'progresso';

export default function App() {
  const [progress, setProgress] = useState<StudentProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_PROGRESS;
  });

  const [activeTab, setActiveTab] = useState<MainTab>('mundo');
  const [missionFilter, setMissionFilter] = useState<'todas' | MissionStatus>('todas');
  const [selectedModuleId, setSelectedModuleId] = useState<ModuleId>('mod1_computadores');

  // Modals & Active Interactions
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [activeNpc, setActiveNpc] = useState<NpcCharacter | null>(null);
  const [activeSimulator, setActiveSimulator] = useState<{
    activity: ActivityType;
    missionId?: string;
  } | null>(null);
  const [teleportSignal, setTeleportSignal] = useState<{
    position: [number, number, number];
    timestamp: number;
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore storage errors
    }
  }, [progress]);

  const showToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => {
      setToastBanner((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Compute current level
  const currentLevelObj =
    [...LEVELS_DATA].reverse().find((l) => progress.xp >= l.minXp) || LEVELS_DATA[0];
  const nextLevelObj = LEVELS_DATA.find((l) => l.level === currentLevelObj.level + 1);
  const xpProgressPercent = nextLevelObj
    ? Math.min(
        100,
        Math.round(
          ((progress.xp - currentLevelObj.minXp) / (nextLevelObj.minXp - currentLevelObj.minXp)) *
            100
        )
      )
    : 100;

  const completedMissionIds = Object.entries(progress.missionStatuses)
    .filter(([, st]) => st === 'concluida')
    .map(([id]) => id);

  // Handlers
  const handleZoneChange = (newZone: ZoneId) => {
    setProgress((prev) => {
      const visited = prev.visitedZones.includes(newZone)
        ? prev.visitedZones
        : [...prev.visitedZones, newZone];
      const badges = new Set(prev.unlockedBadges);
      let bonusXp = 0;
      if (!prev.visitedZones.includes(newZone)) {
        bonusXp = 20;
      }
      if (visited.length >= 3 && !badges.has('explorador')) {
        badges.add('explorador');
        showToast('Nova Medalha Desbloqueada: Explorador (+20 XP)!');
      }
      return {
        ...prev,
        currentZone: newZone,
        visitedZones: visited,
        xp: prev.xp + bonusXp,
        unlockedBadges: Array.from(badges),
      };
    });
  };

  const handleTeleport = (zone: ZoneId, position: [number, number, number]) => {
    handleZoneChange(zone);
    setActiveTab('mundo');
    setTeleportSignal({ position, timestamp: Date.now() });
    showToast(`Teletransportado para: ${ZONES_DATA[zone].name}`);
  };

  const handleInteractObject = (obj: WorldInteractiveObject) => {
    if (!progress.discoveredObjects.includes(obj.id)) {
      setProgress((prev) => ({
        ...prev,
        xp: prev.xp + 10,
        discoveredObjects: [...prev.discoveredObjects, obj.id],
      }));
    }

    if (obj.type === 'portal' && obj.targetZoneId && obj.targetPosition) {
      handleTeleport(obj.targetZoneId, obj.targetPosition);
      return;
    }

    if (obj.type === 'shop') {
      setActiveTab('avatar');
      return;
    }

    if (obj.type === 'board') {
      setActiveTab('progresso');
      return;
    }

    if (obj.linkedActivity) {
      if (obj.linkedMissionId) {
        setProgress((prev) => ({
          ...prev,
          activeMissionId: obj.linkedMissionId!,
          missionStatuses: {
            ...prev.missionStatuses,
            [obj.linkedMissionId!]:
              prev.missionStatuses[obj.linkedMissionId!] === 'concluida'
                ? 'concluida'
                : 'em_progresso',
          },
        }));
      }
      setActiveSimulator({ activity: obj.linkedActivity, missionId: obj.linkedMissionId });
    }
  };

  const handleInteractNpc = (npc: NpcCharacter) => {
    if (!progress.talkedToNpcs.includes(npc.id)) {
      setProgress((prev) => ({
        ...prev,
        xp: prev.xp + 15,
        talkedToNpcs: [...prev.talkedToNpcs, npc.id],
      }));
    }
    setActiveNpc(npc);
  };

  const handleCompleteActivity = (activityType: ActivityType, missionId?: string) => {
    const mission = MISSIONS_DATA.find(
      (m) => m.id === missionId || m.activityType === activityType
    );
    const xpGain = mission ? mission.xpReward : 100;
    const coinGain = mission ? mission.coinReward : 50;

    setProgress((prev) => {
      const badges = new Set(prev.unlockedBadges);
      if (activityType === 'hardware_builder') badges.add('mestre_hardware');
      if (activityType === 'web_detective') badges.add('navegador_seguro');
      if (activityType === 'security_analyzer') badges.add('guardiao_digital');
      if (activityType === 'block_coding') badges.add('programador');
      if (activityType === 'creative_studio') badges.add('criador_digital');

      const nextStatuses = { ...prev.missionStatuses };
      if (mission) {
        nextStatuses[mission.id] = 'concluida';
      }

      return {
        ...prev,
        xp: prev.xp + xpGain,
        coins: prev.coins + coinGain,
        missionStatuses: nextStatuses,
        unlockedBadges: Array.from(badges),
        completedActivitiesCount: {
          ...prev.completedActivitiesCount,
          [activityType]: (prev.completedActivitiesCount[activityType] || 0) + 1,
        },
      };
    });

    setActiveSimulator(null);
    showToast(
      `Parabéns! Atividade concluída: +${xpGain} XP e +${coinGain} BitMoedas adicionados ao teu perfil!`
    );
  };

  const handleSaveCreativeProject = (proj: Omit<CreativeProject, 'id' | 'createdAt'>) => {
    const newProj: CreativeProject = {
      ...proj,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    };
    setProgress((prev) => ({
      ...prev,
      creativeProjects: [newProj, ...prev.creativeProjects],
    }));
    showToast('Cartaz Digital guardado no teu Portefólio da Ilha da Criatividade!');
  };

  const handleUpdateAvatar = (nextAvatar: AvatarConfig) => {
    setProgress((prev) => ({ ...prev, avatar: nextAvatar }));
  };

  const handleBuyShopItem = (item: ShopItem) => {
    if (progress.coins < item.priceCoins) return;
    setProgress((prev) => ({
      ...prev,
      coins: prev.coins - item.priceCoins,
      unlockedShopItemIds: [...prev.unlockedShopItemIds, item.id],
    }));
    showToast(`Artigo desbloqueado na Loja Virtual: ${item.name}!`);
  };

  const handleSendMessage = (text: string) => {
    const timeStr = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: progress.avatar.name || 'Explorador TIC',
      senderRole: `Nível ${currentLevelObj.level}`,
      text,
      timestamp: timeStr,
      zoneId: progress.currentZone,
    };

    const zoneNpc = NPCS_DATA.find((n) => n.zone === progress.currentZone) || NPCS_DATA[0];
    const npcReply: ChatMessage = {
      id: `msg-reply-${Date.now()}`,
      sender: zoneNpc.name,
      senderRole: zoneNpc.role,
      text: `Boa partilha, ${progress.avatar.name}! Continua a explorar a zona ${
        ZONES_DATA[progress.currentZone].name
      } e lembra-te de aplicar as regras de segurança e cidadania digital.`,
      timestamp: timeStr,
      zoneId: progress.currentZone,
      isSystemOrTip: true,
    };

    setChatMessages((prev) => [...prev, userMsg, npcReply]);
  };

  const filteredMissions = MISSIONS_DATA.filter((m) => {
    if (missionFilter === 'todas') return true;
    const status = progress.missionStatuses[m.id] || 'disponivel';
    return status === missionFilter;
  });

  const selectedModule =
    CURRICULUM_MODULES.find((m) => m.id === selectedModuleId) || CURRICULUM_MODULES[0];

  return (
    <div className="min-h-screen h-dvh flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      {/* TIC MUNDO REFERENCE TOP NAVIGATION BAR */}
      <header className="h-16 sm:h-[68px] px-3 sm:px-6 bg-gradient-to-r from-[#0c2138] via-[#122b49] to-[#0c2138] border-b border-sky-400/35 flex items-center justify-between shrink-0 z-30 text-white shadow-lg">
        {/* Left Brand Block: 3D Globe + TIC MUNDO + Subtitle */}
        <button
          onClick={() => setActiveTab('mundo')}
          className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-sky-400 to-blue-700 p-0.5 shadow-md border border-sky-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 40 40" className="w-full h-full rounded-full">
              <circle cx="20" cy="20" r="19" fill="#0284c7" />
              <path
                d="M12,8 C16,7 19,10 18,14 C17,18 11,19 10,24 C9,28 14,31 13,35 L6,30 L5,16 Z"
                fill="#4ade80"
              />
              <path
                d="M24,10 C29,11 34,15 33,21 C32,27 27,31 23,33 C21,29 22,24 20,20 C19,16 21,12 24,10 Z"
                fill="#22c55e"
              />
              <circle
                cx="20"
                cy="20"
                r="18.5"
                fill="none"
                stroke="#bae6fd"
                strokeWidth="1"
                opacity="0.65"
              />
            </svg>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-display font-black tracking-wider text-white leading-none">
              TIC MUNDO
            </div>
            <div className="text-[10px] sm:text-xs text-sky-200 font-medium tracking-tight mt-0.5 hidden sm:block">
              Aprender. Explorar. Criar. Juntos.
            </div>
          </div>
        </button>

        {/* Center 7 Icon + Label Navigation Items (Exact Match to Reference Image) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          <button
            onClick={() => {
              if (activeTab !== 'mundo') {
                setActiveTab('mundo');
              } else {
                setIsWorldMapOpen(true);
              }
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all hover:text-sky-300 ${
              activeTab === 'mundo' ? 'text-sky-300 font-bold' : 'text-slate-100'
            }`}
          >
            <Map className="w-5 h-5" />
            <span className="text-xs font-semibold">Mapa</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'missoes' ? 'mundo' : 'missoes')}
            className={`relative flex flex-col items-center gap-0.5 cursor-pointer transition-all hover:text-sky-300 ${
              activeTab === 'missoes' ? 'text-sky-300 font-bold' : 'text-slate-100'
            }`}
          >
            <span className="absolute -top-0.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-[#122b49]" />
            <ListChecks className="w-5 h-5" />
            <span className="text-xs font-semibold">Missões</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'avatar' ? 'mundo' : 'avatar')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all hover:text-sky-300 ${
              activeTab === 'avatar' ? 'text-sky-300 font-bold' : 'text-slate-100'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-xs font-semibold">Inventário</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'avatar' ? 'mundo' : 'avatar')}
            className="flex flex-col items-center gap-0.5 text-slate-100 hover:text-sky-300 cursor-pointer transition-all"
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-semibold">Avatares</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'progresso' ? 'mundo' : 'progresso')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all hover:text-sky-300 ${
              activeTab === 'progresso' ? 'text-sky-300 font-bold' : 'text-slate-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs font-semibold">Comunidade</span>
          </button>

          <button
            onClick={() => {
              if (activeTab === 'curriculo') {
                setActiveTab('mundo');
              } else {
                setActiveTab('curriculo');
              }
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all hover:text-sky-300 ${
              activeTab === 'curriculo' ? 'text-sky-300 font-bold' : 'text-slate-100'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-xs font-semibold">Professor</span>
          </button>

          <button
            onClick={() => setIsHowToPlayOpen(true)}
            className="flex flex-col items-center gap-0.5 text-slate-100 hover:text-sky-300 cursor-pointer transition-all"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-xs font-semibold">Ajuda</span>
          </button>
        </nav>

        {/* Right Student Profile Pill & System Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 bg-[#091829]/85 border border-slate-600/60 rounded-full pl-1.5 pr-2.5 py-1 shadow-inner">
          {/* Student Avatar Portrait Circle */}
          <button
            onClick={() => setActiveTab('avatar')}
            title="Personalizar Avatar"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-sky-300 to-blue-600 border-2 border-sky-300 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
          >
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <rect width="40" height="40" fill="#bae6fd" />
              <circle cx="20" cy="15" r="8" fill={progress.avatar.skinColor} />
              <path d="M11,14 C11,8 29,8 29,14 C27,11 13,11 11,14 Z" fill={progress.avatar.hairColor} />
              <rect x="10" y="25" width="20" height="15" rx="6" fill={progress.avatar.shirtColor} />
            </svg>
          </button>

          {/* Student Name, Level, and XP Bar */}
          <div className="min-w-[125px] sm:min-w-[165px] pr-1">
            <div className="flex items-center justify-between text-xs font-bold text-white leading-tight">
              <span className="truncate max-w-[90px]">{progress.avatar.name || 'Aluno(a)'}</span>
              <span className="text-[10px] text-amber-300 font-mono">{progress.coins} 🪙</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium mt-0.5">
              <span>Nível {currentLevelObj.level}</span>
              <span className="font-mono tabular-nums text-sky-200">
                {progress.xp} / {nextLevelObj ? nextLevelObj.minXp : 1500} XP
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1">
              <div
                style={{ width: `${xpProgressPercent}%` }}
                className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full transition-all"
              />
            </div>
          </div>

          {/* Settings & Home/World Buttons */}
          <button
            onClick={() => setActiveTab('avatar')}
            title="Definições de Avatar e Inventário"
            className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setActiveTab('mundo');
              setTeleportSignal({ position: [0, 0, 6], timestamp: Date.now() });
              showToast('Regressaste ao ponto inicial da Avenida TIC MUNDO!');
            }}
            title="Voltar à Avenida Central 3D"
            className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-200 hover:text-sky-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {toastBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md bg-[#0f172a]/95 border-2 border-sky-400 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastBanner}</span>
        </div>
      )}

      {/* MAIN VIEWPORT CONTENT */}
      <main className="flex-1 relative overflow-y-auto pb-16 md:pb-0">
        {/* TAB 1: MUNDO 3D */}
        {activeTab === 'mundo' && (
          <div className="w-full h-full relative">
            <World3DCanvas
              avatarConfig={progress.avatar}
              currentZone={progress.currentZone}
              playerPosition={progress.currentPosition}
              completedMissionIds={completedMissionIds}
              onZoneChange={handleZoneChange}
              onInteractObject={handleInteractObject}
              onInteractNpc={handleInteractNpc}
              onPositionUpdate={(pos) =>
                setProgress((prev) => ({ ...prev, currentPosition: pos }))
              }
              teleportSignal={teleportSignal}
              chatMessages={chatMessages}
              onSendChatMessage={handleSendMessage}
              onOpenWorldMap={() => setIsWorldMapOpen(true)}
              onStartActivity={(activity, missionId) =>
                setActiveSimulator({ activity, missionId })
              }
              onOpenAvatarInventory={() => setActiveTab('avatar')}
              onOpenCurriculum={() => setActiveTab('curriculo')}
              onTakeWorldPhoto={() => {
                setProgress((prev) => ({ ...prev, xp: prev.xp + 15 }));
                showToast('📸 Fotografia do TIC MUNDO guardada no teu álbum (+15 XP)!');
              }}
            />
          </div>
        )}

        {/* TAB 2: MISSÕES */}
        {activeTab === 'missoes' && (
          <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="space-y-1">
                <div className="text-xs text-sky-700 font-semibold">
                  Sistema de Missões e Atividades Práticas · 5.º Ano
                </div>
                <h1 className="text-2xl font-display font-bold text-slate-900">
                  Caderno de Missões TIC World
                </h1>
                <p className="text-sm text-slate-600 max-w-2xl">
                  Realiza as missões nos laboratórios ou repete qualquer atividade anteriormente
                  concluída para aperfeiçoar os teus conhecimentos e ganhar XP extra.
                </p>
              </div>

              {/* Interactive Filter Controls */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-xl self-start">
                {(
                  [
                    ['todas', 'Todas'],
                    ['disponivel', 'Disponíveis'],
                    ['em_progresso', 'Em Progresso'],
                    ['concluida', 'Concluídas'],
                  ] as const
                ).map(([fKey, fLabel]) => (
                  <button
                    key={fKey}
                    onClick={() => setMissionFilter(fKey)}
                    className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      missionFilter === fKey
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {fLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredMissions.map((mission) => {
                const status = progress.missionStatuses[mission.id] || 'disponivel';
                const statusLabel =
                  status === 'concluida'
                    ? 'Concluída ✓'
                    : status === 'em_progresso'
                    ? 'Em Progresso'
                    : status === 'bloqueada'
                    ? 'Bloqueada'
                    : 'Disponível';

                return (
                  <div
                    key={mission.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-2">
                      {/* Zero-Pill Unboxed Metadata with typographic separators */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono text-sky-700 font-bold">
                          Missão {mission.code}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{mission.roomName || ZONES_DATA[mission.zoneId].name}</span>
                        <span aria-hidden="true">·</span>
                        <span>Dificuldade: {mission.difficulty}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            status === 'concluida'
                              ? 'text-emerald-700 font-bold'
                              : status === 'em_progresso'
                              ? 'text-amber-700 font-bold'
                              : 'text-slate-600'
                          }
                        >
                          Estado: {statusLabel}
                        </span>
                      </div>

                      <h3 className="text-lg font-display font-bold text-slate-900">
                        {mission.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {mission.description}
                      </p>

                      <div className="pt-1 text-xs text-slate-600">
                        <strong className="text-slate-900">Objetivo:</strong> {mission.objective}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
                        <span className="text-emerald-700 font-bold">+{mission.xpReward} XP</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-700 font-bold">
                          +{mission.coinReward} BitMoedas
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleTeleport(mission.zoneId, ZONES_DATA[mission.zoneId].spawnPoint)
                          }
                          className="min-h-[42px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 whitespace-nowrap cursor-pointer"
                        >
                          Ir ao Local 3D
                        </button>
                        <button
                          onClick={() => {
                            setProgress((prev) => ({
                              ...prev,
                              activeMissionId: mission.id,
                              missionStatuses: {
                                ...prev.missionStatuses,
                                [mission.id]:
                                  prev.missionStatuses[mission.id] === 'concluida'
                                    ? 'concluida'
                                    : 'em_progresso',
                              },
                            }));
                            setActiveSimulator({
                              activity: mission.activityType,
                              missionId: mission.id,
                            });
                          }}
                          className="min-h-[42px] px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
                        >
                          {status === 'concluida' ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" /> Repetir Atividade
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" /> Resolver Agora
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CURRÍCULO TIC (6 MÓDULOS) */}
        {activeTab === 'curriculo' && (
          <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-6">
            <div className="border-b border-slate-200 pb-5 space-y-1">
              <div className="text-xs text-sky-700 font-semibold">
                Aprendizagens Essenciais · Disciplina de TIC (5.º Ano de Escolaridade)
              </div>
              <h1 className="text-2xl font-display font-bold text-slate-900">
                Módulos Curriculares e Guias de Estudo Interativos
              </h1>
            </div>

            {/* Module Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl">
              {CURRICULUM_MODULES.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedModuleId === mod.id
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mod.number}: {mod.title}
                </button>
              ))}
            </div>

            {/* Selected Module Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-2xs">
                <div className="space-y-2 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2 text-xs text-sky-700 font-semibold">
                    <BookOpen className="w-4 h-4" />
                    <span>{selectedModule.number}</span>
                    <span>·</span>
                    <span>{selectedModule.roomName}</span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-slate-900">
                    {selectedModule.title} — {selectedModule.subtitle}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedModule.summary}</p>
                  <div className="pt-1 text-xs text-slate-500">
                    Conteúdos Abordados: {selectedModule.topics.join(' · ')}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-display font-bold text-slate-900">
                    Conceitos Fundamentais para o 5.º Ano
                  </h3>
                  <div className="space-y-3">
                    {selectedModule.keyConcepts.map((kc, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                      >
                        <div className="text-sm font-bold text-sky-800">
                          0{idx + 1}. {kc.term}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{kc.definition}</p>
                        <div className="text-xs text-slate-500 pt-1">
                          <strong className="text-slate-800">Exemplo prático:</strong> {kc.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Linked Missions & Quick Practice Column */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <h3 className="text-base font-display font-bold text-slate-900">
                  Atividades Práticas deste Módulo
                </h3>
                <p className="text-xs text-slate-600">
                  Põe em prática o que aprendeste neste módulo resolvendo os simuladores abaixo:
                </p>

                <div className="space-y-3">
                  {MISSIONS_DATA.filter((m) => selectedModule.missionIds.includes(m.id)).map(
                    (m) => {
                      const done = progress.missionStatuses[m.id] === 'concluida';
                      return (
                        <div
                          key={m.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-sky-700">{m.code}</span>
                            <span className="font-mono font-bold text-emerald-700">
                              +{m.xpReward} XP
                            </span>
                          </div>
                          <div className="text-sm font-display font-bold text-slate-900">
                            {m.title}
                          </div>
                          <p className="text-xs text-slate-600">{m.objective}</p>
                          <button
                            onClick={() =>
                              setActiveSimulator({ activity: m.activityType, missionId: m.id })
                            }
                            className="min-h-[44px] w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>{done ? 'Repetir Simulador' : 'Iniciar Simulador'}</span>
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AVATAR & LOJA */}
        {activeTab === 'avatar' && (
          <AvatarAndShopPanel
            avatar={progress.avatar}
            coins={progress.coins}
            currentLevel={currentLevelObj.level}
            unlockedItemIds={progress.unlockedShopItemIds}
            onUpdateAvatar={handleUpdateAvatar}
            onBuyShopItem={handleBuyShopItem}
          />
        )}

        {/* TAB 5: PROGRESSO & GAMIFICAÇÃO */}
        {activeTab === 'progresso' && (
          <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-8">
            {/* Student Summary Hero Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-2xs">
              <div className="lg:col-span-3 flex justify-center">
                <img
                  src={GENERATED_ASSETS.badgeInsignia}
                  alt="Insígnia Oficial TIC World"
                  referrerPolicy="no-referrer"
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl object-cover border border-slate-200 shadow-md"
                />
              </div>

              <div className="lg:col-span-9 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-sky-700 font-semibold">
                      Passaporte Digital do Aluno · 5.º Ano
                    </div>
                    <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                      {progress.avatar.name} — Nível {currentLevelObj.level}:{' '}
                      {currentLevelObj.title}
                    </h1>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem(STORAGE_KEY);
                      setProgress(DEFAULT_PROGRESS);
                      showToast('Progresso reposto para os valores iniciais.');
                    }}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Repor Progresso
                  </button>
                </div>

                <p className="text-xs text-slate-600">{currentLevelObj.perkDescription}</p>

                {/* Tabular Numeric Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Experiência Total</div>
                    <div className="text-lg font-mono font-bold text-sky-700 tabular-nums">
                      {progress.xp} XP
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Saldo Virtual</div>
                    <div className="text-lg font-mono font-bold text-amber-600 tabular-nums">
                      {progress.coins} BitMoedas
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Missões Concluídas</div>
                    <div className="text-lg font-mono font-bold text-emerald-600 tabular-nums">
                      {completedMissionIds.length} / {MISSIONS_DATA.length}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500">Zonas Exploradas</div>
                    <div className="text-lg font-mono font-bold text-indigo-600 tabular-nums">
                      {progress.visitedZones.length} / 5
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges / Medalhas Conquistadas */}
            <div className="space-y-4">
              <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Medalhas e Conquistas (
                {progress.unlockedBadges.length}/{BADGES_DATA.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BADGES_DATA.map((badge) => {
                  const unlocked = progress.unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-2xl border space-y-2 ${
                        unlocked
                          ? 'bg-white border-amber-400 shadow-2xs'
                          : 'bg-slate-100/70 border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{badge.category}</span>
                        <span
                          className={
                            unlocked ? 'text-amber-600 font-bold' : 'text-slate-400 font-medium'
                          }
                        >
                          {unlocked ? 'Desbloqueada ★' : 'Por conquistar'}
                        </span>
                      </div>
                      <h3 className="text-sm font-display font-bold text-slate-900">
                        {badge.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{badge.description}</p>
                      <div className="text-[11px] text-slate-500 pt-1">
                        Requisito: {badge.criteria}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Levels Roadmap Table */}
            <div className="space-y-4">
              <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-sky-600" /> Escala de Níveis TIC 5.º Ano
              </h2>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="divide-y divide-slate-200">
                  {LEVELS_DATA.map((lvl) => {
                    const reached = progress.xp >= lvl.minXp;
                    return (
                      <div
                        key={lvl.level}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>
                              Nível {lvl.level} — {lvl.title}
                            </span>
                            {reached && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <p className="text-slate-600">{lvl.perkDescription}</p>
                        </div>
                        <div className="font-mono tabular-nums font-semibold text-slate-700 shrink-0">
                          {lvl.minXp} XP necessários
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE FIXED BOTTOM TAB BAR (Pattern 1 — Natural Thumb Zone, <15% Sticky Cap) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center px-1">
        {(
          [
            ['mundo', 'Mundo 3D', Compass],
            ['missoes', 'Missões', ListChecks],
            ['curriculo', 'Currículo', BookOpen],
            ['avatar', 'Avatar', User],
            ['progresso', 'Progresso', Award],
          ] as const
        ).map(([id, label, IconComp]) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
                isActive ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <IconComp className="w-5 h-5" />
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      <HowToPlayModal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />

      <WorldMapModal
        isOpen={isWorldMapOpen}
        currentZone={progress.currentZone}
        onTeleport={handleTeleport}
        onLaunchActivity={(act, mId) => setActiveSimulator({ activity: act, missionId: mId })}
        onClose={() => setIsWorldMapOpen(false)}
      />

      <NpcDialogueModal
        npc={activeNpc}
        onClose={() => setActiveNpc(null)}
        onLaunchActivity={(act, mId) => setActiveSimulator({ activity: act, missionId: mId })}
        onAwardBonusXp={(bonus) => {
          setProgress((prev) => ({ ...prev, xp: prev.xp + bonus }));
          showToast(`Bónus de diálogo educativo: +${bonus} XP!`);
        }}
      />

      <EducationalSimulatorsModal
        activityType={activeSimulator?.activity || null}
        missionId={activeSimulator?.missionId}
        existingProjects={progress.creativeProjects}
        onSaveCreativeProject={handleSaveCreativeProject}
        onCompleteActivity={handleCompleteActivity}
        onClose={() => setActiveSimulator(null)}
      />
    </div>
  );
}
