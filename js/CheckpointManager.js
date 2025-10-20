import * as THREE from 'three';

export class CheckpointManager {
  constructor(scene) {
    this.scene = scene;
    this.checkpoints = [];
    this.currentIndex = 0;
    this.totalCheckpoints = 10;
    this.createCheckpoints();
  }
  
  createCheckpoints() {
    for (let i = 0; i < this.totalCheckpoints; i++) {
      const geometry = new THREE.TorusGeometry(10, 1, 16, 32);
      const material = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0x00ff00 : 0xffff00,
        emissive: i === 0 ? 0x00ff00 : 0xffff00,
        emissiveIntensity: 0.8
      });
      
      const ring = new THREE.Mesh(geometry, material);
      ring.position.set(
        Math.sin(i * 0.5) * 300,
        50 + i * 15,
        -100 - i * 100
      );
      ring.rotation.y = i * 0.3;
      
      this.checkpoints.push(ring);
      this.scene.add(ring);
    }
  }
  
  update(airplanePos) {
    if (this.currentIndex >= this.totalCheckpoints) return 0;
    
    const current = this.checkpoints[this.currentIndex];
    const distance = airplanePos.distanceTo(current.position);
    
    let scoreGained = 0;
    if (distance < 12) {
      scoreGained = this.onCheckpointPassed();
    }
    
    // Animate current checkpoint
    current.rotation.x += 0.02;
    current.rotation.z += 0.01;
    
    return scoreGained;
  }
  
  onCheckpointPassed() {
    this.checkpoints[this.currentIndex].material.color.set(0x888888);
    this.checkpoints[this.currentIndex].material.emissive.set(0x444444);
    
    this.currentIndex++;
    
    if (this.currentIndex < this.totalCheckpoints) {
      this.checkpoints[this.currentIndex].material.color.set(0x00ff00);
      this.checkpoints[this.currentIndex].material.emissive.set(0x00ff00);
    }
    
    return 100; // Score gained
  }
  
  getCurrentCheckpoint() {
    return `${this.currentIndex}/${this.totalCheckpoints}`;
  }
}
