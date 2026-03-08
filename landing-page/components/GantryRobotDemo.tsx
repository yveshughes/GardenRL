'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// --- Types ---
interface ControlValues {
  temperature: number;
  ec: number;
  ph: number;
}

type AIState = 'idle' | 'thinking' | 'acting';

interface AIThought {
  reasoning: string;
  action: string;
  detail: string;
  targetY: number;
}

// --- AI reasoning generator ---
// Grounded in HydroGrowNet Exp 1-3: the only real interventions are
// nutrient solution A+B (mL), pH-down acid (mL), and water top-up (L).
// Temperature is observed but NOT directly controllable.
function generateThought(changed: keyof ControlValues, values: ControlValues): AIThought {
  const { temperature, ec, ph } = values;

  if (changed === 'temperature') {
    if (temperature > 26) return {
      reasoning: `Water temp ${temperature.toFixed(1)}°C — elevated evapotranspiration expected. In Exp 1, the 26.4°C channel consumed 4-6× more water. Adding 5L to reservoir and dosing 30mL A+B to compensate for accelerated uptake.`,
      action: 'ADD_WATER',
      detail: '5L water + 30mL nutrient A+B',
      targetY: 3,
    };
    if (temperature < 18) return {
      reasoning: `Water temp ${temperature.toFixed(1)}°C — root nutrient uptake slows below 18°C. Reducing nutrient dose to avoid salt buildup. Will monitor EC drift over the next 2 readings before intervening further.`,
      action: 'NO_OP',
      detail: 'Monitoring — no intervention',
      targetY: 0,
    };
    return {
      reasoning: `Water temp ${temperature.toFixed(1)}°C — within the 18-26°C optimal range observed in Exp 1. All channels performed well here. No intervention needed, continuing routine monitoring.`,
      action: 'NO_OP',
      detail: 'Monitoring — no intervention',
      targetY: 0,
    };
  }

  if (changed === 'ec') {
    if (ec < 1.0) return {
      reasoning: `EC at ${ec.toFixed(1)} mS/cm — nutrient deficit. Plants are consuming faster than supply. Dosing 30mL nutrient concentrate A+B to bring EC back toward 1.5-2.0 target range.`,
      action: 'ADD_NUTRIENT_AB',
      detail: '30mL nutrient A+B concentrate',
      targetY: -4,
    };
    if (ec > 2.5) return {
      reasoning: `EC at ${ec.toFixed(1)} mS/cm — salt concentration too high, risk of osmotic stress. Adding 3L fresh water to dilute solution back toward 2.0 mS/cm target.`,
      action: 'ADD_WATER',
      detail: '3L fresh water to dilute',
      targetY: 2,
    };
    return {
      reasoning: `EC at ${ec.toFixed(1)} mS/cm — within 1.0-2.5 target range. Nutrient balance is stable. Continuing routine sensor check.`,
      action: 'NO_OP',
      detail: 'Monitoring — no intervention',
      targetY: -1,
    };
  }

  // pH — dataset only tracked pH-down acid, not pH-up
  if (ph > 6.5) return {
    reasoning: `pH at ${ph.toFixed(1)} — drifting alkaline, nutrient lockout risk for iron and manganese. Dispensing 10mL pH-down acid to bring back toward 5.8-6.2 target.`,
    action: 'ADD_ACID',
    detail: '10mL pH-down acid',
    targetY: -2,
  };
  if (ph < 5.5) return {
    reasoning: `pH at ${ph.toFixed(1)} — too acidic, calcium and magnesium uptake impaired. Adding 2L fresh water to buffer pH upward. Will recheck in 30 minutes.`,
    action: 'ADD_WATER',
    detail: '2L fresh water to buffer pH',
    targetY: 1,
  };
  return {
    reasoning: `pH at ${ph.toFixed(1)} — within optimal 5.5-6.5 range. All parameters nominal. Standing by for next sensor reading.`,
    action: 'NO_OP',
    detail: 'Monitoring — no intervention',
    targetY: 0,
  };
}

