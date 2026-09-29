export type ZoneId =
  | 'praca_central'
  | 'academia_tic'
  | 'cidade_digital'
  | 'ilha_criatividade'
  | 'arena_desafios';

export type RoomId =
  | 'sala_informatica'
  | 'lab_hardware'
  | 'lab_internet'
  | 'sala_seguranca'
  | 'oficina_programacao'
  | 'centro_projetos';

export type ModuleId =
  | 'mod1_computadores'
  | 'mod2_internet'
  | 'mod3_seguranca'
  | 'mod4_cidadania'
  | 'mod5_programacao'
  | 'mod6_criatividade';

export type HairStyleId = 'curto' | 'ondulado' | 'crista' | 'trancas' | 'visor_tech';

export type AccessoryId =
  | 'none'
  | 'ar_glasses'
  | 'cyber_headphones'
  | 'jetpack'
  | 'robo_antenna'
  | 'holo_badge';

export type AvatarAnimationState = 'idle' | 'walk' | 'run' | 'jump' | 'interact';

export interface AvatarConfig {
  name: string;
  skinColor: string;
  hairStyle: HairStyleId;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  shoeColor: string;
  accessory: AccessoryId;
}

export type InteractiveObjectType =
  | 'npc'
  | 'computer'
  | 'book'
  | 'robot'
  | 'portal'
  | 'board'
  | 'shop'
  | 'workbench'
  | 'room_station';

export type ActivityType =
  | 'hardware_builder'
  | 'files_organizer'
  | 'web_detective'
  | 'security_analyzer'
  | 'citizenship_dilemma'
  | 'block_coding'
  | 'creative_studio'
  | 'arena_quiz';

export interface WorldInteractiveObject {
  id: string;
  name: string;
  type: InteractiveObjectType;
  zone: ZoneId;
  room?: RoomId;
  position: [number, number, number];
  promptText: string;
  description: string;
  color: string;
  linkedMissionId?: string;
  linkedModuleId?: ModuleId;
  linkedActivity?: ActivityType;
  linkedNpcId?: string;
  targetZoneId?: ZoneId;
  targetPosition?: [number, number, number];
}

export interface NpcDialogueNode {
  id: string;
  speaker: string;
  text: string;
  educationalTakeaway?: string;
  options: {
    label: string;
    nextNodeId?: string;
    triggerMissionId?: string;
    triggerActivity?: ActivityType;
    xpBonus?: number;
  }[];
}

export interface NpcCharacter {
  id: string;
  name: string;
  role: string;
  zone: ZoneId;
  position: [number, number, number];
  skinColor: string;
  coatColor: string;
  accentColor: string;
  isRobot?: boolean;
  promptText: string;
  shortBio: string;
  initialNodeId: string;
  dialogueNodes: Record<string, NpcDialogueNode>;
  linkedMissionIds: string[];
}

export type MissionStatus = 'bloqueada' | 'disponivel' | 'em_progresso' | 'concluida';

export interface Mission {
  id: string;
  code: string;
  title: string;
  description: string;
  objective: string;
  difficulty: 'Iniciante' | 'Intermédio' | 'Avançado';
  xpReward: number;
  coinReward: number;
  moduleId: ModuleId;
  zoneId: ZoneId;
  roomName?: string;
  activityType: ActivityType;
  requiredLevel?: number;
}

export interface CurriculumModule {
  id: ModuleId;
  number: string;
  title: string;
  subtitle: string;
  zoneId: ZoneId;
  roomName: string;
  topics: string[];
  summary: string;
  keyConcepts: {
    term: string;
    definition: string;
    example: string;
  }[];
  missionIds: string[];
}

export interface LevelDefinition {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  perkDescription: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  criteria: string;
  category: string;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'hairStyle' | 'shirtColor' | 'pantsColor' | 'accessory';
  value: string;
  priceCoins: number;
  requiredLevel: number;
  description: string;
  previewColor?: string;
}

export interface CreativeProject {
  id: string;
  title: string;
  theme: string;
  headline: string;
  bulletPoints: string[];
  accentColor: string;
  layoutStyle: 'editorial' | 'infografico' | 'alerta_cyber';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderRole: string;
  text: string;
  timestamp: string;
  zoneId: ZoneId;
  isSystemOrTip?: boolean;
}

export interface StudentProgress {
  xp: number;
  coins: number;
  avatar: AvatarConfig;
  currentZone: ZoneId;
  currentPosition: [number, number, number];
  missionStatuses: Record<string, MissionStatus>;
  activeMissionId: string | null;
  unlockedBadges: string[];
  discoveredObjects: string[];
  visitedZones: ZoneId[];
  talkedToNpcs: string[];
  unlockedShopItemIds: string[];
  creativeProjects: CreativeProject[];
  completedActivitiesCount: Record<string, number>;
}
