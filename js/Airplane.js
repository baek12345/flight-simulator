import * as THREE from 'three';

export class Airplane {
  constructor() {
    this.mesh = new THREE.Group();
    
    // Flight parameters
    this.flySpeed = 80;
    this.yawSpeed = 1.5;
    this.pitchSpeed = 1.2;  // Pitch 변화 속도
    this.rollSpeed = 1.5;   // Roll 변화 속도
    
    this.missileManager = null;
    this.bombManager = null; // <-- 추가

    // Current angles
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    
    // Angular velocities (각속도 - 관성의 핵심)
    this.pitchVelocity = 0;
    this.rollVelocity = 0;
    
    // Limits
    this.maxPitch = 60 * (Math.PI / 180);
    this.maxRoll = 60 * (Math.PI / 180);
    this.maxPitchVelocity = 1.0;
    this.maxRollVelocity = 1.2;
    
    this.throttle = 0.5;
    this.stallSpeed = 20;
    this.maxSpeed = 150;
    this.gearDown = true;
    
    this.buildModel();
  }
  
  buildModel() {
    const airplaneModel = new THREE.Group();
    
    const fuselageMat = new THREE.MeshStandardMaterial({ 
      color: 0xcccccc, 
      metalness: 0.3, 
      roughness: 0.6 
    });
    
    const wingMat = new THREE.MeshStandardMaterial({ 
      color: 0xff3333,
      metalness: 0.2,
      roughness: 0.7
    });
    
    const darkMat = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a,
      metalness: 0.5,
      roughness: 0.5
    });
    
    const canopyMat = new THREE.MeshStandardMaterial({ 
      color: 0x3366cc,
      transparent: true,
      opacity: 0.7,
      metalness: 0.8,
      roughness: 0.2
    });
    
    // [이전 buildModel 코드와 동일 - 생략하지 않고 전체 포함]
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.6, 9, 12);
    const body = new THREE.Mesh(bodyGeo, fuselageMat);
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    airplaneModel.add(body);
    
    const noseGeo = new THREE.ConeGeometry(0.5, 1.5, 12);
    const nose = new THREE.Mesh(noseGeo, fuselageMat);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 5.25;
    nose.castShadow = true;
    airplaneModel.add(nose);
    
    const tailGeo = new THREE.ConeGeometry(0.6, 1.5, 12);
    const tail = new THREE.Mesh(tailGeo, fuselageMat);
    tail.rotation.z = Math.PI / 2;
    tail.position.x = -5.25;
    tail.castShadow = true;
    airplaneModel.add(tail);
    
    const canopyGeo = new THREE.SphereGeometry(0.6, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(1.5, 0.5, 0);
    canopy.scale.set(1.3, 0.8, 1);
    airplaneModel.add(canopy);
    
    const cockpitBaseGeo = new THREE.BoxGeometry(1.5, 0.3, 1);
    const cockpitBase = new THREE.Mesh(cockpitBaseGeo, fuselageMat);
    cockpitBase.position.set(1.5, 0.35, 0);
    airplaneModel.add(cockpitBase);
    
    const wingGeo = new THREE.BoxGeometry(1.8, 0.15, 12);
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, -0.2, 0);
    wings.castShadow = true;
    airplaneModel.add(wings);
    
    const wingTipGeo = new THREE.BoxGeometry(1.5, 0.1, 0.8);
    
    const leftTip = new THREE.Mesh(wingTipGeo, wingMat);
    leftTip.position.set(0, -0.2, -6.4);
    leftTip.rotation.y = -0.1;
    leftTip.castShadow = true;
    airplaneModel.add(leftTip);
    
    const rightTip = new THREE.Mesh(wingTipGeo, wingMat);
    rightTip.position.set(0, -0.2, 6.4);
    rightTip.rotation.y = 0.1;
    rightTip.castShadow = true;
    airplaneModel.add(rightTip);
    
    const strutGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8);
    [-4, -2, 2, 4].forEach(zPos => {
      const strut = new THREE.Mesh(strutGeo, darkMat);
      strut.position.set(0, -0.6, zPos);
      strut.castShadow = true;
      airplaneModel.add(strut);
    });
    
    const hStabGeo = new THREE.BoxGeometry(1.2, 0.1, 3.5);
    const hStab = new THREE.Mesh(hStabGeo, wingMat);
    hStab.position.set(-5, 0.3, 0);
    hStab.castShadow = true;
    airplaneModel.add(hStab);
    
    const vStabGeo = new THREE.BoxGeometry(0.1, 1.8, 1.5);
    const vStab = new THREE.Mesh(vStabGeo, wingMat);
    vStab.position.set(-5, 1.2, 0);
    vStab.castShadow = true;
    airplaneModel.add(vStab);
    
    const cowlingGeo = new THREE.CylinderGeometry(0.55, 0.5, 1, 12);
    const cowling = new THREE.Mesh(cowlingGeo, darkMat);
    cowling.rotation.z = Math.PI / 2;
    cowling.position.x = 6;
    cowling.castShadow = true;
    airplaneModel.add(cowling);
    
    const hubGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.3, 12);
    const hub = new THREE.Mesh(hubGeo, darkMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.x = 6.8;
    airplaneModel.add(hub);
    
    this.propeller = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(0.3, 2.5, 0.12);
    const bladeMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      metalness: 0.7,
      roughness: 0.3
    });
    
    const blade1 = new THREE.Mesh(bladeGeo, bladeMat);
    blade1.position.x = 6.9;
    blade1.castShadow = true;
    this.propeller.add(blade1);
    
    const blade2 = new THREE.Mesh(bladeGeo, bladeMat);
    blade2.position.x = 6.9;
    blade2.rotation.x = Math.PI / 2;
    blade2.castShadow = true;
    this.propeller.add(blade2);
    
    airplaneModel.add(this.propeller);
    
    this.landingGear = new THREE.Group();
    const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.9
    });
    
    const gearStrutGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2);
    
    const leftStrut = new THREE.Mesh(gearStrutGeo, darkMat);
    leftStrut.position.set(0.5, -1, -1.2);
    leftStrut.rotation.z = 0.15;
    leftStrut.castShadow = true;
    this.landingGear.add(leftStrut);
    
    const leftWheel = new THREE.Mesh(wheelGeo, wheelMat);
    leftWheel.rotation.z = Math.PI / 2;
    leftWheel.position.set(0.3, -1.5, -1.2);
    leftWheel.castShadow = true;
    this.landingGear.add(leftWheel);
    
    const rightStrut = new THREE.Mesh(gearStrutGeo, darkMat);
    rightStrut.position.set(0.5, -1, 1.2);
    rightStrut.rotation.z = 0.15;
    rightStrut.castShadow = true;
    this.landingGear.add(rightStrut);
    
    const rightWheel = new THREE.Mesh(wheelGeo, wheelMat);
    rightWheel.rotation.z = Math.PI / 2;
    rightWheel.position.set(0.3, -1.5, 1.2);
    rightWheel.castShadow = true;
    this.landingGear.add(rightWheel);
    
    const tailWheelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 12);
    const tailWheel = new THREE.Mesh(tailWheelGeo, wheelMat);
    tailWheel.rotation.z = Math.PI / 2;
    tailWheel.position.set(-5, -0.8, 0);
    tailWheel.castShadow = true;
    this.landingGear.add(tailWheel);
    
    const tailStrutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6);
    const tailStrut = new THREE.Mesh(tailStrutGeo, darkMat);
    tailStrut.position.set(-5, -0.5, 0);
    this.landingGear.add(tailStrut);
    
    airplaneModel.add(this.landingGear);
    airplaneModel.rotation.y = -Math.PI / 2;
    this.mesh.add(airplaneModel);
    this.mesh.position.set(0, 50, 0);
  }
  
  update(deltaTime, keys) {
    this.handleInput(keys, deltaTime);
    this.updateFlightDynamics(deltaTime);
    this.animatePropeller();
    this.checkStall();
  }
  
