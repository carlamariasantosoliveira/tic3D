import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  AvatarAnimationState,
  AvatarConfig,
  NpcCharacter,
  WorldInteractiveObject,
  ZoneId,
} from '../types/world';
import { NPCS_DATA, WORLD_OBJECTS, ZONES_DATA } from '../data/ticWorldData';
import { buildAvatarMesh, populateWorldScene } from './threeWorldBuilder';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Compass,
  Hand,
  RotateCcw,
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
}

interface ProjectedLabel {
  id: string;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  isNpc?: boolean;
  isPlayer?: boolean;
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
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);
  const [animState, setAnimState] = useState<AvatarAnimationState>('idle');
  const [isRunningMode, setIsRunningMode] = useState(false);
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

    // Bright Daylight Scene & Sky Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e0f2fe');
    scene.fog = new THREE.FogExp2('#e0f2fe', 0.0055);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      280
    );

    // Warm Daylight Three-Point Illumination
    const hemiLight = new THREE.HemisphereLight('#ffffff', '#bae6fd', 1.15);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#fffbeb', 1.35);
    dirLight.position.set(45, 80, 35);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 0.45);
    rimLight.position.set(-50, 40, -60);
    scene.add(rimLight);

    const { interactiveMeshes, npcEntries, clickableMeshes } = populateWorldScene(scene);

    let playerParts = buildAvatarMesh(avatarConfigRef.current);
    const playerContainer = new THREE.Group();
    playerContainer.position.set(playerPosition[0], playerPosition[1], playerPosition[2]);
    playerContainer.add(playerParts.root);
    scene.add(playerContainer);

    let lastConfigJSON = JSON.stringify(avatarConfigRef.current);
    let camYaw = 0;
    let camPitch = 0.4;
    let camDistance = 11.5;
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

      if (e.code === 'Space' && isGrounded) {
        e.preventDefault();
        velocityY = 9.5;
        isGrounded = false;
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

    // Mouse Listeners
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
      camPitch = Math.max(0.12, Math.min(1.15, camPitch + dy * 0.0055));
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

    // Touch Listeners for Smartphones & Tablets (Orbit, Pinch Zoom, Tap-to-Interact)
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
        camPitch = Math.max(0.12, Math.min(1.15, camPitch + dy * 0.006));
        pointerStartX = e.touches[0].clientX;
        pointerStartY = e.touches[0].clientY;
      } else if (e.touches.length === 2 && pinchStartDist > 0) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = pinchStartDist - dist;
        camDistance = Math.max(6, Math.min(22, camDistance + delta * 0.03));
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
      camDistance = Math.max(6, Math.min(22, camDistance + e.deltaY * 0.01));
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

      let nextAnimState: AvatarAnimationState = 'idle';
      if (now - triggerInteractJumpRef.current < 650) {
        nextAnimState = 'interact';
      } else if (!isGrounded) {
        nextAnimState = 'jump';
      } else if (isMoving) {
        nextAnimState = running ? 'run' : 'walk';
      }

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
        const idleWave = Math.sin(now * 0.003) * 0.06;
        playerParts.leftLeg.rotation.x = 0;
        playerParts.rightLeg.rotation.x = 0;
        playerParts.leftArm.rotation.x = idleWave;
        playerParts.rightArm.rotation.x = -idleWave;
        playerParts.bodyMesh.rotation.x = 0;
        playerParts.headGroup.rotation.y = Math.sin(now * 0.0015) * 0.12;
      }

      const totalYaw = playerContainer.rotation.y + camYaw;
      const desiredCamX =
        playerContainer.position.x - Math.sin(totalYaw) * camDistance * Math.cos(camPitch);
      const desiredCamZ =
        playerContainer.position.z - Math.cos(totalYaw) * camDistance * Math.cos(camPitch);
      const desiredCamY = playerContainer.position.y + 2.2 + Math.sin(camPitch) * camDistance;

      camera.position.lerp(new THREE.Vector3(desiredCamX, desiredCamY, desiredCamZ), 0.12);
      camera.lookAt(
        playerContainer.position.x,
        playerContainer.position.y + 1.8,
        playerContainer.position.z
      );

      interactiveMeshes.forEach(({ floatingPart, ring }, idx) => {
        floatingPart.rotation.y += dt * 1.1;
        const pulse = 1 + Math.sin(now * 0.004 + idx) * 0.08;
        ring.scale.set(pulse, pulse, 1);
      });

      npcEntries.forEach(({ group, headGroup, ring }, idx) => {
        headGroup.position.y = 1.75 + Math.sin(now * 0.003 + idx) * 0.04;
        const dist = group.position.distanceTo(playerContainer.position);
        if (dist < 10) {
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
        let minDist = 5.5;

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
          isNpc?: boolean,
          isPlayer?: boolean
        ) => {
          if (camera.position.distanceTo(pos3D) > 38 && !isPlayer) return;
          const projected = pos3D.clone().project(camera);
          if (projected.z > 1) return;
          const sx = (projected.x * 0.5 + 0.5) * width;
          const sy = (-(projected.y * 0.5) + 0.5) * height;
          if (sx >= 20 && sx <= width - 20 && sy >= 20 && sy <= height - 20) {
            nextLabels.push({ id, title, subtitle, x: sx, y: sy, isNpc, isPlayer });
          }
        };

        projectPoint(
          new THREE.Vector3(
            playerContainer.position.x,
            playerContainer.position.y + 2.85,
            playerContainer.position.z
          ),
          'player_tag',
          avatarConfigRef.current.name || 'Explorador TIC',
          undefined,
          false,
          true
        );

        NPCS_DATA.forEach((npc) => {
          projectPoint(
            new THREE.Vector3(npc.position[0], npc.position[1] + 2.95, npc.position[2]),
            npc.id,
            npc.name,
            npc.role,
            true,
            false
          );
        });

        WORLD_OBJECTS.forEach((obj) => {
          const dObj = Math.hypot(
            playerContainer.position.x - obj.position[0],
            playerContainer.position.z - obj.position[2]
          );
          if (dObj < 25) {
            projectPoint(
              new THREE.Vector3(obj.position[0], obj.position[1] + 3.1, obj.position[2]),
              obj.id,
              obj.name
            );
          }
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

  const activeZoneMeta = ZONES_DATA[currentZone];

  return (
    <div className="relative w-full h-full overflow-hidden bg-sky-100 select-none touch-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {webglError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-50/95 p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-xl">
            <h2 className="text-xl font-display font-bold text-slate-900">
              Modo Interativo Simplificado (2D)
            </h2>
            <p className="text-sm text-slate-600">
              Podes interagir diretamente com todos os objetos e NPCs desta zona abaixo:
            </p>
            <div className="grid grid-cols-1 gap-2 text-left">
              {NPCS_DATA.filter((n) => n.zone === currentZone).map((npc) => (
                <button
                  key={npc.id}
                  onClick={() => onInteractNpc(npc)}
                  className="min-h-[44px] p-3 rounded-xl bg-slate-100 hover:bg-sky-50 text-sm text-slate-900 flex justify-between items-center cursor-pointer"
                >
                  <span className="font-semibold">{npc.name}</span>
                  <span className="text-xs text-sky-700 font-medium">{npc.promptText}</span>
                </button>
              ))}
              {WORLD_OBJECTS.filter((o) => o.zone === currentZone).map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => onInteractObject(obj)}
                  className="min-h-[44px] p-3 rounded-xl bg-slate-100 hover:bg-emerald-50 text-sm text-slate-900 flex justify-between items-center cursor-pointer"
                >
                  <span className="font-semibold">{obj.name}</span>
                  <span className="text-xs text-emerald-700 font-medium">{obj.promptText}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Projected 2D DOM Labels */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {labels.map((lbl) => (
          <div
            key={lbl.id}
            style={{
              transform: `translate3d(${Math.round(lbl.x)}px, ${Math.round(lbl.y)}px, 0) translate(-50%, -100%)`,
            }}
            className="absolute top-0 left-0 transition-transform duration-75"
          >
            {lbl.isPlayer ? (
              <div className="px-2.5 py-0.5 rounded-md bg-sky-600 text-xs font-bold text-white whitespace-nowrap shadow-md">
                {lbl.title}
              </div>
            ) : lbl.isNpc ? (
              <div className="px-2.5 py-1 rounded-lg bg-white/95 border border-slate-200 text-center whitespace-nowrap shadow-md">
                <div className="text-xs font-bold text-slate-900">{lbl.title}</div>
                {lbl.subtitle && (
                  <div className="text-[10px] text-sky-700 font-semibold">{lbl.subtitle}</div>
                )}
              </div>
            ) : (
              <div className="px-2.5 py-0.5 rounded-md bg-white/90 border border-slate-200/90 text-[11px] font-semibold text-slate-800 whitespace-nowrap shadow-sm">
                {lbl.title}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top-Left Zone & Room Quick-Access HUD (Daylight Glass) */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-auto max-w-[290px] sm:max-w-sm bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-lg space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Compass className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="text-xs sm:text-sm font-display font-bold text-slate-900 truncate">
              {activeZoneMeta.name}
            </span>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
            {coordsDisplay[0]}, {coordsDisplay[2]}
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-snug hidden sm:block">
          {activeZoneMeta.subtitle}
        </p>

        {/* Quick-Enter Furnished Classrooms & Spaces */}
        <div className="pt-1.5 border-t border-slate-200/80 space-y-1">
          <div className="text-[10px] font-semibold text-slate-500">
            Visitar Salas Mobiladas (1 Clique):
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              { label: 'Praça & Fonte', zone: 'praca_central' as ZoneId, pos: [0, 0, 7] as [number, number, number] },
              { label: 'Salas Academia', zone: 'academia_tic' as ZoneId, pos: [0, 0, -52] as [number, number, number] },
              { label: 'Lab. Hardware', zone: 'academia_tic' as ZoneId, pos: [-12, 0, -52] as [number, number, number] },
              { label: 'Biblioteca', zone: 'cidade_digital' as ZoneId, pos: [54, 0, -6] as [number, number, number] },
              { label: 'Loja 3D', zone: 'cidade_digital' as ZoneId, pos: [54, 0, 6] as [number, number, number] },
              { label: 'Estúdio', zone: 'ilha_criatividade' as ZoneId, pos: [-52, 0, 0] as [number, number, number] },
              { label: 'Arena', zone: 'arena_desafios' as ZoneId, pos: [0, 0, 46] as [number, number, number] },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  const setter = (
                    mountRef.current as unknown as {
                      setPlayerPos?: (pos: [number, number, number]) => void;
                    }
                  )?.setPlayerPos;
                  if (setter) setter(item.pos);
                  onZoneChange(item.zone);
                }}
                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-sky-600 hover:text-white text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Estado: <strong className="text-slate-800 uppercase">{animState}</strong>
          </span>
          <span>·</span>
          <span>
            Missões:{' '}
            <strong className="font-mono tabular-nums text-emerald-600">
              {completedMissionIds.length}/8
            </strong>
          </span>
        </div>
      </div>

      {/* Proximity Interaction Prompt Banner */}
      {nearbyInteractable && (
        <div className="absolute bottom-36 sm:bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full max-w-md px-3">
          <div className="bg-white/95 backdrop-blur-md border-2 border-sky-500 rounded-2xl p-3.5 sm:p-4 shadow-xl flex items-center justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <div className="text-[11px] font-semibold text-sky-700 truncate">
                {nearbyInteractable.kind === 'npc' ? 'NPC Educativo' : 'Objeto Interativo'} ·{' '}
                {nearbyInteractable.name}
              </div>
              <div className="text-xs sm:text-sm font-display font-bold text-slate-900 truncate">
                {nearbyInteractable.promptText}
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-1 sm:line-clamp-2">
                {nearbyInteractable.description}
              </p>
            </div>
            <button
              onClick={() => {
                triggerInteractJumpRef.current = performance.now();
                if (nearbyInteractable.kind === 'npc') {
                  onInteractNpc(nearbyInteractable.data as NpcCharacter);
                } else {
                  onInteractObject(nearbyInteractable.data as WorldInteractiveObject);
                }
              }}
              className="min-h-[44px] shrink-0 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shadow-md"
            >
              <span className="px-1.5 py-0.5 rounded bg-white/20 font-mono font-bold">E</span>
              <span>Interagir</span>
            </button>
          </div>
        </div>
      )}

      {/* Ergonomic Touch & Mouse Controls (44x44px minimum hitboxes, positioned above mobile nav) */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:right-auto z-20 pointer-events-auto flex items-end justify-between sm:justify-start gap-2.5">
        {/* Directional Pad (Thumb Zone) */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1.5 grid grid-cols-3 gap-1 shadow-lg">
          <div />
          <button
            aria-label="Caminhar para a frente (W)"
            onMouseDown={() => (touchInputRef.current.forward = 1)}
            onMouseUp={() => (touchInputRef.current.forward = 0)}
            onMouseLeave={() => (touchInputRef.current.forward = 0)}
            onTouchStart={(e) => {
              e.preventDefault();
              touchInputRef.current.forward = 1;
            }}
            onTouchEnd={() => (touchInputRef.current.forward = 0)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-sky-100 active:bg-sky-600 text-slate-800 active:text-white transition-colors cursor-pointer"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />
          <button
            aria-label="Virar à esquerda (A)"
            onMouseDown={() => (touchInputRef.current.turn = 1)}
            onMouseUp={() => (touchInputRef.current.turn = 0)}
            onMouseLeave={() => (touchInputRef.current.turn = 0)}
            onTouchStart={(e) => {
              e.preventDefault();
              touchInputRef.current.turn = 1;
            }}
            onTouchEnd={() => (touchInputRef.current.turn = 0)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-sky-100 active:bg-sky-600 text-slate-800 active:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            aria-label="Regressar à Praça Central"
            onClick={() => {
              const setter = (
                mountRef.current as unknown as {
                  setPlayerPos?: (pos: [number, number, number]) => void;
                }
              )?.setPlayerPos;
              if (setter) setter([0, 0, 6]);
              onZoneChange('praca_central');
            }}
            title="Regressar à Praça Central"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-mono cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            aria-label="Virar à direita (D)"
            onMouseDown={() => (touchInputRef.current.turn = -1)}
            onMouseUp={() => (touchInputRef.current.turn = 0)}
            onMouseLeave={() => (touchInputRef.current.turn = 0)}
            onTouchStart={(e) => {
              e.preventDefault();
              touchInputRef.current.turn = -1;
            }}
            onTouchEnd={() => (touchInputRef.current.turn = 0)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-sky-100 active:bg-sky-600 text-slate-800 active:text-white transition-colors cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div />
          <button
            aria-label="Recuar (S)"
            onMouseDown={() => (touchInputRef.current.forward = -1)}
            onMouseUp={() => (touchInputRef.current.forward = 0)}
            onMouseLeave={() => (touchInputRef.current.forward = 0)}
            onTouchStart={(e) => {
              e.preventDefault();
              touchInputRef.current.forward = -1;
            }}
            onTouchEnd={() => (touchInputRef.current.forward = 0)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-sky-100 active:bg-sky-600 text-slate-800 active:text-white transition-colors cursor-pointer"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div />
        </div>

        {/* Action Pad (Run, Jump, Interact) */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 shadow-lg">
          <button
            onClick={() => setIsRunningMode((prev) => !prev)}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              isRunningMode
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{isRunningMode ? 'A Correr' : 'Correr'}</span>
          </button>
          <button
            onClick={() => {
              touchInputRef.current.jump = true;
            }}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-sky-600 active:text-white text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            Saltar
          </button>
          <button
            disabled={!nearbyInteractable}
            onClick={() => {
              if (!nearbyInteractable) return;
              triggerInteractJumpRef.current = performance.now();
              if (nearbyInteractable.kind === 'npc') {
                onInteractNpc(nearbyInteractable.data as NpcCharacter);
              } else {
                onInteractObject(nearbyInteractable.data as WorldInteractiveObject);
              }
            }}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              nearbyInteractable
                ? 'bg-sky-600 text-white hover:bg-sky-500 shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>Interagir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
