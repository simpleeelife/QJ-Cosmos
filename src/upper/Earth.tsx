import { useMemo } from "react";
import * as THREE from "three";

const AXIAL_TILT_RAD = (23.4 * Math.PI) / 180;

interface Props {
  position: [number, number, number];
}

export function Earth({ position }: Props) {
  return (
    <group position={position} rotation={[AXIAL_TILT_RAD, 0, 0]}>
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color="#3a7bd5"
          roughness={0.7}
          metalness={0.05}
          emissive="#050a1a"
          emissiveIntensity={0.04}
        />
      </mesh>
      <AxisLine />
      <PoleMarker y={1.0} color="#ddccff" label="N" />
      <PoleMarker y={-1.0} color="#aabbdd" label="S" />
    </group>
  );
}

function AxisLine() {
  const geom = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -1.7, 0),
        new THREE.Vector3(0, 1.7, 0),
      ]),
    []
  );
  return (
    <line>
      <primitive object={geom} attach="geometry" />
      <lineBasicMaterial color="#bb88ff" transparent opacity={0.55} />
    </line>
  );
}

function PoleMarker({ y, color }: { y: number; color: string; label: string }) {
  return (
    <mesh position={[0, y * 1.05, 0]}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