handleInput(keys, dt) {
  // Throttle (W/S) - 유지
  if (keys['KeyW']) this.throttle = Math.min(1, this.throttle + 0.5 * dt);
  if (keys['KeyS']) this.throttle = Math.max(0, this.throttle - 0.5 * dt);
  
  // ✨ Combined Roll + Yaw Control (A/D + Numpad 4/6)
  let rollInput = 0;
  
  // A/D 키로 Roll 제어
  if (keys['KeyA']) rollInput -= 1;
  if (keys['KeyD']) rollInput += 1;
  
  if (!keys['KeyA'] && !keys['KeyD']) {
  // 현재 롤 각도를 0으로 천천히 되돌림
  this.rollVelocity -= this.roll * 8.0 * dt;  // 복원력 (2.0 계수는 복귀 강도)
    }
  // Roll 각속도 적용
  if (rollInput !== 0) {
    this.rollVelocity += rollInput * this.rollSpeed * dt * 6.0;
  } else {
    // 키를 놓으면 서서히 수평으로 복귀
    this.rollVelocity *= 0.92;
  }
  
  // ✨ Pitch Control (Numpad 8/5)
  // ✨ Pitch Control (Numpad 8/5) - 키를 놓으면 수평으로 복귀
if (keys['Numpad8']) {
    this.pitchVelocity -= this.pitchSpeed * dt * 3.0;
} else if (keys['Numpad5']) {
  this.pitchVelocity += this.pitchSpeed * dt * 3.0;
} else {
  // ✨ 키를 놓으면 Pitch를 0으로 복귀 (수평)
  this.pitchVelocity *= 0.92; // 추가 감쇠
}

  
  // Velocity limits
  this.pitchVelocity = Math.max(-this.maxPitchVelocity, Math.min(this.maxPitchVelocity, this.pitchVelocity));
  this.rollVelocity = Math.max(-this.maxRollVelocity, Math.min(this.maxRollVelocity, this.rollVelocity));
  
  // Quick altitude
  if (keys['Space']) {
    this.mesh.position.y += 20 * dt;
  }
  if (keys['ShiftLeft'] || keys['ShiftRight']) {
    this.mesh.position.y -= 20 * dt;
  }
  
  // Landing gear
  if (keys['KeyG']) {
    this.gearDown = !this.gearDown;
    this.landingGear.visible = this.gearDown;
    keys['KeyG'] = false;
  }
  
  // Reset
  if (keys['KeyR']) {
    this.mesh.position.set(0, 50, 0);
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.pitchVelocity = 0;
    this.rollVelocity = 0;
    this.throttle = 0.5;
    keys['KeyR'] = false;
  }
  // ✨ 미사일 발사 (Numpad 4 - 왼쪽, Numpad 6 - 오른쪽)
  if (keys['Numpad6']) {
    this.fireMissile('left');
    keys['Numpad6'] = false; // 연사 방지
  }
  if (keys['Numpad4']) {
    this.fireMissile('right');
    keys['Numpad4'] = false; // 연사 방지
  }

  // 투하 키 (예: Numpad0 또는 KeyB)
if (keys['Numpad0'] || keys['KeyB']) {
  this.dropBomb();
  // 연사 방지
  keys['Numpad0'] = false;
  keys['KeyB'] = false;
}
}

