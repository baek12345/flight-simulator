import * as THREE from 'three';

export class AnimalManager {
  constructor(scene) {
    this.scene = scene;
    this.animals = [];
    this.animalGeometries = {}; // ✨ 지오메트리 재사용
    this.animalMaterials = {}; // ✨ 머티리얼 재사용
    
    this.initializeSharedResources();
    this.createAnimals();
  }
  
  // ✨ 공유 리소스 초기화 (메모리 최적화)
  initializeSharedResources() {
    // 소 지오메트리
    this.animalGeometries.cowBody = new THREE.BoxGeometry(3, 2, 4);
    this.animalGeometries.cowHead = new THREE.BoxGeometry(1.5, 1.5, 2);
    this.animalGeometries.cowLeg = new THREE.CylinderGeometry(0.3, 0.3, 1.5);
    this.animalGeometries.cowHorn = new THREE.ConeGeometry(0.2, 0.5, 8);
    
    // 양 지오메트리
    this.animalGeometries.sheepBody = new THREE.SphereGeometry(1.5, 12, 12);
    this.animalGeometries.sheepHead = new THREE.SphereGeometry(0.8, 12, 12);
    this.animalGeometries.sheepLeg = new THREE.CylinderGeometry(0.2, 0.2, 1);
    
    // 돼지 지오메트리
    this.animalGeometries.pigBody = new THREE.BoxGeometry(2.5, 1.8, 3);
    this.animalGeometries.pigHead = new THREE.BoxGeometry(1.2, 1.2, 1.5);
    this.animalGeometries.pigLeg = new THREE.CylinderGeometry(0.25, 0.25, 1);
    this.animalGeometries.pigEar = new THREE.BoxGeometry(0.6, 0.8, 0.1);
    
    // 머티리얼
    this.animalMaterials.cow = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      roughness: 0.8 
    });
    this.animalMaterials.cowSpot = new THREE.MeshStandardMaterial({ 
      color: 0x000000, 
      roughness: 0.8 
    });
    this.animalMaterials.sheep = new THREE.MeshStandardMaterial({ 
      color: 0xeeeeee, 
      roughness: 0.9 
    });
    this.animalMaterials.pig = new THREE.MeshStandardMaterial({ 
      color: 0xffb6c1, 
      roughness: 0.7 
    });
  }
  
  createAnimals() {
    // 10마리 소
    for (let i = 0; i < 10; i++) {
      const cow = this.createCow();
      this.animals.push(cow);
      this.scene.add(cow.mesh);
    }
    
    // 15마리 양
    for (let i = 0; i < 15; i++) {
      const sheep = this.createSheep();
      this.animals.push(sheep);
      this.scene.add(sheep.mesh);
    }
    
    // 10마리 돼지
    for (let i = 0; i < 10; i++) {
      const pig = this.createPig();
      this.animals.push(pig);
      this.scene.add(pig.mesh);
    }
  }
  
  // ✨ 소 생성
  createCow() {
    const cow = new THREE.Group();
    
    // 몸통
    const body = new THREE.Mesh(this.animalGeometries.cowBody, this.animalMaterials.cow);
    body.position.y = 1.5;
    body.castShadow = true;
    cow.add(body);
    
    // 얼룩
    const spot = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1, 2),
      this.animalMaterials.cowSpot
    );
    spot.position.set(0, 1.5, 0.5);
    cow.add(spot);
    
    // 머리
    const head = new THREE.Mesh(this.animalGeometries.cowHead, this.animalMaterials.cow);
    head.position.set(0, 2, 2.5);
    head.castShadow = true;
    cow.add(head);
    
    // 뿔
    const leftHorn = new THREE.Mesh(this.animalGeometries.cowHorn, this.animalMaterials.cowSpot);
    leftHorn.position.set(-0.5, 2.8, 2.5);
    cow.add(leftHorn);
    
    const rightHorn = new THREE.Mesh(this.animalGeometries.cowHorn, this.animalMaterials.cowSpot);
    rightHorn.position.set(0.5, 2.8, 2.5);
    cow.add(rightHorn);
    
    // 다리
    const legPositions = [[-0.8, 0.75, 1.2], [0.8, 0.75, 1.2], [-0.8, 0.75, -1.2], [0.8, 0.75, -1.2]];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(this.animalGeometries.cowLeg, this.animalMaterials.cowSpot);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      cow.add(leg);
    });
    
    // 랜덤 위치
    cow.position.set(
      (Math.random() - 0.5) * 1500,
      0,
      (Math.random() - 0.5) * 1500
    );
    
    return {
      mesh: cow,
      type: 'cow',
      speed: 0.5 + Math.random() * 0.5,
      direction: Math.random() * Math.PI * 2,
      turnTimer: 0,
      radius: 2
    };
  }
  
  // ✨ 양 생성
  createSheep() {
    const sheep = new THREE.Group();
    
    // 몸통 (양털)
    const body = new THREE.Mesh(this.animalGeometries.sheepBody, this.animalMaterials.sheep);
    body.position.y = 1.2;
    body.scale.set(1, 0.8, 1.2);
    body.castShadow = true;
    sheep.add(body);
    
    // 머리 (회색)
    const headMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });
    const head = new THREE.Mesh(this.animalGeometries.sheepHead, headMat);
    head.position.set(0, 1.2, 1.5);
    head.castShadow = true;
    sheep.add(head);
    
    // 다리
    const legPositions = [[-0.6, 0.5, 0.6], [0.6, 0.5, 0.6], [-0.6, 0.5, -0.6], [0.6, 0.5, -0.6]];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(this.animalGeometries.sheepLeg, headMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      sheep.add(leg);
    });
    
    sheep.position.set(
      (Math.random() - 0.5) * 1500,
      0,
      (Math.random() - 0.5) * 1500
    );
    
    return {
      mesh: sheep,
      type: 'sheep',
      speed: 0.3 + Math.random() * 0.4,
      direction: Math.random() * Math.PI * 2,
      turnTimer: 0,
      radius: 1.5
    };
  }
  
  // ✨ 돼지 생성
  createPig() {
    const pig = new THREE.Group();
    
    // 몸통
    const body = new THREE.Mesh(this.animalGeometries.pigBody, this.animalMaterials.pig);
    body.position.y = 1.2;
    body.castShadow = true;
    pig.add(body);
    
    // 머리
    const head = new THREE.Mesh(this.animalGeometries.pigHead, this.animalMaterials.pig);
    head.position.set(0, 1.2, 1.8);
    head.castShadow = true;
    pig.add(head);
    
    // 코
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.6 });
    const nose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12),
      noseMat
    );
    nose.rotation.z = Math.PI / 2;
    nose.position.set(0, 1.2, 2.5);
    pig.add(nose);
    
    // 귀
    const leftEar = new THREE.Mesh(this.animalGeometries.pigEar, this.animalMaterials.pig);
    leftEar.position.set(-0.5, 1.8, 1.8);
    leftEar.rotation.z = 0.3;
    pig.add(leftEar);
    
    const rightEar = new THREE.Mesh(this.animalGeometries.pigEar, this.animalMaterials.pig);
    rightEar.position.set(0.5, 1.8, 1.8);
    rightEar.rotation.z = -0.3;
    pig.add(rightEar);
    
    // 다리
    const legPositions = [[-0.7, 0.5, 0.8], [0.7, 0.5, 0.8], [-0.7, 0.5, -0.8], [0.7, 0.5, -0.8]];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(this.animalGeometries.pigLeg, this.animalMaterials.pig);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      pig.add(leg);
    });
    
    // 꼬리
    const tail = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.1, 8, 12, Math.PI),
      this.animalMaterials.pig
    );
    tail.position.set(0, 1.5, -1.5);
    tail.rotation.x = Math.PI / 2;
    pig.add(tail);
    
    pig.position.set(
      (Math.random() - 0.5) * 1500,
      0,
      (Math.random() - 0.5) * 1500
    );
    
    return {
      mesh: pig,
      type: 'pig',
      speed: 0.4 + Math.random() * 0.5,
      direction: Math.random() * Math.PI * 2,
      turnTimer: 0,
      radius: 1.8
    };
  }
  
  // ✨ 업데이트 (최적화됨)
  update(deltaTime, airplanePos) {
    this.animals.forEach(animal => {
      // 턴 타이머
      animal.turnTimer -= deltaTime;
      if (animal.turnTimer <= 0) {
        animal.direction += (Math.random() - 0.5) * 1;
        animal.turnTimer = 2 + Math.random() * 3;
      }
      
      // 이동
      const moveX = Math.cos(animal.direction) * animal.speed * deltaTime;
      const moveZ = Math.sin(animal.direction) * animal.speed * deltaTime;
      
      animal.mesh.position.x += moveX;
      animal.mesh.position.z += moveZ;
      
      // 회전
      animal.mesh.rotation.y = animal.direction + Math.PI / 2;
      
      // ✨ 비행기 주변에만 유지 (무한 스크롤링)
      const distX = animal.mesh.position.x - airplanePos.x;
      const distZ = animal.mesh.position.z - airplanePos.z;
      
      if (Math.abs(distX) > 1000) {
        animal.mesh.position.x = airplanePos.x + (Math.random() - 0.5) * 1500;
      }
      
      if (Math.abs(distZ) > 1000) {
        animal.mesh.position.z = airplanePos.z + (Math.random() - 0.5) * 1500;
      }
    });
  }
  
  // ✨ 충돌 체크
  checkCollision(airplanePos) {
    if (airplanePos.y > 10) return null; // 높이 10 이상이면 충돌 안함
    
    for (const animal of this.animals) {
      const dx = airplanePos.x - animal.mesh.position.x;
      const dz = airplanePos.z - animal.mesh.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < animal.radius + 8 && airplanePos.y < 5) {
        return animal;
      }
    }
    
    return null;
  }
  
  // ✨ 동물 제거 (충돌 시)
  removeAnimal(animal) {
    const index = this.animals.indexOf(animal);
    if (index > -1) {
      this.scene.remove(animal.mesh);
      this.animals.splice(index, 1);
    }
  }
}
