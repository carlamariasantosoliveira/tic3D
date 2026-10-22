import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  ActivityType,
  AvatarAnimationState,
  AvatarConfig,
  ChatMessage,
  NpcCharacter,
  WorldInteractiveObject,
  ZoneId,
} from '../types/world';
import {
  NPCS_DATA,
  QUICK_SAFE_PHRASES,
  WORLD_OBJECTS,
  ZONES_DATA,
} from '../data/ticWorldData';
import { buildAvatarMesh, populateWorldScene } from './threeWorldBuilder';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  ClipboardList,
  Gamepad2,
  Hand,
  Laptop,
  Lightbulb,
  Minus,
  Plus,
  Presentation,
  RotateCcw,
  Search,
  Send,
  Users,
  Zap,
} from 'lucide-react';

interface World3DCanvasProps {
  avatarConfig: AvatarConfig;
  currentZone: ZoneId;
  playerPosition: [number, number, number];
  completedMissionIds: string[];
  onZoneChange: (zone: ZoneId) => void;
  onInteractObject: (obj: WorldInteractiveObject) => void;
  onInteractNpc: (npc: NpcCharacter) => void;
  onPositionUpdate: (pos: [number, number, number]) => void;
  teleportSignal: { position: [number, number, number]; timestamp: number } | null;
  chatMessages?: ChatMessage[];
  onSendChatMessage?: (text: string) => void;
  onOpenWorldMap?: () => void;
  onStartActivity?: (activity: ActivityType, missionId?: string) => void;
  onOpenAvatarInventory?: () => void;
  onOpenCurriculum?: () => void;
  onTakeWorldPhoto?: () => void;
}

interface ProjectedLabel {
  id: string;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  isNpc?: boolean;
  isProfAna?: boolean;
  isClassmate?: boolean;
  isPlayer?: boolean;
}

// Procedural Canvas Textures for Pavilions, Cobblestone Promenade & Wood Floors
function createCobblestonePromenadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e2d5c3';
  ctx.fillRect(0, 0, 512, 512);

  const warmStones = ['#efe6d8', '#e5d7c4', '#d8c7b0', '#f5ede2'];
  const tileW = 64;
  const tileH = 32;
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 8; c++) {
      const shift = (r % 2) * 32;
      const sx = (c * tileW + shift) % 512;
      const sy = r * tileH;
      ctx.fillStyle = warmStones[(r * 3 + c) % warmStones.length];
      ctx.fillRect(sx + 2, sy + 2, tileW - 4, tileH - 4);
      ctx.strokeStyle = '#b8a68e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx + 2, sy + 2, tileW - 4, tileH - 4);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  return tex;
}

