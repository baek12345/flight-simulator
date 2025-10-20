import * as THREE from 'three';
import { Airplane } from './Airplane.js';
import { World } from './World.js';
import { CheckpointManager } from './CheckpointManager.js';
import { ParticleSystem } from './ParticleSystem.js';
import { CameraController } from './CameraController.js';
import { HUD } from './HUD.js';
import { ExplosionManager } from './ExplosionManager.js';
import { MissileManager } from './MissileManager.js';
import { BombManager } from './BombManager.js';

let scene, camera, renderer;
let airplane, world, checkpointManager, particles, cameraController, hud, explosionManager, missileManager, bombManager;
let keys = {};
let gameStarted = false;
let gameTime = 0;
let score = 0;
let cameraFrozen = false;
let frozenCameraPosition = null;
let frozenCameraTarget = null;

const cameraOffsets = [
  { y: 5, z: 12 },
  { y: 3, z: 8 },
  { y: 7, z: 16 }
];

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // 기존 renderer 설정 이후 추가
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = 0;
renderer.domElement.style.left = 0;
renderer.domElement.style.zIndex = 0; // 🔽 게임 화면 뒤로
document.body.appendChild(renderer.domElement);


  explosionManager = new ExplosionManager(scene);
  missileManager = new MissileManager(scene);
  bombManager = new BombManager(scene);
  world = new World(scene);

  airplane = new Airplane();
  airplane.missileManager = missileManager;
  airplane.bombManager = bombManager;
  scene.add(airplane.mesh);

// ✅ 초기 카메라 위치 지정 (카메라가 비행기 바로 뒤를 보게)
  camera.position.set(
  airplane.mesh.position.x,
  airplane.mesh.position.y + 5,
  airplane.mesh.position.z + 15
  );
  camera.lookAt(airplane.mesh.position);

  checkpointManager = new CheckpointManager(scene);
  particles = new ParticleSystem(scene);
  cameraController = new CameraController(camera, airplane.mesh, cameraOffsets);
  hud = new HUD();

  document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyC') {
      cameraController.cycleMode();
      keys['KeyC'] = false;
    }
    if (e.code === 'KeyR') {
      cameraFrozen = false;
      frozenCameraPosition = null;
      frozenCameraTarget = null;
    }
  });

  document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  if (!gameStarted) return;

  const deltaTime = clock.getDelta();
  gameTime += deltaTime;

  missileManager.update(deltaTime, world);
  bombManager.update(deltaTime, world);

  const flightStatus = airplane.update(deltaTime, keys);
  const collisionObject = world.checkCollision(airplane.mesh.position);
  const crashed = flightStatus === 'crashed' || collisionObject !== null;

  if (crashed && !cameraFrozen) {
    cameraFrozen = true;
    frozenCameraPosition = camera.position.clone();
    frozenCameraTarget = airplane.mesh.position.clone();

    explosionManager.createAirplaneExplosion(airplane.mesh.position, airplane);
    if (collisionObject === 'ground') explosionManager.createGroundExplosion(airplane.mesh.position);
    else if (collisionObject && collisionObject !== 'tree' && !collisionObject.mesh)
      explosionManager.createBuildingExplosion(collisionObject);
  }

  world.update(airplane.mesh.position, deltaTime);
  const scoreGained = checkpointManager.update(airplane.mesh.position);
  score += scoreGained;

  if (airplane.mesh.visible) {
    const exhaustPos = airplane.getExhaustPosition();
    const forward = airplane.getForwardDirection();
    particles.emit(exhaustPos, forward, airplane.throttle);
  }
  particles.update(deltaTime);

  if (cameraFrozen) {
    camera.position.copy(frozenCameraPosition);
    camera.lookAt(frozenCameraTarget);
  } else {
    cameraController.update(airplane);
  }

  hud.update(airplane, score, gameTime, checkpointManager.getCurrentCheckpoint());
  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start-button');
  const startScreen = document.getElementById('controls-info');

  startButton.addEventListener('click', () => {
    console.log('🚀 Starting game...');
    startScreen.style.display = 'none';
    gameStarted = true;
    init();      // ✅ 초기화 실행
    animate();   // ✅ 루프 시작
  });
});
