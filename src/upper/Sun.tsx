interface Props {
  position: [number, number, number];
  size?: number;
}

export function Sun({ position, size = 2 }: Props) {
  return (
    <group position={position}>
      <pointLight intensity={3.5} distance={0} decay={0} color="#ffd9a0" />
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshBasicMaterial color="#ffcc55" />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 1.3, 32, 32]} />
        <meshBasicMaterial color="#ffaa33" transparent opacity={0.18} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 1.7, 32, 32]} />
        <meshBasicMaterial color="#ff7722" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}
