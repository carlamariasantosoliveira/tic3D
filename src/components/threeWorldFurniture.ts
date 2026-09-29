import * as THREE from 'three';

// Generate crisp procedural CanvasTextures for boards, screens, and floors
export function createSignTexture(
  title: string,
  subtitle: string,
  bgHex: string,
  accentHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 496, 240);

  ctx.fillStyle = accentHex;
  ctx.fillRect(24, 28, 464, 8);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 256, 115);

  ctx.fillStyle = '#bae6fd';
  ctx.font = '22px sans-serif';
  ctx.fillText(subtitle, 256, 170);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createTileFloorTexture(colorA: string, colorB: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const size = 64;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? colorA : colorB;
      ctx.fillRect(x * size, y * size, size, size);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * size, y * size, size, size);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

// Complete Computer Workstation: Desk + Chair + PC Tower + Monitor + Keyboard + Mouse
export function createComputerWorkstation(
  x: number,
  z: number,
  rotY = 0,
  screenColor = '#0ea5e9'
): THREE.Group {
  const group = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.55 });
  const metalMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.5, roughness: 0.4 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4 });

  // Desk tabletop
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.1), woodMat);
  top.position.set(0, 0.95, 0);
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // 4 Desk Legs
  const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.95, 8);
  [
    [-0.98, -0.45],
    [0.98, -0.45],
    [-0.98, 0.45],
    [0.98, 0.45],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, metalMat);
    leg.position.set(lx, 0.475, lz);
    leg.castShadow = true;
    group.add(leg);
  });

  // PC Tower Case on the right side
  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.72, 0.75), darkMat);
  tower.position.set(0.75, 1.36, -0.05);
  tower.castShadow = true;
  const powerLed = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.45, 0.02),
    new THREE.MeshBasicMaterial({ color: '#22d3ee' })
  );
  powerLed.position.set(0.75, 1.36, 0.33);
  group.add(tower, powerLed);

  // Monitor Stand + Bezel + Glowing Screen
  const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.3), metalMat);
  standBase.position.set(-0.15, 1.02, -0.25);
  const standNeck = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.06), metalMat);
  standNeck.position.set(-0.15, 1.18, -0.28);
  const monitorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 0.08), darkMat);
  monitorFrame.position.set(-0.15, 1.52, -0.25);
  monitorFrame.castShadow = true;

  const monitorScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.05, 0.62),
    new THREE.MeshStandardMaterial({
      color: screenColor,
      emissive: screenColor,
      emissiveIntensity: 0.45,
      roughness: 0.2,
    })
  );
  monitorScreen.position.set(-0.15, 1.52, -0.205);
  group.add(standBase, standNeck, monitorFrame, monitorScreen);

  // Keyboard & Mouse
  const keyboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.03, 0.22),
    new THREE.MeshStandardMaterial({ color: '#cbd5e1' })
  );
  keyboard.position.set(-0.15, 1.02, 0.18);
  const mouse = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.03, 0.18),
    new THREE.MeshStandardMaterial({ color: '#cbd5e1' })
  );
  mouse.position.set(0.32, 1.02, 0.18);
  group.add(keyboard, mouse);

  // Office Chair in front of Desk (+Z)
  const chairGroup = new THREE.Group();
  chairGroup.position.set(-0.15, 0, 0.85);
  const chairMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.5 });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.62), chairMat);
  seat.position.y = 0.56;
  seat.castShadow = true;
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.68, 0.08), chairMat);
  backrest.position.set(0, 0.92, 0.28);
  backrest.castShadow = true;
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.52, 8), metalMat);
  piston.position.y = 0.28;
  const wheelBase = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 12), darkMat);
  wheelBase.position.y = 0.04;
  chairGroup.add(seat, backrest, piston, wheelBase);
  group.add(chairGroup);

  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  return group;
}

// Tall Wooden Bookshelf with Colorful 3D Books
export function createBookshelf(x: number, z: number, rotY = 0): THREE.Group {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.6 });

  // Outer frame
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 0.08), woodMat);
  back.position.set(0, 1.4, -0.22);
  back.castShadow = true;
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.8, 0.52), woodMat);
  sideL.position.set(-1.05, 1.4, 0);
  const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.8, 0.52), woodMat);
  sideR.position.set(1.05, 1.4, 0);
  group.add(back, sideL, sideR);

  const bookColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  // 4 Shelves + Books
  [0.2, 0.95, 1.7, 2.45].forEach((sy, sIdx) => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 0.5), woodMat);
    shelf.position.set(0, sy, 0);
    group.add(shelf);

    if (sIdx < 3) {
      for (let b = 0; b < 7; b++) {
        const bookH = 0.42 + (b % 3) * 0.08;
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, bookH, 0.36),
          new THREE.MeshStandardMaterial({
            color: bookColors[(b + sIdx * 2) % bookColors.length],
            roughness: 0.4,
          })
        );
        book.position.set(-0.75 + b * 0.24, sy + 0.04 + bookH / 2, 0);
        group.add(book);
      }
    }
  });

  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  return group;
}

