export class HUD {
  constructor() {
    this.speedEl = document.getElementById('speed');
    this.altitudeEl = document.getElementById('altitude');
    this.throttleEl = document.getElementById('throttle');
    this.scoreEl = document.getElementById('score');
    this.timerEl = document.getElementById('timer');
    this.checkpointEl = document.getElementById('checkpoint');
  }
  
  update(airplane, score, gameTime, checkpointText) {
    const speed = airplane.velocity.length();
    this.speedEl.textContent = speed.toFixed(1);
    this.altitudeEl.textContent = airplane.mesh.position.y.toFixed(0);
    this.throttleEl.textContent = (airplane.throttle * 100).toFixed(0);
    this.scoreEl.textContent = score;
    
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    this.timerEl.textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    this.checkpointEl.textContent = checkpointText;
  }
}
