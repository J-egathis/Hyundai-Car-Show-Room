'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Check,
  Lightbulb,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Card } from '@showroom/ui';

const PAINT_COLORS = [
  { name: 'Electric Amber', hex: '#F5A623' },
  { name: 'Obsidian Black', hex: '#111111' },
  { name: 'Cobalt Blue', hex: '#2563EB' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Titanium Gray', hex: '#6B7280' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Pearl White', hex: '#F0F0F0' },
];

/** Map any vehicle name/id string to one of our 4 GLB files */
function resolveModelPath(vehicleName: string, modelPath?: string): string {
  if (modelPath) return modelPath;
  const models = [
    '/models/ferrari.glb',
    '/models/bugatti.glb',
    '/models/martin.glb',
    '/models/aston.glb',
  ];
  let hash = 0;
  for (let i = 0; i < vehicleName.length; i++) hash += vehicleName.charCodeAt(i);
  return models[hash % models.length];
}

interface ThreeCarViewerProps {
  vehicleName?: string;
  modelPath?: string;
}

export function ThreeCarViewer({ vehicleName = 'Apex 3D Model', modelPath }: ThreeCarViewerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null); // outer div for fullscreen
  const mountRef = useRef<HTMLDivElement>(null);   // canvas mount point

  // THREE internals stored in refs (not state — avoids re-render loops)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number>(0);
  const loadedModelRef = useRef<THREE.Object3D | null>(null);
  const spotLightsRef = useRef<THREE.SpotLight[]>([]);
  const originalMaterialsRef = useRef<Map<string, THREE.Color>>(new Map());
  const autoRotateRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [headlightsOn, setHeadlightsOn] = useState(true);
  const [paintColor, setPaintColor] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const glbPath = resolveModelPath(vehicleName, modelPath);

  // ── RENDERER RESIZE ─────────────────────────────────────────────────────
  const handleResize = useCallback(() => {
    const container = mountRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }, []);

  // ── FULLSCREEN TOGGLE (Browser native API) ──────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {
        // fallback: CSS fullscreen
        setIsFullscreen((prev) => !prev);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      // Give browser time to apply size then resize renderer
      requestAnimationFrame(() => {
        requestAnimationFrame(handleResize);
      });
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [handleResize]);

  // ── MAIN THREE.JS SETUP ─────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    setLoading(true);
    setLoadError(false);
    setLoadProgress(0);
    loadedModelRef.current = null;
    originalMaterialsRef.current = new Map();

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 500;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060810);
    scene.fog = new THREE.FogExp2(0x060810, 0.016);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 600);
    camera.position.set(7, 3.5, 9);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ORBIT CONTROLS — minDistance will be updated after model loads
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.minDistance = 4;     // will be overridden after GLB loads
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 1.4;
    controlsRef.current = controls;

    // LIGHTING
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));

    const keyLight = new THREE.DirectionalLight(0xfff4e0, 4);
    keyLight.position.set(10, 14, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 80;
    keyLight.shadow.camera.left = -16;
    keyLight.shadow.camera.right = 16;
    keyLight.shadow.camera.top = 16;
    keyLight.shadow.camera.bottom = -16;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x3060ff, 1.0);
    fillLight.position.set(-12, 4, -6);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xf5a623, 2.0, 25);
    rimLight.position.set(0, 8, -10);
    scene.add(rimLight);

    // HEADLIGHTS
    const makeSpot = (x: number) => {
      const s = new THREE.SpotLight(0xfff8e0, 18, 35, Math.PI / 8, 0.35);
      s.position.set(x, 1.2, 7);
      s.target.position.set(x * 0.3, 0, 30);
      scene.add(s, s.target);
      return s;
    };
    const sl = makeSpot(1.1);
    const sr = makeSpot(-1.1);
    spotLightsRef.current = [sl, sr];

    // FLOOR + GRID
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x080a10, roughness: 0.95, metalness: 0.2 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(50, 50, 0xf5a623, 0x18202e);
    grid.position.y = 0.003;
    scene.add(grid);

    // Amber glow ring
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf5a623,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
    });
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(3.2, 3.6, 72), ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.01;
    scene.add(ringMesh);

    // LOAD GLB
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load(
      glbPath,
      (gltf) => {
        const model = gltf.scene;

        // ── Auto-center and scale to fit ────────────────────────
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5.0 / maxDim;

        model.scale.setScalar(scale);
        // Center model horizontally
        model.position.x = -center.x * scale;
        model.position.z = -center.z * scale;
        // Sit on floor — lift by negative min Y * scale
        model.position.y = -box.min.y * scale;

        // ── Recompute bounding box after transform ──────────────
        const scaledBox = new THREE.Box3().setFromObject(model);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        const sphere = scaledBox.getBoundingSphere(new THREE.Sphere());
        const radius = sphere.radius;

        // ── Set OrbitControls target & camera to model center ───
        if (controlsRef.current) {
          controlsRef.current.target.copy(scaledCenter);
          // minDistance: 110% of radius so camera can never enter the mesh
          controlsRef.current.minDistance = radius * 1.15;
          controlsRef.current.maxDistance = radius * 8;
          controlsRef.current.update();
        }
        if (cameraRef.current) {
          // Position camera at a good starting angle relative to center
          cameraRef.current.position.set(
            scaledCenter.x + radius * 1.6,
            scaledCenter.y + radius * 0.55,
            scaledCenter.z + radius * 2.0
          );
          cameraRef.current.lookAt(scaledCenter);
        }

        // ── Enable shadows & store original colors by mesh uuid ─
        model.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((mat: any, i: number) => {
              if (mat?.color) {
                // Key: meshUUID + matIndex so each material maps uniquely
                const key = `${mesh.uuid}_${i}`;
                if (!originalMaterialsRef.current.has(key)) {
                  originalMaterialsRef.current.set(key, mat.color.clone());
                }
              }
            });
          }
        });

        scene.add(model);
        loadedModelRef.current = model;
        setLoading(false);
      },
      (prog) => {
        if (prog.total > 0) setLoadProgress(Math.round((prog.loaded / prog.total) * 100));
      },
      (err) => {
        console.error('GLB load error:', err);
        setLoadError(true);
        setLoading(false);
      }
    );

    // ANIMATION LOOP
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      draco.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glbPath]);

  // ── CONTROLS ────────────────────────────────────────────────────────────

  const applyPaintColor = (hex: string) => {
    setPaintColor(hex);
    if (!loadedModelRef.current) return;
    loadedModelRef.current.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat: any) => {
        if (!mat?.color) return;
        // Skip glass, transparent, emissive-only, or very dark materials (tires, windows etc.)
        const isTransparent = mat.transparent && mat.opacity < 0.7;
        const isVeryDark = mat.color.r < 0.08 && mat.color.g < 0.08 && mat.color.b < 0.08;
        if (!isTransparent && !isVeryDark) {
          mat.color.set(hex);
        }
      });
    });
  };

  const resetPaint = () => {
    setPaintColor('');
    if (!loadedModelRef.current) return;
    loadedModelRef.current.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat: any, i: number) => {
        const key = `${mesh.uuid}_${i}`;
        const orig = originalMaterialsRef.current.get(key);
        if (mat?.color && orig) mat.color.copy(orig);
      });
    });
  };

  const toggleHeadlights = () => {
    const next = !headlightsOn;
    setHeadlightsOn(next);
    spotLightsRef.current.forEach((s) => { s.intensity = next ? 18 : 0; });
  };

  const toggleAutoRotate = () => {
    const next = !autoRotate;
    setAutoRotate(next);
    autoRotateRef.current = next;
    if (controlsRef.current) controlsRef.current.autoRotate = next;
  };

  const zoom = (factor: number) => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.position.multiplyScalar(factor);
  };

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapperRef}
      className={`relative ${isFullscreen ? 'fixed inset-0 z-[9999] bg-[#060810]' : ''}`}
      style={isFullscreen ? { width: '100vw', height: '100vh' } : {}}
    >
      <Card
        hoverEffect={false}
        className="p-0 overflow-hidden bg-[#060810] border-[#F5A623]/40 h-full"
      >
        {/* TOP BADGE */}
        <div className="absolute top-4 left-4 z-20 bg-[#060810]/90 backdrop-blur-md px-3 py-1.5 rounded-[12px] border border-[#F5A623]/80 text-xs font-mono text-[#F5A623] font-bold flex items-center gap-2 shadow-xl pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Real 3D WebGL Model · {vehicleName}
        </div>

        {/* FULLSCREEN BUTTON */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-20 bg-[#060810]/90 backdrop-blur-md p-2 rounded-[12px] border border-[#52565E]/60 text-gray-300 hover:border-[#F5A623] hover:text-[#F5A623] transition-all"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* THREE.JS CANVAS MOUNT */}
        <div
          ref={mountRef}
          className="w-full cursor-grab active:cursor-grabbing"
          style={{ height: isFullscreen ? 'calc(100vh - 72px)' : '520px' }}
        />

        {/* LOADING OVERLAY */}
        {loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#060810]/96 gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-[#F5A623]/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-[#F5A623] animate-pulse" />
              </div>
              <svg className="absolute inset-0 w-16 h-16 -rotate-90 animate-spin" style={{ animationDuration: '2s' }}>
                <circle cx="32" cy="32" r="30" fill="none" stroke="#F5A623" strokeWidth="2"
                  strokeDasharray={`${loadProgress * 1.885} 200`} />
              </svg>
            </div>
            <span className="text-[#F5A623] font-mono text-sm font-bold uppercase tracking-widest">
              Loading 3D Model
            </span>
            <div className="w-52 h-1 bg-[#1a1d22] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F5A623] to-amber-300 transition-all duration-200"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="text-gray-500 font-mono text-xs">{loadProgress}% · {vehicleName}</span>
          </div>
        )}

        {/* ERROR OVERLAY */}
        {loadError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#060810]/95 gap-3">
            <span className="text-red-400 font-mono text-sm font-bold">⚠ Failed to load 3D model</span>
            <span className="text-gray-600 text-xs font-mono">{glbPath}</span>
          </div>
        )}

        {/* CONTROLS BAR */}
        {!loading && !loadError && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#0a0c14]/92 backdrop-blur-xl px-4 py-3 rounded-[14px] border border-[#2a2d35] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">

            {/* PAINT SWATCHES */}
            <div className="flex items-center gap-2.5">
              <span className="text-gray-500 uppercase text-[10px] font-bold shrink-0">Paint:</span>
              {/* Reset swatch */}
              <button
                onClick={resetPaint}
                title="Original Color"
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-bold transition-all bg-gradient-to-br from-gray-400 to-gray-600 ${
                  paintColor === '' ? 'border-[#F5A623] scale-125 shadow-[0_0_8px_rgba(245,166,35,0.6)]' : 'border-[#52565E]/50'
                }`}
              >
                {paintColor === '' && <Check className="w-3 h-3 text-white drop-shadow" />}
              </button>
              {PAINT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => applyPaintColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    paintColor === c.hex
                      ? 'border-[#F5A623] scale-125 shadow-[0_0_8px_rgba(245,166,35,0.6)]'
                      : 'border-[#52565E]/50 hover:scale-110'
                  }`}
                >
                  {paintColor === c.hex && <Check className="w-3 h-3 text-white drop-shadow" />}
                </button>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2">
              {/* Headlights */}
              <button
                onClick={toggleHeadlights}
                title="Toggle Headlights"
                className={`px-3 py-1.5 rounded-[10px] border text-[10px] font-bold uppercase flex items-center gap-1.5 transition-all ${
                  headlightsOn
                    ? 'bg-[#F5A623] text-[#0D0D0D] border-[#F5A623] shadow-[0_0_12px_rgba(245,166,35,0.45)]'
                    : 'bg-transparent text-gray-400 border-[#52565E]'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                {headlightsOn ? 'Lights ON' : 'Lights OFF'}
              </button>

              {/* Auto-rotate */}
              <button
                onClick={toggleAutoRotate}
                title="Toggle Auto-Rotate"
                className={`p-2 rounded-[10px] border transition-all ${
                  autoRotate
                    ? 'bg-[#3A3D42] text-[#F5A623] border-[#F5A623]'
                    : 'bg-transparent text-gray-500 border-[#52565E]'
                }`}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              </button>

              {/* Zoom In */}
              <button
                onClick={() => zoom(0.85)}
                title="Zoom In"
                className="p-2 rounded-[10px] bg-transparent text-gray-400 border border-[#52565E] hover:text-[#F5A623] hover:border-[#F5A623] transition-all"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {/* Zoom Out */}
              <button
                onClick={() => zoom(1.15)}
                title="Zoom Out"
                className="p-2 rounded-[10px] bg-transparent text-gray-400 border border-[#52565E] hover:text-[#F5A623] hover:border-[#F5A623] transition-all"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              {/* Fullscreen (also in controls bar for convenience) */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                className="p-2 rounded-[10px] bg-transparent text-gray-400 border border-[#52565E] hover:text-[#F5A623] hover:border-[#F5A623] transition-all"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