function createPavilionBannerTexture(
  titleLine1: string,
  titleLine2: string,
  bgHex: string,
  accentHex: string,
  iconType: 'search' | 'users' | 'bulb' | 'shield' | 'center'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 220;
  const ctx = canvas.getContext('2d')!;

  // Vibrant gradient background matching the reference pavilions
  const grad = ctx.createLinearGradient(0, 0, 640, 220);
  grad.addColorStop(0, bgHex);
  grad.addColorStop(1, accentHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 220);

  // Outer glowing border
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 628, 208);

  // Draw crisp white icon on left (or centered for TIC MUNDO)
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';

  if (iconType === 'center') {
    ctx.font = '800 62px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(titleLine1, 320, 110);
    ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText(titleLine2, 320, 165);
  } else {
    // Icon circle area at x=95, y=110
    if (iconType === 'search') {
      ctx.beginPath();
      ctx.arc(90, 95, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(115, 120);
      ctx.lineTo(142, 147);
      ctx.stroke();
    } else if (iconType === 'users') {
      ctx.beginPath();
      ctx.arc(95, 82, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(95, 148, 36, Math.PI, 0);
      ctx.fill();
    } else if (iconType === 'bulb') {
      ctx.beginPath();
      ctx.arc(95, 88, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillRect(82, 122, 26, 16);
    } else if (iconType === 'shield') {
      ctx.beginPath();
      ctx.moveTo(95, 55);
      ctx.lineTo(132, 72);
      ctx.lineTo(132, 112);
      ctx.lineTo(95, 152);
      ctx.lineTo(58, 112);
      ctx.lineTo(58, 72);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 44px "Chakra Petch", sans-serif';
    ctx.fillText(titleLine1, 170, 98);
    ctx.fillText(titleLine2, 170, 152);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createSubSignTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.fillRect(0, 0, 512, 96);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 508, 92);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 34px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 60);
  return new THREE.CanvasTexture(canvas);
}

// Build the Iconic TIC MUNDO Campus Promenade, 5 Pavilions, Globe Fountain, Airship & Classmates
function buildTicMundoReferenceCampus(scene: THREE.Scene): {
  globeMesh: THREE.Group;
  airshipGroup: THREE.Group;
  classmateLabels: { id: string; name: string; pos: THREE.Vector3 }[];
} {
  const cobbleTex = createCobblestonePromenadeTexture();

  // 1. Warm Sunlit Stone Promenade & Central Plaza
  const mainPromenade = new THREE.Mesh(
    new THREE.CylinderGeometry(25.5, 25.8, 0.16, 64),
    new THREE.MeshStandardMaterial({ map: cobbleTex, roughness: 0.55 })
  );
  mainPromenade.position.set(0, 0.02, -2);
  mainPromenade.receiveShadow = true;
  scene.add(mainPromenade);

  // Central Avenue Carpet Walkway leading from Player Spawn [0,0,6] to Globe Fountain [0,0,-4]
  const walkway = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 0.18, 22),
    new THREE.MeshStandardMaterial({ color: '#e7dac6', roughness: 0.45 })
  );
  walkway.position.set(0, 0.03, 2);
  walkway.receiveShadow = true;
  scene.add(walkway);

  // 2. Central Holographic Globe Fountain ("TIC MUNDO" Landmark at [0, 0, -4.5])
  const fountainGroup = new THREE.Group();
  const basePool = new THREE.Mesh(
    new THREE.CylinderGeometry(3.4, 3.7, 0.75, 32),
    new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.35, metalness: 0.2 })
  );
  basePool.position.y = 0.38;
  basePool.castShadow = true;
  basePool.receiveShadow = true;

  const glowingWater = new THREE.Mesh(
    new THREE.CylinderGeometry(3.1, 3.1, 0.82, 32),
    new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.45,
      roughness: 0.15,
    })
  );
  glowingWater.position.y = 0.42;

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.6, 1.4, 24),
    new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.45, roughness: 0.25 })
  );
  pedestal.position.y = 1.1;

  // Rotating 3D Globe with Orbital Rings
  const globeMesh = new THREE.Group();
  globeMesh.position.set(0, 3.1, 0);

  const coreSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 28, 28),
    new THREE.MeshStandardMaterial({
      color: '#0284c7',
      emissive: '#0369a1',
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.3,
    })
  );
  const wireSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.49, 16, 12),
    new THREE.MeshBasicMaterial({ color: '#bae6fd', wireframe: true })
  );
  const orbitRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.06, 12, 48),
    new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      emissive: '#38bdf8',
      emissiveIntensity: 0.5,
      metalness: 0.7,
    })
  );
  orbitRing1.rotation.x = Math.PI / 3;
  orbitRing1.rotation.y = Math.PI / 6;

  const orbitRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.85, 0.045, 12, 48),
    new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#f59e0b',
      emissiveIntensity: 0.4,
      metalness: 0.6,
    })
  );
  orbitRing2.rotation.x = -Math.PI / 4;

  globeMesh.add(coreSphere, wireSphere, orbitRing1, orbitRing2);
  fountainGroup.add(basePool, glowingWater, pedestal, globeMesh);
  fountainGroup.position.set(0, 0, -4.5);
  scene.add(fountainGroup);

  // 3. Raised Stone Flower Planters along the Left & Right of the Promenade
  const createFlowerPlanter = (x: number, z: number, length: number, rotY = 0) => {
    const planter = new THREE.Group();
    const stoneWall = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.85, length),
      new THREE.MeshStandardMaterial({ color: '#d6c7b2', roughness: 0.7 })
    );
    stoneWall.position.y = 0.425;
    stoneWall.castShadow = true;
    stoneWall.receiveShadow = true;

    const soil = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.1, length - 0.3),
      new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 })
    );
    soil.position.y = 0.86;

    planter.add(stoneWall, soil);

    // Colorful pink, magenta & yellow flower clusters
    const flowerColors = ['#ec4899', '#f43f5e', '#f472b6', '#facc15'];
    for (let fz = -length / 2 + 0.6; fz <= length / 2 - 0.6; fz += 0.85) {
      const bush = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.38, 0),
        new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.65 })
      );
      bush.position.set(0, 1.02, fz);
      const blossom = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.24, 0),
        new THREE.MeshStandardMaterial({
          color: flowerColors[Math.abs(Math.round(fz * 3)) % flowerColors.length],
          roughness: 0.4,
        })
      );
      blossom.position.set(0.15, 1.24, fz);
      planter.add(bush, blossom);
    }

    planter.position.set(x, 0, z);
    planter.rotation.y = rotY;
    scene.add(planter);
  };

  createFlowerPlanter(-5.8, 3.8, 7.5);
  createFlowerPlanter(6.2, 3.8, 7.5);

  // 4. Build the 5 Iconic Glass & Color-Coded Pavilions from the Reference Image
  const createModernPavilion = (opts: {
    x: number;
    z: number;
    rotY: number;
    width: number;
    depth: number;
    height: number;
    line1: string;
    line2: string;
    subTitle: string;
    bgHex: string;
    accentHex: string;
    iconType: 'search' | 'users' | 'bulb' | 'shield' | 'center';
    hasRoofGlobe?: boolean;
  }) => {
    const pav = new THREE.Group();

    const frameMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.4 });
    const darkMullionMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.35 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#bae6fd',
      transparent: true,
      opacity: 0.46,
      roughness: 0.1,
      metalness: 0.25,
    });
    const warmInteriorGlow = new THREE.MeshStandardMaterial({
      color: '#fef3c7',
      emissive: '#fde68a',
      emissiveIntensity: 0.45,
      roughness: 0.5,
    });

    // Concrete & warm floor base
    const floorBase = new THREE.Mesh(
      new THREE.BoxGeometry(opts.width, 0.25, opts.depth),
      frameMat
    );
    floorBase.position.y = 0.125;
    pav.add(floorBase);

    // Back wall (warm lit interior backdrop)
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(opts.width - 0.4, opts.height - 0.5, 0.3),
      warmInteriorGlow
    );
    backWall.position.set(0, opts.height / 2, -opts.depth / 2 + 0.2);
    pav.add(backWall);

    // Left & Right structural columns + side glass walls
    const sideGlassL = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, opts.height - 0.6, opts.depth - 0.4),
      glassMat
    );
    sideGlassL.position.set(-opts.width / 2 + 0.15, opts.height / 2, 0);
    const sideGlassR = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, opts.height - 0.6, opts.depth - 0.4),
      glassMat
    );
    sideGlassR.position.set(opts.width / 2 - 0.15, opts.height / 2, 0);
    pav.add(sideGlassL, sideGlassR);

    // Front Pillars
    [-opts.width / 2 + 0.25, -opts.width / 4, opts.width / 4, opts.width / 2 - 0.25].forEach(
      (px) => {
        const col = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, opts.height, 0.35),
          darkMullionMat
        );
        col.position.set(px, opts.height / 2, opts.depth / 2);
        col.castShadow = true;
        pav.add(col);
      }
    );

    // Front Glass Panels (leaving central doorway open for walking in!)
    const sidePanelW = opts.width / 4 - 0.2;
    const frontGlassL = new THREE.Mesh(
      new THREE.BoxGeometry(sidePanelW, opts.height - 1.2, 0.12),
      glassMat
    );
    frontGlassL.position.set(-opts.width * 0.375, (opts.height - 1.2) / 2, opts.depth / 2);
    const frontGlassR = new THREE.Mesh(
      new THREE.BoxGeometry(sidePanelW, opts.height - 1.2, 0.12),
      glassMat
    );
    frontGlassR.position.set(opts.width * 0.375, (opts.height - 1.2) / 2, opts.depth / 2);
    pav.add(frontGlassL, frontGlassR);

    // Roof Slab
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(opts.width + 0.6, 0.45, opts.depth + 0.8),
      frameMat
    );
    roof.position.y = opts.height + 0.2;
    roof.castShadow = true;
    pav.add(roof);

    // Iconic Colored Top Billboard Sign
    const bannerTex = createPavilionBannerTexture(
      opts.line1,
      opts.line2,
      opts.bgHex,
      opts.accentHex,
      opts.iconType
    );
    const signBox = new THREE.Mesh(
      new THREE.BoxGeometry(opts.width + 0.2, 2.5, 0.55),
      new THREE.MeshStandardMaterial({
        map: bannerTex,
        roughness: 0.25,
        emissive: opts.bgHex,
        emissiveIntensity: 0.12,
      })
    );
    signBox.position.set(0, opts.height + 1.55, opts.depth / 2 - 0.1);
    signBox.castShadow = true;
    pav.add(signBox);

    // Subtitle Transom Sign above the entrance ("Biblioteca Digital", "Espaço de Projetos", etc.)
    if (opts.subTitle) {
      const subTex = createSubSignTexture(opts.subTitle);
      const subSign = new THREE.Mesh(
        new THREE.BoxGeometry(opts.width * 0.72, 0.95, 0.25),
        new THREE.MeshStandardMaterial({ map: subTex, roughness: 0.3 })
      );
      subSign.position.set(0, opts.height - 0.65, opts.depth / 2 + 0.1);
      pav.add(subSign);
    }

    // Interior Low-Poly Furniture visible through the glass facade
    const deskMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.5 });
    const screenMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.6,
    });
    [-opts.width * 0.26, opts.width * 0.26].forEach((dx) => {
      const desk = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 1.0), deskMat);
      desk.position.set(dx, 0.4, -0.5);
      const mon = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.08), screenMat);
      mon.position.set(dx, 1.1, -0.6);
      pav.add(desk, mon);
    });

    // Optional Rooftop Holographic Globe for the Central TIC MUNDO Building
    if (opts.hasRoofGlobe) {
      const roofGlobe = new THREE.Mesh(
        new THREE.SphereGeometry(1.75, 20, 20),
        new THREE.MeshStandardMaterial({
          color: '#38bdf8',
          emissive: '#0284c7',
          emissiveIntensity: 0.55,
          wireframe: true,
        })
      );
      roofGlobe.position.set(0, opts.height + 4.4, opts.depth / 2 - 0.5);
      pav.add(roofGlobe);
    }

    pav.position.set(opts.x, 0, opts.z);
    pav.rotation.y = opts.rotY;
    scene.add(pav);
  };

  // Pavilion 1 (Left Front): INVESTIGAR E PESQUISAR — Biblioteca Digital (Blue)
  createModernPavilion({
    x: -13.5,
    z: -1.5,
    rotY: Math.PI / 2.6,
    width: 8.5,
    depth: 5.5,
    height: 4.8,
    line1: 'INVESTIGAR',
    line2: 'E PESQUISAR',
    subTitle: 'Biblioteca Digital',
    bgHex: '#1d4ed8',
    accentHex: '#2563eb',
    iconType: 'search',
  });

  // Pavilion 2 (Left Center): COMUNICAR E COLABORAR — Espaço de Projetos (Teal/Green)
  createModernPavilion({
    x: -9.8,
    z: -10.5,
    rotY: Math.PI / 5.5,
    width: 8.2,
    depth: 5.2,
    height: 4.8,
    line1: 'COMUNICAR',
    line2: 'E COLABORAR',
    subTitle: 'Espaço de Projetos',
    bgHex: '#0d9488',
    accentHex: '#10b981',
    iconType: 'users',
  });

  // Pavilion 3 (Center Main): TIC MUNDO — CENTRO DE APRENDIZAGEM (Royal Blue + Roof Globe)
  createModernPavilion({
    x: 0,
    z: -15.5,
    rotY: 0,
    width: 11.5,
    depth: 6.5,
    height: 5.6,
    line1: 'TIC MUNDO',
    line2: 'CENTRO DE APRENDIZAGEM',
    subTitle: 'Laboratórios & Salas TIC',
    bgHex: '#0369a1',
    accentHex: '#0284c7',
    iconType: 'center',
    hasRoofGlobe: true,
  });

  // Pavilion 4 (Right Center): CRIAR E INOVAR — Laboratório Criativo (Purple/Magenta)
  createModernPavilion({
    x: 9.8,
    z: -10.5,
    rotY: -Math.PI / 5.5,
    width: 8.2,
    depth: 5.2,
    height: 4.8,
    line1: 'CRIAR',
    line2: 'E INOVAR',
    subTitle: 'Laboratório Criativo',
    bgHex: '#7e22ce',
    accentHex: '#a855f7',
    iconType: 'bulb',
  });

  // Pavilion 5 (Right Front): RESPEITAR E PROTEGER — Cidadania Digital (Gold/Amber)
  createModernPavilion({
    x: 13.5,
    z: -1.5,
    rotY: -Math.PI / 2.6,
    width: 8.5,
    depth: 5.5,
    height: 4.8,
    line1: 'RESPEITAR',
    line2: 'E PROTEGER',
    subTitle: 'Cidadania Digital',
    bgHex: '#b45309',
    accentHex: '#d97706',
    iconType: 'shield',
  });

  // 5. Sky Airship (Dirigível TIC) & Distant Mountains + Coastal Lighthouse (matching background!)
  const airshipGroup = new THREE.Group();
  const hull = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 24, 16),
    new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.3, roughness: 0.3 })
  );
  hull.scale.set(2.6, 0.95, 0.95);
  const stripe = new THREE.Mesh(
    new THREE.CylinderGeometry(2.05, 2.05, 5.2, 20),
    new THREE.MeshStandardMaterial({ color: '#0284c7', emissive: '#38bdf8', emissiveIntensity: 0.3 })
  );
  stripe.rotation.z = Math.PI / 2;
  stripe.scale.set(0.98, 1, 0.35);
  const gondola = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.65, 0.8),
    new THREE.MeshStandardMaterial({ color: '#1e293b' })
  );
  gondola.position.y = -2.1;
  airshipGroup.add(hull, stripe, gondola);
  airshipGroup.position.set(14, 24, -42);
  scene.add(airshipGroup);

  // Distant Mountain Range Backdrop behind the Campus
  const mountainData = [
    { x: -42, z: -75, r: 24, h: 32, c: '#64748b' },
    { x: -18, z: -82, r: 28, h: 38, c: '#475569' },
    { x: 15, z: -80, r: 26, h: 34, c: '#64748b' },
    { x: 48, z: -72, r: 22, h: 28, c: '#475569' },
  ];
  mountainData.forEach((m) => {
    const peak = new THREE.Mesh(
      new THREE.ConeGeometry(m.r, m.h, 7),
      new THREE.MeshStandardMaterial({ color: m.c, roughness: 0.85 })
    );
    peak.position.set(m.x, m.h / 2 - 2, m.z);
    scene.add(peak);
  });

  // 6. Fellow Classmate 3D Avatars in the Plaza: Tiago, Lara, and Sofia!
  const classmateConfigs: {
    id: string;
    name: string;
    pos: [number, number, number];
    rotY: number;
    config: AvatarConfig;
  }[] = [
    {
      id: 'classmate_tiago',
      name: 'Tiago',
      pos: [-3.3, 0, 0.8],
      rotY: Math.PI,
      config: {
        name: 'Tiago',
        skinColor: '#e0ac69',
        hairStyle: 'curto',
        hairColor: '#1e293b',
        shirtColor: '#1e3a8a',
        pantsColor: '#2563eb',
        shoeColor: '#f8fafc',
        accessory: 'none',
      },
    },
    {
      id: 'classmate_lara',
      name: 'Lara',
      pos: [-1.8, 0, -2.1],
      rotY: Math.PI,
      config: {
        name: 'Lara',
        skinColor: '#f1c27d',
        hairStyle: 'ondulado',
        hairColor: '#0f172a',
        shirtColor: '#f472b6',
        pantsColor: '#334155',
        shoeColor: '#f8fafc',
        accessory: 'none',
      },
    },
    {
      id: 'classmate_sofia',
      name: 'Sofia',
      pos: [1.9, 0, -1.8],
      rotY: 0,
      config: {
        name: 'Sofia',
        skinColor: '#f1c27d',
        hairStyle: 'ondulado',
        hairColor: '#92400e',
        shirtColor: '#10b981',
        pantsColor: '#2563eb',
        shoeColor: '#f8fafc',
        accessory: 'none',
      },
    },
  ];

  const classmateLabels: { id: string; name: string; pos: THREE.Vector3 }[] = [];

  classmateConfigs.forEach((cm) => {
    const parts = buildAvatarMesh(cm.config);
    parts.root.position.set(cm.pos[0], cm.pos[1], cm.pos[2]);
    parts.root.rotation.y = cm.rotY;
    parts.root.add(createContactShadowDisc(0.62));
    scene.add(parts.root);
    classmateLabels.push({
      id: cm.id,
      name: cm.name,
      pos: new THREE.Vector3(cm.pos[0], cm.pos[1] + 2.65, cm.pos[2]),
    });
  });

  return { globeMesh, airshipGroup, classmateLabels };
}

