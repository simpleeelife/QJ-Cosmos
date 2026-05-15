interface Props {
  position: [number, number, number];
}

export function Sun({ position }: Props) {
  return (
    <group position={position}>
      <pointLight intensity={3.5} distance={0} decay={0} color="#ffd9a0" />
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial color="#ffcc55" />
      </mesh>
      <mesh>
        <sphereGeometry args={[6.5, 32, 32]} />
        <meshBasicMaterial color="#ffaa33" transparent opacity={0.18} />
      </mesh>
      <mesh>
        <sphereGeometry args={[8.5, 32, 32]} />
        <meshBasicMaterial color="#ff7722" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}
