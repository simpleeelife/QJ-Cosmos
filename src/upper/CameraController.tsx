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
  freeInitialPos: [number, number, number];
  topDownInitialPos: [number, number, number];
  fromSunFov: number;
}

export function CameraController({
  viewpoint,
  earthPos,
  moonPos,
  freeInitialPos,
  topDownInitialPos,
  fromSunFov,
}: Props) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const lastViewpoint = useRef<Viewpoint | null>(null);

  useEffect(() => {
    if (lastViewpoint.current === viewpoint) return;
    lastViewpoint.current = viewpoint;
    // up ベクトルを視点に応じて切替(真上俯瞰時は gimbal lock 回避のため Z を上扱い)
    if (viewpoint === "topDown") {
      camera.up.set(0, 0, -1);
    } else {
      camera.up.set(0, 1, 0);
    }
    if (viewpoint === "free") {
      camera.position.set(...freeInitialPos);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    }
    if (viewpoint === "topDown") {
      camera.position.set(...topDownInitialPos);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    }
    if (viewpoint === "fromSun") {
      if ("fov" in camera) {
        (camera as PerspectiveCamera).fov = fromSunFov;
        (camera as PerspectiveCamera).updateProjectionMatrix();
      }
    } else if (viewpoint === "fromEarth") {
      if ("fov" in camera) {
        (camera as PerspectiveCamera).fov = 75;
        (camera as PerspectiveCamera).updateProjectionMatrix();
      }
    } else {
      if ("fov" in camera) {
        (camera as PerspectiveCamera).fov = 50;
        (camera as PerspectiveCamera).updateProjectionMatrix();
      }
    }
  }, [viewpoint, camera, freeInitialPos, topDownInitialPos, fromSunFov]);

  useFrame(() => {
    if (!controlsRef.current) return;
    if (viewpoint === "fromEarth") {
      camera.position.set(...earthPos);
      controlsRef.current.target.set(...moonPos);
      controlsRef.current.update();
    } else if (viewpoint === "fromSun") {
      camera.position.set(0, 0, 0);
      controlsRef.current.target.set(...earthPos);
      controlsRef.current.update();
    }
  });

  const isFree = viewpoint === "free";
  const isTopDown = viewpoint === "topDown";
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={isFree || isTopDown}
      enableZoom
      enableRotate={isFree}
      minDistance={isFree ? 1.5 : 0.001}
      maxDistance={600}
    />
  );
}