// Rich Global Illumination, Sky Dome, PMREM Reflections & Multi-Directional Shadow Rig
function setupRichGlobalIllumination(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene
): {
  playerShadowLight: THREE.DirectionalLight;
  cloudGroups: THREE.Group[];
  disposeEnv: () => void;
} {
  // 1.Procedural Gradient Sky Texture for Sky Dome & PMREM Environment Reflections
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 512;
  skyCanvas.height = 512;
  const skyCtx = skyCanvas.getContext('2d')!;
  const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0.0, '#0284c7'); // Deep azure zenith
  skyGrad.addColorStop(0.42, '#38bdf8'); // Crisp sky blue
  skyGrad.addColorStop(0.68, '#bae6fd'); // Luminous horizon
  skyGrad.addColorStop(0.76, '#fef3c7'); // Warm golden sunlight band
  skyGrad.addColorStop(1.0, '#d6c7b2'); // Warm ground bounce
  skyCtx.fillStyle = skyGrad;
  skyCtx.fillRect(0, 0, 512, 512);

  // Add bright solar disc to the environment map
  const sunRadial = skyCtx.createRadialGradient(360, 170, 4, 360, 170, 75);
  sunRadial.addColorStop(0, '#ffffff');
  sunRadial.addColorStop(0.35, 'rgba(254, 240, 138, 0.85)');
  sunRadial.addColorStop(1, 'rgba(254, 240, 138, 0)');
  skyCtx.fillStyle = sunRadial;
  skyCtx.fillRect(0, 0, 512, 512);

  const skyTexture = new THREE.CanvasTexture(skyCanvas);
  skyTexture.mapping = THREE.EquirectangularReflectionMapping;
  skyTexture.colorSpace = THREE.SRGBColorSpace;

  // Generate real Image-Based Lighting (IBL) environment reflections via PMREMGenerator
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envRenderTarget = pmremGenerator.fromEquirectangular(skyTexture);
  scene.environment = envRenderTarget.texture;
  scene.background = new THREE.Color('#7dd3fc');
  scene.fog = new THREE.FogExp2('#bae6fd', 0.0032);

  // 3D Sky Dome Sphere surrounding the world
  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(230, 32, 24),
    new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide, depthWrite: false })
  );
  skyDome.name = 'sky_dome_non_shadow';
  scene.add(skyDome);

  // Glowing 3D Sun Disc & Halo in the Sky
  const sunGroup = new THREE.Group();
  const sunCore = new THREE.Mesh(
    new THREE.SphereGeometry(7.5, 24, 24),
    new THREE.MeshBasicMaterial({ color: '#fffbeb' })
  );
  const sunHalo = new THREE.Mesh(
    new THREE.SphereGeometry(13.5, 24, 24),
    new THREE.MeshBasicMaterial({
      color: '#fde047',
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    })
  );
  sunGroup.add(sunCore, sunHalo);
  sunGroup.position.set(55, 88, -95);
  scene.add(sunGroup);

  // 2. Volumetric Low-Poly 3D Clouds with Soft Shading
  const cloudGroups: THREE.Group[] = [];
  const cloudCoords = [
    [-48, 36, -62, 1.3],
    [32, 40, -68, 1.5],
    [-16, 38, -52, 1.1],
    [62, 34, -35, 1.25],
    [-65, 35, -25, 1.2],
  ];
  const cloudMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.85,
    metalness: 0.0,
    emissive: '#e0f2fe',
    emissiveIntensity: 0.22,
  });

  cloudCoords.forEach(([cx, cy, cz, scale]) => {
    const cg = new THREE.Group();
    const p1 = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2 * scale, 1), cloudMat);
    const p2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4 * scale, 1), cloudMat);
    p2.position.set(2.8 * scale, -0.4 * scale, 0.4 * scale);
    const p3 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2 * scale, 1), cloudMat);
    p3.position.set(-2.6 * scale, -0.5 * scale, -0.3 * scale);
    cg.add(p1, p2, p3);
    cg.position.set(cx, cy, cz);
    scene.add(cg);
    cloudGroups.push(cg);
  });

  // 3. Balanced Sky-to-Ground Hemisphere Light (Global Ambient Base)
  const hemiLight = new THREE.HemisphereLight('#e0f2fe', '#c2a887', 0.68);
  hemiLight.position.set(0, 60, 0);
  scene.add(hemiLight);

  // 4. Primary Key Sunlight (Campus-Wide DirectionalLight with 2048x2048 Soft Shadows)
  const keySunLight = new THREE.DirectionalLight('#fff7ed', 2.2);
  keySunLight.position.set(52, 84, 46);
  keySunLight.castShadow = true;
  keySunLight.shadow.mapSize.width = 2048;
  keySunLight.shadow.mapSize.height = 2048;
  keySunLight.shadow.camera.near = 10;
  keySunLight.shadow.camera.far = 220;
  const campusBounds = 72;
  keySunLight.shadow.camera.left = -campusBounds;
  keySunLight.shadow.camera.right = campusBounds;
  keySunLight.shadow.camera.top = campusBounds;
  keySunLight.shadow.camera.bottom = -campusBounds;
  keySunLight.shadow.bias = -0.0004;
  keySunLight.shadow.normalBias = 0.022;
  keySunLight.shadow.radius = 2.5;
  scene.add(keySunLight);

  // 5. Player-Tracking Close-Range DirectionalLight (Crisp Avatar & Promenade Shadows)
  const playerShadowLight = new THREE.DirectionalLight('#fffbeb', 0.9);
  playerShadowLight.position.set(16, 28, 14);
  playerShadowLight.castShadow = true;
  playerShadowLight.shadow.mapSize.width = 1024;
  playerShadowLight.shadow.mapSize.height = 1024;
  playerShadowLight.shadow.camera.near = 2;
  playerShadowLight.shadow.camera.far = 65;
  const localBounds = 16;
  playerShadowLight.shadow.camera.left = -localBounds;
  playerShadowLight.shadow.camera.right = localBounds;
  playerShadowLight.shadow.camera.top = localBounds;
  playerShadowLight.shadow.camera.bottom = -localBounds;
  playerShadowLight.shadow.bias = -0.0003;
  playerShadowLight.shadow.normalBias = 0.015;
  scene.add(playerShadowLight);
  scene.add(playerShadowLight.target);

  // 6. Cool Azure Sky Rim / Backlight (Sculpts 3D Silhouettes & Edges)
  const skyRimLight = new THREE.DirectionalLight('#38bdf8', 0.95);
  skyRimLight.position.set(-58, 44, -52);
  scene.add(skyRimLight);

  // 7. Warm Ground Bounce Fill Light (Simulates Sun Bounce off Stone Pavement)
  const bounceFillLight = new THREE.DirectionalLight('#fed7aa', 0.45);
  bounceFillLight.position.set(-15, -22, 35);
  scene.add(bounceFillLight);

  // 8. Local Architectural & Landmark PointLights for Depth & Warmth
  const globeFountainLight = new THREE.PointLight('#38bdf8', 3.6, 18, 1.5);
  globeFountainLight.position.set(0, 3.2, -4.5);
  scene.add(globeFountainLight);

  const pavilionLights: [number, number, number, string][] = [
    [-13.5, 3.2, -1.5, '#60a5fa'], // Biblioteca Digital
    [-9.8, 3.2, -10.5, '#34d399'], // Espaço de Projetos
    [0, 3.8, -15.5, '#38bdf8'], // Centro de Aprendizagem
    [9.8, 3.2, -10.5, '#c084fc'], // Laboratório Criativo
    [13.5, 3.2, -1.5, '#fbbf24'], // Cidadania Digital
  ];
  pavilionLights.forEach(([lx, ly, lz, colorHex]) => {
    const pt = new THREE.PointLight(colorHex, 2.2, 15, 1.6);
    pt.position.set(lx, ly, lz);
    scene.add(pt);
  });

  return {
    playerShadowLight,
    cloudGroups,
    disposeEnv: () => {
      envRenderTarget.dispose();
      skyTexture.dispose();
      pmremGenerator.dispose();
    },
  };
}

