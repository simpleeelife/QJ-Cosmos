interface Props {
  position: [number, number, number];
}

export function Moon({ position }: Props) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial
        color="#cccccc"
        roughness={0.95}
        metalness={0}
        emissive="#0a0a0a"
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}