// --- Props ---
interface GantryRobotDemoProps {
  mode?: 'simulation' | 'live';
  currentDay?: number;
  isPlaying?: boolean;
}

// --- Slider config ---
const sliderConfig = [
  { key: 'temperature' as const, label: 'Temperature', unit: '°C', min: 15, max: 30, step: 0.5, optimal: [18, 26] },
  { key: 'ec' as const, label: 'Nutrient Concentration', unit: 'mS/cm', min: 0.5, max: 3.0, step: 0.1, optimal: [1.0, 2.5] },
  { key: 'ph' as const, label: 'pH Level', unit: '', min: 4.5, max: 8.0, step: 0.1, optimal: [5.5, 6.5] },
];

function getStatusColor(key: keyof ControlValues, value: number): string {
  const config = sliderConfig.find(s => s.key === key)!;
  if (value < config.optimal[0]) return '#3b82f6';
  if (value > config.optimal[1]) return '#ef4444';
  return '#10b981';
}

// =============================================
// Main Component
// =============================================
export default function GantryRobotDemo({ mode = 'simulation' }: GantryRobotDemoProps = {}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<ControlValues>({ temperature: 22, ec: 1.5, ph: 6.0 });
  const [aiState, setAIState] = useState<AIState>('idle');
  const [displayedText, setDisplayedText] = useState('');
  const [currentAction, setCurrentAction] = useState('');
  const carriageTargetRef = useRef(0);
  const carriagePosRef = useRef(0);
  const debounceRef = useRef<{ timer: ReturnType<typeof setTimeout> | null; key: keyof ControlValues | null }>({ timer: null, key: null });
  const sceneRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    animationId?: number;
  }>({});

  // Typewriter effect
  const typeText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      let i = 0;
      setDisplayedText('');
      const interval = setInterval(() => {
        i++;
        setDisplayedText(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, 20);
    });
  }, []);

  // Trigger AI reaction (called after debounce)
  const triggerAI = useCallback(async (key: keyof ControlValues, newValues: ControlValues) => {
    if (aiState !== 'idle') return;

    const thought = generateThought(key, newValues);

    setAIState('thinking');
    setCurrentAction('');
    await typeText(thought.reasoning);

    await new Promise(r => setTimeout(r, 400));
    setAIState('acting');
    setCurrentAction(thought.action);
    carriageTargetRef.current = thought.targetY;

    await new Promise(r => setTimeout(r, 2000));
    setAIState('idle');
  }, [aiState, typeText]);

  // Handle slider change — update value instantly, debounce AI reaction
  const handleSliderChange = useCallback((key: keyof ControlValues, value: number) => {
    setValues(prev => {
      const next = { ...prev, [key]: value };

      // Debounce: wait 1s after last change before AI reacts
      if (debounceRef.current.timer) clearTimeout(debounceRef.current.timer);
      debounceRef.current.timer = setTimeout(() => {
        triggerAI(key, next);
      }, 1000);
      debounceRef.current.key = key;

      return next;
    });
  }, [triggerAI]);

  // Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene — transparent background so the photo shows through
    const scene = new THREE.Scene();

    // Camera matching Blender: 18mm focal on 36mm sensor, render 1280x960
    // Vertical FOV ≈ 73.74° at 4:3 aspect
    const camera = new THREE.PerspectiveCamera(73.74, width / height, 0.1, 50);
    // Blender camera (0, -8, 1.6) Z-up → Three.js (0, 1.6, 8) Y-up
    camera.position.set(0, 1.6, 8);
    camera.lookAt(0, 1.6, 0);

    // Renderer with alpha for compositing over photo
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // --- Environment map for metallic reflections ---
    // Create a dark pink-tinted environment matching the grow-light atmosphere
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x1a0a15);
    envScene.add(new THREE.HemisphereLight(0xff8899, 0x111111, 2));
    const envPink = new THREE.PointLight(0xff6699, 8);
    envPink.position.set(0, 3, 0);
    envScene.add(envPink);
    scene.environment = pmremGenerator.fromScene(envScene, 0.04).texture;
    pmremGenerator.dispose();

    // --- Lighting ---
    // Hemisphere ambient
    scene.add(new THREE.HemisphereLight(0xffeedd, 0x111111, 0.6));

    // Pink grow lights along the rail (Blender positions converted to Y-up)
    [-0.5, 0.5].forEach(x => {
      for (let z = -2; z <= 7; z += 3) {
        const pink = new THREE.PointLight(0xff6699, 2, 10);
        pink.position.set(x, 2.9, z);
        scene.add(pink);
      }
    });

    // White center strip lights
    for (let z = -2; z <= 7; z += 3) {
      const white = new THREE.PointLight(0xffffff, 1.5, 10);
      white.position.set(0, 2.9, z);
      scene.add(white);
    }

    // Key light from above-behind camera
    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    keyLight.position.set(0, 3, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    // --- Load Blender model ---
    let carriageObj: THREE.Object3D | null = null;
    let upperArmInitialRotZ = 0;
    let forearmInitialRotZ = 0;
    let upperArmObj: THREE.Object3D | null = null;
    let forearmObj: THREE.Object3D | null = null;
    let initialCarriageZ = 0;

    const loader = new GLTFLoader();
    loader.load('/models/gantry-robot.glb', (gltf) => {
      scene.add(gltf.scene);

      gltf.scene.traverse((child) => {
        if (child.name === 'GantryCarriage') {
          carriageObj = child;
          initialCarriageZ = child.position.z;
        }
        if (child.name === 'Robot_UpperArm') {
          upperArmObj = child;
          upperArmInitialRotZ = child.rotation.z;
        }
        if (child.name === 'Robot_Forearm') {
          forearmObj = child;
          forearmInitialRotZ = child.rotation.z;
        }

        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
    });

    sceneRef.current = { renderer };

    // --- Animation ---
    let time = 0;
    const animate = () => {
      const id = requestAnimationFrame(animate);
      sceneRef.current.animationId = id;
      time += 0.016;

      // Smoothly move carriage toward target along rail
      const target = carriageTargetRef.current;
      const current = carriagePosRef.current;
      carriagePosRef.current += (target - current) * 0.03;

      if (carriageObj) {
        // Blender +Y → Three.js -Z, so negate the offset
        carriageObj.position.z = initialCarriageZ - carriagePosRef.current;
      }

      // Subtle arm sway
      if (upperArmObj) {
        upperArmObj.rotation.z = upperArmInitialRotZ + Math.sin(time * 0.8) * 0.05;
      }
      if (forearmObj) {
        forearmObj.rotation.z = forearmInitialRotZ + Math.sin(time * 1.1) * 0.03;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current.animationId) cancelAnimationFrame(sceneRef.current.animationId);
      if (container && renderer.domElement) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,800px)_320px] gap-6 w-full justify-center">
      {/* Column 1: Observe — Sensors + Agent Reasoning */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-emerald-500 font-mono text-xs font-bold">01</span>
          <span className="text-white font-mono text-sm font-semibold tracking-wide">Observe</span>
        </div>

        {sliderConfig.map((ctrl) => {
          const value = values[ctrl.key];
          const pct = ((value - ctrl.min) / (ctrl.max - ctrl.min)) * 100;
          const color = getStatusColor(ctrl.key, value);
          const inRange = value >= ctrl.optimal[0] && value <= ctrl.optimal[1];

          return (
            <div key={ctrl.key} className="bg-gray-900/80 border border-gray-800 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-xs font-medium">{ctrl.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-mono font-bold text-sm">
                    {value.toFixed(1)}
                  </span>
                  {ctrl.unit && <span className="text-gray-500 text-xs">{ctrl.unit}</span>}
                </div>
              </div>
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                value={value}
                onChange={(e) => handleSliderChange(ctrl.key, parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #1f2937 ${pct}%, #1f2937 100%)`,
                }}
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-600 text-[10px] font-mono">{ctrl.min}</span>
                <span className="text-[10px] font-semibold" style={{ color }}>
                  {inRange ? 'Optimal' : value < ctrl.optimal[0] ? 'Low' : 'High'}
                </span>
                <span className="text-gray-600 text-[10px] font-mono">{ctrl.max}</span>
              </div>
            </div>
          );
        })}

        {/* Agent Reasoning */}
        <div className="flex-1 bg-black/60 border border-gray-800 rounded-lg p-3 min-h-[120px] flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              aiState === 'idle' ? 'bg-gray-600' :
              aiState === 'thinking' ? 'bg-amber-400 animate-pulse' :
              'bg-emerald-400 animate-pulse'
            }`} />
            <span className="text-gray-500 text-[10px] font-mono uppercase tracking-wider">
              {aiState === 'idle' ? 'Agent Idle' :
               aiState === 'thinking' ? 'Reasoning...' :
               'Action Sent'}
            </span>
          </div>
          <div className="flex-1 font-mono text-xs leading-relaxed">
            {aiState === 'idle' && !displayedText && (
              <span className="text-gray-600 italic">Adjust a sensor to see the agent think...</span>
            )}
            {displayedText && (
              <span className={aiState === 'thinking' ? 'text-amber-300/90' : 'text-gray-400'}>
                {displayedText}
                {aiState === 'thinking' && <span className="animate-pulse">|</span>}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Column 2: Act — Robot Arm 3D Viewport */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-emerald-500 font-mono text-xs font-bold">02</span>
          <span className="text-white font-mono text-sm font-semibold tracking-wide">Act</span>
        </div>

        <div className="relative aspect-[4/3]">
          <img
            src="/4-in-1-container-14.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-2xl"
            draggable={false}
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />
          <div
            ref={canvasRef}
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden"
          />
          {currentAction && aiState === 'acting' && (
            <div className="absolute top-4 left-4">
              <div className="bg-black/80 backdrop-blur-sm border border-emerald-500/50 rounded-lg px-4 py-2 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-mono text-sm">{currentAction}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Column 3: Reward — Action Log + Outcome */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-emerald-500 font-mono text-xs font-bold">03</span>
          <span className="text-white font-mono text-sm font-semibold tracking-wide">Reward</span>
        </div>

        {/* Harvest Day Report Header */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-sm">🌿</span>
            <div>
              <div className="text-emerald-400 font-mono text-[10px] font-bold">HARVEST DAY 26</div>
              <div className="text-gray-500 text-[10px]">Episode complete — computing reward</div>
            </div>
          </div>
        </div>

        {/* Measurements — what we put on the scale */}
        <div className="bg-black/60 border border-gray-800 rounded-lg p-3">
          <div className="text-gray-500 font-mono text-[10px] uppercase tracking-wider mb-2">Measurements</div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Total weight</span>
              <span className="text-white font-mono text-xs font-bold">245.1g</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Leaf count</span>
              <span className="text-white font-mono text-xs font-bold">29</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Shoot weight</span>
              <span className="text-white font-mono text-xs font-bold">196.3g</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Survived</span>
              <span className="text-emerald-400 font-mono text-xs font-bold">Yes</span>
            </div>
          </div>
        </div>

        {/* Reward Function — how we compute the score */}
        <div className="bg-black/60 border border-emerald-500/20 rounded-lg p-3 flex-1">
          <div className="text-gray-500 font-mono text-[10px] uppercase tracking-wider mb-2">Reward Function</div>
          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">harvest_weight / baseline</span>
              <span className="text-emerald-400 font-bold">+1.06</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">survival_bonus</span>
              <span className="text-emerald-400 font-bold">+1.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">resource_penalty</span>
              <span className="text-red-400/70">-0.18</span>
            </div>
            <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between">
              <span className="text-white text-xs font-bold">Total Reward</span>
              <span className="text-emerald-400 text-sm font-black">+1.88</span>
            </div>
          </div>
        </div>

        {/* Why this works for RL */}
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-3">
          <div className="text-gray-600 font-mono text-[10px] uppercase tracking-wider mb-1.5">Why It&apos;s Verifiable</div>
          <div className="text-gray-500 text-[10px] leading-relaxed">
            Put the lettuce on a scale. The reward is deterministic — no human judgment needed.
          </div>
        </div>
      </div>
    </div>
  );
}
