import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useUiStore } from "../store/uiStore";

interface Props {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

const FOLLOW_SPEED = 0.14;
const ARRIVAL_EPSILON = 0.05;
const CLOSE_DISTANCE = 4; // 星から何ユニット手前にカメラを置くか

const tmpGoal = new THREE.Vector3();
const tmpViewDir = new THREE.Vector3();
const tmpDesired = new THREE.Vector3();

export function CameraFollower({ controlsRef }: Props) {
  const { camera } = useThree();

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const goal = useUiStore.getState().focusedPosition;
    if (!goal) return;

    tmpGoal.set(goal[0], goal[1], goal[2]);

    // 到着判定: ターゲットがゴールに十分近く & カメラ距離が大体CLOSE_DISTANCE
    const targetDist = controls.target.distanceTo(tmpGoal);
    const cameraDist = camera.position.distanceTo(tmpGoal);
    if (targetDist < ARRIVAL_EPSILON && Math.abs(cameraDist - CLOSE_DISTANCE) < 0.1) {
      return;
    }

    // 現在の視線方向(ターゲット - カメラ、正規化)
    tmpViewDir.copy(controls.target).sub(camera.position);
    if (tmpViewDir.lengthSq() < 0.0001) {
      tmpViewDir.set(0, 0.3, 1);
    }
    tmpViewDir.normalize();

    // カメラ目標位置 = goal - viewDir * CLOSE_DISTANCE(視線方向は維持して星の手前に)
    tmpDesired.copy(tmpViewDir).multiplyScalar(-CLOSE_DISTANCE).add(tmpGoal);

    controls.target.lerp(tmpGoal, FOLLOW_SPEED);
    camera.position.lerp(tmpDesired, FOLLOW_SPEED);
    controls.update();
  });

  return null;
}
