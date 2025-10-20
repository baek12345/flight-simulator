import * as THREE from 'three';

export class BombManager {
  constructor(scene) {
    this.scene = scene;
    this.bombs = [];
  }

  dropBomb(startPos, airplane) {
    const bomb = this.createBomb();
    bomb.position.copy(startPos);
    this.scene.add(bomb);

    const bombData = {
      mesh: bomb,
      velocity: new THREE.Vector3(0, -5, 0),
      life: 30,
      rotation: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      hitTarget: null,
      mass: 1.0,
      drag: 0.02
    };

    const forward = airplane.getForwardDirection().clone().multiplyScalar(10);
    bombData.velocity.add(forward);

    this.bombs.push(bombData);
    console.log('💣 Bomb dropped');
  }

  createBomb() {
    const bomb = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6, roughness: 0.4 })
    );
    body.castShadow = true;
    bomb.add(body);

    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    tail.position.y = -0.45;
    tail.rotation.x = Math.PI;
    bomb.add(tail);

    return bomb;
  }

  update(deltaTime, world) {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const b = this.bombs[i];
      b.life -= deltaTime;
      if (b.life <= 0) {
        this.scene.remove(b.mesh);
        this.bombs.splice(i, 1);
        continue;
      }

      const gravity = -9.8;
      const dragAcc = b.velocity.clone().multiplyScalar(-b.drag);
      b.velocity.y += gravity * deltaTime / b.mass;
      b.velocity.add(dragAcc.multiplyScalar(deltaTime));
      b.mesh.position.add(b.velocity.clone().multiplyScalar(deltaTime));
      b.mesh.rotation.x += b.rotation.x;
      b.mesh.rotation.y += b.rotation.y;
      b.mesh.rotation.z += b.rotation.z;

      const collision = world.checkCollision(b.mesh.position);
      if (collision || b.mesh.position.y <= 1.5) {
        this.createBombExplosion(b.mesh.position);
        this.scene.remove(b.mesh);
        this.bombs.splice(i, 1);
      }
    }
  }

  createBombExplosion(position) {
    const explosionGeo = new THREE.SphereGeometry(4, 24, 24);
    const explosionMat = new THREE.MeshBasicMaterial({
      color: 0xffaa33, transparent: true, opacity: 1
    });
    const explosion = new THREE.Mesh(explosionGeo, explosionMat);
    explosion.position.copy(position);
    this.scene.add(explosion);

    let scale = 1;
    const explosionInterval = setInterval(() => {
      scale += 0.8;
      explosion.scale.set(scale, scale, scale);
      explosionMat.opacity -= 0.06;
      if (explosionMat.opacity <= 0) {
        this.scene.remove(explosion);
        clearInterval(explosionInterval);
      }
    }, 50);

    const flash = new THREE.PointLight(0xffcc77, 30, 200);
    flash.position.copy(position);
    this.scene.add(flash);

    let intensity = 30;
    const flashInterval = setInterval(() => {
      intensity -= 3;
      flash.intensity = Math.max(0, intensity);
      if (flash.intensity <= 0) {
        this.scene.remove(flash);
        clearInterval(flashInterval);
      }
    }, 50);
  }

  clear() {
    this.bombs.forEach(b => this.scene.remove(b.mesh));
    this.bombs = [];
  }
}