// Create a soft Ground Contact Ambient Occlusion (AO) disc under avatars
function createContactShadowDisc(radius = 0.62): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.55)');
  grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.22)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  const disc = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2, radius * 2),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.04;
  return disc;
}

export const World3DCanvas: React.FC<World3DCanvasProps> = ({
  avatarConfig,
  currentZone,
  playerPosition,
  completedMissionIds,
  onZoneChange,
  onInteractObject,
  onInteractNpc,
  onPositionUpdate,
  teleportSignal,
  chatMessages = [],
  onSendChatMessage,
  onOpenWorldMap,
  onStartActivity,
  onOpenAvatarInventory,
  onOpenCurriculum,
  onTakeWorldPhoto,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);
  const [animState, setAnimState] = useState<AvatarAnimationState>('idle');
  const [isRunningMode, setIsRunningMode] = useState(false);
  const [isSitting, setIsSitting] = useState(false);
  const [showTouchPad, setShowTouchPad] = useState(false);
  const [activeHotbarSlot, setActiveHotbarSlot] = useState<number>(1);
  const [chatTab, setChatTab] = useState<'chat' | 'turma' | 'mundo'>('chat');
  const [chatDraft, setChatDraft] = useState('');
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const [minimapZoom, setMinimapZoom] = useState(1);

  const [nearbyInteractable, setNearbyInteractable] = useState<{
    kind: 'object' | 'npc';
    id: string;
    name: string;
    promptText: string;
    description: string;
    color: string;
    data: WorldInteractiveObject | NpcCharacter;
  } | null>(null);
  const [labels, setLabels] = useState<ProjectedLabel[]>([]);
  const [coordsDisplay, setCoordsDisplay] = useState<[number, number, number]>(playerPosition);

  const keysPressedRef = useRef<Record<string, boolean>>({});
  const touchInputRef = useRef<{ forward: number; turn: number; jump: boolean }>({
    forward: 0,
    turn: 0,
    jump: false,
  });
  const isRunningRef = useRef(false);
  const isSittingRef = useRef(false);
  const avatarConfigRef = useRef<AvatarConfig>(avatarConfig);
  const nearbyRef = useRef<typeof nearbyInteractable>(null);
  const currentZoneRef = useRef<ZoneId>(currentZone);
  const triggerInteractJumpRef = useRef<number>(0);

  useEffect(() => {
    avatarConfigRef.current = avatarConfig;
  }, [avatarConfig]);

  useEffect(() => {
    isRunningRef.current = isRunningMode;
  }, [isRunningMode]);

  useEffect(() => {
    isSittingRef.current = isSitting;
  }, [isSitting]);

  useEffect(() => {
    currentZoneRef.current = currentZone;
  }, [currentZone]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.16;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      setWebglError(true);
      return;
    }

    const canvasEl = renderer.domElement;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const handleContextRestored = () => setWebglError(false);
    canvasEl.addEventListener('webglcontextlost', handleContextLost);
    canvasEl.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      280
    );

    // Initialize Rich Multi-Directional Global Illumination & Sky Environment
    const { playerShadowLight, cloudGroups, disposeEnv } = setupRichGlobalIllumination(
      renderer,
      scene
    );

    const { interactiveMeshes, npcEntries, clickableMeshes } = populateWorldScene(scene);
    const { globeMesh, airshipGroup, classmateLabels } = buildTicMundoReferenceCampus(scene);

    // Enable shadow casting & receiving across all architectural and decorative 3D meshes
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh && obj.name !== 'sky_dome_non_shadow') {
        const mesh = obj as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && !mat.wireframe) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      }
    });

    let playerParts = buildAvatarMesh(avatarConfigRef.current);
    const playerContainer = new THREE.Group();
    playerContainer.position.set(playerPosition[0], playerPosition[1], playerPosition[2]);
    // Face North (-Z) toward the Globe Fountain, Prof. Ana, and TIC MUNDO Pavilions!
    playerContainer.rotation.y = Math.PI;
    playerContainer.add(playerParts.root);
    playerContainer.add(createContactShadowDisc(0.68));
    scene.add(playerContainer);

    let lastConfigJSON = JSON.stringify(avatarConfigRef.current);
    let camYaw = 0;
    let camPitch = 0.22; // Over-the-shoulder angle framing the pavilions & sky!
    let camDistance = 6.8;
    let isPointerDown = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerMoved = false;
    let pinchStartDist = 0;
    let velocityY = 0;
    let isGrounded = true;
    let walkCycle = 0;
    let lastZoneCheckTime = 0;
    let lastHudUpdateTime = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      keysPressedRef.current[e.code] = true;

      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        if (isSittingRef.current) setIsSitting(false);
      }

      if (e.code === 'Space' && isGrounded) {
        e.preventDefault();
        setIsSitting(false);
        velocityY = 9.5;
        isGrounded = false;
      }
      if (e.code === 'KeyR') {
        e.preventDefault();
        setIsSitting((prev) => !prev);
      }
      if (e.code === 'KeyE') {
        e.preventDefault();
        triggerInteractJumpRef.current = performance.now();
        if (nearbyRef.current) {
          if (nearbyRef.current.kind === 'npc') {
            onInteractNpc(nearbyRef.current.data as NpcCharacter);
          } else {
            onInteractObject(nearbyRef.current.data as WorldInteractiveObject);
          }
        } else {
          // If Prof. Ana is in the current zone, open her dialogue directly on [E]
          const profAna = NPCS_DATA.find((n) => n.id === 'npc_professor_tic');
          if (profAna) onInteractNpc(profAna);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const triggerRaycastAt = (clientX: number, clientY: number) => {
      const rect = canvasEl.getBoundingClientRect();
      mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObjects(clickableMeshes, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const kind = hit.userData?.interactKind;
        const data = hit.userData?.interactData;
        if (kind === 'npc' && data) {
          triggerInteractJumpRef.current = performance.now();
          onInteractNpc(data as NpcCharacter);
        } else if (kind === 'object' && data) {
          triggerInteractJumpRef.current = performance.now();
          onInteractObject(data as WorldInteractiveObject);
        }
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      isPointerDown = true;
      pointerMoved = false;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (!isPointerDown) return;
      const dx = e.clientX - pointerStartX;
      const dy = e.clientY - pointerStartY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) pointerMoved = true;
      camYaw -= dx * 0.0065;
      camPitch = Math.max(0.08, Math.min(1.05, camPitch + dy * 0.0055));
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
    };

    const onPointerUp = (e: MouseEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      if (!pointerMoved) {
        triggerRaycastAt(e.clientX, e.clientY);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isPointerDown = true;
        pointerMoved = false;
        pointerStartX = e.touches[0].clientX;
        pointerStartY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        pinchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isPointerDown) {
        const dx = e.touches[0].clientX - pointerStartX;
        const dy = e.touches[0].clientY - pointerStartY;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) pointerMoved = true;
        camYaw -= dx * 0.0075;
        camPitch = Math.max(0.08, Math.min(1.05, camPitch + dy * 0.006));
        pointerStartX = e.touches[0].clientX;
        pointerStartY = e.touches[0].clientY;
      } else if (e.touches.length === 2 && pinchStartDist > 0) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = pinchStartDist - dist;
        camDistance = Math.max(4.5, Math.min(20, camDistance + delta * 0.03));
        pinchStartDist = dist;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isPointerDown && !pointerMoved && e.changedTouches.length === 1) {
        triggerRaycastAt(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
      isPointerDown = false;
      pinchStartDist = 0;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camDistance = Math.max(4.5, Math.min(20, camDistance + e.deltaY * 0.01));
    };

    canvasEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    canvasEl.addEventListener('touchstart', onTouchStart, { passive: true });
    canvasEl.addEventListener('touchmove', onTouchMove, { passive: true });
    canvasEl.addEventListener('touchend', onTouchEnd);
    canvasEl.addEventListener('wheel', onWheel, { passive: false });

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    (container as unknown as { setPlayerPos?: (pos: [number, number, number]) => void }).setPlayerPos = (
      pos: [number, number, number]
    ) => {
      playerContainer.position.set(pos[0], pos[1], pos[2]);
      velocityY = 0;
    };

    let reqId = 0;
    let prevTime = performance.now();

    const animate = (now: number) => {
      reqId = requestAnimationFrame(animate);
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;

      // Rotate central globe, float airship & drift volumetric 3D clouds
      globeMesh.rotation.y += dt * 0.45;
      airshipGroup.position.x = 14 + Math.sin(now * 0.0004) * 6;
      airshipGroup.position.y = 24 + Math.cos(now * 0.0008) * 0.6;
      cloudGroups.forEach((cg, idx) => {
        cg.position.x += Math.sin(now * 0.0002 + idx) * 0.008;
      });

      const currentConfigStr = JSON.stringify(avatarConfigRef.current);
      if (currentConfigStr !== lastConfigJSON) {
        lastConfigJSON = currentConfigStr;
        playerContainer.remove(playerParts.root);
        playerParts = buildAvatarMesh(avatarConfigRef.current);
        playerContainer.add(playerParts.root);
      }

      const keys = keysPressedRef.current;
      let moveForward = touchInputRef.current.forward;
      let moveTurn = touchInputRef.current.turn;

      if (keys['KeyW'] || keys['ArrowUp']) moveForward += 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveForward -= 1;
      if (keys['KeyA'] || keys['ArrowLeft']) moveTurn += 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveTurn -= 1;

      if (touchInputRef.current.jump && isGrounded) {
        velocityY = 9.5;
        isGrounded = false;
        touchInputRef.current.jump = false;
      }

      const running =
        isRunningRef.current || Boolean(keys['ShiftLeft']) || Boolean(keys['ShiftRight']);
      const baseSpeed = running ? 13.5 : 7.5;

      if (Math.abs(moveTurn) > 0.01) {
        playerContainer.rotation.y += moveTurn * 2.4 * dt;
      }

      const isMoving = Math.abs(moveForward) > 0.01;
      if (isMoving) {
        const dir = new THREE.Vector3(0, 0, moveForward).normalize();
        dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerContainer.rotation.y);
        playerContainer.position.x = Math.max(
          -75,
          Math.min(75, playerContainer.position.x + dir.x * baseSpeed * dt)
        );
        playerContainer.position.z = Math.max(
          -75,
          Math.min(75, playerContainer.position.z + dir.z * baseSpeed * dt)
        );
      }

      if (!isGrounded || playerContainer.position.y > 0) {
        playerContainer.position.y += velocityY * dt;
        velocityY -= 24 * dt;
        if (playerContainer.position.y <= 0) {
          playerContainer.position.y = 0;
          velocityY = 0;
          isGrounded = true;
        }
      }

      // Keep close-range high-resolution shadow frustum centered on the student avatar
      playerShadowLight.position.set(
        playerContainer.position.x + 16,
        28,
        playerContainer.position.z + 14
      );
      playerShadowLight.target.position.copy(playerContainer.position);
      playerShadowLight.target.updateMatrixWorld();

      let nextAnimState: AvatarAnimationState = 'idle';
      if (now - triggerInteractJumpRef.current < 650) {
        nextAnimState = 'interact';
      } else if (!isGrounded) {
        nextAnimState = 'jump';
      } else if (isMoving) {
        nextAnimState = running ? 'run' : 'walk';
      }

      if (isSittingRef.current && !isMoving && isGrounded) {
        playerParts.leftLeg.rotation.x = -1.35;
        playerParts.rightLeg.rotation.x = -1.35;
        playerParts.root.position.y = -0.32;
      } else {
        playerParts.root.position.y = 0;
        if (nextAnimState === 'walk' || nextAnimState === 'run') {
          walkCycle += dt * (nextAnimState === 'run' ? 14 : 8.5);
          const swing = Math.sin(walkCycle) * (nextAnimState === 'run' ? 0.85 : 0.55);
          playerParts.leftLeg.rotation.x = swing;
          playerParts.rightLeg.rotation.x = -swing;
          playerParts.leftArm.rotation.x = -swing * 0.9;
          playerParts.rightArm.rotation.x = swing * 0.9;
          playerParts.bodyMesh.rotation.x = nextAnimState === 'run' ? 0.14 : 0.04;
        } else if (nextAnimState === 'jump') {
          playerParts.leftLeg.rotation.x = -0.35;
          playerParts.rightLeg.rotation.x = 0.25;
          playerParts.leftArm.rotation.x = -2.2;
          playerParts.rightArm.rotation.x = -2.2;
        } else if (nextAnimState === 'interact') {
          playerParts.rightArm.rotation.x = -2.4 + Math.sin(now * 0.02) * 0.35;
          playerParts.leftArm.rotation.x = 0;
        } else {
          const idleWave = Math.sin(now * 0.003) * 0.05;
          playerParts.leftLeg.rotation.x = 0;
          playerParts.rightLeg.rotation.x = 0;
          playerParts.leftArm.rotation.x = idleWave;
          playerParts.rightArm.rotation.x = -idleWave;
          playerParts.bodyMesh.rotation.x = 0;
          playerParts.headGroup.rotation.y = Math.sin(now * 0.0015) * 0.1;
        }
      }

      const totalYaw = playerContainer.rotation.y + camYaw;
      const desiredCamX =
        playerContainer.position.x - Math.sin(totalYaw) * camDistance * Math.cos(camPitch);
      const desiredCamZ =
        playerContainer.position.z - Math.cos(totalYaw) * camDistance * Math.cos(camPitch);
      const desiredCamY = playerContainer.position.y + 1.95 + Math.sin(camPitch) * camDistance;

      camera.position.lerp(new THREE.Vector3(desiredCamX, desiredCamY, desiredCamZ), 0.14);
      camera.lookAt(
        playerContainer.position.x,
        playerContainer.position.y + 1.85,
        playerContainer.position.z - 2.5
      );

      interactiveMeshes.forEach(({ floatingPart, ring }, idx) => {
        floatingPart.rotation.y += dt * 1.1;
        const pulse = 1 + Math.sin(now * 0.004 + idx) * 0.08;
        ring.scale.set(pulse, pulse, 1);
      });

      npcEntries.forEach(({ group, headGroup, ring }, idx) => {
        headGroup.position.y = 1.75 + Math.sin(now * 0.003 + idx) * 0.04;
        const dist = group.position.distanceTo(playerContainer.position);
        if (dist < 12) {
          const dx = playerContainer.position.x - group.position.x;
          const dz = playerContainer.position.z - group.position.z;
          group.rotation.y += (Math.atan2(dx, dz) - group.rotation.y) * 0.08;
        }
        const pulse = 1 + Math.sin(now * 0.005 + idx) * 0.07;
        ring.scale.set(pulse, pulse, 1);
      });

      if (now - lastHudUpdateTime > 95) {
        lastHudUpdateTime = now;
        setAnimState(nextAnimState);

        const px = Math.round(playerContainer.position.x);
        const py = Math.round(playerContainer.position.y);
        const pz = Math.round(playerContainer.position.z);
        setCoordsDisplay([px, py, pz]);
        onPositionUpdate([px, py, pz]);

        if (now - lastZoneCheckTime > 300) {
          lastZoneCheckTime = now;
          let bestZone: ZoneId = currentZoneRef.current;
          let bestDist = Infinity;
          (Object.keys(ZONES_DATA) as ZoneId[]).forEach((zKey) => {
            const zMeta = ZONES_DATA[zKey];
            const dZone = Math.hypot(
              playerContainer.position.x - zMeta.center[0],
              playerContainer.position.z - zMeta.center[2]
            );
            if (dZone < bestDist) {
              bestDist = dZone;
              bestZone = zKey;
            }
          });
          if (bestZone !== currentZoneRef.current) onZoneChange(bestZone);
        }

        let closestItem: typeof nearbyInteractable = null;
        let minDist = 7.5;

        NPCS_DATA.forEach((npc) => {
          const dNpc = Math.hypot(
            playerContainer.position.x - npc.position[0],
            playerContainer.position.z - npc.position[2]
          );
          if (dNpc < minDist) {
            minDist = dNpc;
            closestItem = {
              kind: 'npc',
              id: npc.id,
              name: npc.name,
              promptText: npc.promptText,
              description: npc.shortBio,
              color: npc.accentColor,
              data: npc,
            };
          }
        });

        WORLD_OBJECTS.forEach((obj) => {
          const dObj = Math.hypot(
            playerContainer.position.x - obj.position[0],
            playerContainer.position.z - obj.position[2]
          );
          if (dObj < minDist) {
            minDist = dObj;
            closestItem = {
              kind: 'object',
              id: obj.id,
              name: obj.name,
              promptText: obj.promptText,
              description: obj.description,
              color: obj.color,
              data: obj,
            };
          }
        });

        nearbyRef.current = closestItem;
        setNearbyInteractable(closestItem);

        const width = container.clientWidth;
        const height = container.clientHeight;
        const nextLabels: ProjectedLabel[] = [];

        const projectPoint = (
          pos3D: THREE.Vector3,
          id: string,
          title: string,
          subtitle?: string,
          opts?: {
            isNpc?: boolean;
            isProfAna?: boolean;
            isClassmate?: boolean;
            isPlayer?: boolean;
          }
        ) => {
          if (camera.position.distanceTo(pos3D) > 42 && !opts?.isPlayer) return;
          const projected = pos3D.clone().project(camera);
          if (projected.z > 1) return;
          const sx = (projected.x * 0.5 + 0.5) * width;
          const sy = (-(projected.y * 0.5) + 0.5) * height;
          if (sx >= 20 && sx <= width - 20 && sy >= 20 && sy <= height - 20) {
            nextLabels.push({
              id,
              title,
              subtitle,
              x: sx,
              y: sy,
              ...opts,
            });
          }
        };

        // Project Classmates (Tiago, Lara, Sofia)
        classmateLabels.forEach((cm) => {
          projectPoint(cm.pos, cm.id, cm.name, undefined, { isClassmate: true });
        });

        // Project NPCs (with special yellow '!' and [E] Falar badge for Prof. Ana)
        NPCS_DATA.forEach((npc) => {
          projectPoint(
            new THREE.Vector3(npc.position[0], npc.position[1] + 2.8, npc.position[2]),
            npc.id,
            npc.name,
            npc.role,
            {
              isNpc: true,
              isProfAna: npc.id === 'npc_professor_tic',
            }
          );
        });

        setLabels(nextLabels);
      }

      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('resize', onResize);
      canvasEl.removeEventListener('mousedown', onPointerDown);
      canvasEl.removeEventListener('touchstart', onTouchStart);
      canvasEl.removeEventListener('touchmove', onTouchMove);
      canvasEl.removeEventListener('touchend', onTouchEnd);
      canvasEl.removeEventListener('wheel', onWheel);
      canvasEl.removeEventListener('webglcontextlost', handleContextLost);
      canvasEl.removeEventListener('webglcontextrestored', handleContextRestored);
      disposeEnv();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!teleportSignal || !mountRef.current) return;
    const setter = (
      mountRef.current as unknown as { setPlayerPos?: (pos: [number, number, number]) => void }
    ).setPlayerPos;
    if (setter) setter(teleportSignal.position);
  }, [teleportSignal]);

  const profAnaNpc = NPCS_DATA.find((n) => n.id === 'npc_professor_tic') || NPCS_DATA[0];

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatDraft.trim() || !onSendChatMessage) return;
    onSendChatMessage(chatDraft.trim());
    setChatDraft('');
  };

  // Hotbar 1-6 Actions
  const handleHotbarClick = (slot: number) => {
    setActiveHotbarSlot(slot);
    if (slot === 1 && onStartActivity) {
      onStartActivity('hardware_builder', 'missao_hardware');
    } else if (slot === 2 && onOpenCurriculum) {
      onOpenCurriculum();
    } else if (slot === 3 && onStartActivity) {
      onStartActivity('web_detective', 'missao_internet');
    } else if (slot === 4 && onStartActivity) {
      onStartActivity('creative_studio', 'missao_criatividade');
    } else if (slot === 5 && onOpenAvatarInventory) {
      onOpenAvatarInventory();
    } else if (slot === 6 && onTakeWorldPhoto) {
      onTakeWorldPhoto();
    }
  };

  const getSenderColorClass = (sender: string) => {
    const s = sender.toLowerCase();
    if (s.includes('sofia')) return 'text-amber-300';
    if (s.includes('tiago')) return 'text-cyan-400';
    if (s.includes('lara')) return 'text-yellow-300';
    if (s.includes('prof')) return 'text-emerald-400';
    return 'text-sky-300';
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-sky-200 select-none touch-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {webglError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/90 p-6">
          <div className="max-w-lg w-full bg-[#111c2d] border border-slate-600 rounded-2xl p-6 text-center space-y-4 shadow-2xl text-white">
            <h2 className="text-xl font-display font-bold">Modo Interativo Simplificado (2D)</h2>
            <p className="text-sm text-slate-300">
              Escolhe diretamente uma das atividades ou NPCs desta zona:
            </p>
            <div className="grid grid-cols-1 gap-2 text-left">
              {NPCS_DATA.map((npc) => (
                <button
                  key={npc.id}
                  onClick={() => onInteractNpc(npc)}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-sky-900/60 text-sm text-white flex justify-between items-center cursor-pointer"
                >
                  <span className="font-semibold">{npc.name}</span>
                  <span className="text-xs text-amber-300 font-medium">{npc.promptText}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Projected 3D Character Nameplates (Tiago, Lara, Sofia, and Prof. Ana with Yellow '!' & [E] Falar) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {labels.map((lbl) => (
          <div
            key={lbl.id}
            style={{
              transform: `translate3d(${Math.round(lbl.x)}px, ${Math.round(lbl.y)}px, 0) translate(-50%, -100%)`,
            }}
            className="absolute top-0 left-0 transition-transform duration-75"
          >
            {lbl.isProfAna ? (
              <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
                {/* Floating Yellow Exclamation Badge */}
                <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-amber-200 shadow-lg flex items-center justify-center text-slate-950 font-display font-black text-lg animate-bounce">
                  !
                </div>
                {/* Prof. Ana Nameplate */}
                <div className="px-3 py-1 rounded-lg bg-[#0f172a]/88 border border-slate-500/60 text-white text-xs sm:text-sm font-bold shadow-lg whitespace-nowrap">
                  {lbl.title}
                </div>
                {/* Floating [E] Falar Button below Prof. Ana */}
                <button
                  onClick={() => onInteractNpc(profAnaNpc)}
                  className="mt-16 px-3.5 py-1.5 rounded-xl bg-[#0f172a]/90 hover:bg-sky-700 border border-slate-400/60 text-white text-xs sm:text-sm font-bold shadow-xl flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span className="px-2 py-0.5 rounded-md bg-white text-slate-950 font-mono font-extrabold text-xs">
                    E
                  </span>
                  <span>Falar</span>
                </button>
              </div>
            ) : lbl.isClassmate ? (
              <div className="px-3 py-0.5 rounded-lg bg-[#0f172a]/82 border border-slate-500/50 text-xs font-bold text-white whitespace-nowrap shadow-md">
                {lbl.title}
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-lg bg-[#0f172a]/85 border border-slate-500/50 text-center whitespace-nowrap shadow-md">
                <div className="text-xs font-bold text-white">{lbl.title}</div>
                {lbl.subtitle && (
                  <div className="text-[10px] text-sky-300 font-medium">{lbl.subtitle}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* =====================================================================
          TOP-LEFT HUD: MISSÕES ATIVAS (Exact Match to Reference Image)
         ===================================================================== */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-auto w-[260px] sm:w-[300px] bg-[#111c2d]/88 backdrop-blur-md border border-slate-500/45 rounded-2xl p-3 sm:p-3.5 shadow-2xl text-white">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-sm sm:text-base font-display font-bold tracking-wide text-white">
            Missões Ativas
          </h3>
          <span className="text-[11px] font-mono text-sky-300">
            {completedMissionIds.length}/8 concluídas
          </span>
        </div>

        <div className="space-y-2">
          {/* Mission 1: Explorar o Centro de Segurança */}
          <button
            onClick={() => onInteractNpc(profAnaNpc)}
            className="w-full text-left p-2.5 rounded-xl bg-[#1e293b]/90 hover:bg-[#283548] border border-slate-600/50 flex items-center justify-between gap-2.5 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-display font-black text-base shrink-0 shadow-sm">
                !
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                  Explorar o Centro de Segurança
                </div>
                <div className="text-[11px] text-slate-300 truncate">Fala com a Prof. Ana</div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-200 shrink-0">
              {completedMissionIds.includes('missao_seguranca') ? '1/1' : '0/1'}
            </span>
          </button>

          {/* Mission 2: Pesquisar informação fidedigna */}
          <button
            onClick={() => onStartActivity && onStartActivity('web_detective', 'missao_internet')}
            className="w-full text-left p-2.5 rounded-xl bg-[#1e293b]/90 hover:bg-[#283548] border border-slate-600/50 flex items-center justify-between gap-2.5 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                  Pesquisar informação fidedigna
                </div>
                <div className="text-[11px] text-slate-300 truncate">Biblioteca Digital</div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-200 shrink-0">
              {completedMissionIds.includes('missao_internet') ? '3/3' : '0/3'}
            </span>
          </button>

          {/* Mission 3: Criar uma apresentação */}
          <button
            onClick={() =>
              onStartActivity && onStartActivity('creative_studio', 'missao_criatividade')
            }
            className="w-full text-left p-2.5 rounded-xl bg-[#1e293b]/90 hover:bg-[#283548] border border-slate-600/50 flex items-center justify-between gap-2.5 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Presentation className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate group-hover:text-pink-300 transition-colors">
                  Criar uma apresentação
                </div>
                <div className="text-[11px] text-slate-300 truncate">Laboratório Criativo</div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-200 shrink-0">
              {completedMissionIds.includes('missao_criatividade') ? '1/1' : '0/1'}
            </span>
          </button>

          {/* Mission 4: Trabalhar em equipa */}
          <button
            onClick={() =>
              onStartActivity && onStartActivity('hardware_builder', 'missao_hardware')
            }
            className="w-full text-left p-2.5 rounded-xl bg-[#1e293b]/90 hover:bg-[#283548] border border-slate-600/50 flex items-center justify-between gap-2.5 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  Trabalhar em equipa
                </div>
                <div className="text-[11px] text-slate-300 truncate">Espaço de Projetos</div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-200 shrink-0">
              {completedMissionIds.includes('missao_hardware') ? '2/2' : '0/2'}
            </span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TOP-RIGHT HUD: CIRCULAR MINIMAP ("Mapa do Mundo TIC")
         ===================================================================== */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-auto flex flex-col items-center">
        <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-b from-slate-200 via-sky-300 to-slate-400 shadow-2xl border-2 border-white/80">
          {/* Interactive Circular Radar Map */}
          <div
            onClick={onOpenWorldMap}
            title="Clica para abrir o Mapa do Mundo TIC completo"
            className="relative w-full h-full rounded-full overflow-hidden bg-[#0ea5e9] cursor-pointer group"
          >
            {/* Aerial Campus Island Illustration in SVG */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full transition-transform duration-300"
              style={{ transform: `scale(${minimapZoom})` }}
            >
              {/* Turquoise Ocean Water */}
              <rect width="200" height="200" fill="#0284c7" />
              <circle cx="100" cy="100" r="88" fill="#38bdf8" opacity="0.45" />
              {/* Green Island Landmass */}
              <circle cx="100" cy="100" r="76" fill="#16a34a" />
              <circle cx="100" cy="100" r="64" fill="#22c55e" />
              {/* Circular Plaza Roads & Walkways */}
              <circle
                cx="100"
                cy="100"
                r="42"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="12"
              />
              <line x1="100" y1="24" x2="100" y2="176" stroke="#cbd5e1" strokeWidth="8" />
              <line x1="24" y1="100" x2="176" y2="100" stroke="#cbd5e1" strokeWidth="8" />
              {/* Central Courtyard & Fountain */}
              <circle cx="100" cy="100" r="20" fill="#e2e8f0" />
              <circle cx="100" cy="100" r="8" fill="#0ea5e9" stroke="#ffffff" strokeWidth="2" />

              {/* Pavilion Roofs on Minimap */}
              <rect x="82" y="42" width="36" height="14" rx="4" fill="#0284c7" stroke="#fff" strokeWidth="1.5" />
              <rect x="44" y="64" width="22" height="14" rx="3" fill="#0d9488" stroke="#fff" strokeWidth="1.5" />
              <rect x="134" y="64" width="22" height="14" rx="3" fill="#9333ea" stroke="#fff" strokeWidth="1.5" />
              <rect x="34" y="96" width="20" height="16" rx="3" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
              <rect x="146" y="96" width="20" height="16" rx="3" fill="#d97706" stroke="#fff" strokeWidth="1.5" />

              {/* Colored Map Pins matching the reference image */}
              <circle cx="65" cy="68" r="7" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
              <circle cx="115" cy="80" r="7" fill="#0ea5e9" stroke="#ffffff" strokeWidth="2" />
              <circle cx="106" cy="118" r="7" fill="#14b8a6" stroke="#ffffff" strokeWidth="2" />
              <circle cx="148" cy="54" r="7" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />

              {/* Live Player Position Marker */}
              <circle
                cx={Math.max(30, Math.min(170, 100 + coordsDisplay[0] * 0.9))}
                cy={Math.max(30, Math.min(170, 100 + coordsDisplay[2] * 0.9))}
                r="6"
                fill="#facc15"
                stroke="#0f172a"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          {/* + / - Zoom Buttons on the bottom-right rim */}
          <div className="absolute bottom-2 right-0 flex flex-col gap-1">
            <button
              onClick={() => setMinimapZoom((z) => Math.min(1.6, +(z + 0.2).toFixed(1)))}
              aria-label="Aproximar minimapa"
              className="w-6 h-6 rounded-md bg-[#0f172a]/90 hover:bg-sky-600 border border-slate-400/60 text-white flex items-center justify-center shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMinimapZoom((z) => Math.max(0.8, +(z - 0.2).toFixed(1)))}
              aria-label="Afastar minimapa"
              className="w-6 h-6 rounded-md bg-[#0f172a]/90 hover:bg-sky-600 border border-slate-400/60 text-white flex items-center justify-center shadow-md cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* "Mapa do Mundo TIC" Label Pill */}
        <button
          onClick={onOpenWorldMap}
          className="-mt-2.5 px-3.5 py-1 rounded-full bg-[#0f172a]/92 hover:bg-sky-700 border border-slate-400/60 text-white text-[11px] sm:text-xs font-bold shadow-lg cursor-pointer transition-colors"
        >
          Mapa do Mundo TIC
        </button>
      </div>

      {/* =====================================================================
          BOTTOM-LEFT HUD: MULTI-TAB CHAT ("Chat | Turma | Mundo | +")
         ===================================================================== */}
      <div className="hidden md:flex flex-col absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 pointer-events-auto w-[340px] lg:w-[380px] bg-[#111c2d]/88 backdrop-blur-md border border-slate-500/45 rounded-2xl p-3 shadow-2xl text-white">
        {/* Chat Tabs Header */}
        <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-600/50">
          <button
            onClick={() => setChatTab('chat')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              chatTab === 'chat'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setChatTab('turma')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              chatTab === 'turma'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Turma
          </button>
          <button
            onClick={() => setChatTab('mundo')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              chatTab === 'mundo'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Mundo
          </button>
          <button
            onClick={() => setShowQuickPhrases((prev) => !prev)}
            title="Frases seguras rápidas"
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Optional Quick Safe Phrases Drawer */}
        {showQuickPhrases && (
          <div className="mb-2 p-2 rounded-xl bg-slate-900/95 border border-slate-700 space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-semibold text-sky-300 uppercase">
              Frases Rápidas Seguras:
            </div>
            {QUICK_SAFE_PHRASES.map((phrase) => (
              <button
                key={phrase}
                onClick={() => {
                  if (onSendChatMessage) onSendChatMessage(phrase);
                  setShowQuickPhrases(false);
                }}
                className="w-full text-left text-[11px] text-slate-200 hover:text-sky-300 py-0.5 truncate cursor-pointer"
              >
                • {phrase}
              </button>
            ))}
          </div>
        )}

        {/* Messages List */}
        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 mb-2.5 text-xs leading-snug custom-scrollbar">
          {chatMessages.slice(-5).map((m) => (
            <div key={m.id} className="text-slate-100">
              <span className={`font-bold mr-1.5 ${getSenderColorClass(m.sender)}`}>
                {m.sender}:
              </span>
              <span className="text-slate-100">{m.text}</span>
            </div>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={chatDraft}
            onChange={(e) => setChatDraft(e.target.value)}
            placeholder="Escreve uma mensagem..."
            className="flex-1 bg-[#1e293b]/90 border border-slate-600/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            aria-label="Enviar mensagem"
            className="w-8 h-8 rounded-xl bg-slate-700/90 hover:bg-sky-500 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* =====================================================================
          BOTTOM-CENTER HUD: 6-SLOT HOTBAR (Slots 1 to 6)
         ===================================================================== */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <div className="bg-[#111c2d]/90 backdrop-blur-md border border-slate-500/50 rounded-2xl px-2.5 py-2 shadow-2xl flex items-center gap-1.5 sm:gap-2.5">
          {[
            {
              slot: 1,
              label: 'Computador & Hardware',
              icon: <Laptop className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300" />,
              bg: 'from-sky-500/30 to-blue-600/30',
            },
            {
              slot: 2,
              label: 'Manual & Currículo TIC',
              icon: (
                <div className="w-6 h-7 rounded bg-amber-600 border border-amber-300 flex items-center justify-center text-[10px] font-bold text-white shadow">
                  TIC
                </div>
              ),
              bg: 'from-amber-500/30 to-orange-600/30',
            },
            {
              slot: 3,
              label: 'Pesquisa Web Segura',
              icon: <Search className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200" />,
              bg: 'from-cyan-500/30 to-sky-600/30',
            },
            {
              slot: 4,
              label: 'Laboratório Criativo',
              icon: <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 fill-yellow-300/40" />,
              bg: 'from-yellow-500/30 to-amber-600/30',
            },
            {
              slot: 5,
              label: 'Mochila & Avatar',
              icon: (
                <div className="w-6 h-6 rounded-md bg-blue-600 border border-blue-300 flex items-center justify-center text-white text-xs font-bold">
                  🎒
                </div>
              ),
              bg: 'from-blue-500/30 to-indigo-600/30',
            },
            {
              slot: 6,
              label: 'Câmara Fotográfica (+XP)',
              icon: <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-slate-100" />,
              bg: 'from-slate-500/30 to-slate-700/30',
            },
          ].map((item) => (
            <button
              key={item.slot}
              onClick={() => handleHotbarClick(item.slot)}
              title={item.label}
              className={`relative w-11 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-b ${
                item.bg
              } border flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                activeHotbarSlot === item.slot
                  ? 'border-sky-400 ring-2 ring-sky-400/40 bg-slate-800/90'
                  : 'border-slate-600/70 bg-slate-900/75 hover:border-slate-400'
              }`}
            >
              {item.icon}
              <span className="mt-0.5 text-[10px] font-mono font-bold text-slate-200">
                {item.slot}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          BOTTOM-RIGHT HUD: CONTROLOS PANEL (Exact Match to Reference Image)
         ===================================================================== */}
      <div className="hidden sm:block absolute bottom-4 right-4 z-20 pointer-events-auto w-[215px] bg-[#111c2d]/88 backdrop-blur-md border border-slate-500/45 rounded-2xl p-3.5 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-slate-600/50 pb-1.5 mb-2.5">
          <h4 className="text-xs font-display font-bold text-white tracking-wide">Controlos</h4>
          <button
            onClick={() => setShowTouchPad((prev) => !prev)}
            title="Mostrar/Ocultar botões táteis no ecrã"
            className="text-[10px] text-sky-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Tátil</span>
          </button>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 font-mono font-bold text-[10px]">
              {['W', 'A', 'S', 'D'].map((k) => (
                <kbd
                  key={k}
                  className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-500 text-white"
                >
                  {k}
                </kbd>
              ))}
            </div>
            <span className="text-slate-200 font-medium">Mover</span>
          </div>

          <div className="flex items-center justify-between">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-500 font-mono font-bold text-[10px] text-white">
              Shift
            </kbd>
            <span className="text-slate-200 font-medium">Correr</span>
          </div>

          <div className="flex items-center justify-between">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-500 font-mono font-bold text-[10px] text-white">
              Espaço
            </kbd>
            <span className="text-slate-200 font-medium">Saltar</span>
          </div>

          <div className="flex items-center justify-between">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-500 font-mono font-bold text-[10px] text-white">
              E
            </kbd>
            <span className="text-slate-200 font-medium">Interagir</span>
          </div>

          <div className="flex items-center justify-between">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-500 font-mono font-bold text-[10px] text-white">
              R
            </kbd>
            <span className="text-slate-200 font-medium">Sentar</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
            <span className="text-[10px] font-mono text-sky-300">🖱️ Arrastar</span>
            <span className="text-slate-200 font-medium">Mover câmara</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-sky-300">🖱️ Roda</span>
            <span className="text-slate-200 font-medium">Ver à volta</span>
          </div>
        </div>
      </div>

      {/* Mobile / Optional On-Screen Touch D-Pad */}
      <div
        className={`${
          showTouchPad ? 'flex' : 'flex sm:hidden'
        } absolute bottom-20 right-3 z-20 pointer-events-auto flex-col items-end gap-2`}
      >
        <div className="bg-[#111c2d]/90 backdrop-blur-md border border-slate-500/50 rounded-2xl p-1.5 grid grid-cols-3 gap-1 shadow-xl">
          <div />
          <button
            aria-label="Caminhar para a frente"
            onMouseDown={() => (touchInputRef.current.forward = 1)}
            onMouseUp={() => (touchInputRef.current.forward = 0)}
            onTouchStart={(e) => {
              e.preventDefault();
              touchInputRef.current.forward = 1;
            }}
            onTouchEnd={() => (touchInputRef.current.forward = 0)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 active:bg-sky-500 text-white cursor-pointer"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />
          <button
            aria-label="Virar à esquerda"
            onMouseDown={() => (touchInputRef.current.turn = 1)}
            onMouseUp={() => (touchInputRef.current.turn = 0)}
            onTouchStart={(e) => {
              e.preventDefault();
              touchInputRef.current.turn = 1;
            }}
            onTouchEnd={() => (touchInputRef.current.turn = 0)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 active:bg-sky-500 text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            aria-label="Centrar na Praça"
            onClick={() => {
              const setter = (
                mountRef.current as unknown as {
                  setPlayerPos?: (pos: [number, number, number]) => void;
                }
              )?.setPlayerPos;
              if (setter) setter([0, 0, 6]);
              onZoneChange('praca_central');
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-700 text-sky-300 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            aria-label="Virar à direita"
            onMouseDown={() => (touchInputRef.current.turn = -1)}
            onMouseUp={() => (touchInputRef.current.turn = 0)}
            onTouchStart={(e) => {
              e.preventDefault();
              touchInputRef.current.turn = -1;
            }}
            onTouchEnd={() => (touchInputRef.current.turn = 0)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 active:bg-sky-500 text-white cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div />
          <button
            aria-label="Recuar"
            onMouseDown={() => (touchInputRef.current.forward = -1)}
            onMouseUp={() => (touchInputRef.current.forward = 0)}
            onTouchStart={(e) => {
              e.preventDefault();
              touchInputRef.current.forward = -1;
            }}
            onTouchEnd={() => (touchInputRef.current.forward = 0)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 active:bg-sky-500 text-white cursor-pointer"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsRunningMode((prev) => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg cursor-pointer ${
              isRunningMode ? 'bg-amber-500 text-slate-950' : 'bg-[#111c2d]/90 text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Correr</span>
          </button>
          <button
            onClick={() => onInteractNpc(profAnaNpc)}
            className="px-3 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-1 shadow-lg cursor-pointer"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Falar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
