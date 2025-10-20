import * as THREE from 'three';

export class ExplosionManager {
  constructor(scene) {
    this.scene = scene;
  }
  
  // ✨ 비행기 폭발
  createAirplaneExplosion(position, airplane) {
    airplane.mesh.visible = false;
    
    const explosionParticles = [];
    
    // 1. 메인 폭발
    const mainExplosion = this.createMainExplosion(position);
    
    // 2. 비행기 파편
    const airplaneColors = [
      0xcccccc, 0xcccccc, 0xcccccc,
      0xff3333, 0xff3333, 0xff3333,
      0x3366cc, 0x2a2a2a, 0x2a2a2a
    ];
    
    // 큰 파편
    for (let i = 0; i < 15; i++) {
      const debris = this.createDebris(
        position,
        airplaneColors[Math.floor(Math.random() * airplaneColors.length)],
        { width: 1 + Math.random() * 2, height: 0.5 + Math.random(), depth: 2 + Math.random() * 2 },
        { x: 40, y: 35, z: 40 }
      );
      explosionParticles.push(debris);
    }
    
    // 작은 파편
    for (let i = 0; i < 50; i++) {
      const size = 0.3 + Math.random() * 0.5;
      const debris = this.createDebris(
        position,
        airplaneColors[Math.floor(Math.random() * airplaneColors.length)],
        { width: size, height: size, depth: size },
        { x: 30, y: 30, z: 30 }
      );
      explosionParticles.push(debris);
    }
    
    // 날개 조각
    for (let i = 0; i < 3; i++) {
      const wing = this.createDebris(
        position,
        0xff3333,
        { width: 4, height: 0.2, depth: 2 },
        { x: 35, y: 25, z: 35 }
      );
      explosionParticles.push(wing);
    }
    
    // 화염
    const fire = this.createFire(position, 20);
    explosionParticles.push(...fire);
    
    // 연기
    const smoke = this.createSmoke(position, 30);
    explosionParticles.push(...smoke);
    
    // 섬광
    this.createFlash(position, 15, 150);
    
    // 애니메이션
    this.animateParticles(explosionParticles, 5);
  }
  
  // ✨ 건물 폭발
  createBuildingExplosion(building) {
    const buildingPos = building.position.clone();
    const buildingColor = building.children[0].material.color.getHex();
    const { width, height, depth } = building.userData;
    
    building.visible = false;
    
    const debrisParticles = [];
    
    // 큰 벽 조각
    for (let i = 0; i < 20; i++) {
      const debris = this.createBuildingDebris(
        buildingPos,
        buildingColor,
        {
          width: 2 + Math.random() * 4,
          height: 3 + Math.random() * 6,
          depth: 1 + Math.random() * 2
        },
        { width, height, depth },
        { x: 25, y: 20, z: 25 }
      );
      debrisParticles.push(debris);
    }
    
    // 작은 콘크리트 조각
    for (let i = 0; i < 40; i++) {
      const size = 0.5 + Math.random() * 1;
      const debris = this.createBuildingDebris(
        buildingPos,
        0x888888,
        { width: size, height: size, depth: size },
        { width, height, depth },
        { x: 30, y: 25, z: 30 }
      );
      debrisParticles.push(debris);
    }
    
    // 먼지 구름
    const dust = this.createDust(buildingPos, { width, height, depth }, 25);
    debrisParticles.push(...dust);
    
    // 화염
    const fire = this.createBuildingFire(buildingPos, 15);
    debrisParticles.push(...fire);
    
    // 섬광
    this.createFlash(
      new THREE.Vector3(buildingPos.x, buildingPos.y + height / 2, buildingPos.z),
      20,
      200
    );
    
    // 애니메이션
    this.animateParticles(debrisParticles, 6, () => {
      // 건물 제거 콜백
      const index = this.scene.children.findIndex(child => child === building);
      if (index > -1) {
        this.scene.remove(building);
      }
      
      // 잔해 남기기
      this.createRubble(buildingPos, { width, height, depth });
    });
  }
  
  // === 헬퍼 메서드 ===
  
  createMainExplosion(position) {
    const geo = new THREE.SphereGeometry(5, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ 
      color: 0xff6600,
      transparent: true,
      opacity: 0.8
    });
    const explosion = new THREE.Mesh(geo, mat);
    explosion.position.copy(position);
    this.scene.add(explosion);
    
    let scale = 1;
    const interval = setInterval(() => {
      scale += 0.3;
      explosion.scale.set(scale, scale, scale);
      mat.opacity -= 0.05;
      
      if (mat.opacity <= 0) {
        this.scene.remove(explosion);
        clearInterval(interval);
      }
    }, 50);
    