dropBomb() {
  if (!this.bombManager) return;

  // 로컬(항공기 기준) 오프셋: 꼬리나 중앙 아래쪽으로 떨어뜨리기
  // 이 값은 모델에 맞게 조절하세요.
  const offset = new THREE.Vector3(0, -1.5, -2); // 아래 + 뒤쪽으로
  offset.applyQuaternion(this.mesh.quaternion);

  const startPos = this.mesh.position.clone().add(offset);

  // Forward throw 느낌을 주려면 약간 전방으로 이동
  const forward = this.getForwardDirection().clone().multiplyScalar(3);
  startPos.add(forward);

  this.bombManager.dropBomb(startPos, this);
}

fireMissile(side) {
  if (!this.missileManager) return;
  
  // 발사 위치 (날개 끝)
  const offset = side === 'left' 
    ? new THREE.Vector3(-3, 0, 2) 
    : new THREE.Vector3(3, 0, 2);
  
  offset.applyQuaternion(this.mesh.quaternion);
  const startPos = this.mesh.position.clone().add(offset);
  
  // 발사 방향 (앞으로)
  const forward = this.getForwardDirection();
  
  this.missileManager.fireMissile(startPos, forward, this);
}

updateFlightDynamics(deltaTime) {
  // 각속도를 각도에 적용
  this.pitch += this.pitchVelocity * deltaTime;
  this.roll += this.rollVelocity * deltaTime;
  
  // ✨ Roll에 따라 자동으로 Yaw 발생 (방향 반전!)
  const rollEffect = Math.sin(this.roll) * 0.8;
  this.yaw -= rollEffect * deltaTime; // ← 마이너스로 변경!
  
  // Angle limits
  this.roll = Math.max(-this.maxRoll, Math.min(this.maxRoll, this.roll));
  
  // Apply rotations
  const euler = new THREE.Euler(this.pitch, this.yaw, this.roll, 'YXZ');
  this.mesh.quaternion.setFromEuler(euler);
  
  // Forward movement
  const forward = new THREE.Vector3(0, 0, 1);
  forward.applyQuaternion(this.mesh.quaternion);
  
  const moveSpeed = this.throttle * this.flySpeed * deltaTime;
  this.mesh.position.add(forward.multiplyScalar(moveSpeed));
  
  // Gravity and lift
  const speed = this.throttle * this.flySpeed;
  let verticalForce = -15 * deltaTime;
  
  if (speed > this.stallSpeed) {
    verticalForce += (speed / this.maxSpeed) * 10 * deltaTime;
  }
  
  this.mesh.position.y += verticalForce;
  
  // Ground collision
  if (this.mesh.position.y < 2) {
    this.mesh.position.y = 2;
    this.pitchVelocity = 0;
    this.rollVelocity = 0;
    if (speed < 30) {
      this.throttle *= 0.95;
    }
  }
}
  
  animatePropeller() {
    this.propeller.rotation.x += (this.throttle * 2 + 0.5) * 0.1;
  }
  
  checkStall() {
    const speed = this.throttle * this.flySpeed;
    const stallWarning = document.getElementById('stall-warning');
    if (stallWarning) {
      stallWarning.style.display = speed < this.stallSpeed ? 'block' : 'none';
    }
  }
  
  getExhaustPosition() {
    const exhaustPos = this.mesh.position.clone();
    const backward = new THREE.Vector3(0, -0.1, -1);
    backward.applyQuaternion(this.mesh.quaternion);
    exhaustPos.add(backward.multiplyScalar(7));
    return exhaustPos;
  }
  
  getForwardDirection() {
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(this.mesh.quaternion);
    return forward;
  }
  
  get velocity() {
    const speed = this.throttle * this.flySpeed;
    return new THREE.Vector3(0, 0, speed);
  }
}
