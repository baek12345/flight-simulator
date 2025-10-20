import * as THREE from 'three';

export class MissileManager {
  constructor(scene) {
    this.scene = scene;
    this.missiles = [];
  }
  
  // ✨ 미사일 발사
  fireMissile(startPos, direction, airplane) {
    const missile = this.createMissile();
    missile.position.copy(startPos);
    this.scene.add(missile);
    
    // 미사일 데이터
    const missileData = {
      mesh: missile,
      velocity: direction.clone().multiplyScalar(150), // 빠른 속도
      life: 10, // 10초 수명
      trail: [],
      rotation: new THREE.Vector3(
        Math.random() * 0.2,
        Math.random() * 0.2,
        Math.random() * 0.2
      )
    };
    
    // 미사일 방향 설정
    missile.lookAt(
      startPos.x + direction.x * 10,
      startPos.y + direction.y * 10,
      startPos.z + direction.z * 10
    );
    
    this.missiles.push(missileData);
    
    // 발사음 효과 (선택)
    console.log('🚀 Missile Fired!');
  }
  
  // ✨ 미사일 생성
  createMissile() {
    const missile = new THREE.Group();
    
    // 미사일 본체 (회색 금속)
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.2, 2, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    missile.add(body);
    
    // 탄두 (빨강)
    const noseGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
    const noseMat = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      metalness: 0.6,
      roughness: 0.4
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.z = 1.25;
    nose.rotation.x = -Math.PI / 2;
    missile.add(nose);
    
    // 날개 (4개)
    const wingGeo = new THREE.BoxGeometry(0.8, 0.05, 0.4);
    const wingMat = new THREE.MeshStandardMaterial({ 
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.4
    });
    
    const positions = [
      [0, 0.4, -0.5, 0],
      [0, -0.4, -0.5, 0],
      [0.4, 0, -0.5, Math.PI / 2],
      [-0.4, 0, -0.5, Math.PI / 2]
    ];
    
    positions.forEach(pos => {
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(pos[0], pos[1], pos[2]);
      wing.rotation.z = pos[3];
      missile.add(wing);
    });
    
    // 엔진 배기구 발광
    const exhaustGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.3, 8);
    const exhaustMat = new THREE.MeshBasicMaterial({ 
      color: 0xff6600,
      emissive: 0xff6600,
      emissiveIntensity: 1
    });
    const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.position.z = -1.15;
    exhaust.rotation.x = Math.PI / 2;
    missile.add(exhaust);
    
    // 불꽃 (발광)
    const flameGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const flameMat = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 1
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.z = -1.3;
    missile.add(flame);
    
    return missile;
  }
  
  // ✨ 미사일 업데이트
  update(deltaTime, world) {
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const missile = this.missiles[i];
      
      // 수명 감소
      missile.life -= deltaTime;
      
      if (missile.life <= 0) {
        // 수명 다하면 제거
        this.scene.remove(missile.mesh);
        this.missiles.splice(i, 1);
        continue;
      }
      
      // 이동
      missile.mesh.position.add(missile.velocity.clone().multiplyScalar(deltaTime));
      
      // 회전 (날아가는 효과)
      missile.mesh.rotation.z += missile.rotation.z;
      
      // 중력 (약간)
      missile.velocity.y -= 5 * deltaTime;
      
      // 연기 트레일 생성
      if (Math.random() > 0.7) {
        this.createSmoke(missile.mesh.position);
      }
      
      // ✨ 충돌 체크
      const collision = world.checkCollision(missile.mesh.position);
      if (collision || missile.mesh.position.y < 2) {
        // 폭발!
        this.createMissileExplosion(missile.mesh.position);
        this.scene.remove(missile.mesh);
        this.missiles.splice(i, 1);
        
        // 건물 파괴
        if (collision && collision !== 'tree' && collision !== 'ground') {
          // ExplosionManager를 통해 파괴 (main.js에서 처리)
          missile.hitTarget = collision;
        }
      }
    }
  }
  
  // ✨ 연기 트레일
  createSmoke(position) {
    const smokeGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const smokeMat = new THREE.MeshBasicMaterial({ 
      color: 0x888888,
      transparent: true,
      opacity: 0.6
    });
    const smoke = new THREE.Mesh(smokeGeo, smokeMat);
    smoke.position.copy(position);
    this.scene.add(smoke);
    
    // 페이드 아웃
    let opacity = 0.6;
    const smokeInterval = setInterval(() => {
      opacity -= 0.05;
      smokeMat.opacity = opacity;
      smoke.scale.multiplyScalar(1.1);
      
      if (opacity <= 0) {
        this.scene.remove(smoke);
        clearInterval(smokeInterval);
      }
    }, 50);
  }
  
  // ✨ 미사일 폭발
  createMissileExplosion(position) {
    // 폭발 구체
    const explosionGeo = new THREE.SphereGeometry(3, 16, 16);
    const explosionMat = new THREE.MeshBasicMaterial({ 
      color: 0xff6600,
      transparent: true,
      opacity: 1
    });
    const explosion = new THREE.Mesh(explosionGeo, explosionMat);
    explosion.position.copy(position);
    this.scene.add(explosion);
    
    let scale = 1;
    const explosionInterval = setInterval(() => {
      scale += 0.5;
      explosion.scale.set(scale, scale, scale);
      explosionMat.opacity -= 0.1;
      
      if (explosionMat.opacity <= 0) {
        this.scene.remove(explosion);
        clearInterval(explosionInterval);
      }
    }, 50);
    
    // 섬광
    const flash = new THREE.PointLight(0xff6600, 20, 100);
    flash.position.copy(position);
    this.scene.add(flash);
    
    let intensity = 20;
    const flashInterval = setInterval(() => {
      intensity -= 2;
      flash.intensity = intensity;
      
      if (intensity <= 0) {
        this.scene.remove(flash);
        clearInterval(flashInterval);
      }
    }, 50);
  }
  
  // ✨ 모든 미사일 제거
  clear() {
    this.missiles.forEach(missile => {
      this.scene.remove(missile.mesh);
    });
    this.missiles = [];
  }
}