// Classroom Wall Whiteboard / Digital Smartboard
export function createWallSmartboard(
  x: number,
  y: number,
  z: number,
  rotY: number,
  title: string,
  subtitle: string,
  accentHex: string
): THREE.Group {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 2.1, 0.12),
    new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.4, roughness: 0.3 })
  );
  const boardTex = createSignTexture(title, subtitle, '#0f172a', accentHex);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(3.96, 1.88),
    new THREE.MeshBasicMaterial({ map: boardTex })
  );
  screen.position.z = 0.07;
  group.add(frame, screen);
  group.position.set(x, y, z);
  group.rotation.y = rotY;
  return group;
}

// Park Bench with Wooden Slats + Potted Plant
export function createParkBench(x: number, z: number, rotY = 0): THREE.Group {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.55 });
  const ironMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.6, roughness: 0.4 });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.65), woodMat);
  seat.position.set(0, 0.5, 0);
  seat.castShadow = true;

  const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.55, 0.08), woodMat);
  back.position.set(0, 0.85, -0.28);
  back.rotation.x = -0.12;
  back.castShadow = true;

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.6), ironMat);
  legL.position.set(-0.95, 0.25, 0);
  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.6), ironMat);
  legR.position.set(0.95, 0.25, 0);

  group.add(seat, back, legL, legR);
  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  return group;
}

// Decorative Street Lamp
export function createStreetLamp(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.6, roughness: 0.3 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.4, 12), poleMat);
  base.position.y = 0.2;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.4, 10), poleMat);
  pole.position.y = 2.4;
  pole.castShadow = true;

  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 14, 14),
    new THREE.MeshStandardMaterial({
      color: '#fef08a',
      emissive: '#facc15',
      emissiveIntensity: 0.8,
      roughness: 0.1,
    })
  );
  globe.position.y = 4.7;

  group.add(base, pole, globe);
  group.position.set(x, 0, z);
  return group;
}

// Central Monument Fountain for Praça Central
export function createPlazaFountain(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.4 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: '#06b6d4',
    emissive: '#0891b2',
    emissiveIntensity: 0.25,
    roughness: 0.15,
  });

  // Outer basin
  const outerRim = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.1, 0.65, 32), stoneMat);
  outerRim.position.y = 0.32;
  outerRim.receiveShadow = true;

  const waterPool = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.55, 32), waterMat);
  waterPool.position.y = 0.38;

  // Inner tier
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.9, 2.2, 16), stoneMat);
  column.position.y = 1.1;
  column.castShadow = true;

  const upperBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.1, 0.4, 24), stoneMat);
  upperBowl.position.y = 2.1;

  // Floating Globe Emblem on top
  const globe = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.75, 1),
    new THREE.MeshStandardMaterial({
      color: '#0284c7',
      emissive: '#38bdf8',
      emissiveIntensity: 0.5,
      wireframe: true,
    })
  );
  globe.position.y = 3.25;

  group.add(outerRim, waterPool, column, upperBowl, globe);
  group.position.set(x, 0, z);
  return group;
}

// Server Rack Cabinet with LED Lights (for Internet & Cybersecurity Labs)
export function createServerRack(x: number, z: number, rotY = 0): THREE.Group {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.9, 1.0),
    new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.6, roughness: 0.3 })
  );
  body.position.y = 1.45;
  body.castShadow = true;
  group.add(body);

  for (let i = 0; i < 6; i++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.96, 0.18, 0.05),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? '#10b981' : '#38bdf8',
        emissive: i % 2 === 0 ? '#10b981' : '#38bdf8',
        emissiveIntensity: 0.7,
      })
    );
    blade.position.set(0, 0.5 + i * 0.38, 0.51);
    group.add(blade);
  }

  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  return group;
}

// Wall segment with optional window cutout look
export function createArchitecturalWall(
  x: number,
  z: number,
  width: number,
  height: number,
  depth: number,
  rotY = 0,
  wallColor = '#f8fafc',
  trimColor = '#0284c7',
  hasWindow = false
): THREE.Group {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.45 });
  const trimMat = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.35 });

  const mainWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
  mainWall.position.y = height / 2;
  mainWall.castShadow = true;
  mainWall.receiveShadow = true;
  group.add(mainWall);

  // Baseboard & Top Crown Trim
  const baseboard = new THREE.Mesh(new THREE.BoxGeometry(width + 0.06, 0.22, depth + 0.06), trimMat);
  baseboard.position.y = 0.11;
  const topTrim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, 0.2, depth + 0.08), trimMat);
  topTrim.position.y = height - 0.1;
  group.add(baseboard, topTrim);

  if (hasWindow && width >= 4) {
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#7dd3fc',
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      metalness: 0.3,
    });
    const winPane = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.6, height * 0.48, depth + 0.08),
      glassMat
    );
    winPane.position.y = height * 0.55;
    group.add(winPane);
  }

  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  return group;
}
