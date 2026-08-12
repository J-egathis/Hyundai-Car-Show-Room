'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Link from 'next/link';
import { Button, Badge, PriceTag, Card } from '@showroom/ui';
import { CategorizedVehicle } from '../../lib/mockData';
import {
  Sparkles,
  Gauge,
  Cpu,
  RotateCcw,
  Star,
  MessageSquare,
  Send,
  Lightbulb,
  Volume2,
  Check,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowDown,
  ArrowRight,
  Compass,
  Disc,
  Activity,
  Layers,
  Wrench,
  Wind,
  ZapOff,
} from 'lucide-react';

const PAINT_COLORS = [
  { name: 'Royal Sapphire Blue', hex: '#003082' },
  { name: 'Pure Obsidian Black', hex: '#000000' },
  { name: 'Slate Charcoal Gray', hex: '#60605B' },
  { name: 'Warm Platinum Gray', hex: '#BFBAAF' },
  { name: 'Cobalt Blue', hex: '#2563EB' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Pearl White', hex: '#FFFFFF' },
];

function resolveModelPath(vehicle: CategorizedVehicle): string {
  if (vehicle.modelPath) return vehicle.modelPath;
  const models = [
    '/models/ferrari.glb',
    '/models/bugatti.glb',
    '/models/aston.glb',
    '/models/martin.glb',
    '/models/carglb.glb',
    '/models/subaru.glb',
    '/models/zagato.glb',
    '/models/aurus.fbx',
    '/models/mercedes.obj',
    '/models/benz.fbx',
  ];
  let hash = 0;
  for (let i = 0; i < vehicle.id.length; i++) hash += vehicle.id.charCodeAt(i);
  return models[hash % models.length];
}

interface Scroll3DShowcaseProps {
  vehicle: CategorizedVehicle;
  onOpenAiChat?: () => void;
}

const SEED_REVIEWS_DEFAULT = [
  {
    id: 'rev-seed-1',
    author: 'Alexander Mercer',
    rating: 5,
    date: '2026-08-05',
    verified: true,
    title: 'Mind-blowing 3D continuous scroll camera flight!',
    comment: 'Scrolling down the page feels like a high-budget cinematic film! The camera flies around the 3D car showing every angle and spec in real time.',
    likes: 42,
  },
  {
    id: 'rev-seed-2',
    author: 'Sir Charles Montgomery',
    rating: 5,
    date: '2026-08-01',
    verified: true,
    title: 'Unrivaled luxury and track-proven agility',
    comment: 'Apex Motors delivers top-tier hypercar excellence. The 3D camera animations matched the physical vehicle to the millimeter.',
    likes: 22,
  },
  {
    id: 'rev-seed-3',
    author: 'Elena Rostova',
    rating: 5,
    date: '2026-07-25',
    verified: true,
    title: 'Aerodynamic masterpiece with unbelievable downforce',
    comment: 'Took it on a mountain pass — cornering stability is unreal. The titanium exhaust note gives goosebumps every single time.',
    likes: 19,
  },
];

export function Scroll3DCarShowcase({ vehicle, onOpenAiChat }: Scroll3DShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);

  // THREE.JS REFS
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const animFrameRef = useRef<number>(0);
  const loadedModelRef = useRef<THREE.Object3D | null>(null);
  const spotLightsRef = useRef<THREE.SpotLight[]>([]);
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());

  // REFS FOR UNTHROTTLED SILKY SMOOTH CAMERA INTERPOLATION
  const scrollTargetProgressRef = useRef<number>(0);
  const currentSmoothProgressRef = useRef<number>(0);
  const freeOrbitRef = useRef<boolean>(false);

  // UI STATES
  const [activeStage, setActiveStage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const [selectedColor, setSelectedColor] = useState(PAINT_COLORS[0]);
  const [headlightsOn, setHeadlightsOn] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [freeOrbit, setFreeOrbitState] = useState(false);

  const setFreeOrbit = (val: boolean) => {
    freeOrbitRef.current = val;
    setFreeOrbitState(val);
  };

  // REVIEWS STATE WITH LOCALSTORAGE PERSISTENCE
  const [reviews, setReviews] = useState<any[]>([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const glbPath = useMemo(() => resolveModelPath(vehicle), [vehicle]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`APEX_REVIEWS_${vehicle.id}`);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        setReviews(SEED_REVIEWS_DEFAULT);
      }
    } catch (err) {
      console.error(err);
      setReviews(SEED_REVIEWS_DEFAULT);
    }
  }, [vehicle.id]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim() || !newTitle.trim()) return;

    const createdReview = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      rating: Number(newRating),
      date: new Date().toISOString().split('T')[0],
      verified: true,
      title: newTitle.trim(),
      comment: newComment.trim(),
      likes: 0,
    };

    const updated = [createdReview, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(`APEX_REVIEWS_${vehicle.id}`, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setNewAuthor('');
    setNewTitle('');
    setNewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  // CONTINUOUS CATMULL-ROM 3D CAMERA FLIGHT SPLINES (ZERO ABRUPT JUMPS / ZERO JERKINESS)
  const cameraCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(5.2, 2.2, 6.4),   // Stage 0: Hero 3/4 Front
        new THREE.Vector3(2.7, 1.8, 4.6),   // Stage 1: Front-Side Transition
        new THREE.Vector3(0.5, 2.6, 3.8),   // Stage 1: Active Roof Aero
        new THREE.Vector3(1.2, 1.0, 3.4),   // Stage 2: Laser LED Headlights
        new THREE.Vector3(-2.8, 1.4, 2.2),  // Stage 3: Powertrain & Engine
        new THREE.Vector3(-2.2, 1.0, -1.2), // Stage 4: Wheels & Brakes
        new THREE.Vector3(0.0, 1.1, -4.8),  // Stage 5: Titanium Quad Exhaust
        new THREE.Vector3(4.8, 2.2, -3.2),  // Stage 6: Rear Flyby
        new THREE.Vector3(5.6, 2.4, 4.2),   // Stage 6: Full Orbit Return
      ],
      false,
      'catmullrom',
      0.5
    );
  }, []);

  const lookAtCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 0.4, 0),       // Target 0: Car Center
        new THREE.Vector3(0, 0.45, 0.8),    // Target 1: Hood & Windshield
        new THREE.Vector3(0, 0.6, 0.5),     // Target 2: Roof
        new THREE.Vector3(0.4, 0.45, 1.4),  // Target 3: Front Matrix Lamp
        new THREE.Vector3(0, 0.45, 0),      // Target 4: Engine Block
        new THREE.Vector3(-0.8, 0.35, 0.4), // Target 5: Brake Calipers
        new THREE.Vector3(0, 0.45, -1.6),   // Target 6: Quad Exhaust & Diffuser
        new THREE.Vector3(0, 0.4, -0.8),    // Target 7: Rear Wing
        new THREE.Vector3(0, 0.4, 0),       // Target 8: Full Car Center
      ],
      false,
      'catmullrom',
      0.5
    );
  }, []);

  const calculateCameraFlight = useCallback(
    (p: number) => {
      const clampedP = Math.max(0, Math.min(1, p));
      const pos = cameraCurve.getPoint(clampedP);
      const look = lookAtCurve.getPoint(clampedP);
      return { pos, look };
    },
    [cameraCurve, lookAtCurve]
  );

  // PASSIVE SCROLL EVENT LISTENER
  useEffect(() => {
    let lastStage = -1;

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollTop = window.scrollY;
      const rawProgress = Math.max(0, Math.min(1, scrollTop / docHeight));
      scrollTargetProgressRef.current = rawProgress;

      let currentStage = 0;
      if (rawProgress < 0.14) currentStage = 0;
      else if (rawProgress < 0.28) currentStage = 1;
      else if (rawProgress < 0.42) currentStage = 2;
      else if (rawProgress < 0.56) currentStage = 3;
      else if (rawProgress < 0.70) currentStage = 4;
      else if (rawProgress < 0.84) currentStage = 5;
      else currentStage = 6;

      if (currentStage !== lastStage) {
        lastStage = currentStage;
        setActiveStage(currentStage);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const jumpToStage = (stageIdx: number) => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targets = [0.02, 0.20, 0.35, 0.50, 0.65, 0.78, 0.95];
    const targetY = targets[stageIdx] * docHeight;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  // THREE.JS SETUP WITH UNIVERSAL 3D LOADER (GLB, FBX, OBJ)
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    setLoading(true);
    setLoadError(false);
    setLoadProgress(0);
    loadedModelRef.current = null;
    originalMaterialsRef.current = new Map();

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);
    scene.fog = new THREE.FogExp2(0xFFFFFF, 0.012);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 600);
    camera.position.set(5.2, 2.2, 6.4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.enabled = freeOrbitRef.current;
    controlsRef.current = controls;

    // LIGHTS
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(12, 22, 12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x003082, 1.4);
    fillLight.position.set(-15, 12, -15);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xBFBAAF, 1.8);
    rimLight.position.set(0, 18, -22);
    scene.add(rimLight);

    const spotLeft = new THREE.SpotLight(0xffffff, 25);
    spotLeft.position.set(-1.2, 0.9, 3.5);
    spotLeft.target.position.set(-1.2, 0.5, 6);
    scene.add(spotLeft);
    scene.add(spotLeft.target);

    const spotRight = new THREE.SpotLight(0xffffff, 25);
    spotRight.position.set(1.2, 0.9, 3.5);
    spotRight.target.position.set(1.2, 0.5, 6);
    scene.add(spotRight);
    scene.add(spotRight.target);

    spotLightsRef.current = [spotLeft, spotRight];

    // SHOWROOM FLOOR WITH REFLECTION GRID
    const grid = new THREE.GridHelper(90, 90, 0x003082, 0x60605B);
    grid.position.y = -0.01;
    (grid.material as THREE.Material).opacity = 0.2;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    const floorGeo = new THREE.PlaneGeometry(120, 120);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xBFBAAF,
      roughness: 0.15,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // UNIVERSAL MODEL PROCESSOR & NORMALIZER
    const handleLoadedModel = (model: THREE.Object3D) => {
      const bbox = new THREE.Box3().setFromObject(model);
      const size = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetScale = 4.8 / (maxDim || 1);

      model.scale.set(targetScale, targetScale, targetScale);

      const updatedBox = new THREE.Box3().setFromObject(model);
      const center = updatedBox.getCenter(new THREE.Vector3());
      model.position.x -= center.x;
      model.position.y -= updatedBox.min.y;
      model.position.z -= center.z;

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m: any) => {
                m.side = THREE.DoubleSide;
                m.needsUpdate = true;
              });
            } else if (mesh.material) {
              (mesh.material as any).side = THREE.DoubleSide;
              (mesh.material as any).needsUpdate = true;
            }
            originalMaterialsRef.current.set(mesh, mesh.material);
          }
        }
      });

      scene.add(model);
      loadedModelRef.current = model;
      setLoading(false);
    };

    const onProgress = (xhr: ProgressEvent) => {
      if (xhr.lengthComputable) {
        setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
      }
    };

    const onError = (err: any) => {
      console.error('Failed to load 3D model:', err);
      setLoadError(true);
      setLoading(false);

      const group = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(3.6, 1.2, 7.2);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x003082, roughness: 0.2, metalness: 0.8 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.8;
      group.add(body);
      scene.add(group);
      loadedModelRef.current = group;
    };

    // SELECT CORRECT LOADER ACCORDING TO EXTENSION
    const ext = glbPath.split('.').pop()?.toLowerCase();

    if (ext === 'fbx') {
      const fbxLoader = new FBXLoader();
      fbxLoader.load(glbPath, handleLoadedModel, onProgress, onError);
    } else if (ext === 'obj') {
      const objLoader = new OBJLoader();
      objLoader.load(glbPath, handleLoadedModel, onProgress, onError);
    } else {
      const draco = new DRACOLoader();
      draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);
      loader.load(glbPath, (gltf) => handleLoadedModel(gltf.scene), onProgress, onError);
    }

    // ULTRA-SMOOTH CAMERA FLIGHT ANIMATION LOOP (EXPONENTIAL LERP)
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (!freeOrbitRef.current && cameraRef.current && controlsRef.current) {
        controlsRef.current.enabled = false;
        const target = scrollTargetProgressRef.current;
        currentSmoothProgressRef.current += (target - currentSmoothProgressRef.current) * 0.06;

        const { pos, look } = calculateCameraFlight(currentSmoothProgressRef.current);

        cameraRef.current.position.lerp(pos, 0.15);
        controlsRef.current.target.lerp(look, 0.15);
        controlsRef.current.update();
      } else if (controlsRef.current) {
        controlsRef.current.enabled = true;
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const nw = container.clientWidth || window.innerWidth;
      const nh = container.clientHeight || window.innerHeight;
      cameraRef.current.aspect = nw / nh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, [glbPath, calculateCameraFlight]);

  const applyCarColor = (hex: string) => {
    setSelectedColor(PAINT_COLORS.find((c) => c.hex === hex) || PAINT_COLORS[0]);
    if (!loadedModelRef.current) return;

    const newColor = new THREE.Color(hex);
    loadedModelRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        if (
          name.includes("body") ||
          name.includes("paint") ||
          name.includes("carrosserie") ||
          name.includes("door") ||
          name.includes("hood") ||
          name.includes("roof") ||
          name.includes("fender")
        ) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m: any) => { if (m.color) m.color.copy(newColor); });
          } else if ((mesh.material as any)?.color) {
            (mesh.material as any).color.copy(newColor);
          }
        }
      }
    });
  };

  const toggleHeadlights = () => {
    const next = !headlightsOn;
    setHeadlightsOn(next);
    spotLightsRef.current.forEach((s) => { s.intensity = next ? 25 : 0; });
  };

  const playEngineRevSound = () => {
    try {
      setIsPlayingAudio(true);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.6);
      osc.frequency.exponentialRampToValueAtTime(440, now + 1.1);
      osc.frequency.exponentialRampToValueAtTime(120, now + 2.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.4);
      gain.gain.linearRampToValueAtTime(0.35, now + 1.1);
      gain.gain.linearRampToValueAtTime(0.001, now + 2.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.4);

      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 2400);
    } catch (e) {
      console.error(e);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-[500vh] w-full bg-white text-[#000000] font-mono select-none overflow-x-hidden">

      {/* FULLSCREEN 3D STAGE */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
        <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/98 gap-5 text-[#000000]">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-[#003082]/20 flex items-center justify-center">
                <Sparkles className="w-9 h-9 text-[#003082] animate-pulse" />
              </div>
              <svg className="absolute inset-0 w-20 h-20 -rotate-90 animate-spin" style={{ animationDuration: '2s' }}>
                <circle cx="40" cy="40" r="38" fill="none" stroke="#003082" strokeWidth="2"
                  strokeDasharray={`${loadProgress * 2.38} 300`} />
              </svg>
            </div>
            <span className="text-[#000000] text-base font-extrabold uppercase tracking-widest">
              Loading 3D Smooth Camera Animation
            </span>
            <div className="w-64 h-1.5 bg-[#BFBAAF]/30 rounded-full overflow-hidden border border-[#60605B]/30">
              <div
                className="h-full bg-[#003082] transition-all duration-200"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="text-[#60605B] text-xs font-mono font-bold">{loadProgress}% · {vehicle.make} {vehicle.model}</span>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 gap-3 text-red-700 font-bold">
            <span>⚠ Failed to load 3D GLB model</span>
          </div>
        )}
      </div>

      {/* TOP NAVIGATION HUD BAR */}
      <div className="fixed top-20 left-6 right-6 z-40 pointer-events-none flex items-center justify-between gap-4 font-mono">
        <div className="pointer-events-auto bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-[16px] border border-[#003082] text-xs font-bold text-[#000000] flex items-center gap-2.5 shadow-xl">
          <Sparkles className="w-4 h-4 text-[#003082] animate-pulse" />
          <span>Real 3D Camera Flight · {vehicle.make} {vehicle.model}</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <Link href="/inventory">
            <button className="bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-[16px] border border-[#60605B]/40 text-xs font-bold text-[#000000] hover:border-[#003082] transition-all shadow-md">
              ← Catalog
            </button>
          </Link>
          <Link href={`/booking/test-drive?carId=${vehicle.id}`}>
            <Button variant="primary" size="sm" className="shadow-lg bg-[#003082] text-white font-bold">
              Book Test Drive 🏎
            </Button>
          </Link>
        </div>
      </div>

      {/* FLOATING CONTROL HUD BAR (SHOWN ONLY AT THE LAST STAGE / END OF SCROLL) */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-2xl border-2 border-[#003082] rounded-[24px] px-6 py-3 shadow-2xl flex items-center gap-6 text-xs text-[#000000] font-mono transition-all duration-500 ${
          activeStage === 6 || freeOrbit
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
            : 'opacity-0 translate-y-12 pointer-events-none scale-95'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#60605B] font-bold uppercase">Color:</span>
          <div className="flex items-center gap-1.5">
            {PAINT_COLORS.map((col) => (
              <button
                key={col.hex}
                onClick={() => applyCarColor(col.hex)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-125 ${
                  selectedColor.hex === col.hex ? 'border-[#003082] scale-110 shadow-md' : 'border-gray-300'
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-[#BFBAAF]" />

        <button
          onClick={playEngineRevSound}
          disabled={isPlayingAudio}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border text-xs font-bold uppercase transition-all ${
            isPlayingAudio
              ? 'bg-[#BFBAAF] border-[#003082] text-[#000000] animate-pulse'
              : 'bg-[#BFBAAF]/20 border-[#60605B]/40 text-[#000000] hover:border-[#003082]'
          }`}
        >
          <Volume2 className="w-4 h-4 text-[#003082]" /> {isPlayingAudio ? 'Revving...' : 'Engine Rev Sound'}
        </button>

        <button
          onClick={toggleHeadlights}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border text-xs font-bold uppercase transition-all ${
            headlightsOn
              ? 'bg-[#003082] text-white border-[#003082]'
              : 'bg-[#BFBAAF]/20 border-[#60605B]/40 text-[#000000]'
          }`}
        >
          <Lightbulb className="w-4 h-4" /> {headlightsOn ? 'Headlights ON' : 'Headlights OFF'}
        </button>

        <button
          onClick={() => setFreeOrbit(!freeOrbit)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border text-xs font-bold uppercase transition-all ${
            freeOrbit
              ? 'bg-[#003082] text-white border-[#003082]'
              : 'bg-[#BFBAAF]/20 border-[#60605B]/40 text-[#000000]'
          }`}
        >
          <Compass className="w-4 h-4" /> {freeOrbit ? 'Free 3D Orbit' : 'Scroll Flight Mode'}
        </button>
      </div>

      {/* DETAILED CAR PARTS STAGE OVERLAYS (DYNANICALLY CUSTOMIZED FOR EACH CAR) */}
      <div className="relative z-10 space-y-[80vh] pt-[30vh] pb-[20vh] px-6 max-w-7xl mx-auto font-mono">
        {/* STAGE 0: HERO MODEL SPEC OVERLAY */}
        <div className="min-h-[70vh] flex items-center">
          <Card hoverEffect={false} className="max-w-xl p-8 bg-white/95 border-2 border-[#003082] backdrop-blur-2xl shadow-2xl rounded-[32px] space-y-6 text-[#000000]">
            <div className="flex items-center gap-2">
              <Badge variant="amber">3D Engineering Blueprint</Badge>
              <span className="text-xs text-[#60605B] font-bold uppercase">Model Year {vehicle.year}</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-[#60605B] uppercase font-black tracking-widest">{vehicle.make}</span>
              <h1 className="text-4xl sm:text-5xl font-black uppercase text-[#000000] tracking-tight">{vehicle.model}</h1>
              <PriceTag price={vehicle.price} />
            </div>

            <p className="text-xs text-[#60605B] leading-relaxed font-bold">{vehicle.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold pt-2 border-t border-[#BFBAAF]">
              <div className="p-3 bg-[#BFBAAF]/20 rounded-[14px] border border-[#BFBAAF] space-y-0.5">
                <span className="text-[10px] text-[#60605B] uppercase font-bold">Horsepower</span>
                <span className="text-sm font-black text-[#000000] block">{vehicle.horsepower} HP</span>
              </div>
              <div className="p-3 bg-[#BFBAAF]/20 rounded-[14px] border border-[#BFBAAF] space-y-0.5">
                <span className="text-[10px] text-[#60605B] uppercase font-bold">0-60 MPH</span>
                <span className="text-sm font-black text-[#003082] block">{vehicle.acceleration0to60 || '2.3s'}</span>
              </div>
              <div className="p-3 bg-[#BFBAAF]/20 rounded-[14px] border border-[#BFBAAF] space-y-0.5">
                <span className="text-[10px] text-[#60605B] uppercase font-bold">Top Speed</span>
                <span className="text-sm font-black text-[#000000] block">{vehicle.topSpeed || '230 mph'}</span>
              </div>
              <div className="p-3 bg-[#BFBAAF]/20 rounded-[14px] border border-[#BFBAAF] space-y-0.5">
                <span className="text-[10px] text-[#60605B] uppercase font-bold">Powertrain</span>
                <span className="text-sm font-black text-[#000000] block truncate">{vehicle.fuelType}</span>
              </div>
            </div>

            {vehicle.customHighlights && vehicle.customHighlights.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {vehicle.customHighlights.map((chip, idx) => (
                  <span key={idx} className="text-[10px] font-extrabold uppercase bg-[#003082] text-white px-3 py-1 rounded-full">
                    ⚡ {chip}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link href={`/booking/test-drive?carId=${vehicle.id}`} className="flex-1">
                <Button variant="primary" size="md" className="w-full bg-[#003082] text-white font-bold">
                  Schedule Private Test Drive 🏎
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* STAGE 1: AERODYNAMIC CARBON FIBER MONOCOQUE & ACTIVE REAR WING */}
        <div className="min-h-[70vh] flex items-center justify-end">
          <Card hoverEffect={false} className="max-w-md p-6 bg-white/95 border-2 border-[#003082] backdrop-blur-2xl shadow-2xl rounded-[28px] space-y-4 text-[#000000]">
            <Badge variant="green">Stage 1 · Chassis & Aerodynamics</Badge>
            <h3 className="text-2xl font-extrabold uppercase text-[#000000]">{vehicle.chassisType || 'Carbon Fiber Monocoque Cell'}</h3>
            <p className="text-xs text-[#60605B] leading-relaxed font-bold">
              Precision aerodynamic chassis for {vehicle.make} {vehicle.model}. Features active Venturi downforce channels generating {vehicle.downforce || '650kg of downforce at 180 mph'}.
            </p>
            <div className="space-y-2 pt-2 border-t border-[#BFBAAF] text-xs font-bold text-[#000000]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#003082]" /> <span>Chassis Cell: {vehicle.chassisType || 'T1000 Carbon Monocoque'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#003082]" /> <span>Downforce Output: {vehicle.downforce || '650kg @ 180 mph'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#003082]" /> <span>Underbody Venturi Airflow Geometry</span>
              </div>
            </div>
          </Card>
        </div>

        {/* STAGE 2: MATRIX LED HEADLIGHTS & FRONT AIR SPLITTER */}
        <div className="min-h-[70vh] flex items-center">
          <Card hoverEffect={false} className="max-w-md p-6 bg-white/95 border-2 border-[#003082] backdrop-blur-2xl shadow-2xl rounded-[28px] space-y-4 text-[#000000]">
            <Badge variant="amber">Stage 2 · Front Lighting & Aero Splitter</Badge>
            <h3 className="text-2xl font-extrabold uppercase text-[#000000]">HD Matrix Laser Headlights</h3>
            <p className="text-xs text-[#60605B] leading-relaxed font-bold">
              1.3 million micro-mirrors adapt lighting beam shape in real time, projecting dynamic navigational symbols directly onto the road for {vehicle.model}.
            </p>
            <div className="space-y-2 pt-2 border-t border-[#BFBAAF] text-xs font-bold text-[#000000]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#003082]" /> <span>1.3M Micro-Mirror HD Laser Projection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#003082]" /> <span>Front Carbon Air Splitter Assembly</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#003082]" /> <span>Front Brake Cooling NACA Ducts</span>
              </div>
            </div>
          </Card>
        </div>

        {/* STAGE 3: HYBRID POWERTRAIN & TURBOCHARGERS */}
        <div className="min-h-[70vh] flex items-center justify-end">
          <Card hoverEffect={false} className="max-w-md p-6 bg-white/95 border-2 border-[#003082] backdrop-blur-2xl shadow-2xl rounded-[28px] space-y-4 text-[#000000]">
            <Badge variant="green">Stage 3 · High Output Powertrain</Badge>
            <h3 className="text-2xl font-extrabold uppercase text-[#000000]">{vehicle.engine || 'High Output Performance Engine'}</h3>
            <p className="text-xs text-[#60605B] leading-relaxed font-bold">
              Engineered with {vehicle.horsepower} HP delivering 0-60 mph acceleration in {vehicle.acceleration0to60 || '2.3s'} and top speed of {vehicle.topSpeed || '230 mph'}.
            </p>
            <div className="space-y-2 pt-2 border-t border-[#BFBAAF] text-xs font-bold text-[#000000]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#003082]" /> <span>Transmission: {vehicle.transmission}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#003082]" /> <span>Engine Output: {vehicle.engine || vehicle.fuelType}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#003082]" /> <span>Acceleration: 0-60 mph in {vehicle.acceleration0to60 || '2.3s'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* STAGE 4: FORGED WHEELS, TIRES & CARBON CERAMIC BRAKES */}
        <div className="min-h-[70vh] flex items-center">
          <Card hoverEffect={false} className="max-w-md p-6 bg-white/95 border-2 border-[#003082] backdrop-blur-2xl shadow-2xl rounded-[28px] space-y-4 text-[#000000]">
            <Badge variant="amber">Stage 4 · Wheels, Tires & Braking</Badge>
            <h3 className="text-2xl font-extrabold uppercase text-[#000000]">Carbon Ceramic Matrix Brakes</h3>
            <p className="text-xs text-[#60605B] leading-relaxed font-bold">
              420mm carbon ceramic discs with 10-piston titanium monobloc calipers ensuring 60-0 mph stopping distance of {vehicle.brakingDistance || '94 ft'}.
            </p>
            <div className="space-y-2 pt-2 border-t border-[#BFBAAF] text-xs font-bold text-[#000000]">
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4 text-[#003082]" /> <span>21" Forged Lightweight Alloy Wheels</span>
              </div>
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4 text-[#003082]" /> <span>Pirelli P-Zero Corsa Track Tires</span>
              </div>
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4 text-[#003082]" /> <span>Braking Distance: {vehicle.brakingDistance || '94 ft (60-0 mph)'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* STAGE 5: REAR QUAD EXHAUST & ACTIVE DIFFUSER */}
        <div className="min-h-[70vh] flex items-center justify-end">
          <Card hoverEffect={false} className="max-w-md p-6 bg-white/95 border-2 border-[#003082] backdrop-blur-2xl shadow-2xl rounded-[28px] space-y-4 text-[#000000]">
            <Badge variant="green">Stage 5 · Rear Exhaust & Diffuser</Badge>
            <h3 className="text-2xl font-extrabold uppercase text-[#000000]">3D-Printed Titanium Exhaust</h3>
            <p className="text-xs text-[#60605B] leading-relaxed font-bold">
              Ultra-thin Inconel and titanium exhaust geometry produces a spine-tingling acoustic roar while shedding mass for maximum aerodynamic speed.
            </p>
            <div className="space-y-2 pt-2 border-t border-[#BFBAAF] text-xs font-bold text-[#000000]">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-[#003082]" /> <span>3D-Printed Titanium Inconel Quad Exhaust</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-[#003082]" /> <span>Rear Carbon Diffuser Airflow Blades</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-[#003082]" /> <span>Active Underbody Exhaust Flaps</span>
              </div>
            </div>
          </Card>
        </div>

        {/* STAGE 6: REVIEWS & RATING SECTION */}
        <div className="min-h-screen pt-12 space-y-8">
          <Card hoverEffect={false} className="p-8 bg-white border-2 border-[#003082] rounded-[32px] space-y-8 shadow-2xl text-[#000000]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#BFBAAF] pb-6">
              <div>
                <Badge variant="amber">Verified Client Experiences</Badge>
                <h2 className="text-3xl font-extrabold uppercase text-[#000000] pt-2">
                  Customer Reviews & Ratings for {vehicle.model}
                </h2>
              </div>
              <div className="flex items-center gap-2 bg-[#BFBAAF]/20 p-3 rounded-[16px] border border-[#BFBAAF]">
                <Star className="w-6 h-6 text-[#003082] fill-[#003082]" />
                <span className="text-2xl font-black text-[#000000]">4.9</span>
                <span className="text-xs text-[#60605B] font-bold">({reviews.length} Verified Reviews)</span>
              </div>
            </div>

            <form onSubmit={handleAddReview} className="p-6 bg-[#BFBAAF]/20 border border-[#BFBAAF] rounded-[24px] space-y-4 text-xs font-mono">
              <h3 className="text-sm font-extrabold uppercase text-[#000000] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#003082]" /> Write a Customer Review
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#000000] uppercase mb-1 font-bold">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monika"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full bg-white text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                  />
                </div>
                <div>
                  <label className="block text-[#000000] uppercase mb-1 font-bold">Review Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Exceptional Track Performance"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-white text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                  />
                </div>
                <div>
                  <label className="block text-[#000000] uppercase mb-1 font-bold">Star Rating</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full bg-white text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 / 5 Stars - Perfection)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 / 5 Stars - Excellent)</option>
                    <option value={3}>⭐⭐⭐ (3 / 5 Stars - Good)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#000000] uppercase mb-1 font-bold">Detailed Review Comment</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share your driving experience, handling feedback, and performance impression..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-white text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none text-xs font-bold focus:border-[#003082] resize-none"
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="bg-[#003082] text-white font-bold">
                Submit Verified Review
              </Button>

              {reviewSubmitted && (
                <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-800 rounded-[12px] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Your review has been published!
                </div>
              )}
            </form>

            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 bg-[#BFBAAF]/20 rounded-[20px] border border-[#BFBAAF] space-y-2 text-xs font-mono text-[#000000]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#000000] text-sm">{rev.author}</span>
                      {rev.verified && (
                        <span className="text-[10px] text-[#000000] font-bold bg-[#BFBAAF]/40 px-2 py-0.5 rounded-full border border-[#003082]">
                          ✓ Verified Owner
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[#003082]">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#003082]" />
                      ))}
                    </div>
                  </div>

                  <h4 className="font-extrabold text-[#000000]">{rev.title}</h4>
                  <p className="text-[#60605B] leading-relaxed font-bold">{rev.comment}</p>
                  <span className="text-[10px] text-gray-500 block pt-1">{rev.date}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
