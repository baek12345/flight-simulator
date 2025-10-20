import * as THREE from 'three';

export class CameraController {
  constructor(camera, target, cameraOffsets) {
    this.camera = camera;
    this.target = target;
    this.cameraOffsets = [
      { x: 0, y: 4, z: -12 },   // 기본
      { x: 0, y: 3, z: -8 },    // 가까이
      { x: 0, y: 6, z: -18 }    // 멀리
    ];
    this.currentMode = 0;
    this.currentOffset = { ...this.cameraOffsets[0] };
    this.damping = 0.15;
  }
  
  update(airplane) {
    const targetPos = this.target.position.clone();
    
    // 비행기의 전체 회전 정보 가져오기
    const euler = new THREE.Euler().setFromQuaternion(
      this.target.quaternion,
      'YXZ'
    );
    
    // ✨ 핵심: Pitch도 포함한 Quaternion 생성 (Yaw + Pitch)
    // Roll은 제외하여 카메라가 기울지 않음
    const cameraPitch = euler.x * 0.5; // Pitch의 50%만 적용 (너무 심하지 않게)
    const cameraYaw = euler.y;
    
    const cameraQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(cameraPitch, cameraYaw, 0, 'YXZ')
    );
    
    // 카메라 오프셋 계산
    const offset = new THREE.Vector3(
      this.currentOffset.x,
      this.currentOffset.y,
      this.currentOffset.z
    );
    offset.applyQuaternion(cameraQuat);
    
    // 원하는 카메라 위치
    const desiredPos = targetPos.clone().add(offset);
    
    // 부드럽게 이동
    this.camera.position.lerp(desiredPos, this.damping);
    
    // ✨ 카메라가 바라보는 지점도 비행기 각도 반영
    const lookAhead = new THREE.Vector3(0, 0, 3);
    lookAhead.applyQuaternion(cameraQuat);
    const lookTarget = targetPos.clone().add(lookAhead);
    lookTarget.y += 0.5;
    
    this.camera.lookAt(lookTarget);
    
    // 속도에 따른 FOV 조정 (속도감 강화)
    const speed = airplane.throttle * airplane.flySpeed;
    const baseFOV = 70;
    const speedFOV = (speed / airplane.maxSpeed) * 20;
    const pitchFOV = Math.abs(euler.x) * 10; // Pitch 변화도 FOV에 반영
    
    const targetFOV = baseFOV + speedFOV + pitchFOV;
    this.camera.fov += (targetFOV - this.camera.fov) * 0.05;
    this.camera.updateProjectionMatrix();
  }
  
  cycleMode() {
    this.currentMode = (this.currentMode + 1) % 3;
    this.currentOffset = { ...this.cameraOffsets[this.currentMode] };
  }
}
