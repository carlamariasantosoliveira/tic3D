import React, { useState } from 'react';
import {
  AccessoryId,
  ActivityType,
  AvatarConfig,
  ChatMessage,
  HairStyleId,
  NpcCharacter,
  ShopItem,
  ZoneId,
} from '../types/world';
import {
  GENERATED_ASSETS,
  QUICK_SAFE_PHRASES,
  SHOP_ITEMS,
  WORLD_OBJECTS,
  ZONES_DATA,
} from '../data/ticWorldData';
import {
  Check,
  Compass,
  Keyboard,
  Lock,
  MapPin,
  MessageSquare,
  MousePointer,
  Send,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from 'lucide-react';

export const HowToPlayModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-slate-900">
            Como Jogar no TIC World (Computador, Tablet e Telemóvel)
          </h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-600 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="text-sm font-display font-bold text-sky-700 flex items-center gap-2">
                <Keyboard className="w-4 h-4" /> Computador e Portátil
              </div>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Movimentar / Virar:</span>
                  <strong className="font-mono text-slate-900">W, A, S, D ou Setas</strong>
                </li>
                <li className="flex justify-between">
                  <span>Correr mais depressa:</span>
                  <strong className="font-mono text-slate-900">Shift + Movimento</strong>
                </li>
                <li className="flex justify-between">
                  <span>Saltar:</span>
                  <strong className="font-mono text-slate-900">Tecla Espaço</strong>
                </li>
                <li className="flex justify-between">
                  <span>Interagir com objetos / NPCs:</span>
                  <strong className="font-mono text-sky-700">Tecla E ou Clique</strong>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="text-sm font-display font-bold text-amber-700 flex items-center gap-2">
                <MousePointer className="w-4 h-4" /> Telemóvel, Tablet e Ecrã Tátil
              </div>
              <ul className="space-y-2">
                <li>
                  <strong className="text-slate-900">Rodar Câmara 3D:</strong> Arrasta 1 dedo no
                  ecrã 3D para olhar em redor.
                </li>
                <li>
                  <strong className="text-slate-900">Zoom (Pinça):</strong> Usa 2 dedos no ecrã
                  tátil (ou roda do rato) para aproximar/afastar.
                </li>
                <li>
                  <strong className="text-slate-900">Tocar em Objetos 3D:</strong> Toca diretamente
                  num professor, computador ou portal.
                </li>
                <li>
                  <strong className="text-slate-900">Botões Direcionais:</strong> Usa os comandos na
                  parte inferior do ecrã.
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
            <div className="text-sm font-display font-bold text-emerald-800">
              Objetivo Pedagógico — TIC 5.º Ano
            </div>
            <p className="leading-relaxed text-slate-700">
              Explora as 5 zonas do mundo virtual, conversa com os professores e especialistas,
              resolve as 8 missões dos 6 módulos curriculares (Computadores, Internet, Segurança
              Digital, Cidadania Digital, Programação e Criatividade Digital), ganha XP para subir de
              nível e usa as tuas BitMoedas na Loja Virtual!
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Entendido, Vamos Explorar!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NpcDialogueModal: React.FC<{
  npc: NpcCharacter | null;
  onClose: () => void;
  onLaunchActivity: (activity: ActivityType, missionId?: string) => void;
  onAwardBonusXp: (xp: number) => void;
}> = ({ npc, onClose, onLaunchActivity, onAwardBonusXp }) => {
  const [nodeId, setNodeId] = useState<string>('root');

  if (!npc) return null;
  const currentNode = npc.dialogueNodes[nodeId] || npc.dialogueNodes[npc.initialNodeId];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden" />
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-sky-700">{npc.role}</div>
            <h2 className="text-lg font-display font-bold text-slate-900">{npc.name}</h2>
          </div>
          <button
            onClick={() => {
              setNodeId('root');
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed">
            "{currentNode.text}"
          </div>

          {currentNode.educationalTakeaway && (
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-slate-800">
              <strong className="text-sky-700">Conceito TIC: </strong>
              {currentNode.educationalTakeaway}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-slate-500">
              Escolhe a tua resposta ou ação:
            </div>
            {currentNode.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (opt.xpBonus) onAwardBonusXp(opt.xpBonus);
                  if (opt.triggerActivity) {
                    const act = opt.triggerActivity;
                    const mId = opt.triggerMissionId;
                    setNodeId('root');
                    onClose();
                    onLaunchActivity(act, mId);
                    return;
                  }
                  if (opt.nextNodeId) {
                    setNodeId(opt.nextNodeId);
                  } else {
                    setNodeId('root');
                    onClose();
                  }
                }}
                className="min-h-[44px] w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-400 text-xs font-bold text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{opt.label}</span>
                <span className="text-sky-600 font-mono">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const WorldMapModal: React.FC<{
  isOpen: boolean;
  currentZone: ZoneId;
  onTeleport: (zone: ZoneId, pos: [number, number, number]) => void;
  onLaunchActivity: (act: ActivityType, missionId?: string) => void;
  onClose: () => void;
}> = ({ isOpen, currentZone, onTeleport, onLaunchActivity, onClose }) => {
  if (!isOpen) return null;

  const academiaRooms = WORLD_OBJECTS.filter((o) => o.zone === 'academia_tic');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs text-sky-700 font-semibold">
              Teletransporte e Orientação Espacial
            </div>
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
              Mapa Geral do TIC World — 5 Zonas e Salas da Academia
            </h2>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={GENERATED_ASSETS.worldMapBanner}
                alt="Mapa Panorâmico das 5 Zonas do TIC World"
                referrerPolicy="no-referrer"
                className="w-full h-44 sm:h-48 object-cover"
              />
              <div className="p-3 text-xs text-slate-600">
                Toca em qualquer zona ou laboratório ao lado para teletransportar o teu avatar
                imediatamente.
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(ZONES_DATA) as ZoneId[]).map((zId) => {
                const z = ZONES_DATA[zId];
                const isHere = currentZone === zId;
                return (
                  <div
                    key={zId}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 ${
                      isHere ? 'bg-sky-50 border-sky-400' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-display font-bold text-slate-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-sky-600" /> {z.name}
                        </span>
                        {isHere && (
                          <span className="text-[10px] text-sky-700 font-mono font-bold">
                            ATUAL
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{z.subtitle}</p>
                    </div>
                    <button
                      onClick={() => {
                        onTeleport(zId, z.spawnPoint);
                        onClose();
                      }}
                      className="min-h-[40px] w-full py-2 px-3 rounded-xl bg-white hover:bg-sky-600 hover:text-white border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                    >
                      Viajar para {z.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct access to Academia TIC Rooms */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" /> Salas e Laboratórios da Academia TIC
              (Acesso Direto)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {academiaRooms.map((roomObj) => (
                <div
                  key={roomObj.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{roomObj.name}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{roomObj.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onTeleport('academia_tic', [
                          roomObj.position[0],
                          0,
                          roomObj.position[2] + 3,
                        ]);
                        onClose();
                      }}
                      className="min-h-[40px] flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      Ir no 3D
                    </button>
                    {roomObj.linkedActivity && (
                      <button
                        onClick={() => {
                          onClose();
                          onLaunchActivity(roomObj.linkedActivity!, roomObj.linkedMissionId);
                        }}
                        className="min-h-[40px] flex-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer"
                      >
                        Abrir Aula
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AvatarAndShopPanel: React.FC<{
  avatar: AvatarConfig;
  coins: number;
  currentLevel: number;
  unlockedItemIds: string[];
  onUpdateAvatar: (next: AvatarConfig) => void;
  onBuyShopItem: (item: ShopItem) => void;
}> = ({ avatar, coins, currentLevel, unlockedItemIds, onUpdateAvatar, onBuyShopItem }) => {
  const skinTones = ['#f8d9c6', '#f1c27d', '#e0ac69', '#c68642', '#8d5524'];
  const hairColors = ['#0f172a', '#451a03', '#b45309', '#dc2626', '#0284c7', '#9333ea'];
  const baseShirtColors = ['#0284c7', '#4f46e5', '#0f766e', '#334155'];
  const basePantsColors = ['#1e293b', '#0f172a', '#312e81', '#374151'];

  const hairStyles: { id: HairStyleId; label: string; shopId?: string }[] = [
    { id: 'curto', label: 'Curto Clássico' },
    { id: 'ondulado', label: 'Médio Ondulado' },
    { id: 'crista', label: 'Crista Tech' },
    { id: 'trancas', label: 'Tranças Simétricas' },
    { id: 'visor_tech', label: 'Capacete Visor', shopId: 'shop_hair_visor' },
  ];

  const accessories: { id: AccessoryId; label: string; shopId?: string }[] = [
    { id: 'none', label: 'Sem Acessório' },
    { id: 'ar_glasses', label: 'Óculos AR', shopId: 'shop_acc_ar_glasses' },
    { id: 'cyber_headphones', label: 'Auscultadores', shopId: 'shop_acc_headphones' },
    { id: 'robo_antenna', label: 'Antena RoboTIC', shopId: 'shop_acc_antenna' },
    { id: 'jetpack', label: 'Mochila BitJet', shopId: 'shop_acc_jetpack' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      {/* Left Column: Avatar Customization Controls */}
      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs text-sky-700 font-semibold">
              Identidade Visual sem Estereótipos
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-sky-600" /> Personalizar Avatar 3D
            </h2>
          </div>
          <span className="text-xs text-slate-500">Atualizado em tempo real no Mundo 3D</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nome / Apelido Visível no Mundo (Pseudónimo Seguro)
          </label>
          <input
            type="text"
            maxLength={22}
            value={avatar.name}
            onChange={(e) => onUpdateAvatar({ ...avatar, name: e.target.value })}
            className="min-h-[44px] w-full rounded-xl bg-slate-50 border border-slate-300 px-3.5 py-2 text-sm text-slate-900 font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Tom de Pele</label>
          <div className="flex items-center gap-3">
            {skinTones.map((tone) => (
              <button
                key={tone}
                onClick={() => onUpdateAvatar({ ...avatar, skinColor: tone })}
                style={{ backgroundColor: tone }}
                className={`w-10 h-10 rounded-full cursor-pointer transition-transform ${
                  avatar.skinColor === tone
                    ? 'scale-110 ring-2 ring-sky-600 ring-offset-2 ring-offset-white'
                    : ''
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Estilo de Cabelo
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {hairStyles.map((hs) => {
              const unlocked = !hs.shopId || unlockedItemIds.includes(hs.shopId);
              return (
                <button
                  key={hs.id}
                  disabled={!unlocked}
                  onClick={() => onUpdateAvatar({ ...avatar, hairStyle: hs.id })}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between cursor-pointer ${
                    avatar.hairStyle === hs.id
                      ? 'bg-sky-50 border-sky-600 text-sky-900 font-bold'
                      : unlocked
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="truncate">{hs.label}</span>
                  {!unlocked && <Lock className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Cor do Cabelo</label>
          <div className="flex flex-wrap items-center gap-3">
            {hairColors.map((col) => (
              <button
                key={col}
                onClick={() => onUpdateAvatar({ ...avatar, hairColor: col })}
                style={{ backgroundColor: col }}
                className={`w-9 h-9 rounded-full cursor-pointer ${
                  avatar.hairColor === col
                    ? 'ring-2 ring-sky-600 ring-offset-2 ring-offset-white'
                    : ''
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Cor da Roupa</label>
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                ...baseShirtColors,
                ...SHOP_ITEMS.filter(
                  (s) => s.category === 'shirtColor' && unlockedItemIds.includes(s.id)
                ).map((s) => s.value),
              ].map((col) => (
                <button
                  key={col}
                  onClick={() => onUpdateAvatar({ ...avatar, shirtColor: col })}
                  style={{ backgroundColor: col }}
                  className={`w-9 h-9 rounded-xl cursor-pointer ${
                    avatar.shirtColor === col
                      ? 'ring-2 ring-sky-600 ring-offset-2 ring-offset-white'
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Cor das Calças
            </label>
            <div className="flex items-center gap-2.5">
              {basePantsColors.map((col) => (
                <button
                  key={col}
                  onClick={() => onUpdateAvatar({ ...avatar, pantsColor: col })}
                  style={{ backgroundColor: col }}
                  className={`w-9 h-9 rounded-xl cursor-pointer ${
                    avatar.pantsColor === col
                      ? 'ring-2 ring-sky-600 ring-offset-2 ring-offset-white'
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Acessórios 3D Desbloqueados
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {accessories.map((acc) => {
              const unlocked = !acc.shopId || unlockedItemIds.includes(acc.shopId);
              return (
                <button
                  key={acc.id}
                  disabled={!unlocked}
                  onClick={() => onUpdateAvatar({ ...avatar, accessory: acc.id })}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between cursor-pointer ${
                    avatar.accessory === acc.id
                      ? 'bg-sky-50 border-sky-600 text-sky-900 font-bold'
                      : unlocked
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="truncate">{acc.label}</span>
                  {!unlocked && <Lock className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Loja Virtual (Virtual Store) */}
      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs text-amber-700 font-semibold">
              Cidade Digital · Recompensas TIC
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" /> Loja Virtual de Acessórios
            </h2>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Saldo Disponível</div>
            <div className="text-base font-mono font-bold text-amber-600 tabular-nums">
              {coins} BitMoedas
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SHOP_ITEMS.map((item) => {
            const owned = unlockedItemIds.includes(item.id);
            const levelLocked = currentLevel < item.requiredLevel;
            const canAfford = coins >= item.priceCoins && !levelLocked && !owned;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    <span
                      style={{ backgroundColor: item.previewColor || '#0284c7' }}
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Nível exigido: {item.requiredLevel} · Preço:{' '}
                    <strong className="font-mono text-amber-700">{item.priceCoins} Moedas</strong>
                  </div>
                </div>

                <button
                  disabled={!canAfford && !owned}
                  onClick={() => {
                    if (owned) {
                      if (item.category === 'accessory') {
                        onUpdateAvatar({ ...avatar, accessory: item.value as AccessoryId });
                      } else if (item.category === 'hairStyle') {
                        onUpdateAvatar({ ...avatar, hairStyle: item.value as HairStyleId });
                      } else if (item.category === 'shirtColor') {
                        onUpdateAvatar({ ...avatar, shirtColor: item.value });
                      }
                    } else if (canAfford) {
                      onBuyShopItem(item);
                    }
                  }}
                  className={`min-h-[42px] w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    owned
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : levelLocked
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : canAfford
                      ? 'bg-amber-500 hover:bg-amber-400 text-white font-bold shadow-xs'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {owned ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Desbloqueado (Equipar)
                    </>
                  ) : levelLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Requer Nível {item.requiredLevel}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Desbloquear ({item.priceCoins} Moedas)
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const WorldChatWidget: React.FC<{
  messages: ChatMessage[];
  currentZone: ZoneId;
  onSendMessage: (text: string) => void;
}> = ({ messages, currentZone, onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSendMessage(draft.trim());
    setDraft('');
  };

  return (
    <div className="fixed top-16 sm:top-auto sm:bottom-4 right-3 sm:right-4 z-30 pointer-events-auto">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-sky-400 text-xs font-bold text-slate-900 flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-sky-600" />
          <span className="hidden sm:inline">Chat da Turma & NPCs</span>
          <span className="font-mono text-sky-700">({messages.length})</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[380px] sm:max-h-[420px]">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-display font-bold text-slate-900">
                Mural · {ZONES_DATA[currentZone].name}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 overflow-y-auto space-y-2.5 flex-1 max-h-52">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-2.5 rounded-xl text-xs ${
                  m.isSystemOrTip
                    ? 'bg-sky-50 border border-sky-200 text-slate-800'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                  <strong className="text-slate-900">
                    {m.sender} · {m.senderRole}
                  </strong>
                  <span className="font-mono">{m.timestamp}</span>
                </div>
                <p className="leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>

          {/* Quick Safe School Phrases */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto">
            {QUICK_SAFE_PHRASES.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(phrase)}
                className="min-h-[32px] px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 text-[10px] font-medium text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {phrase}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSend}
            className="p-2.5 bg-white border-t border-slate-200 flex gap-2"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escreve uma mensagem respeitosa..."
              className="min-h-[40px] flex-1 rounded-xl bg-slate-50 border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
            />
            <button
              type="submit"
              className="min-w-[44px] min-h-[40px] px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
