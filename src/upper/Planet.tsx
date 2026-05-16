interface Ring {
  inner: number;
  outer: number;
  color: string;
  tilt: number;
}

interface Props {
  position: [number, number, number];
  color: string;
  size: number;
  ring?: Ring;
}

export function Planet({ position, color, size, ring }: Props) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.05}
          emissive={color}
          emissiveIntensity={0.06}
        />
      </mesh>
      {ring && (
        <mesh rotation={[Math.PI / 2 + ring.tilt, 0, 0]}>
          <ringGeometry args={[size * ring.inner, size * ring.outer, 96]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={0.55}
            side={2}
          />
        </mesh>
      )}
    </group>
  );
}
