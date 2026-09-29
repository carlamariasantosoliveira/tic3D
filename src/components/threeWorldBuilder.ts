import * as THREE from 'three';
import { AvatarConfig, NpcCharacter, WorldInteractiveObject, ZoneId } from '../types/world';
import { NPCS_DATA, WORLD_OBJECTS, ZONES_DATA } from '../data/ticWorldData';
import {
  createArchitecturalWall,
  createBookshelf,
  createComputerWorkstation,
  createParkBench,
  createPlazaFountain,
  createServerRack,
  createStreetLamp,
  createTileFloorTexture,
  createWallSmartboard,
} from './threeWorldFurniture';

export interface AvatarMeshParts {
  root: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  headGroup: THREE.Group;
  bodyMesh: THREE.Mesh;
}

export function buildAvatarMesh(config: AvatarConfig): AvatarMeshParts {
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: config.skinColor, roughness: 0.45 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: config.shirtColor, roughness: 0.35 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: config.pantsColor, roughness: 0.5 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: config.shoeColor, roughness: 0.4 });
  const hairMat = new THREE.MeshStandardMaterial({ color: config.hairColor, roughness: 0.4 });

  // Legs
  const legGeo = new THREE.BoxGeometry(0.28, 0.75, 0.28);
  const shoeGeo = new THREE.BoxGeometry(0.3, 0.18, 0.4);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.22, 0.75, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.position.y = -0.375;
  leftLegMesh.castShadow = true;
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(0, -0.72, 0.05);
  leftLeg.add(leftLegMesh, leftShoe);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.22, 0.75, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.position.y = -0.375;
  rightLegMesh.castShadow = true;
  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0, -0.72, 0.05);
  rightLeg.add(rightLegMesh, rightShoe);

  // Torso
  const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.92, 0.42), shirtMat);
  bodyMesh.position.set(0, 1.22, 0);
  bodyMesh.castShadow = true;

  const emblem = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.26, 0.45),
    new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#38bdf8', emissiveIntensity: 0.35 })
  );
  emblem.position.set(0, 1.32, 0);
  root.add(emblem);

  // Arms
  const armGeo = new THREE.BoxGeometry(0.24, 0.78, 0.24);
  const handGeo = new THREE.SphereGeometry(0.13, 10, 10);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.54, 1.58, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
  leftArmMesh.position.y = -0.34;
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.y = -0.76;
  leftArm.add(leftArmMesh, leftHand);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.54, 1.58, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
  rightArmMesh.position.y = -0.34;
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.y = -0.76;
  rightArm.add(rightArmMesh, rightHand);

  // Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.75, 0);
  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.68), skinMat);
  headMesh.position.y = 0.34;
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  const eyeGeo = new THREE.BoxGeometry(0.1, 0.12, 0.05);
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#0f172a' });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.15, 0.38, 0.35);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.15, 0.38, 0.35);
  headGroup.add(leftEye, rightEye);

  // Hair
  if (config.hairStyle === 'curto') {
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.22, 0.74), hairMat);
    top.position.set(0, 0.68, 0);
    headGroup.add(top);
  } else if (config.hairStyle === 'ondulado') {
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.25, 0.76), hairMat);
    top.position.set(0, 0.68, 0);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.55, 0.24), hairMat);
    back.position.set(0, 0.42, -0.32);
    headGroup.add(top, back);
  } else if (config.hairStyle === 'crista') {
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.38, 0.78), hairMat);
    crest.position.set(0, 0.75, 0);
    headGroup.add(crest);
  } else if (config.hairStyle === 'trancas') {
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.2, 0.74), hairMat);
    top.position.set(0, 0.68, 0);
    const bL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.58, 0.16), hairMat);
    bL.position.set(-0.38, 0.28, -0.1);
    const bR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.58, 0.16), hairMat);
    bR.position.set(0.38, 0.28, -0.1);
    headGroup.add(top, bL, bR);
  } else if (config.hairStyle === 'visor_tech') {
    const helmet = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.32, 0.76),
      new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.4, roughness: 0.2 })
    );
    helmet.position.set(0, 0.64, 0);
    headGroup.add(helmet);
  }

  // Accessories
  if (config.accessory === 'ar_glasses' || config.hairStyle === 'visor_tech') {
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.66, 0.18, 0.1),
      new THREE.MeshStandardMaterial({ color: '#0284c7', emissive: '#38bdf8', emissiveIntensity: 0.6 })
    );
    visor.position.set(0, 0.39, 0.35);
    headGroup.add(visor);
  } else if (config.accessory === 'cyber_headphones') {
    const hpMat = new THREE.MeshStandardMaterial({
      color: '#e11d48',
      emissive: '#f43f5e',
      emissiveIntensity: 0.3,
    });
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.2), hpMat);
    band.position.set(0, 0.74, 0);
    const earL = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12), hpMat);
    earL.rotation.z = Math.PI / 2;
    earL.position.set(-0.39, 0.38, 0);
    const earR = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12), hpMat);
    earR.rotation.z = Math.PI / 2;
    earR.position.set(0.39, 0.38, 0);
    headGroup.add(band, earL, earR);
  } else if (config.accessory === 'robo_antenna') {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.6 })
    );
    stem.position.set(0, 0.9, 0);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 10, 10),
      new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#10b981', emissiveIntensity: 0.7 })
    );
    bulb.position.set(0, 1.15, 0);
    headGroup.add(stem, bulb);
  } else if (config.accessory === 'jetpack') {
    const pack = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.64, 0.28),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.4, roughness: 0.3 })
    );
    pack.position.set(0, 1.26, -0.32);
    const thruster = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 0.2, 10),
      new THREE.MeshStandardMaterial({ color: '#0284c7', emissive: '#38bdf8', emissiveIntensity: 0.8 })
    );
    thruster.position.set(0, 0.88, -0.32);
    root.add(pack, thruster);
  }

  root.add(leftLeg, rightLeg, bodyMesh, leftArm, rightArm, headGroup);
  return { root, leftArm, rightArm, leftLeg, rightLeg, headGroup, bodyMesh };
}