    return explosion;
  }
  
  createDebris(position, color, size, velocityRange) {
    const geo = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const mat = new THREE.MeshStandardMaterial({ 
      color,
      metalness: 0.3,
      roughness: 0.7
    });
    const debris = new THREE.Mesh(geo, mat);
    debris.position.copy(position);
    debris.castShadow = true;
    
    debris.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * velocityRange.x,
        Math.random() * velocityRange.y + 5,
        (Math.random() - 0.5) * velocityRange.z
      ),
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      ),
      life: 1.0
    };
    
    this.scene.add(debris);
    return debris;
  }
  
  createBuildingDebris(buildingPos, color, size, buildingSize, velocityRange) {
    const geo = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const mat = new THREE.MeshStandardMaterial({ 
      color,
      roughness: 0.8,
      metalness: 0.2
    });
    const debris = new THREE.Mesh(geo, mat);
    
    debris.position.set(
      buildingPos.x + (Math.random() - 0.5) * buildingSize.width,
      buildingPos.y + Math.random() * buildingSize.height,
      buildingPos.z + (Math.random() - 0.5) * buildingSize.depth
    );
    debris.castShadow = true;
    
    debris.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * velocityRange.x,
        Math.random() * velocityRange.y + 5,
        (Math.random() - 0.5) * velocityRange.z
      ),
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      ),
      life: 1.0
    };
    
    this.scene.add(debris);
    return debris;
  }
  
  createFire(position, count) {
    const fire = [];
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ 
        color: i % 2 === 0 ? 0xff6600 : 0xff3300,
        transparent: true,
        opacity: 0.8
      });
      const fireBall = new THREE.Mesh(geo, mat);
      
      fireBall.position.set(
        position.x + (Math.random() - 0.5) * 3,
        position.y + (Math.random() - 0.5) * 3,
        position.z + (Math.random() - 0.5) * 3
      );
      
      fireBall.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 15,
          Math.random() * 20,
          (Math.random() - 0.5) * 15
        ),
        life: 1.0
      };
      
      this.scene.add(fireBall);
      fire.push(fireBall);
    }
    return fire;
  }
  
  createBuildingFire(buildingPos, count) {
    const fire = [];
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(1 + Math.random(), 8, 8);
      const mat = new THREE.MeshBasicMaterial({ 
        color: i % 2 === 0 ? 0xff6600 : 0xff3300,
        transparent: true,
        opacity: 0.8
      });
      const fireBall = new THREE.Mesh(geo, mat);
      
      fireBall.position.set(
        buildingPos.x + (Math.random() - 0.5) * 10,
        buildingPos.y + Math.random() * 20,
        buildingPos.z + (Math.random() - 0.5) * 10
      );
      
      fireBall.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          Math.random() * 15,
          (Math.random() - 0.5) * 10
        ),
        life: 1.0
      };
      
      this.scene.add(fireBall);
      fire.push(fireBall);
    }
    return fire;
  }
  
  createSmoke(position, count) {
    const smoke = [];
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(2 + Math.random() * 2, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ 
        color: 0x444444,
        transparent: true,
        opacity: 0.6
      });
      const smokeCloud = new THREE.Mesh(geo, mat);
      
      smokeCloud.position.set(
        position.x + (Math.random() - 0.5) * 5,
        position.y + (Math.random() - 0.5) * 5,
        position.z + (Math.random() - 0.5) * 5
      );
      
      smokeCloud.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 3 + 2,
          (Math.random() - 0.5) * 2
        ),
        life: 1.0
      };
      
      this.scene.add(smokeCloud);
      smoke.push(smokeCloud);
    }
    return smoke;
  }
  
  createDust(buildingPos, buildingSize, count) {
    const dust = [];
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(3 + Math.random() * 3, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ 
        color: 0x999999,
        transparent: true,
        opacity: 0.5
      });
      const dustCloud = new THREE.Mesh(geo, mat);
      
      dustCloud.position.set(
        buildingPos.x + (Math.random() - 0.5) * buildingSize.width,
        buildingPos.y + Math.random() * buildingSize.height * 0.5,
        buildingPos.z + (Math.random() - 0.5) * buildingSize.depth
      );
      
      dustCloud.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 4 + 2,
          (Math.random() - 0.5) * 3
        ),
        life: 1.0,
        isDust: true
      };
      
      this.scene.add(dustCloud);
      dust.push(dustCloud);
    }
    return dust;
  }
  
  createFlash(position, intensity, range) {
    const flash = new THREE.PointLight(0xff6600, intensity, range);
    flash.position.copy(position);
    this.scene.add(flash);
    
    let flashIntensity = intensity;
    const interval = setInterval(() => {
      flashIntensity -= intensity / 20;
      flash.intensity = flashIntensity;
      
      if (flashIntensity <= 0) {
        this.scene.remove(flash);
        clearInterval(interval);
      }
    }, 50);
  }
  
  createRubble(buildingPos, buildingSize) {
    const rubbleGeo = new THREE.BoxGeometry(
      buildingSize.width,
      buildingSize.height * 0.2,
      buildingSize.depth
    );
    const rubbleMat = new THREE.MeshStandardMaterial({ 
      color: 0x666666,
      roughness: 0.9
    });
    const rubble = new THREE.Mesh(rubbleGeo, rubbleMat);
    rubble.position.set(
      buildingPos.x,
      buildingSize.height * 0.1,
      buildingPos.z
    );
    rubble.receiveShadow = true;
    this.scene.add(rubble);
  }
  
  animateParticles(particles, duration, callback) {
    let life = 0;
    const interval = setInterval(() => {
      life += 0.05;
      
      particles.forEach(particle => {
        // 물리
        particle.userData.velocity.y -= 0.8;
        particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.05));
        
        // 회전
        if (particle.userData.rotationSpeed) {
          particle.rotation.x += particle.userData.rotationSpeed.x;
          particle.rotation.y += particle.userData.rotationSpeed.y;
          particle.rotation.z += particle.userData.rotationSpeed.z;
        }
        
        // 페이드 아웃
        particle.userData.life -= 0.012;
        if (particle.material.opacity !== undefined) {
          particle.material.opacity = Math.max(0, particle.userData.life);
        }
        
        // 먼지 확산
        if (particle.userData.isDust) {
          particle.scale.multiplyScalar(1.08);
        }
        
        // 연기 확산
        if (particle.geometry.type === 'SphereGeometry' && 
            particle.material.color.getHex() === 0x444444) {
          particle.scale.multiplyScalar(1.05);
        }
        
        // 땅 충돌
        if (particle.position.y < 2) {
          particle.position.y = 2;
          particle.userData.velocity.multiplyScalar(0.2);
        }
      });
      
      if (life > duration) {
        particles.forEach(p => this.scene.remove(p));
        clearInterval(interval);
        if (callback) callback();
      }
    }, 50);
  }
  
}
