import * as THREE from 'three';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.clouds = [];
    this.trees = [];
    this.buildings = [];
    this.roads = [];
    this.iceCreamTrucks = [];
    this.animals = [];
    this.trafficLights = [];
    this.crosswalks = [];
    
    this.createSky();
    this.createLighting();
    this.createTerrain();
    this.createRoads();
    this.createTrafficLights();
    this.createCrosswalks();
    this.createClouds();
    this.createTrees();
    this.createBuildings();
    this.createIceCreamTrucks();
    this.createAnimals();
  }
  
  createSky() {
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 1000, 5000);
  }
  
  createLighting() {
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(100, 200, 100);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -200;
    dirLight.shadow.camera.right = 200;
    dirLight.shadow.camera.top = 200;
    dirLight.shadow.camera.bottom = -200;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);
    
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3a5f0b, 0.6);
    this.scene.add(hemiLight);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
  }
  
  createTerrain() {
    const groundGeo = new THREE.PlaneGeometry(10000, 10000);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x4a7c2c,
      roughness: 0.8
    });
    
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }
  
  createRoads() {
    const roadMat = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.9
    });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const roadWidth = 15;
    const roadLength = 2000;
    const spacing = 300;
    
    // 수평 도로
    for (let i = -5; i <= 5; i++) {
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(roadLength, roadWidth),
        roadMat
      );
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0.6, i * spacing);
      road.receiveShadow = true;
      
      for (let j = -10; j <= 10; j++) {
        const line = new THREE.Mesh(
          new THREE.PlaneGeometry(30, 1),
          lineMat
        );
        line.rotation.x = -Math.PI / 2;
        line.position.set(j * 100, 0.61, i * spacing);
        road.add(line);
      }
      
      this.roads.push(road);
      this.scene.add(road);
    }
    
    // 수직 도로
    for (let i = -5; i <= 5; i++) {
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(roadWidth, roadLength),
        roadMat
      );
      road.rotation.x = -Math.PI / 2;
      road.position.set(i * spacing, 0.6, 0);
      road.receiveShadow = true;
      
      for (let j = -10; j <= 10; j++) {
        const line = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 30),
          lineMat
        );
        line.rotation.x = -Math.PI / 2;
        line.position.set(i * spacing, 0.61, j * 100);
        road.add(line);
      }
      
      this.roads.push(road);
      this.scene.add(road);
    }
  }
  
  createTrafficLights() {
    const spacing = 300;
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        const light = this.createTrafficLight();
        light.position.set(i * spacing + 10, 0, j * spacing + 10);
        this.trafficLights.push(light);
        this.scene.add(light);
      }
    }
  }
  
  createTrafficLight() {
    const light = new THREE.Group();
    
    const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 5);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.5;
    pole.castShadow = true;
    light.add(pole);
    
    const boxGeo = new THREE.BoxGeometry(0.6, 1.8, 0.4);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = 5.5;
    box.castShadow = true;
    light.add(box);
    
    const circleGeo = new THREE.CircleGeometry(0.2, 16);
    const redMat = new THREE.MeshBasicMaterial({ 
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1
    });
    const redLight = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1.0
  });

    
    const yellowMat = new THREE.MeshBasicMaterial({ 
      color: 0x333333,
      emissive: 0xffff00,
      emissiveIntensity: 0
    });
    const yellowLight = new THREE.Mesh(circleGeo, yellowMat);
    yellowLight.position.set(0, 5.5, 0.21);
    light.add(yellowLight);
    
    const greenMat = new THREE.MeshBasicMaterial({ 
      color: 0x333333,
      emissive: 0x00ff00,
      emissiveIntensity: 0
    });
    const greenLight = new THREE.Mesh(circleGeo, greenMat);
    greenLight.position.set(0, 5, 0.21);
    light.add(greenLight);
    
    light.userData = {
      redLight: redMat,
      yellowLight: yellowMat,
      greenLight: greenMat,
      timer: Math.random() * 10,
      state: 'red'
    };
    
    return light;
  }
  
  createCrosswalks() {
    const spacing = 300;
    const crosswalkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        for (let k = 0; k < 5; k++) {
          const stripe1 = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 10),
            crosswalkMat
          );
          stripe1.rotation.x = -Math.PI / 2;
          stripe1.position.set(
            i * spacing + k * 2.5 - 5,
            0.62,
            j * spacing + 15
          );
          this.crosswalks.push(stripe1);
          this.scene.add(stripe1);
          
          const stripe2 = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 2),
            crosswalkMat
          );
          stripe2.rotation.x = -Math.PI / 2;
          stripe2.position.set(
            i * spacing + 15,
            0.62,
            j * spacing + k * 2.5 - 5
          );
          this.crosswalks.push(stripe2);
          this.scene.add(stripe2);
        }
      }
    }
  }
  
  createIceCreamTrucks() {
    for (let i = 0; i < 5; i++) {
      const truck = this.createIceCreamTruck();
      const roadIndex = Math.floor(Math.random() * this.roads.length);
      const roadPosition = this.roads[roadIndex].position;
      
      truck.position.set(
        roadPosition.x + (Math.random() - 0.5) * 100,
        1.5,
        roadPosition.z + (Math.random() - 0.5) * 100
      );
      truck.rotation.y = Math.random() * Math.PI * 2;
      truck.userData = {
        isVehicle: true,
        width: 8,
        height: 6,
        depth: 4,
        radius: 6
      };
      
      this.iceCreamTrucks.push(truck);
      this.scene.add(truck);
    }
  }
  
  createIceCreamTruck() {
    const truck = new THREE.Group();
    
    const bodyGeo = new THREE.BoxGeometry(4, 3, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0xff69b4,
      metalness: 0.3,
      roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.5;
    body.castShadow = true;
    truck.add(body);
    
    const cabGeo = new THREE.BoxGeometry(4, 2, 2);
    const cabMat = new THREE.MeshStandardMaterial({ 
      color: 0xffb6c1,
      metalness: 0.2,
      roughness: 0.6
    });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 2.5, 2.5);
    cab.castShadow = true;
    truck.add(cab);
    
    const windowMat = new THREE.MeshStandardMaterial({ 
      color: 0x4488ff,
      transparent: true,
      opacity: 0.6,
      metalness: 0.8,
      roughness: 0.2
    });
    const frontWindow = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 1.5),
      windowMat
    );
    frontWindow.position.set(0, 2.5, 3.51);
    truck.add(frontWindow);
    
    const wheelMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.9
    });
    const wheelPositions = [[-1.5, 0.5, 2], [1.5, 0.5, 2], [-1.5, 0.5, -2], [1.5, 0.5, -2]];
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16),
        wheelMat
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.castShadow = true;
      truck.add(wheel);
    });
    
    const coneGeo = new THREE.ConeGeometry(0.5, 1.5, 16);
    const coneMat = new THREE.MeshStandardMaterial({ 
      color: 0xffaa00,
      roughness: 0.6
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(0, 4, 0);
    truck.add(cone);
    
    const scoopGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const scoopMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.4
    });
    const scoop = new THREE.Mesh(scoopGeo, scoopMat);
    scoop.position.set(0, 4.8, 0);
    truck.add(scoop);
    
    return truck;
  }
  
  createClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 1
    });
    
    for (let i = 0; i < 50; i++) {
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(15 + Math.random() * 10, 8, 8),
        cloudMat
      );
      cloud.position.set(
        (Math.random() - 0.5) * 2000,
        30 + Math.random() * 50,
        (Math.random() - 0.5) * 2000
      );
      cloud.scale.set(1, 0.6, 1);
      this.clouds.push(cloud);
      this.scene.add(cloud);
    }
  }
  
  createTrees() {
    for (let cluster = 0; cluster < 10; cluster++) {
      const clusterX = (Math.random() - 0.5) * 3000;
      const clusterZ = (Math.random() - 0.5) * 3000;
      
      for (let i = 0; i < 50; i++) {
        const tree = new THREE.Group();
        
        const trunkGeo = new THREE.CylinderGeometry(0.5, 0.7, 5 + Math.random() * 3);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.castShadow = true;
        tree.add(trunk);
        
        const foliageType = Math.random() > 0.5 ? 'cone' : 'sphere';
        const foliageGeo = foliageType === 'cone'
          ? new THREE.ConeGeometry(2 + Math.random(), 4 + Math.random() * 2, 8)
          : new THREE.SphereGeometry(2.5 + Math.random(), 8, 8);
        const foliageMat = new THREE.MeshStandardMaterial({ 
          color: 0x228B22,
          roughness: 0.9
        });
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.y = 5;
        foliage.castShadow = true;
        tree.add(foliage);
        
        tree.position.set(
          clusterX + (Math.random() - 0.5) * 200,
          3,
          clusterZ + (Math.random() - 0.5) * 200
        );
        
        this.trees.push(tree);
        this.scene.add(tree);
      }
    }
  }
  
  createBuildings() {
    const buildingColors = [0x888888, 0x666666, 0x999999, 0x777777, 0x555555];
    
    for (let i = 0; i < 10; i++) {
      const building = new THREE.Group();
      
      const width = 20 + Math.random() * 20;
      const height = 50 + Math.random() * 80;
      const depth = 20 + Math.random() * 20;
      
      const buildingGeo = new THREE.BoxGeometry(width, height, depth);
      const buildingMat = new THREE.MeshStandardMaterial({ 
        color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
        roughness: 0.8,
        metalness: 0.2
      });
      
      const mainBuilding = new THREE.Mesh(buildingGeo, buildingMat);
      mainBuilding.position.y = height / 2;
      mainBuilding.castShadow = true;
      mainBuilding.receiveShadow = true;
      building.add(mainBuilding);
      
      this.addWindows(building, width, height, depth);
      
      if (Math.random() > 0.5) {
        this.addAntenna(building, height);
      }
      
      building.position.set(
        (Math.random() - 0.5) * 2500,
        0,
        (Math.random() - 0.5) * 2500
      );
      
      building.userData = {
        isObstacle: true,
        width: width,
        height: height,
        depth: depth,
        radius: Math.sqrt(width * width + depth * depth) / 2
      };
      
      this.buildings.push(building);
      this.scene.add(building);
    }
  }
  
  addWindows(building, width, height, depth) {
    const windowMat = new THREE.MeshBasicMaterial({ 
      color: 0xffff66,
      emissive: 0xffff00,
      emissiveIntensity: 0.4
    });
    
    const windowSize = 2;
    const spacing = 6;
    const frontRows = Math.floor(height / spacing) - 1;
    const frontCols = Math.floor(width / spacing);
    
    for (let row = 1; row <= frontRows; row++) {
      for (let col = 0; col < frontCols; col++) {
        if (Math.random() > 0.3) {
          const windowGeo = new THREE.PlaneGeometry(windowSize, windowSize);
          const window1 = new THREE.Mesh(windowGeo, windowMat);
          window1.position.set(
            -width/2 + (col + 0.5) * spacing,
            height/2 - row * spacing,
            depth/2 + 0.1
          );
          building.add(window1);
        }
      }
    }
  }
  
  addAntenna(building, buildingHeight) {
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const antennaGeo = new THREE.CylinderGeometry(0.2, 0.2, 10);
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.y = buildingHeight + 5;
    building.add(antenna);
    
    const dishGeo = new THREE.CylinderGeometry(2, 2, 0.5);
    const dish = new THREE.Mesh(dishGeo, antennaMat);
    dish.position.y = buildingHeight + 8;
    building.add(dish);
  }
  
  createAnimals() {
    for (let i = 0; i < 10; i++) {
      this.animals.push(this.createCow());
    }
    for (let i = 0; i < 15; i++) {
      this.animals.push(this.createSheep());
    }
    for (let i = 0; i < 10; i++) {
      this.animals.push(this.createPig());
    }
  }
  
  createCow() {
    const cow = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(3, 2, 4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.5;
    body.castShadow = true;
    cow.add(body);
    
    const spotMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.8 });
    const spot = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 2), spotMat);
    spot.position.set(0, 1.5, 0.5);
    cow.add(spot);
    
    const headGeo = new THREE.BoxGeometry(1.5, 1.5, 2);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 2, 2.5);
    head.castShadow = true;
    cow.add(head);
    
    const hornGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
    const leftHorn = new THREE.Mesh(hornGeo, spotMat);
    leftHorn.position.set(-0.5, 2.8, 2.5);
    cow.add(leftHorn);
    
    const rightHorn = new THREE.Mesh(hornGeo, spotMat);
    rightHorn.position.set(0.5, 2.8, 2.5);
    cow.add(rightHorn);
    
    const legGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.5);
    const legPositions = [[-0.8, 0.75, 1.2], [0.8, 0.75, 1.2], [-0.8, 0.75, -1.2], [0.8, 0.75, -1.2]];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, spotMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      cow.add(leg);
    });
    
    cow.position.set(
      (Math.random() - 0.5) * 1500,
      0,
      (Math.random() - 0.5) * 1500
    );
    
    this.scene.add(cow);
    
    return {
      mesh: cow,
      type: 'cow',
      speed: 0.5 + Math.random() * 0.5,
      direction: Math.random() * Math.PI * 2,
      turnTimer: 0,
      radius: 2
    };
  }
  
  createSheep() {
    const sheep = new THREE.Group();
    const bodyGeo = new THREE.SphereGeometry(1.5, 12, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.2;
    body.scale.set(1, 0.8, 1.2);
    body.castShadow = true;
    sheep.add(body);
    
    const headMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });
    const headGeo = new THREE.SphereGeometry(0.8, 12, 12);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.2, 1.5);
    head.castShadow = true;
    sheep.add(head);
    
    const legGeo = new THREE.CylinderGeometry(0.2, 0.2, 1);
    const legPositions = [[-0.6, 0.5, 0.6], [0.6, 0.5, 0.6], [-0.6, 0.5, -0.6], [0.6, 0.5, -0.6]];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, headMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      sheep.add(leg);
    });
    
    sheep.position.set(
      (Math.random() - 0.5) * 1500,
      0,
      (Math.random() - 0.5) * 1500
    );
    
    this.scene.add(sheep);
    
    return {
      mesh: sheep,
      type: 'sheep',
      speed: 0.3 + Math.random() * 0.4,
      direction: Math.random() * Math.PI * 2,
      turnTimer: 0,
      radius: 1.5
    };
  }
  
  createPig() {
    const pig = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(2.5, 1.8, 3);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.2;
    body.castShadow = true;
    pig.add(body);
    
    const headGeo = new THREE.BoxGeometry(1.2, 1.2, 1.5);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 1.2, 1.8);
    head.castShadow = true;
    pig.add(head);
    
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.6 });
    const noseGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.rotation.z = Math.PI / 2;
    nose.position.set(0, 1.2, 2.5);
    pig.add(nose);
    
    const legGeo = new THREE.CylinderGeometry(0.25, 0.25, 1);
    const legPositions = [[-0.7, 0.5, 0.8], [0.7, 0.5, 0.8], [-0.7, 0.5, -0.8], [0.7, 0.5, -0.8]];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, bodyMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      pig.add(leg);
    });
    
    const tailGeo = new THREE.TorusGeometry(0.3, 0.1, 8, 12, Math.PI);
    const tail = new THREE.Mesh(tailGeo, bodyMat);
    tail.position.set(0, 1.5, -1.5);
    tail.rotation.x = Math.PI / 2;
    pig.add(tail);
    
    pig.position.set(
      (Math.random() - 0.5) * 1500,
      0,
      (Math.random() - 0.5) * 1500
    );
    
    this.scene.add(pig);
    
    return {
      mesh: pig,
      type: 'pig',
      speed: 0.4 + Math.random() * 0.5,
      direction: Math.random() * Math.PI * 2,
      turnTimer: 0,
      radius: 1.8
    };
  }
  
  updateAnimals(deltaTime, airplanePos) {
    this.animals.forEach(animal => {
      animal.turnTimer -= deltaTime;
      if (animal.turnTimer <= 0) {
        animal.direction += (Math.random() - 0.5) * 1;
        animal.turnTimer = 2 + Math.random() * 3;
      }
      
      const moveX = Math.cos(animal.direction) * animal.speed * deltaTime;
      const moveZ = Math.sin(animal.direction) * animal.speed * deltaTime;
      
      animal.mesh.position.x += moveX;
      animal.mesh.position.z += moveZ;
      animal.mesh.rotation.y = animal.direction + Math.PI / 2;
      
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
  
  updateTrafficLights(deltaTime) {
    this.trafficLights.forEach(light => {
      light.userData.timer += deltaTime;
      
      if (light.userData.state === 'red' && light.userData.timer > 5) {
        light.userData.state = 'green';
        light.userData.timer = 0;
        light.userData.redLight.emissiveIntensity = 0;
        light.userData.greenLight.emissiveIntensity = 1;
      } else if (light.userData.state === 'green' && light.userData.timer > 5) {
        light.userData.state = 'yellow';
        light.userData.timer = 0;
        light.userData.greenLight.emissiveIntensity = 0;
        light.userData.yellowLight.emissiveIntensity = 1;
      } else if (light.userData.state === 'yellow' && light.userData.timer > 2) {
        light.userData.state = 'red';
        light.userData.timer = 0;
        light.userData.yellowLight.emissiveIntensity = 0;
        light.userData.redLight.emissiveIntensity = 1;
      }
    });
  }
  
  update(airplanePos, deltaTime) {
    // 구름
    this.clouds.forEach(cloud => {
      cloud.position.x += 0.02;
      const distX = cloud.position.x - airplanePos.x;
      const distZ = cloud.position.z - airplanePos.z;
      if (distX > 1500) cloud.position.x = airplanePos.x - 1500;
      else if (distX < -1500) cloud.position.x = airplanePos.x + 1500;
      if (distZ > 1500) cloud.position.z = airplanePos.z - 1500;
      else if (distZ < -1500) cloud.position.z = airplanePos.z + 1500;
    });
    
    // 나무
    this.trees.forEach(tree => {
      const distX = tree.position.x - airplanePos.x;
      const distZ = tree.position.z - airplanePos.z;
      if (distX > 2000) tree.position.x = airplanePos.x - 2000 + Math.random() * 100;
      else if (distX < -2000) tree.position.x = airplanePos.x + 2000 + Math.random() * 100;
      if (distZ > 2000) tree.position.z = airplanePos.z - 2000 + Math.random() * 100;
      else if (distZ < -2000) tree.position.z = airplanePos.z + 2000 + Math.random() * 100;
    });
    
    // 건물
    this.buildings.forEach(building => {
      const distX = building.position.x - airplanePos.x;
      const distZ = building.position.z - airplanePos.z;
      if (distX > 1500) building.position.x = airplanePos.x - 1500 + Math.random() * 300;
      else if (distX < -1500) building.position.x = airplanePos.x + 1500 + Math.random() * 300;
      if (distZ > 1500) building.position.z = airplanePos.z - 1500 + Math.random() * 300;
      else if (distZ < -1500) building.position.z = airplanePos.z + 1500 + Math.random() * 300;
    });
    
    // 트럭
    this.iceCreamTrucks.forEach(truck => {
      const distX = truck.position.x - airplanePos.x;
      const distZ = truck.position.z - airplanePos.z;
      if (distX > 1200) truck.position.x = airplanePos.x - 1200 + Math.random() * 200;
      else if (distX < -1200) truck.position.x = airplanePos.x + 1200 + Math.random() * 200;
      if (distZ > 1200) truck.position.z = airplanePos.z - 1200 + Math.random() * 200;
      else if (distZ < -1200) truck.position.z = airplanePos.z + 1200 + Math.random() * 200;
    });
    
    // 신호등 (애니메이션만, 위치 고정)
    this.updateTrafficLights(deltaTime);
    
    // 동물
    this.updateAnimals(deltaTime, airplanePos);
    
    // 지형
    this.ground.position.x = airplanePos.x;
    this.ground.position.z = airplanePos.z;
  }
  
  checkCollision(airplanePos) {
    // 지면 충돌
    if (airplanePos.y < 2) {
      return 'ground';
    }
    
    // 건물
    for (const building of this.buildings) {
      const dx = airplanePos.x - building.position.x;
      const dz = airplanePos.z - building.position.z;
      const distance2D = Math.sqrt(dx * dx + dz * dz);
      const minDist = building.userData.radius + 10;
      if (distance2D < minDist && airplanePos.y < building.userData.height + 5) {
        return building;
      }
    }
    
    // 트럭
    for (const truck of this.iceCreamTrucks) {
      const dx = airplanePos.x - truck.position.x;
      const dz = airplanePos.z - truck.position.z;
      const distance2D = Math.sqrt(dx * dx + dz * dz);
      const minDist = truck.userData.radius + 8;
      if (distance2D < minDist && airplanePos.y < 10) {
        return truck;
      }
    }
    
    // 동물
    if (airplanePos.y < 10) {
      for (const animal of this.animals) {
        const dx = airplanePos.x - animal.mesh.position.x;
        const dz = airplanePos.z - animal.mesh.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance < animal.radius + 8 && airplanePos.y < 5) {
          return animal;
        }
      }
    }
    
    // 나무
    if (airplanePos.y < 15) {
      for (const tree of this.trees) {
        const dx = airplanePos.x - tree.position.x;
        const dz = airplanePos.z - tree.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance < 6) {
          return 'tree';
        }
      }
    }
    
    return null;
  }
}
