import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { PerspectiveCamera } from "three";
import type { Viewpoint } from "../store/timeStore";

interface Props {
  viewpoint: Viewpoint;
  earthPos: [number, number, number];
  moonPos: [number, number, number];
}

const FREE_OFFSET: [number, number, number] = [0, 5, 12];

export function CameraController({ viewpoint, earthPos, moonPos }: Props) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const lastViewpoint = useRef<Viewpoint | null>(null);
  const lastEarthPos = useRef<[number, number, number] | null>(null);

  useEffect(() => {
    if (lastViewpoint.current === viewpoint) return;
    lastViewpoint.current = viewpoint;
    if (viewpoint === "free") {
      // 地球を中心に、地球から少し離れた位置にカメラを配置
      camera.position.set(
        earthPos[0] + FREE_OFFSET[0],
        earthPos[1] + FREE_OFFSET[1],
        earthPos[2] + FREE_OFFSET[2]
      );
      if (controlsRef.current) {
        controlsRef.current.target.set(...earthPos);
        controlsRef.current.update();
      }
      lastEarthPos.current = [...earthPos];
    }
    if (viewpoint === "fromSun") {
      if ("fov" in camera) {
        (camera as PerspectiveCamera).fov = 12;
        (camera as PerspectiveCamera).updateProjectionMatrix();
      }
    } else {
      if ("fov" in camera) {
        (camera as PerspectiveCamera).fov = 50;
        (camera as PerspectiveCamera).updateProjectionMatrix();
      }
    }
    if (viewpoint !== "free") {
      lastEarthPos.current = null;
    }
  }, [viewpoint, camera, earthPos]);

  useFrame(() => {
    if (!controlsRef.current) return;
    if (viewpoint === "free") {
      // 地球が動いた分だけカメラとターゲットを平行移動して追尾
      if (lastEarthPos.current) {
        const dx = earthPos[0] - lastEarthPos.current[0];
        const dy = earthPos[1] - lastEarthPos.current[1];
        const dz = earthPos[2] - lastEarthPos.current[2];
        if (dx !== 0 || dy !== 0 || dz !== 0) {
          camera.position.x += dx;
          camera.position.y += dy;
          camera.position.z += dz;
          controlsRef.current.target.set(...earthPos);
          controlsRef.current.update();
        }
      }
      lastEarthPos.current = [...earthPos];
    } else if (viewpoint === "fromEarth") {
      camera.position.set(...earthPos);
      controlsRef.current.target.set(...moonPos);
      controlsRef.current.update();
    } else if (viewpoint === "fromMoon") {
      camera.position.set(...moonPos);
      controlsRef.current.target.set(...earthPos);
      controlsRef.current.update();
    } else if (viewpoint === "fromSun") {
      camera.position.set(0, 0, 0);
      controlsRef.current.target.set(...earthPos);
      controlsRef.current.update();
    }
  });

  const isFree = viewpoint === "free";
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={isFree}
      enableZoom
      enableRotate={isFree}
      minDistance={isFree ? 1.5 : 0.001}
      maxDistance={400}
    />
  );
}
