import React, { useState } from 'react';
import { CreativeProject } from '../types/world';
import { CheckCircle2, Play, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react';

type BlockInstruction =
  | 'AVANCAR'
  | 'VIRAR_DIREITA'
  | 'VIRAR_ESQUERDA'
  | 'REPETIR_2_AVANCAR'
  | 'REPETIR_3_AVANCAR'
  | 'SE_OBSTACULO_DESVIAR';

const BLOCK_META: Record<BlockInstruction, { label: string; color: string; desc: string }> = {
  AVANCAR: {
    label: 'Avançar 1 Casa',
    color: 'bg-sky-600 text-white',
    desc: 'Move o RoboTIC 1 passo na direção atual',
  },
  VIRAR_DIREITA: {
    label: 'Virar à Direita ↻',
    color: 'bg-indigo-600 text-white',
    desc: 'Roda 90° para a direita',
  },
  VIRAR_ESQUERDA: {
    label: 'Virar à Esquerda ↺',
    color: 'bg-indigo-600 text-white',
    desc: 'Roda 90° para a esquerda',
  },
  REPETIR_2_AVANCAR: {
    label: 'Ciclo: Repetir 2x [Avançar]',
    color: 'bg-amber-600 text-white',
    desc: 'Repete a instrução Avançar 2 vezes',
  },
  REPETIR_3_AVANCAR: {
    label: 'Ciclo: Repetir 3x [Avançar]',
    color: 'bg-amber-600 text-white',
    desc: 'Repete a instrução Avançar 3 vezes',
  },
  SE_OBSTACULO_DESVIAR: {
    label: 'Condição: SE Obstáculo → Virar Direita',
    color: 'bg-emerald-600 text-white',
    desc: 'Verifica se a casa à frente está bloqueada e roda à direita',
  },
};

interface LevelGrid {
  title: string;
  subtitle: string;
  start: [number, number];
  startDir: number;
  goal: [number, number];
  crystals: [number, number][];
  obstacles: [number, number][];
  hint: string;
}

const CODING_LEVELS: LevelGrid[] = [
  {
    title: 'Nível 1: Sequência Direta',
    subtitle:
      'Usa um Ciclo de Repetição para levar o RoboTIC até ao portal sem repetir blocos desnecessários.',
    start: [0, 2],
    startDir: 0,
    goal: [3, 2],
    crystals: [[2, 2]],
    obstacles: [
      [1, 1],
      [2, 1],
      [1, 3],
      [2, 3],
    ],
    hint: 'O portal está 3 casas à direita. Experimenta o bloco "Ciclo: Repetir 3x [Avançar]"!',
  },
  {
    title: 'Nível 2: Curva com Algoritmo',
    subtitle: 'Recolhe o cristal de dados e vira na esquina para chegar ao portal.',
    start: [0, 1],
    startDir: 0,
    goal: [2, 3],
    crystals: [[2, 1]],
    obstacles: [
      [1, 2],
      [3, 1],
      [0, 3],
    ],
    hint: 'Avança 2 casas para Este, vira à Direita (Sul) e avança 2 casas!',
  },
  {
    title: 'Nível 3: Decisão Condicional',
    subtitle: 'Há uma parede energética no caminho! Usa uma condição ou curva inteligente.',
    start: [0, 0],
    startDir: 0,
    goal: [3, 2],
    crystals: [
      [2, 0],
      [2, 2],
    ],
    obstacles: [
      [3, 0],
      [1, 1],
      [1, 2],
    ],
    hint: 'Avança 2x até (2,0), usa "SE Obstáculo → Virar Direita", avança 2x para Sul, vira à Esquerda e avança 1x!',
  },
];

export const BlockCodingView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [program, setProgram] = useState<BlockInstruction[]>(['REPETIR_3_AVANCAR']);
  const [robotPos, setRobotPos] = useState<[number, number]>(CODING_LEVELS[0].start);
  const [robotDir, setRobotDir] = useState<number>(CODING_LEVELS[0].startDir);
  const [collected, setCollected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  const currentLevel = CODING_LEVELS[levelIdx];

  const selectLevel = (idx: number) => {
    setLevelIdx(idx);
    setRobotPos(CODING_LEVELS[idx].start);
    setRobotDir(CODING_LEVELS[idx].startDir);
    setCollected([]);
    setFeedback(null);
    setProgram([]);
  };

  const runProgram = () => {
    let [x, y] = currentLevel.start;
    let dir = currentLevel.startDir;
    const picked = new Set<string>();
    let hitWall = false;

    const deltas: [number, number][] = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ];

    const isBlocked = (nx: number, ny: number) =>
      nx < 0 ||
      nx > 4 ||
      ny < 0 ||
      ny > 4 ||
      currentLevel.obstacles.some(([ox, oy]) => ox === nx && oy === ny);

    const stepForward = () => {
      const [dx, dy] = deltas[dir];
      const nx = x + dx;
      const ny = y + dy;
      if (isBlocked(nx, ny)) {
        hitWall = true;
        return;
      }
      x = nx;
      y = ny;
      currentLevel.crystals.forEach(([cx, cy]) => {
        if (cx === x && cy === y) picked.add(`${cx},${cy}`);
      });
    };

    for (const block of program) {
      if (hitWall) break;
      if (block === 'AVANCAR') stepForward();
      else if (block === 'VIRAR_DIREITA') dir = (dir + 1) % 4;
      else if (block === 'VIRAR_ESQUERDA') dir = (dir + 3) % 4;
      else if (block === 'REPETIR_2_AVANCAR') {
        stepForward();
        if (!hitWall) stepForward();
      } else if (block === 'REPETIR_3_AVANCAR') {
        stepForward();
        if (!hitWall) stepForward();
        if (!hitWall) stepForward();
      } else if (block === 'SE_OBSTACULO_DESVIAR') {
        const [dx, dy] = deltas[dir];
        if (isBlocked(x + dx, y + dy)) {
          dir = (dir + 1) % 4;
        }
      }
    }

    setRobotPos([x, y]);
    setRobotDir(dir);
    setCollected(Array.from(picked));

    if (hitWall) {
      setFeedback(
        'Alerta: O RoboTIC chocou contra um obstáculo ou limite da grelha! Ajusta os teus blocos.'
      );
      return;
    }

    const reachedGoal = x === currentLevel.goal[0] && y === currentLevel.goal[1];
    const allCrystals = picked.size === currentLevel.crystals.length;

    if (reachedGoal && allCrystals) {
      const nextDone = Array.from(new Set([...completedLevels, levelIdx]));
      setCompletedLevels(nextDone);
      setFeedback(
        'Excelente Algoritmo! O RoboTIC recolheu os cristais e chegou ao portal energético!'
      );
    } else if (reachedGoal && !allCrystals) {
      setFeedback('Chegaste ao portal, mas faltou recolher um cristal de dados pelo caminho!');
    } else {
      setFeedback(
        'O programa terminou antes de o RoboTIC alcançar o portal. Revê a sequência de blocos.'
      );
    }
  };

  const dirSymbols = ['→', '↓', '←', '↑'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Interactive Stage: 5x5 Visual Grid */}
      <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-display font-bold text-slate-900">
              {currentLevel.title}
            </h3>
            <p className="text-xs text-slate-600">{currentLevel.subtitle}</p>
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            {CODING_LEVELS.map((_, i) => (
              <button
                key={i}
                onClick={() => selectLevel(i)}
                className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  levelIdx === i
                    ? 'bg-sky-600 text-white'
                    : completedLevels.includes(i)
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Desafio {i + 1} {completedLevels.includes(i) ? '✓' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* 5x5 Grid Stage */}
        <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto aspect-square bg-white p-3 rounded-2xl border border-slate-200 shadow-inner">
          {Array.from({ length: 25 }).map((_, idx) => {
            const gx = idx % 5;
            const gy = Math.floor(idx / 5);
            const isRobot = robotPos[0] === gx && robotPos[1] === gy;
            const isGoal = currentLevel.goal[0] === gx && currentLevel.goal[1] === gy;
            const isObstacle = currentLevel.obstacles.some(([ox, oy]) => ox === gx && oy === gy);
            const hasCrystal =
              currentLevel.crystals.some(([cx, cy]) => cx === gx && cy === gy) &&
              !collected.includes(`${gx},${gy}`);

            return (
              <div
                key={`${gx}-${gy}`}
                className={`relative rounded-xl border flex flex-col items-center justify-center text-xs font-mono select-none transition-colors ${
                  isObstacle
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : isGoal
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <span className="absolute top-1 left-1.5 text-[9px] text-slate-400">
                  {gx},{gy}
                </span>
                {isObstacle && <span className="font-bold text-[10px] text-rose-600">PAREDE</span>}
                {isGoal && !isRobot && (
                  <span className="font-bold text-[10px] text-emerald-700">PORTAL</span>
                )}
                {hasCrystal && !isRobot && (
                  <span className="font-bold text-[10px] text-sky-600 animate-pulse">◆ DADOS</span>
                )}
                {isRobot && (
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-bold flex flex-col items-center justify-center shadow-md">
                    <span className="text-[9px]">ROBO</span>
                    <span className="text-sm leading-none">{dirSymbols[robotDir]}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-slate-700">
          <strong className="text-sky-700">Dica do RoboTIC:</strong> {currentLevel.hint}
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold ${
              feedback.startsWith('Excelente')
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}
          >
            {feedback}
          </div>
        )}
      </div>

      {/* Right Control Deck: Block Palette & Algorithm Stack */}
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <h4 className="text-sm font-display font-bold text-slate-900">
          1. Paleta de Blocos (Toca para Adicionar)
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(BLOCK_META) as BlockInstruction[]).map((bKey) => {
            const meta = BLOCK_META[bKey];
            return (
              <button
                key={bKey}
                onClick={() => setProgram((prev) => [...prev, bKey])}
                className="min-h-[44px] flex items-center justify-between p-3 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-left transition-colors cursor-pointer shadow-2xs"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{meta.label}</div>
                  <div className="text-[11px] text-slate-500">{meta.desc}</div>
                </div>
                <Plus className="w-4 h-4 text-sky-600 shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-display font-bold text-slate-900">
              2. O Teu Algoritmo ({program.length} blocos)
            </h4>
            <button
              onClick={() => {
                setProgram([]);
                setRobotPos(currentLevel.start);
                setRobotDir(currentLevel.startDir);
                setCollected([]);
                setFeedback(null);
              }}
              className="min-h-[36px] px-2 text-xs text-slate-600 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Limpar
            </button>
          </div>

          <div className="min-h-[130px] max-h-[200px] overflow-y-auto bg-white border border-slate-200 rounded-xl p-2.5 space-y-1.5">
            {program.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                Toca nos blocos acima para construir a tua sequência lógica.
              </p>
            ) : (
              program.map((blk, i) => (
                <div
                  key={`${blk}-${i}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${BLOCK_META[blk].color}`}
                >
                  <span className="font-mono">
                    {i + 1}. {BLOCK_META[blk].label}
                  </span>
                  <button
                    onClick={() => setProgram((prev) => prev.filter((_, idx) => idx !== i))}
                    className="p-1 text-white/90 hover:text-white cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
          <button
            onClick={runProgram}
            disabled={program.length === 0}
            className="min-h-[44px] flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4" /> Executar Algoritmo
          </button>
          {completedLevels.length >= 1 && (
            <button
              onClick={onComplete}
              className="min-h-[44px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" /> Concluir Missão (+180 XP)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const CreativeStudioView: React.FC<{
  existingProjects: CreativeProject[];
  onSaveProject: (proj: Omit<CreativeProject, 'id' | 'createdAt'>) => void;
  onComplete: () => void;
}> = ({ existingProjects, onSaveProject, onComplete }) => {
  const [title, setTitle] = useState('5 Regras de Ouro da Segurança Digital');
  const [theme, setTheme] = useState('Cibersegurança Escolar');
  const [headline, setHeadline] = useState('Protege os teus dados antes de clicar!');
  const [bullet1, setBullet1] = useState('Usa palavras-passe com mais de 10 caracteres e símbolos.');
  const [bullet2, setBullet2] = useState('Desconfia sempre de links que prometem prémios grátis.');
  const [bullet3, setBullet3] = useState(
    'Pede ajuda a um professor ou familiar se vires algo suspeito.'
  );
  const [accentColor, setAccentColor] = useState('#0284c7');
  const [layoutStyle, setLayoutStyle] = useState<'editorial' | 'infografico' | 'alerta_cyber'>(
    'infografico'
  );
  const [savedAlert, setSavedAlert] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProject({
      title,
      theme,
      headline,
      bulletPoints: [bullet1, bullet2, bullet3].filter(Boolean),
      accentColor,
      layoutStyle,
    });
    setSavedAlert(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Live Poster Preview Stage */}
      <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Pré-visualização em Tempo Real (Contraste Elevado)</span>
          <span className="font-mono">Diapositivo TIC</span>
        </div>

        <div
          style={{ borderColor: accentColor }}
          className="rounded-2xl bg-white border-2 p-5 sm:p-6 space-y-5 shadow-md"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span
              style={{ color: accentColor }}
              className="text-xs font-mono font-bold uppercase"
            >
              {theme} · TIC 5.º ANO
            </span>
            <span className="text-xs text-slate-500 capitalize">Layout: {layoutStyle}</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">{title}</h2>
            <p style={{ color: accentColor }} className="text-sm font-semibold">
              {headline}
            </p>
          </div>

          <ul className="space-y-2.5 pt-1">
            {[bullet1, bullet2, bullet3].filter(Boolean).map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
              >
                <span
                  style={{ backgroundColor: accentColor }}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white font-mono font-bold shrink-0"
                >
                  {idx + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {existingProjects.length > 0 && (
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-bold text-slate-700">
              Os Teus Trabalhos Guardados na Ilha da Criatividade ({existingProjects.length}):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {existingProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex justify-between items-center"
                >
                  <span className="font-semibold text-slate-800 truncate">{p.title}</span>
                  <span className="text-slate-500 font-mono text-[10px]">{p.createdAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor Controls */}
      <form
        onSubmit={handlePublish}
        className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5"
      >
        <h3 className="text-sm font-display font-bold text-slate-900">
          Configurador de Cartaz e Apresentação Digital
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Tema Curricular</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="min-h-[42px] w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900"
          >
            <option value="Cibersegurança Escolar">Cibersegurança Escolar</option>
            <option value="Arquitetura de Computadores">Arquitetura de Computadores</option>
            <option value="Cidadania e Respeito Online">Cidadania e Respeito Online</option>
            <option value="Pesquisa Segura na Internet">Pesquisa Segura na Internet</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Título Principal</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="min-h-[42px] w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subtítulo / Mensagem-Chave
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            required
            className="min-h-[42px] w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            3 Ideias Essenciais (Tópicos Curtos)
          </label>
          <input
            type="text"
            value={bullet1}
            onChange={(e) => setBullet1(e.target.value)}
            className="min-h-[40px] w-full rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
          />
          <input
            type="text"
            value={bullet2}
            onChange={(e) => setBullet2(e.target.value)}
            className="min-h-[40px] w-full rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
          />
          <input
            type="text"
            value={bullet3}
            onChange={(e) => setBullet3(e.target.value)}
            className="min-h-[40px] w-full rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cor de Destaque
            </label>
            <div className="flex items-center gap-2">
              {['#0284c7', '#059669', '#d97706', '#e11d48'].map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setAccentColor(col)}
                  style={{ backgroundColor: col }}
                  className={`w-8 h-8 rounded-full cursor-pointer ${
                    accentColor === col
                      ? 'ring-2 ring-slate-900 ring-offset-2 ring-offset-slate-50'
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Estilo Visual</label>
            <select
              value={layoutStyle}
              onChange={(e) =>
                setLayoutStyle(e.target.value as 'editorial' | 'infografico' | 'alerta_cyber')
              }
              className="min-h-[40px] w-full rounded-xl bg-white border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
            >
              <option value="infografico">Infográfico</option>
              <option value="editorial">Editorial</option>
              <option value="alerta_cyber">Alerta Cyber</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
          <button
            type="submit"
            className="min-h-[44px] flex-1 py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Publicar no Portefólio
          </button>
          {savedAlert && (
            <button
              type="button"
              onClick={onComplete}
              className="min-h-[44px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Concluir (+150 XP)
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