function createCampusTree(x: number, z: number, scale = 1): THREE.Group {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25 * scale, 0.38 * scale, 1.8 * scale, 10),
    new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.85 })
  );
  trunk.position.y = 0.9 * scale;
  trunk.castShadow = true;

  const crown1 = new THREE.Mesh(
    new THREE.SphereGeometry(1.45 * scale, 12, 12),
    new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.65 })
  );
  crown1.position.set(0, 2.5 * scale, 0);
  crown1.castShadow = true;

  const crown2 = new THREE.Mesh(
    new THREE.SphereGeometry(1.1 * scale, 12, 12),
    new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.6 })
  );
  crown2.position.set(0.4 * scale, 3.3 * scale, 0.2 * scale);
  crown2.castShadow = true;

  tree.add(trunk, crown1, crown2);
  tree.position.set(x, 0, z);
  return tree;
}

export function populateWorldScene(scene: THREE.Scene) {
  // 1. Lush Park & Lagoon Base Environment
  const waterFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(360, 360),
    new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.25, metalness: 0.1 })
  );
  waterFloor.rotation.x = -Math.PI / 2;
  waterFloor.position.y = -0.45;
  waterFloor.receiveShadow = true;
  scene.add(waterFloor);

  const tileTex = createTileFloorTexture('#f8fafc', '#e2e8f0');
  const woodFloorTex = createTileFloorTexture('#fef3c7', '#fde68a');

  // 2. Five Richly Landscaped Zone Islands (Grass + Stone Plaza + Decorative Ring)
  (Object.keys(ZONES_DATA) as ZoneId[]).forEach((zKey) => {
    const zone = ZONES_DATA[zKey];
    const [cx, , cz] = zone.center;

    // Outer lush green grass lawn bank
    const grassIsland = new THREE.Mesh(
      new THREE.CylinderGeometry(zone.radius + 3.5, zone.radius + 5, 0.7, 48),
      new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.75 })
    );
    grassIsland.position.set(cx, -0.38, cz);
    grassIsland.receiveShadow = true;
    scene.add(grassIsland);

    // Inner paved stone plaza
    const stonePlaza = new THREE.Mesh(
      new THREE.CylinderGeometry(zone.radius - 0.5, zone.radius, 0.76, 48),
      new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.5 })
    );
    stonePlaza.position.set(cx, -0.35, cz);
    stonePlaza.receiveShadow = true;
    scene.add(stonePlaza);

    // Zone colored curb trim
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(zone.radius - 0.8, zone.radius - 0.2, 48),
      new THREE.MeshBasicMaterial({ color: zone.accentHex, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(cx, 0.04, cz);
    scene.add(ring);
  });

  // 3. Paved Bridges with Side Guardrails & Lamps
  const bridges: [number, number, number, number, string][] = [
    [0, -26, 7, 15, '#10b981'],
    [0, 26, 7, 15, '#6366f1'],
    [27, 0, 16, 7, '#f59e0b'],
    [-27, 0, 16, 7, '#ec4899'],
  ];
  bridges.forEach(([bx, bz, bw, bl, accent]) => {
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(bw, 0.38, bl),
      new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.45 })
    );
    deck.position.set(bx, -0.14, bz);
    deck.receiveShadow = true;
    scene.add(deck);

    // Bridge side low walls/curbs
    const isNS = bl > bw;
    const curbGeo = isNS
      ? new THREE.BoxGeometry(0.35, 0.65, bl)
      : new THREE.BoxGeometry(bw, 0.65, 0.35);
    const curbMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.35 });

    const curb1 = new THREE.Mesh(curbGeo, curbMat);
    const curb2 = new THREE.Mesh(curbGeo, curbMat);
    if (isNS) {
      curb1.position.set(bx - bw / 2 + 0.2, 0.2, bz);
      curb2.position.set(bx + bw / 2 - 0.2, 0.2, bz);
    } else {
      curb1.position.set(bx, 0.2, bz - bl / 2 + 0.2);
      curb2.position.set(bx, 0.2, bz + bl / 2 - 0.2);
    }
    scene.add(curb1, curb2);
  });

  // ============================================================================
  // ZONA 1: PRAÇA CENTRAL (Fonte Central, Bancos de Jardim, Candeeiros, Árvores)
  // ============================================================================
  scene.add(createPlazaFountain(0, 0));
  scene.add(createParkBench(-8, 5, Math.PI / 4));
  scene.add(createParkBench(8, 5, -Math.PI / 4));
  scene.add(createParkBench(-8, -8, -Math.PI / 4));
  scene.add(createParkBench(8, -8, Math.PI / 4));

  [
    [-11, -11],
    [11, -11],
    [-11, 11],
    [11, 11],
  ].forEach(([lx, lz]) => {
    scene.add(createStreetLamp(lx, lz));
  });

  // ============================================================================
  // ZONA 2: ACADEMIA TIC (Norte: Salas com Paredes, Janelas, Quadros e Móveis)
  // ============================================================================
  // Warm interior floor for the entire Academia building
  const academiaFloor = new THREE.Mesh(
    new THREE.BoxGeometry(36, 0.12, 22),
    new THREE.MeshStandardMaterial({ map: woodFloorTex, roughness: 0.45 })
  );
  academiaFloor.position.set(0, 0.03, -55);
  academiaFloor.receiveShadow = true;
  scene.add(academiaFloor);

  // Exterior Back Wall (North) + Side Walls (West & East) + Front Entrance Walls with Windows
  scene.add(createArchitecturalWall(0, -66, 36, 5.2, 0.5, 0, '#f8fafc', '#059669', false));
  scene.add(
    createArchitecturalWall(-18, -55, 22, 5.2, 0.5, Math.PI / 2, '#f8fafc', '#059669', true)
  );
  scene.add(
    createArchitecturalWall(18, -55, 22, 5.2, 0.5, Math.PI / 2, '#f8fafc', '#059669', true)
  );
  // Front left & right wings with windows (leaving a wide 12m central entrance!)
  scene.add(createArchitecturalWall(-12, -44, 12, 4.5, 0.5, 0, '#f8fafc', '#059669', true));
  scene.add(createArchitecturalWall(12, -44, 12, 4.5, 0.5, 0, '#f8fafc', '#059669', true));

  // Interior Partition Walls dividing the Classrooms & Labs
  scene.add(
    createArchitecturalWall(-8, -59, 13, 4.2, 0.35, Math.PI / 2, '#f1f5f9', '#0284c7', false)
  );
  scene.add(
    createArchitecturalWall(8, -59, 13, 4.2, 0.35, Math.PI / 2, '#f1f5f9', '#0284c7', false)
  );

  // Wall Smartboards on the Back Wall of each Classroom
  scene.add(
    createWallSmartboard(
      -13,
      2.8,
      -65.6,
      0,
      'LAB. HARDWARE',
      'CPU · RAM · SSD · Placa-Mãe',
      '#10b981'
    )
  );
  scene.add(
    createWallSmartboard(
      -3.5,
      2.8,
      -65.6,
      0,
      'SALA DE INFORMÁTICA',
      'Sistema Operativo e Ficheiros',
      '#06b6d4'
    )
  );
  scene.add(
    createWallSmartboard(
      3.5,
      2.8,
      -65.6,
      0,
      'LAB. DE INTERNET',
      'Motores de Pesquisa e HTTPS',
      '#3b82f6'
    )
  );
  scene.add(
    createWallSmartboard(
      13,
      2.8,
      -65.6,
      0,
      'SALA SEGURANÇA DIGITAL',
      'Palavras-Passe · Anti-Phishing',
      '#f59e0b'
    )
  );

  // Classroom Furniture inside Academia TIC: Computer Desks, Chairs, Server Racks & Bookshelves
  // Hardware Lab furniture (West wing)
  scene.add(createComputerWorkstation(-15, -62, 0, '#10b981'));
  scene.add(createComputerWorkstation(-11, -62, 0, '#10b981'));
  scene.add(createBookshelf(-17.2, -52, Math.PI / 2));

  // Sala de Informática & Lab Internet furniture (Center wing)
  scene.add(createComputerWorkstation(-5, -62.5, 0, '#06b6d4'));
  scene.add(createComputerWorkstation(0, -62.5, 0, '#0284c7'));
  scene.add(createComputerWorkstation(5, -62.5, 0, '#3b82f6'));
  scene.add(createServerRack(-7.2, -63.5, 0));
  scene.add(createServerRack(7.2, -63.5, 0));

  // Sala de Segurança Digital furniture (East wing)
  scene.add(createComputerWorkstation(11, -62, 0, '#f59e0b'));
  scene.add(createComputerWorkstation(15, -62, 0, '#f59e0b'));
  scene.add(createBookshelf(17.2, -52, -Math.PI / 2));
  scene.add(createServerRack(16.5, -63.5, 0));

  // Oficina de Programação Carpet Grid (Center-front of Academia)
  const codingCarpet = new THREE.Mesh(
    new THREE.BoxGeometry(7, 0.06, 7),
    new THREE.MeshStandardMaterial({ color: '#ede9fe', roughness: 0.7 })
  );
  codingCarpet.position.set(0, 0.07, -49);
  scene.add(codingCarpet);

  // ============================================================================
  // ZONA 3: CIDADE DIGITAL (Este: Biblioteca com Estantes, Loja Virtual e Prédios)
  // ============================================================================
  // 1. Biblioteca & Centro de Cidadania Building (North-East of Cidade Digital)
  const libFloor = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.12, 12),
    new THREE.MeshStandardMaterial({ map: woodFloorTex, roughness: 0.5 })
  );
  libFloor.position.set(57, 0.04, -10);
  scene.add(libFloor);

  scene.add(createArchitecturalWall(57, -16, 16, 4.6, 0.45, 0, '#fffbeb', '#0284c7', true));
  scene.add(
    createArchitecturalWall(65, -10, 12, 4.6, 0.45, Math.PI / 2, '#fffbeb', '#0284c7', false)
  );
  scene.add(
    createWallSmartboard(
      64.6,
      2.6,
      -10,
      -Math.PI / 2,
      'BIBLIOTECA & CIDADANIA',
      'Respeito Online · Direitos de Autor',
      '#0284c7'
    )
  );
  // Bookshelves & Reading Desks inside the Library
  scene.add(createBookshelf(52, -15.3, 0));
  scene.add(createBookshelf(55, -15.3, 0));
  scene.add(createBookshelf(60, -15.3, 0));
  scene.add(createComputerWorkstation(54, -11, 0, '#0ea5e9'));
  scene.add(createComputerWorkstation(61, -11, 0, '#0ea5e9'));

  // 2. Loja Virtual Boutique Building (South-East of Cidade Digital)
  const shopFloor = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.12, 12),
    new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.4 })
  );
  shopFloor.position.set(57, 0.04, 10);
  scene.add(shopFloor);

  scene.add(createArchitecturalWall(57, 16, 16, 4.6, 0.45, 0, '#fff7ed', '#f59e0b', true));
  scene.add(
    createArchitecturalWall(65, 10, 12, 4.6, 0.45, Math.PI / 2, '#fff7ed', '#f59e0b', false)
  );
  scene.add(
    createWallSmartboard(
      64.6,
      2.6,
      10,
      -Math.PI / 2,
      'LOJA VIRTUAL 3D',
      'Roupas · Acessórios · BitMoedas',
      '#f59e0b'
    )
  );

  // Mannequin Display Pedestals inside Loja Virtual
  [
    [53, 13.5, '#059669'],
    [56.5, 13.5, '#e11d48'],
    [60, 13.5, '#d97706'],
  ].forEach(([mx, mz, mCol]) => {
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.85, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 })
    );
    ped.position.set(mx as number, 0.3, mz as number);
    const shirtDisplay = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.9, 0.4),
      new THREE.MeshStandardMaterial({ color: mCol as string, roughness: 0.35 })
    );
    shirtDisplay.position.set(mx as number, 1.15, mz as number);
    shirtDisplay.castShadow = true;
    scene.add(ped, shirtDisplay);
  });

  scene.add(createParkBench(46, -5, Math.PI / 2));
  scene.add(createParkBench(46, 5, Math.PI / 2));
  scene.add(createStreetLamp(45, -10));
  scene.add(createStreetLamp(45, 10));

  // ============================================================================
  // ZONA 4: ILHA DA CRIATIVIDADE (Oeste: Estúdio Multimédia, Cavaletes e Mesas)
  // ============================================================================
  const studioFloor = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.12, 20),
    new THREE.MeshStandardMaterial({ map: woodFloorTex, roughness: 0.45 })
  );
  studioFloor.position.set(-56, 0.04, 0);
  scene.add(studioFloor);

  scene.add(
    createArchitecturalWall(-65, 0, 20, 4.8, 0.45, Math.PI / 2, '#fdf2f8', '#ec4899', false)
  );
  scene.add(createArchitecturalWall(-56, -10, 18, 4.5, 0.45, 0, '#fdf2f8', '#ec4899', true));
  scene.add(createArchitecturalWall(-56, 10, 18, 4.5, 0.45, 0, '#fdf2f8', '#ec4899', true));

  scene.add(
    createWallSmartboard(
      -64.6,
      2.7,
      0,
      Math.PI / 2,
      'ESTÚDIO CRIATIVO TIC',
      'Cartazes · Design · Multimédia',
      '#ec4899'
    )
  );

  // Multimedia Design Workstations & Gallery Boards inside Ilha da Criatividade
  scene.add(createComputerWorkstation(-60, -5.5, Math.PI / 2, '#ec4899'));
  scene.add(createComputerWorkstation(-60, 5.5, Math.PI / 2, '#a855f7'));
  scene.add(createBookshelf(-52, -9.2, 0));
  scene.add(createParkBench(-46, -6, -Math.PI / 2));
  scene.add(createParkBench(-46, 6, -Math.PI / 2));

  // ============================================================================
  // ZONA 5: ARENA DOS DESAFIOS (Sul: Bancadas de Estádio, Pódio e Ecrã Gigante)
  // ============================================================================
  const arenaStage = new THREE.Mesh(
    new THREE.CylinderGeometry(12, 13, 0.25, 36),
    new THREE.MeshStandardMaterial({ color: '#e0e7ff', roughness: 0.4 })
  );
  arenaStage.position.set(0, 0.1, 54);
  scene.add(arenaStage);

  // Back Curved Wall & Giant Scoreboard
  scene.add(createArchitecturalWall(0, 66, 22, 5.2, 0.5, 0, '#eef2ff', '#4f46e5', false));
  scene.add(
    createWallSmartboard(
      0,
      2.9,
      65.6,
      Math.PI,
      'ARENA DOS DESAFIOS',
      'Grande Torneio TIC 5.º Ano',
      '#6366f1'
    )
  );

  // Spectator Bleachers (Left & Right of Arena)
  [-11, 11].forEach((bx) => {
    for (let step = 0; step < 3; step++) {
      const bleacher = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.55 + step * 0.5, 12),
        new THREE.MeshStandardMaterial({
          color: step % 2 === 0 ? '#6366f1' : '#818cf8',
          roughness: 0.4,
        })
      );
      const offset = bx < 0 ? -step * 1.2 : step * 1.2;
      bleacher.position.set(bx + offset, (0.55 + step * 0.5) / 2, 54);
      bleacher.castShadow = true;
      scene.add(bleacher);
    }
  });

  // Campus Trees surrounding all zones
  const treeCoords: [number, number, number][] = [
    [-16, -14, 1.1],
    [16, -14, 1.0],
    [-16, 14, 1.15],
    [16, 14, 1.0],
    [-22, -42, 1.2],
    [22, -42, 1.2],
    [-22, -64, 1.1],
    [22, -64, 1.1],
    [42, -18, 1.1],
    [42, 18, 1.1],
    [-42, -16, 1.15],
    [-42, 16, 1.15],
    [-18, 44, 1.1],
    [18, 44, 1.1],
  ];
  treeCoords.forEach(([tx, tz, sc]) => {
    scene.add(createCampusTree(tx, tz, sc));
  });

  // ============================================================================
  // INTERACTIVE OBJECTS (Computers, Books, Portals, Boards, Shop, Workbenches)
  // ============================================================================
  const interactiveMeshes: {
    obj: WorldInteractiveObject;
    group: THREE.Group;
    ring: THREE.Mesh;
    floatingPart: THREE.Object3D;
  }[] = [];
  const clickableMeshes: THREE.Object3D[] = [];

  WORLD_OBJECTS.forEach((obj) => {
    const group = new THREE.Group();
    group.position.set(obj.position[0], obj.position[1], obj.position[2]);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.45, 1.85, 32),
      new THREE.MeshBasicMaterial({
        color: obj.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    group.add(ring);

    let floatingPart: THREE.Object3D = new THREE.Group();

    if (obj.type === 'portal') {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(1.85, 0.22, 14, 32),
        new THREE.MeshStandardMaterial({
          color: obj.color,
          emissive: obj.color,
          emissiveIntensity: 0.45,
          roughness: 0.2,
        })
      );
      arch.position.y = 2.1;
      const core = new THREE.Mesh(
        new THREE.CircleGeometry(1.62, 24),
        new THREE.MeshBasicMaterial({
          color: obj.color,
          transparent: true,
          opacity: 0.28,
          side: THREE.DoubleSide,
        })
      );
      core.position.y = 2.1;
      group.add(arch, core);
      floatingPart = arch;
    } else if (obj.type === 'computer' || obj.type === 'workbench') {
      // Full interactive Computer Workstation with Chair + Floating Crystal Indicator
      const ws = createComputerWorkstation(0, 0, 0, obj.color);
      const holo = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.36),
        new THREE.MeshStandardMaterial({
          color: obj.color,
          emissive: obj.color,
          emissiveIntensity: 0.5,
          roughness: 0.2,
        })
      );
      holo.position.set(0, 2.45, 0);
      group.add(ws, holo);
      floatingPart = holo;
    } else if (obj.type === 'book') {
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.8, 1.15, 16),
        new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.45 })
      );
      pedestal.position.y = 0.58;
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 0.22, 0.88),
        new THREE.MeshStandardMaterial({
          color: obj.color,
          emissive: obj.color,
          emissiveIntensity: 0.35,
        })
      );
      book.position.y = 1.75;
      book.rotation.x = 0.35;
      group.add(pedestal, book);
      floatingPart = book;
    } else if (obj.type === 'board' || obj.type === 'shop') {
      const boardGroup = createWallSmartboard(
        0,
        1.9,
        0,
        0,
        obj.type === 'shop' ? 'LOJA VIRTUAL' : 'PAINEL TIC WORLD',
        obj.promptText,
        obj.color
      );
      const pillarL = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 1.9, 10),
        new THREE.MeshStandardMaterial({ color: '#334155' })
      );
      pillarL.position.set(-1.8, 0.95, 0);
      const pillarR = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 1.9, 10),
        new THREE.MeshStandardMaterial({ color: '#334155' })
      );
      pillarR.position.set(1.8, 0.95, 0);
      group.add(boardGroup, pillarL, pillarR);
      floatingPart = ring;
    } else {
      // Robot / Arena Podium Station
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.35, 0.6, 24),
        new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.4 })
      );
      base.position.y = 0.3;
      const crystal = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.72, 0),
        new THREE.MeshStandardMaterial({
          color: obj.color,
          emissive: obj.color,
          emissiveIntensity: 0.45,
          roughness: 0.2,
        })
      );
      crystal.position.y = 1.9;
      group.add(base, crystal);
      floatingPart = crystal;
    }

    group.traverse((child) => {
      child.userData = { interactKind: 'object', interactData: obj };
    });
    clickableMeshes.push(group);
    scene.add(group);
    interactiveMeshes.push({ obj, group, ring, floatingPart });
  });

  // ============================================================================
  // NPCs EDUCATIVOS
  // ============================================================================
  const npcEntries: {
    npc: NpcCharacter;
    group: THREE.Group;
    headGroup: THREE.Group;
    ring: THREE.Mesh;
  }[] = [];

  NPCS_DATA.forEach((npc) => {
    const npcAvatar = buildAvatarMesh({
      name: npc.name,
      skinColor: npc.skinColor,
      hairStyle: npc.isRobot ? 'visor_tech' : 'curto',
      hairColor: '#1e293b',
      shirtColor: npc.coatColor,
      pantsColor: '#1e293b',
      shoeColor: '#334155',
      accessory: npc.isRobot ? 'robo_antenna' : 'ar_glasses',
    });
    npcAvatar.root.position.set(npc.position[0], npc.position[1], npc.position[2]);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.1, 1.45, 24),
      new THREE.MeshBasicMaterial({
        color: npc.accentColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    npcAvatar.root.add(ring);

    npcAvatar.root.traverse((child) => {
      child.userData = { interactKind: 'npc', interactData: npc };
    });
    clickableMeshes.push(npcAvatar.root);
    scene.add(npcAvatar.root);
    npcEntries.push({ npc, group: npcAvatar.root, headGroup: npcAvatar.headGroup, ring });
  });

  return { interactiveMeshes, npcEntries, clickableMeshes };
}
