'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Action {
  type: 'DOSE_NUTRIENT' | 'ADD_WATER' | 'ADJUST_PH' | 'CHECK_SENSORS';
  label: string;
  color: string;
}

const actions: Action[] = [
  { type: 'CHECK_SENSORS', label: 'Reading sensor data...', color: '#10b981' },
  { type: 'DOSE_NUTRIENT', label: 'Dosing nutrients', color: '#f59e0b' },
  { type: 'ADD_WATER', label: 'Adding water', color: '#3b82f6' },
  { type: 'ADJUST_PH', label: 'Adjusting pH', color: '#8b5cf6' },
];

export default function RobotArmSimulation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentAction, setCurrentAction] = useState<Action>(actions[0]);
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    arm?: THREE.Group;
    animationId?: number;
  }>({});

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x10b981, 2);
    spotLight.position.set(10, 20, 10);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const fillLight = new THREE.PointLight(0x3b82f6, 0.5);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);

    // Hydroponic reservoir (base platform)
    const reservoirGeometry = new THREE.BoxGeometry(4, 0.3, 3);
    const reservoirMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.3,
      roughness: 0.7
    });
    const reservoir = new THREE.Mesh(reservoirGeometry, reservoirMaterial);
    reservoir.position.y = 0;
    reservoir.receiveShadow = true;
    scene.add(reservoir);

    // Water surface
    const waterGeometry = new THREE.PlaneGeometry(3.8, 2.8);
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      opacity: 0.6,
      transparent: true,
      metalness: 0.8,
      roughness: 0.2
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.16;
    scene.add(water);

    // Plant (simplified)
    const plantStemGeometry = new THREE.CylinderGeometry(0.05, 0.08, 1.5, 8);
    const plantStemMaterial = new THREE.MeshStandardMaterial({ color: 0x059669 });
    const plantStem = new THREE.Mesh(plantStemGeometry, plantStemMaterial);
    plantStem.position.set(0, 0.9, 0);
    plantStem.castShadow = true;
    scene.add(plantStem);

    // Leaves
    for (let i = 0; i < 5; i++) {
      const leafGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x10b981 });
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      const angle = (i / 5) * Math.PI * 2;
      leaf.position.set(
        Math.cos(angle) * 0.4,
        1.3 + i * 0.15,
        Math.sin(angle) * 0.4
      );
      leaf.scale.set(1, 0.3, 1);
      leaf.castShadow = true;
      scene.add(leaf);
    }

    // Robot Arm
    const arm = new THREE.Group();

    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.3, 16);
    const armMaterial = new THREE.MeshStandardMaterial({
      color: 0x374151,
      metalness: 0.8,
      roughness: 0.2
    });
    const base = new THREE.Mesh(baseGeometry, armMaterial);
    base.position.y = 0.15;
    base.castShadow = true;
    arm.add(base);

    // Lower arm segment
    const lowerArmGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 12);
    const lowerArm = new THREE.Mesh(lowerArmGeometry, armMaterial);
    lowerArm.position.set(0, 1.4, 0);
    lowerArm.castShadow = true;
    arm.add(lowerArm);

    // Joint
    const jointGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const joint = new THREE.Mesh(jointGeometry, armMaterial);
    joint.position.set(0, 2.65, 0);
    joint.castShadow = true;
    arm.add(joint);

    // Upper arm segment
    const upperArmGeometry = new THREE.CylinderGeometry(0.12, 0.12, 2, 12);
    const upperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
    upperArm.position.set(0, 3.65, 0);
    upperArm.rotation.z = Math.PI / 6;
    upperArm.castShadow = true;
    arm.add(upperArm);

    // End effector (tool)
    const effectorGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
    const effectorMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.3
    });
    const effector = new THREE.Mesh(effectorGeometry, effectorMaterial);
    effector.position.set(0, 4.6, 0.8);
    effector.rotation.x = Math.PI;
    effector.castShadow = true;
    arm.add(effector);

    arm.position.set(3, 0, 1.5);
    scene.add(arm);

    sceneRef.current = { scene, camera, renderer, arm };

    // Animation loop
    let time = 0;
    let actionIndex = 0;
    let actionTimer = 0;

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      sceneRef.current.animationId = animationId;

      time += 0.01;
      actionTimer += 0.01;

      // Cycle through actions every 3 seconds
      if (actionTimer > 3) {
        actionTimer = 0;
        actionIndex = (actionIndex + 1) % actions.length;
        setCurrentAction(actions[actionIndex]);
      }

      if (arm) {
        // Rotate base
        base.rotation.y = Math.sin(time * 0.5) * 0.5;

        // Move lower arm
        lowerArm.rotation.z = Math.sin(time * 0.7) * 0.2;

        // Move upper arm
        upperArm.rotation.z = Math.PI / 6 + Math.sin(time * 0.9) * 0.3;

        // Pulse effector color based on current action
        const actionColor = new THREE.Color(actions[actionIndex].color);
        effectorMaterial.color.copy(actionColor);
        effectorMaterial.emissive.copy(actionColor);
        effectorMaterial.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2;

        // Bob effector up and down
        effector.position.y = 4.6 + Math.sin(time * 2) * 0.1;
      }

      // Animate water
      waterMaterial.opacity = 0.6 + Math.sin(time * 0.5) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full h-[500px] rounded-2xl overflow-hidden border-2 border-emerald-500/30"
        style={{ background: 'linear-gradient(to bottom, #000000, #0a0a0a)' }}
      />

      {/* Action indicator */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-black/80 backdrop-blur-sm border border-emerald-500/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: currentAction.color }}
            />
            <div>
              <div className="text-gray-400 text-xs font-mono">AI Decision</div>
              <div className="text-white font-semibold">{currentAction.label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => (
          <div
            key={action.type}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              currentAction.type === action.type
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-gray-800 bg-gray-900/50'
            }`}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: action.color }}
            />
            <div className="text-xs text-gray-400">{action.type.replace('_', ' ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
