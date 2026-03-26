import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

const HolographicMaterial = ({ color = "#00f2ff", wireframe = true, opacity = 0.3 }) => (
  <meshStandardMaterial
    color={color}
    wireframe={wireframe}
    transparent
    opacity={opacity}
    emissive={color}
    emissiveIntensity={0.5}
    side={THREE.DoubleSide}
  />
);

const BodyPart = ({ start, end, radius = 0.1, color = "#00f2ff", opacity = 0.2 }: { start: THREE.Vector3, end: THREE.Vector3, radius?: number, color?: string, opacity?: number }) => {
  const distance = start.distanceTo(end);
  const position = start.clone().lerp(end, 0.5);
  const direction = end.clone().sub(start).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

  return (
    <mesh position={position} quaternion={quaternion}>
      <capsuleGeometry args={[radius, distance, 4, 12]} />
      <HolographicMaterial color={color} opacity={opacity} />
    </mesh>
  );
};

const HumanModel = ({ injuredArea, poseLandmarks, intensity = 0.8 }: { injuredArea: string, poseLandmarks?: PoseLandmark[], intensity?: number }) => {
  const group = useRef<THREE.Group>(null);

  const connections = [
    [11, 12], // Shoulders
    [11, 13], [13, 15], // L Arm
    [12, 14], [14, 16], // R Arm
    [11, 23], [12, 24], [23, 24], // Torso
    [23, 25], [25, 27], // L Leg
    [24, 26], [26, 28], // R Leg
    [15, 17], [16, 18], // Hands
    [27, 31], [28, 32], // Feet
    [11, 24], [12, 23]  // Torso Cross
  ];

  const joints = useMemo(() => {
    if (!poseLandmarks || poseLandmarks.length === 0) return null;
    return poseLandmarks.map(p => new THREE.Vector3((0.5 - p.x) * 4, (0.5 - p.y) * 4, -p.z * 2));
  }, [poseLandmarks]);

  const pointCloud = useMemo(() => {
    if (!joints) return null;
    const points: THREE.Vector3[] = [];
    // Generate some random points between joints to fill the volume
    connections.forEach(([a, b]) => {
      if (joints[a] && joints[b]) {
        for (let i = 0; i < 10; i++) {
          points.push(joints[a].clone().lerp(joints[b], Math.random()));
        }
      }
    });
    return points;
  }, [joints]);

  useFrame((state) => {
    if (group.current && !poseLandmarks) {
      group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  const getInjuredPosition = () => {
    const area = injuredArea.toLowerCase();
    if (area.includes('knee')) return joints ? joints[25].clone().lerp(joints[27], 0.2) : new THREE.Vector3(0.3, -1.2, 0.1);
    if (area.includes('shoulder')) return joints ? joints[11] : new THREE.Vector3(-0.6, 1.2, 0.1);
    if (area.includes('arm')) return joints ? joints[13] : new THREE.Vector3(-0.8, 0.8, 0.1);
    if (area.includes('back')) return joints ? joints[11].clone().lerp(joints[23], 0.5).add(new THREE.Vector3(0, 0, -0.2)) : new THREE.Vector3(0, 0.5, -0.2);
    if (area.includes('hip')) return joints ? joints[23] : new THREE.Vector3(0.3, -0.2, 0.1);
    return new THREE.Vector3(0, 0.5, 0.1);
  };

  const getHeatmapColor = (val: number) => {
    if (val > 0.7) return "#ff1100"; // Intense Red
    if (val > 0.4) return "#ffaa00"; // Orange/Yellow
    return "#00ffaa"; // Cyan/Green
  };

  const injuredPos = getInjuredPosition();
  const heatmapColor = getHeatmapColor(intensity);

  return (
    <group ref={group}>
      {joints ? (
        <>
          {/* Main Body Parts */}
          {connections.map(([a, b], i) => (
            joints[a] && joints[b] && (
              <BodyPart 
                key={i} 
                start={joints[a]} 
                end={joints[b]} 
                radius={i === 0 ? 0.15 : (i > 4 && i < 8) ? 0.2 : 0.12} 
                opacity={0.3}
              />
            )
          ))}
          {/* Torso Fill */}
          {joints[11] && joints[12] && joints[23] && joints[24] && (
            <mesh position={joints[11].clone().lerp(joints[24], 0.5)}>
              <boxGeometry args={[
                Math.abs(joints[11].x - joints[12].x) * 1.2, 
                Math.abs(joints[11].y - joints[23].y) * 1.1, 
                0.3
              ]} />
              <HolographicMaterial opacity={0.15} wireframe={false} />
            </mesh>
          )}
          {/* Head & Neck */}
          {joints[0] && joints[11] && joints[12] && (
            <>
              <mesh position={joints[0]}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <HolographicMaterial opacity={0.4} wireframe={false} />
              </mesh>
              <BodyPart 
                start={joints[0].clone().sub(new THREE.Vector3(0, 0.2, 0))} 
                end={joints[11].clone().lerp(joints[12], 0.5)} 
                radius={0.08} 
              />
            </>
          )}
          {/* Point Cloud Effect */}
          {pointCloud && (
            <points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={pointCloud.length}
                  array={new Float32Array(pointCloud.flatMap(p => [p.x, p.y, p.z]))}
                  itemSize={3}
                />
              </bufferGeometry>
              <pointsMaterial color="#00f2ff" size={0.03} transparent opacity={0.3} />
            </points>
          )}
        </>
      ) : (
        <>
          {/* Static Humanoid */}
          <mesh position={[0, 1.6, 0]}>
            <sphereGeometry args={[0.22, 20, 20]} />
            <HolographicMaterial opacity={0.4} />
          </mesh>
          <BodyPart start={new THREE.Vector3(0, 1.5, 0)} end={new THREE.Vector3(0, 0.5, 0)} radius={0.2} /> {/* Chest */}
          <BodyPart start={new THREE.Vector3(-0.5, 1.3, 0)} end={new THREE.Vector3(0.5, 1.3, 0)} radius={0.1} /> {/* Shoulders */}
          <BodyPart start={new THREE.Vector3(-0.5, 1.3, 0)} end={new THREE.Vector3(-0.7, 0.7, 0)} radius={0.08} /> {/* L Arm */}
          <BodyPart start={new THREE.Vector3(0.5, 1.3, 0)} end={new THREE.Vector3(0.7, 0.7, 0)} radius={0.08} /> {/* R Arm */}
          <BodyPart start={new THREE.Vector3(-0.3, 0.5, 0)} end={new THREE.Vector3(0.3, 0.5, 0)} radius={0.15} /> {/* Hips */}
          <BodyPart start={new THREE.Vector3(-0.3, 0.5, 0)} end={new THREE.Vector3(-0.4, -0.6, 0)} radius={0.12} /> {/* L Leg */}
          <BodyPart start={new THREE.Vector3(0.3, 0.5, 0)} end={new THREE.Vector3(0.4, -0.6, 0)} radius={0.12} /> {/* R Leg */}
        </>
      )}

      {/* Heatmap Effect */}
      {injuredArea && (
        <Float speed={4} rotationIntensity={1} floatIntensity={2}>
          <group position={injuredPos}>
            <Sphere args={[0.35, 32, 32]}>
              <MeshDistortMaterial 
                color={heatmapColor} 
                speed={5} 
                distort={0.5} 
                opacity={0.8} 
                transparent 
                emissive={heatmapColor}
                emissiveIntensity={3}
              />
            </Sphere>
            <Sphere args={[0.55, 32, 32]}>
              <meshStandardMaterial 
                color={heatmapColor} 
                opacity={0.15} 
                transparent 
                wireframe
              />
            </Sphere>
            <pointLight color={heatmapColor} intensity={8} distance={4} />
          </group>
        </Float>
      )}
    </group>
  );
};

const Grid = () => (
  <gridHelper args={[20, 20, "#00f2ff", "#002233"]} position={[0, -2, 0]} rotation={[0, 0, 0]} />
);

const ThreeModel: React.FC<{ injuredArea: string, poseLandmarks?: PoseLandmark[], intensity?: number }> = ({ injuredArea, poseLandmarks, intensity }) => {
  return (
    <div className="w-full h-[500px] bg-black rounded-xl overflow-hidden shadow-2xl relative border border-indigo-500/30 font-sans">
      <div className="absolute top-4 left-4 z-10">
        <div className="text-cyan-400 text-[10px] uppercase tracking-[0.2em] font-semibold mb-1 font-sans">
          Biometric Analysis System
        </div>
        <div className="text-white/40 text-[10px] font-medium font-mono">
          STATUS: {poseLandmarks ? 'TRACKING ACTIVE' : 'SCANNING...'}
        </div>
      </div>
      
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 5, 15]} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#00f2ff" />
        
        <HumanModel injuredArea={injuredArea} poseLandmarks={poseLandmarks} intensity={intensity} />
        <Grid />
        
        <OrbitControls 
          enableZoom={true} 
          maxPolarAngle={Math.PI / 1.8} 
          minPolarAngle={Math.PI / 3}
          enablePan={false}
        />
      </Canvas>

      {/* UI Overlays */}
      <div className="absolute bottom-4 right-4 text-right">
        <div className="text-cyan-400/50 text-[10px] font-medium font-mono">
          X-AXIS: {poseLandmarks?.[0]?.x.toFixed(2) || '0.00'}<br/>
          Y-AXIS: {poseLandmarks?.[0]?.y.toFixed(2) || '0.00'}<br/>
          Z-AXIS: {poseLandmarks?.[0]?.z.toFixed(2) || '0.00'}
        </div>
      </div>
    </div>
  );
};

export default ThreeModel;
