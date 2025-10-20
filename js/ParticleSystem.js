import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      color: 0xff8800,
      size: 1,
      transparent: true,
      opacity: 0.6
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }
  
  emit(position, velocity, throttle) {
    if (Math.random() > throttle) return;
    
    const particle = {
      position: position.clone(),
      velocity: velocity.clone().multiplyScalar(-0.5),
      life: 1.0,
      size: 0.5
    };
    
    this.particles.push(particle);
    
    if (this.particles.length > 200) {
      this.particles.shift();
    }
  }
  
  update(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.position.add(p.velocity.clone().multiplyScalar(deltaTime * 10));
      p.life -= deltaTime * 0.5;
      p.size += deltaTime * 2;
      return p.life > 0;
    });
    
    const positions = new Float32Array(this.particles.length * 3);
    this.particles.forEach((p, i) => {
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;
    });
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.attributes.position.needsUpdate = true;
  }
}
