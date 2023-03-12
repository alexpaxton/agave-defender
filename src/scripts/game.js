import PlayerShip from "./player_ship";
import EnemyShip from "./enemy_ship";
import Boss from "./boss";

class Game {
  constructor(canvas) {
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    // this.enemyWave = 0;
    this.enemyWave = 1;

    // add a delay to this later after implementing start screen
    // this.addEnemyOnCooldown = true;
    this.addEnemyOnCooldown = false;

    this.addedEnemies = 0;
    this.enemiesRemaining = 0;
    this.enemyWaveCount = 0;

    this.score = 0;
    this.gameOver = false;

    this.player = new PlayerShip(this);
    
    this.allMovingObjects = {
      player: this.player,
      enemies: [],
      projectiles: [],
      particles: []
    };

    // this.boss = new Boss(this);
    const bossInfo = document.getElementById("boss-info");
    bossInfo.style.display = 'none';
    this.bossFight = false;
  }

  step(timeDelta) {
    this.clearNulls();
    this.checkCollisions();
    this.updateInformation();
    this.setEnemies();  // maybe add if else to check for boss fight status or add enemy waves
    this.moveObjects(timeDelta);
  }

  // null vs splicing testing
  clearNulls() {
    for (let key in this.allMovingObjects) {
      const objectsValue = this.allMovingObjects[key]
      if (objectsValue instanceof Array) {
        const filtered = objectsValue.filter(el => el);
        this.allMovingObjects[key] = filtered;
      }
    }
  }

  // moveObjects() {
  //   for (let key in this.allMovingObjects) {
  //     const objectsValue = this.allMovingObjects[key]
  //     if (objectsValue instanceof Array) {
  //       objectsValue.forEach(obj => {
  //         if (obj) obj.move()
  //       });
  //     } else {
  //       if (objectsValue) objectsValue.move();
  //     }
  //   }
  // }

  moveObjects(timeDelta) {
    for (let key in this.allMovingObjects) {
      const objectsValue = this.allMovingObjects[key]
      if (objectsValue instanceof Array) {
        objectsValue.forEach(obj => {
          if (obj) obj.move(timeDelta)
        });
      } else {
        if (objectsValue) objectsValue.move(timeDelta);
      }
    }
  }

  checkCollisions() {
    // check projectile collisions
    // check projectile hitbox vs enemy hitboxes
    this.allMovingObjects.projectiles.forEach((projectile) => {
      if (projectile) {
        if (projectile.origin === "player") {
          this.allMovingObjects.enemies.forEach((enemy) => {
            if (enemy) enemy.collideCheck(projectile);
          })
        } else {
          this.player.collideCheck(projectile);
        }
      }
    })

    // check enemy to player collisions
    // check player hitbox vs enemy hitboxes
    this.allMovingObjects.enemies.forEach((enemy) => {
      if (enemy) this.player.collideCheck(enemy);
    })
  }

  draw(ctx) {
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    for (let key in this.allMovingObjects) {
      const objectsValue = this.allMovingObjects[key]
      if (objectsValue instanceof Array) {
        objectsValue.forEach(obj => {
          if (obj) obj.draw(ctx);
        });
      } else {
        if (objectsValue) objectsValue.draw(ctx);
      }
    }
  }

  updateInformation() {
    // update score here later

    this.updateHealthBar('player');

    if (this.bossFight) {
      this.updateHealthBar('boss');
    } else {
      const waveSpan = document.getElementById("wave-number");
      waveSpan.innerText = this.enemyWave;

      const enemiesRemainingSpan = document.getElementById("enemies-remaining");
      enemiesRemainingSpan.innerText = this.enemiesRemaining;
    }
  }

  updateHealthBar(type) {
    const obj = (type === 'player' ? this.player : this.boss);
    const healthBar = document.getElementById(`${type}-health-bar`);

    const healthPoint = document.createElement("li");
    healthPoint.setAttribute("class", `${type}-health-point`);

    let health = obj.health;
    if (type === 'boss') {
      health = Math.ceil(health / 10);
    }

    if (healthBar.children.length < health) {
      for (let i = 0; i < health - healthBar.children.length; i++) {
        healthBar.appendChild(healthPoint);
      }
    } else if ((healthBar.children.length > health)) {
      for (let i = 0; i < healthBar.children.length - health; i++) {
        // console.log(healthBar.lastChild);
        const lastChild = healthBar.lastChild;
        if (lastChild) healthBar.removeChild(healthBar.lastChild);
      }
    }
  }

  setEnemies() {
    if (this.enemiesRemaining === 0) {
      if (this.enemyWave < 10) {
        this.enemyWave += 1;
        this.enemyWaveCount = this.enemyWave * 5;
        this.enemiesRemaining = this.enemyWaveCount;
        this.addedEnemies = 0;

        // heal player in between rounds (no more than 10)
        // can also heal based on score or enemies killed this round
        this.player.health += Math.min(3, 10-this.player.health);

      } else if (!this.bossFight) {
        // this.bossFight = true;
        // this.player.disabled = true;
        // setTimeout(this.setBoss.bind(this), 1000);
        this.setBoss();
      }
      // might change to delay after start
      // this.resetAddEnemyCooldown();
    }

    if (!this.bossfight && !this.addEnemyOnCooldown) {
      const remaining = this.enemyWaveCount - this.addedEnemies;

      let numNewEnemies;
      if (remaining < 10) {
        numNewEnemies = remaining;
      } else {
        numNewEnemies = Math.floor(Math.random() * (10 - 3) + 3);
      }
      this.addedEnemies += numNewEnemies;

      for (let i = 0; i < numNewEnemies; i++) {
        const randPosX = Math.floor(Math.random() * this.canvasWidth);

        // might change to increment difficulty per wave
        // const randSpeed = Math.floor(Math.random() * (5 - 2) + 2);
        const randSpeed = Math.random() * (5 - 2) + 2;
        const randCooldown = Math.floor(Math.random() * (1000 - 450) + 450);
        const newEnemy = new EnemyShip(this, randPosX, randSpeed, randCooldown);
        this.allMovingObjects.enemies.push(newEnemy);
      }

      this.addEnemyOnCooldown = true;
      const randTimeOut = Math.random() * (3000 - 1000) + 1000;
      setTimeout(this.resetAddEnemyCooldown.bind(this), randTimeOut);
    }
  }

  resetAddEnemyCooldown() {
    this.addEnemyOnCooldown = false;
  }

  setBoss() {
    this.player.disabled = true;

    if (this.allMovingObjects.projectiles.length === 0) {
      this.boss = new Boss(this);
      this.switchGameInformation();
      this.allMovingObjects.enemies.push(this.boss);
      this.bossFight = true;
    }
  }

  switchGameInformation() {
    const bossInfo = document.getElementById("boss-info");
    const waveInfo = document.getElementById("wave-info");
    waveInfo.style.display = 'none';
    bossInfo.style.display = 'flex';
  }
}

export default Game;