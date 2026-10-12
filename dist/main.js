/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
!function() {

;// CONCATENATED MODULE: ./src/scripts/utils.js
// vector and collision math related helper functions go here

// rectangle to rectangle collision 
// takes in 2 box objects that have x/y positions, width, and height
function rectangleCollision(box1, box2) {
  return box1.x < box2.x + box2.width && box1.x + box1.width > box2.x && box1.y < box2.y + box2.height && box1.height + box1.y > box2.y;
}

// angled rectangle collision (seperate axis theorem)

// rectangle to circle collision

// circle to circle collision

// vector scaling calculation
function vectorScale(vector, newMagnitude) {
  const magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
  const scale = newMagnitude / magnitude;
  return [vector[0] * scale, vector[1] * scale];
}

// vector calculation between two points

// new angle calculation
;// CONCATENATED MODULE: ./src/scripts/moving_object.js
// MovingObject is the top parent class for ships, projectiles, explosions, etc.


class MovingObject {
  // for smoothing gameplay based on fps
  static NORMAL_FRAME_TIME_DELTA = 1000 / 60;

  // takes in an argument object with the following:
  constructor(argsObject) {
    this.position = argsObject["position"]; // initial canvas position [int, int]
    this.velocity = argsObject["velocity"]; // initial velocity [int, int]
    this.speed = argsObject["speed"]; // initial speed
    this.health = argsObject["health"]; // initial health
    this.game = argsObject["game"]; // Game object
    this.width = argsObject["width"]; // image width
    this.height = argsObject["height"]; // image height
    this.image = argsObject["image"]; // image url
    this.type = argsObject["type"]; // type can be 'enemy', 'boss', 'player', or 'explosion'
    this.rotationAngle = argsObject["rotation"] || 0; // (optional) image rotation angle in degrees

    // stores itself in the Game with an id
    this.id = this.game.idCounter++;
    this.game.allMovingObjects[this.type][this.id] = this;
  }
  draw(ctx) {
    // ctx.drawImage(this.image, this.position[0], this.position[1], this.width, this.height);

    // rotate from center
    const [x, y] = this.position;
    const [centerX, centerY] = [x + this.width / 2, y + this.height / 2];
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.PI / 180 * this.rotationAngle);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(this.image, x, y, this.width, this.height);
    ctx.restore();
  }

  // checks collisions against all hitboxes of the other MovingObject
  collideCheck(otherObj) {
    // hitBoxCollisions is used by subclasses with more complex logic
    const hitBoxCollisions = [];
    this.getHitbox().forEach((thisBox, idx) => {
      const collisionFound = otherObj.getHitbox().some(otherBox => {
        // rectangleCollision is a utility function for mathematically determining collisions
        return rectangleCollision(thisBox, otherBox);
      });
      if (collisionFound) hitBoxCollisions.push(idx);
    });
    if (hitBoxCollisions.length > 0) {
      this.handleCollided(otherObj, hitBoxCollisions);
    }
  }

  // will be overwritten by subclasses with more complex logic
  handleCollided(otherObj) {
    const otherObjClass = otherObj.constructor.name;

    // three cases: ship to projectile, player to enemy, player to boss
    if (otherObjClass === "Projectile") {
      const damage = otherObj.health;
      otherObj.remove();
      this.damageTaken(damage);
    } else if (otherObjClass === "EnemyShip") {
      const damage = 1;
      this.damageTaken(damage);
    } else if (otherObjClass === "Boss") {
      const damage = 3;
      this.damageTaken(damage);
    }
  }
  getHitbox() {
    const [x, y] = this.position;
    const width = this.width;
    const height = this.height;
    return [{
      x: x,
      y: y,
      width: width,
      height: height
    }];
  }

  // movement is smoothed out during fps changes
  move(timeDelta) {
    this.updateVelocity();
    const velocityScale = timeDelta / MovingObject.NORMAL_FRAME_TIME_DELTA;
    const offsetX = this.velocity[0] * velocityScale;
    const offsetY = this.velocity[1] * velocityScale;
    const newX = this.position[0] + offsetX;
    const newY = this.position[1] + offsetY;
    this.handleBounds([newX, newY]);
  }

  // updates the position with a new [int, int]
  handleBounds(newPosition) {
    // to be changed in sub classes as needed
    this.position = newPosition;
  }
  updateVelocity() {
    // to be implemented in sub classes as needed
  }

  // these functions take in a y position as int
  inUpperYHeightBounds(y) {
    return y <= this.game.canvasHeight + this.height;
  }
  inUpperYBounds(y) {
    return y >= 0;
  }
  inLowerYBounds(y) {
    return y <= this.game.canvasHeight - this.height;
  }
  inYBounds(y) {
    return this.inUpperYBounds(y) && this.inLowerYBounds(y);
  }

  // these functions take in a x position as int
  inUpperXBounds(x) {
    return x >= 0;
  }
  inLowerXBounds(x) {
    return x <= this.game.canvasWidth - this.width;
  }
  inXBounds(x) {
    return this.inUpperXBounds(x) && this.inLowerXBounds(x);
  }

  // takes in a position as [int, int]
  inBounds(position) {
    return this.inXBounds(position[0]) && this.inYBounds(position[1]);
  }
  remove() {
    delete this.game.allMovingObjects[this.type][this.id];
  }
}
/* harmony default export */ var moving_object = (MovingObject);
;// CONCATENATED MODULE: ./src/scripts/projectile.js
// Top level class for all projectiles shot from ships


class Projectile extends moving_object {
  // args contains MovingObject args and an origin
  constructor(args) {
    // Projectile health determines damage dealt
    args.objArgs.type = "projectiles";
    super(args.objArgs);
    this.origin = args.origin; // a string of either 'player' or 'enemy'
  }

  // projectiles are also removed when they collide with ships, handled by Ship objects
  handleBounds(newPosition) {
    if (!this.inBounds(newPosition)) {
      super.remove();
    } else {
      this.position = newPosition;
    }
  }
}
/* harmony default export */ var projectile = (Projectile);
;// CONCATENATED MODULE: ./src/scripts/timer.js
// Timer class wraps setTimeouts with added pause and resume functionality

class Timer {
  // callback function to be called after the delay expires
  // delay is in milliseconds
  constructor(game, callback, delay) {
    // all Timers are kept tracked of in Game.timers
    this.game = game;
    this.id = this.game.idCounter++;
    this.game.timers[this.id] = this;

    //  Timers will also delete themselves after the callback is played
    this.timerCallback = () => {
      callback();
      delete this.game.timers[this.id];
    };
    this.startTime = Date.now();
    this.delay = delay;
    this.timeoutId = setTimeout(this.timerCallback.bind(this), this.delay);
  }

  // pause and resume simply clear and create setTimeouts with new remaining delays
  pause() {
    clearTimeout(this.timeoutId);
    this.delay -= Date.now() - this.startTime;
  }
  resume() {
    this.startTime = Date.now();
    this.timeoutId = setTimeout(this.timerCallback.bind(this), this.delay);
  }
  clear() {
    clearTimeout(this.timeoutId);
    delete this.game.timers[this.id];
  }
}
/* harmony default export */ var timer = (Timer);
;// CONCATENATED MODULE: ./src/scripts/ship.js
// Ship is the top parent class for player, enemy, and boss ships




class Ship extends moving_object {
  // takes in constructor argument objects for MovingObject and Projectile
  // and takes in an array of shooting pattern objects
  constructor(objArgs, projectileArgs, patternArgs) {
    super(objArgs);
    this.projectileArgs = projectileArgs;
    this.patternArgs = patternArgs;
  }

  // ships can have multiple projectile patterns and possible batch firing
  // each pattern has it's own cooldown
  shootProjectile() {
    this.patternArgs.forEach((pattern, idx) => {
      // fire pattern if off cooldown and ship in game bounds
      if (!pattern.onCooldown && this.inBounds(this.position)) {
        // batch firing
        for (let i = 0; i < pattern.batchFireNum; i++) {
          new timer(this.game, () => {
            // only fire if ship still alive when timer callback activates
            if (this.health > 0) {
              // create new Projectile at each position in the pattern
              pattern.positionDeltas.forEach(delta => {
                const [x, y] = this.position;
                const [dx, dy] = delta;
                const startPosition = [x + dx, y + dy];
                const projArgs = this.projectileArgs[pattern.projectileArgIndex];
                projArgs.objArgs.position = startPosition;
                new projectile(projArgs);
              });
            }
          }, pattern.batchFireInterval * i);
        }

        // set cooldown and start timer to reset it
        pattern.onCooldown = true;
        const batchCooldownOffset = pattern.batchFireInterval * pattern.batchFireNum;
        pattern.timer = new timer(this.game, this.resetCooldown.bind(this, idx), pattern.cooldown + batchCooldownOffset);
      }
    });
  }

  // takes in an index for the shooting patterns array
  resetCooldown(index) {
    this.patternArgs[index].onCooldown = false;
    this.patternArgs[index].timer = null;
  }
  damageTaken(damage) {
    this.health -= damage;
    if (this.health <= 0) this.remove();
  }
}
/* harmony default export */ var ship = (Ship);
;// CONCATENATED MODULE: ./src/scripts/explosion.js
// Explosion class handles different explosion types for death animations


class Explosion extends moving_object {
  // position and velocityDeltas are [int, int]
  // explosionType is a string of either "minor" or "major"
  constructor(game, size, position, explosionType, velocityDelta) {
    const image = document.createElement("img");

    // minor for enemy ships, major for player/boss death
    if (explosionType === "minor") {
      image.src = "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/dfd05171-57ad-4a36-9e7b-7110cdab1baf/explosion1.png";
    } else if (explosionType === "major") {
      image.src = "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/a8f574e9-b0db-4cb8-bc91-f626fae49fd6/explosion2.png";
    }
    const argsObj = {
      position: position,
      velocity: [0, 0],
      speed: 0,
      health: 0,
      game: game,
      width: size,
      height: size,
      image: image,
      type: "explosions"
    };
    super(argsObj);
    if (explosionType === "minor") {
      this.maxFrames = 20;
      this.imgSize = 192;
      this.cutSize = 5;
    } else if (explosionType === "major") {
      this.maxFrames = 48;
      this.imgSize = 240;
      this.cutSize = 8;
    }
    this.frame = 0;
    this.velocityDelta = velocityDelta;
  }

  // explosions are animated sprites with multiple frames
  draw(ctx) {
    const yOffset = Math.floor(this.frame / this.cutSize);
    const xOffset = this.frame % this.cutSize;
    ctx.drawImage(this.image, this.imgSize * xOffset, this.imgSize * yOffset, this.imgSize, this.imgSize, this.position[0], this.position[1], this.width, this.height);
    this.frame += 1;
    if (this.frame >= this.maxFrames) {
      this.remove();
    }
  }
  updateVelocity() {
    this.velocity[0] += this.velocityDelta[0];
    this.velocity[1] += this.velocityDelta[1];
  }
}
/* harmony default export */ var explosion = (Explosion);
;// CONCATENATED MODULE: ./src/scripts/player_ship.js
// The player, aka the Galactic Defender





class PlayerShip extends ship {
  static SPEED = 5;
  static MAX_HEALTH = 10;
  constructor(game) {
    // Ship/MovingObject related arguments
    let image = document.createElement("img");
    image.src = "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/48067fa2-57f9-42c8-baed-7207d4b4085c/player1.png";
    let width = 34;
    let height = 55;
    const objArgs = {
      width: width,
      height: height,
      position: [Math.floor(game.canvasWidth / 2), game.canvasHeight - height],
      velocity: [0, 0],
      speed: PlayerShip.SPEED,
      health: PlayerShip.MAX_HEALTH,
      game: game,
      image: image,
      type: "player"
    };

    // Projectile related arguments
    image = document.createElement("img");
    image.src = "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/f0cc2cc7-6f4f-4ecb-80d9-b13bbd04720c/enemy_projectile.png";
    const projectileArgs = [{
      objArgs: {
        velocity: [0, -10],
        speed: 10,
        health: 1,
        game: game,
        width: 5,
        height: 20,
        image: image
      },
      type: "bullet",
      origin: "player"
    }];

    // projectile pattern
    const patternArgs = [{
      positionDeltas: [[width / 2.3, 0]],
      batchFireNum: 1,
      batchFireInterval: 0,
      cooldown: 250,
      onCooldown: false,
      timer: null,
      projectileArgIndex: 0
    }];
    super(objArgs, projectileArgs, patternArgs);

    // player controlled movements
    this.keysPressed = {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false
    };
    this.disabled = false;
    this.invincible = false;
  }

  // player ship unique hitboxes
  getHitbox() {
    const box1 = {
      x: this.position[0] + this.width / 3,
      y: this.position[1],
      width: this.width / 3,
      height: this.height
    };
    const box2 = {
      x: this.position[0],
      y: this.position[1] + this.height * .65,
      width: this.width,
      height: this.height / 5
    };
    return [box1, box2];
  }

  // velocity updated based on player controlled movements
  updateVelocity() {
    let newVelocity = [0, 0];

    // when disabled, player auto moves downwards
    if (this.disabled) {
      newVelocity[1] = 2;
    } else if (this.game.gameView.mouseFollow && this.game.gameView.mousePosition) {
      // mouse/touch controlled movement handling
      // movement is smoothed out for finer controls
      const xDiff = this.game.gameView.mousePosition.x - (this.position[0] + this.width / 2);
      const yDiff = this.game.gameView.mousePosition.y - (this.position[1] + this.height / 2);
      const deadzone = 2;
      if (xDiff > deadzone) {
        newVelocity[0] += Math.min(this.speed, xDiff);
      } else if (xDiff < -deadzone) {
        newVelocity[0] -= Math.min(this.speed, -xDiff);
      }
      if (yDiff > deadzone) {
        newVelocity[1] += Math.min(this.speed, yDiff);
      } else if (yDiff < -deadzone) {
        newVelocity[1] -= Math.min(this.speed, -yDiff);
      }
      if (newVelocity[0] && newVelocity[1]) {
        const speed = (Math.abs(newVelocity[0]) + Math.abs(newVelocity[1])) / 2;
        newVelocity = vectorScale(newVelocity, speed);
      }
    } else {
      // keyboard controlled movement handling
      if (this.keysPressed.right) newVelocity[0] += this.speed;
      if (this.keysPressed.left) newVelocity[0] -= this.speed;
      if (this.keysPressed.up) newVelocity[1] -= this.speed;
      if (this.keysPressed.down) newVelocity[1] += this.speed;
      if (newVelocity[0] && newVelocity[1]) newVelocity = vectorScale(newVelocity, this.speed);
    }
    this.velocity = newVelocity;
  }

  // shooting also controlled by player
  shootProjectile() {
    if (this.keysPressed.shoot && !this.disabled) super.shootProjectile();
  }

  // player must be within game screen at all times
  handleBounds(newPosition) {
    if (this.inXBounds(newPosition[0])) this.position[0] = newPosition[0];
    if (this.inYBounds(newPosition[1])) this.position[1] = newPosition[1];
  }

  // player gets 1 sec of invicibility after taking damage
  damageTaken(damage) {
    if (!this.invincible && this.health >= 0) {
      super.damageTaken(damage);
      this.invincible = true;
      new timer(this.game, this.resetInvincibility.bind(this), 1000);
    }
  }
  resetInvincibility() {
    this.invincible = false;
  }

  // player unique death animation, and activates game over logic
  remove() {
    if (!this.disabled) {
      this.disabled = true;
      new timer(this.game, () => {
        const posX = this.position[0] - 40;
        const posY = this.position[1] - 20;
        new explosion(this.game, 100, [posX, posY], "major", [0, 0]);
        super.remove();
        new timer(this.game, this.game.setGameOver.bind(this.game), 3000);
      }, 1000);
    }
  }
}
/* harmony default export */ var player_ship = (PlayerShip);
;// CONCATENATED MODULE: ./src/scripts/enemy_ship.js
// Low level enemies that move top to bottom
// shooting 1 bullet downwards at consistent intervals



class EnemyShip extends ship {
  // posX is the initial x position
  // cooldown is in milliseconds
  constructor(game, posX, speed, cooldown) {
    // Ship/MovingObject related arguments
    let image = document.createElement("img");
    image.src = "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/740c1152-1afc-40a3-8d50-8e2cdec8261f/enemy1.png";
    let width = 23;
    let height = 80;
    let health = 1;
    let projectileDmg = 1;

    // in case the random position clips the ship image out of bounds
    if (posX < 0 - width) {
      posX = 0;
    } else if (posX > game.canvasWidth - width) {
      posX = game.canvasWidth - width;
    }
    const objArgs = {
      width: width,
      height: height,
      position: [posX, 0 - height * 2],
      velocity: [0, speed],
      speed: speed,
      health: health,
      game: game,
      image: image,
      type: "enemies"
    };

    // Projectile related arguments
    image = document.createElement("img");
    image.src = "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/f0cc2cc7-6f4f-4ecb-80d9-b13bbd04720c/enemy_projectile.png";
    const projectileArgs = [{
      objArgs: {
        velocity: [0, 8],
        speed: 8,
        health: projectileDmg,
        game: game,
        width: 5,
        height: 20,
        image: image
      },
      type: "bullet",
      origin: "enemy"
    }];

    // projectile pattern
    const patternArgs = [{
      positionDeltas: [[width / 2.25, 10]],
      batchFireNum: 1,
      batchFireInterval: 0,
      cooldown: cooldown,
      onCooldown: false,
      timer: null,
      projectileArgIndex: 0
    }];
    super(objArgs, projectileArgs, patternArgs);
  }

  // enemy ships simply move from top to bottom
  // removed once they get below the screen
  handleBounds(newPosition) {
    if (!this.inUpperYHeightBounds(newPosition[1])) {
      this.remove();
    } else {
      this.position = newPosition;
    }
  }
  remove() {
    if (this.health <= 0) {
      new explosion(this.game, 80, this.position, "minor", [0, 0.25]);
      this.game.score += 50;
    }
    super.remove();
    this.game.enemiesRemaining -= 1;
  }
}
/* harmony default export */ var enemy_ship = (EnemyShip);
;// CONCATENATED MODULE: ./src/scripts/boss.js
// The big bad boss, the final enemy in a level
// Defeat the boss to win and save the galaxy!




class Boss extends ship {
  static MAX_HEALTH = 50;
  constructor(game) {
    // Ship/Moving Object related arguments
    let image = document.createElement("img");
    image.src = "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/07783292-53fc-470b-8b8c-2299bd8e7a01/boss1.png";
    let width = 178;
    let height = 258;
    let health = Boss.MAX_HEALTH;
    let projectileDmg = 2;
    const objArgs = {
      width: width,
      height: height,
      position: [game.canvasWidth / 2 - width / 2, 0 - height * 2],
      velocity: [0, 1],
      speed: 1,
      health: health,
      game: game,
      image: image,
      type: "enemies"
    };

    // Projectile related arguments
    image = document.createElement("img");
    image.src = "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/f0cc2cc7-6f4f-4ecb-80d9-b13bbd04720c/enemy_projectile.png";
    const projectileArgs = [{
      objArgs: {
        velocity: [0, 8],
        speed: 8,
        health: projectileDmg,
        game: game,
        width: 10,
        height: 40,
        image: image
      },
      type: "bullet",
      origin: "enemy"
    }];

    // boss projectile patterns, to be activated based on boss phase
    const patternArgs = [{
      positionDeltas: [[18, 200], [width - 32, 200]],
      batchFireNum: 1,
      batchFireInterval: 0,
      cooldown: 1000,
      onCooldown: true,
      timer: null,
      projectileArgIndex: 0
    }, {
      positionDeltas: [[60, 210], [width - 76, 210]],
      batchFireNum: 2,
      batchFireInterval: 150,
      cooldown: 2000,
      onCooldown: true,
      timer: null,
      projectileArgIndex: 0
    }, {
      positionDeltas: [[75, 180], [width - 88, 180]],
      batchFireNum: 2,
      batchFireInterval: 150,
      cooldown: 1000,
      onCooldown: true,
      timer: null,
      projectileArgIndex: 0
    }, {
      positionDeltas: [[100, 160], [width - 110, 160]],
      batchFireNum: 3,
      batchFireInterval: 150,
      cooldown: 2000,
      onCooldown: true,
      timer: null,
      projectileArgIndex: 0
    }];
    super(objArgs, projectileArgs, patternArgs);
  }

  // box1 is the weakspot
  getHitbox() {
    const box1 = {
      x: this.position[0] + 85,
      y: this.position[1] + 90,
      width: 80,
      height: 70
    };
    const box2 = {
      x: this.position[0] + 10,
      y: this.position[1] + 90,
      width: (this.width - 100) / 2,
      height: this.height - 110
    };
    const box3 = {
      x: this.position[0] + 165,
      y: this.position[1] + 90,
      width: (this.width - 100) / 2,
      height: this.height - 110
    };
    const box4 = {
      x: this.position[0] + 45,
      y: this.position[1] + 30,
      width: 155,
      height: 60
    };
    return [box1, box2, box3, box4];
  }

  // only takes damage if weakpoint hit (index 0 is the hitbox1 weakpoint)
  // takes in the colliding MovingObject and an array of hitbox collision positions as [[int, int]]
  handleCollided(otherObj, hitboxesCollided) {
    const otherObjClass = otherObj.constructor.name;
    if (otherObjClass === "Projectile") {
      if (hitboxesCollided.includes(0)) {
        const damage = otherObj.health;
        this.damageTaken(damage);
      }
      otherObj.remove();
    }
  }

  // Boss will slowly move down center from the top during cutscene
  // then move side to side throughout the fight at normal speed 
  updateVelocity() {
    if (this.movementDisabled) return;
    if (this.position[1] > 0) {
      this.speed = 1.5;
      if (this.velocity[0] === 0 || this.position[0] < 0) {
        if (this.velocity[0] === 0) {
          new timer(this.game, this.resetCooldown.bind(this, 0), 1250);
          this.game.player.disabled = false;
        }
        this.velocity = [this.speed, 0];
      } else if (this.position[0] > this.game.canvasWidth - this.width) {
        this.velocity = [-this.speed, 0];
      }
    }
  }

  // Boss shooting patterns updated based on health remaining
  updateShootingPattern() {
    if (this.health === 20) {
      this.patternArgs[0].timer?.clear();
      this.patternArgs[1].timer?.clear();
      this.patternArgs[2].timer?.clear();
      this.patternArgs[0].onCooldown = false;
      this.patternArgs[1].onCooldown = false;
      this.patternArgs[2].onCooldown = false;
      this.patternArgs[3].onCooldown = false;
    } else if (this.health === 30) {
      this.patternArgs[0].timer?.clear();
      this.patternArgs[1].timer?.clear();
      this.patternArgs[0].onCooldown = false;
      this.patternArgs[1].onCooldown = false;
      this.patternArgs[2].onCooldown = false;
    } else if (this.health === 40) {
      this.patternArgs[0].timer?.clear();
      this.patternArgs[0].onCooldown = false;
      this.patternArgs[1].onCooldown = false;
    }
  }
  shootProjectile() {
    if (!this.disabled) super.shootProjectile();
  }
  damageTaken(damage) {
    if (!this.disabled) {
      super.damageTaken(damage);
      this.updateShootingPattern();
    }
  }

  // Boss death animations plays alot of minor explosions and ends with big finale explosion
  // Then proceeds to game win after a delay
  remove() {
    this.game.score += 1000;
    this.disabled = true;

    // minor explosions
    for (let i = 0; i < 20; i++) {
      const timeDelay = i * 200;
      new timer(this.game, () => {
        const hitBoxes = this.getHitbox();
        const randHitBox = hitBoxes[i % hitBoxes.length];
        const randPosX = Math.floor(Math.random() * (randHitBox.x + randHitBox.width - randHitBox.x) + randHitBox.x);
        const randPosY = Math.floor(Math.random() * (randHitBox.y + randHitBox.height - randHitBox.y) + randHitBox.y);
        const dx = this.velocity[0] < 0 ? 30 : 10;
        new explosion(this.game, 80, [randPosX - dx, randPosY - 70], "minor", [0, 0.1]);
      }, timeDelay);
    }

    // stop for final explosion
    new timer(this.game, () => {
      this.velocity = [0, 0];
      this.speed = 0;
      this.movementDisabled = true;
    }, 4000);

    // final explosion and start timer for setting game win
    new timer(this.game, () => {
      const multiplier = this.velocity[0] < 0 ? 1 : -1;
      const posX = this.position[0] - this.width / 2;
      const posY = this.position[1] - this.height / 1.5;
      new explosion(this.game, 500, [posX - 30, posY], "major", [0, 0]);
      super.remove();
      new timer(this.game, this.game.setWin.bind(this.game), 3500);
    }, 4500);
  }
}
/* harmony default export */ var boss = (Boss);
;// CONCATENATED MODULE: ./src/scripts/game.js
// Game class handles all game state logic





class Game {
  static MAX_ENEMY_WAVE = 5;
  constructor(canvas, gameView) {
    this.canvas = canvas;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.gameView = gameView;
    this.enemyWave = 0;
    this.addEnemyOnCooldown = true;
    this.addedEnemies = 0;
    this.enemiesRemaining = 0;
    this.enemyWaveCount = 0;
    this.score = 0;
    this.gameOver = false;
    this.win = false;
    this.secretEnd = false;
    this.startScreen = true;

    // all moving objects and timers have a unique game id
    this.idCounter = 1;
    this.timers = {};
    this.allMovingObjects = {
      player: {},
      enemies: {},
      projectiles: {},
      explosions: {}
    };
    this.player = new player_ship(this);
    this.bossFight = false;
    this.boss = null;
  }

  // apply game logic to determine next state of the game for next animation frame
  // time changes, handled by GameView, are used to smooth gameplay during fps changes
  step(timeDelta) {
    this.checkCollisions();
    if (!this.bossFight) this.setEnemies();
    this.moveObjects(timeDelta);
    this.shootProjectiles();
  }
  pauseTimers() {
    Object.values(this.timers).forEach(timer => timer.pause());
  }
  resumeTimers() {
    Object.values(this.timers).forEach(timer => timer.resume());
  }

  // call move() for all MovingObject objects
  moveObjects(timeDelta) {
    for (let key in this.allMovingObjects) {
      Object.values(this.allMovingObjects[key]).forEach(obj => obj.move(timeDelta));
    }
  }

  // call shoot() for all Ship objects (player and enemies)
  shootProjectiles() {
    this.player.shootProjectile();
    Object.values(this.allMovingObjects.enemies).forEach(enemy => enemy.shootProjectile());
  }

  // first check projectile collisions, then check player to enemy ship collisions
  checkCollisions() {
    Object.values(this.allMovingObjects.projectiles).forEach(projectile => {
      if (projectile.origin === "player") {
        Object.values(this.allMovingObjects.enemies).forEach(enemy => {
          enemy.collideCheck(projectile);
        });
      } else {
        this.player.collideCheck(projectile);
      }
    });
    Object.values(this.allMovingObjects.enemies).forEach(enemy => {
      this.player.collideCheck(enemy);
    });
  }

  // heal player 3hp per round (up to max health)
  healPlayer() {
    if (this.allMovingObjects.player && this.player.health > 0) {
      this.player.health = Math.min(this.player.health + 3, player_ship.MAX_HEALTH);
    }
  }

  // next wave if 0 enemies remaining, activate boss fight if last wave finished
  // increases enemies per wave
  // multiply score by remaining player health, and then heal player
  setEnemies() {
    if (this.enemiesRemaining === 0) {
      if (this.enemyWave < Game.MAX_ENEMY_WAVE) {
        this.enemyWave += 1;
        this.enemyWaveCount = this.enemyWave * 5;
        this.enemiesRemaining = this.enemyWaveCount;
        this.addedEnemies = 0;
        if (this.enemyWave > 1) {
          this.score += this.player.health * 100;
          this.healPlayer();
        }
      } else {
        this.setBoss();
      }
    }

    // throughout a wave, enemies are placed in clusters of 3 to 10 at different intervals
    if (!this.addEnemyOnCooldown) {
      const remaining = this.enemyWaveCount - this.addedEnemies;
      let numNewEnemies;
      if (remaining < 10) {
        numNewEnemies = remaining;
      } else {
        numNewEnemies = Math.floor(Math.random() * (10 - 3) + 3);
      }
      this.addedEnemies += numNewEnemies;

      // randomize position, speed, and shoot cooldown for each enemy
      for (let i = 0; i < numNewEnemies; i++) {
        const randPosX = Math.floor(Math.random() * this.canvasWidth);
        const randSpeed = Math.random() * (5 - 2) + 2;
        const randCooldown = Math.floor(Math.random() * (1000 - 450) + 450);
        new enemy_ship(this, randPosX, randSpeed, randCooldown);
      }

      // set cooldown before adding next group of enemies, reset flag in 1 to 3 seconds
      this.addEnemyOnCooldown = true;
      const randTimeOut = Math.random() * (3000 - 1000) + 1000;
      new timer(this, this.resetAddEnemyCooldown.bind(this), randTimeOut);
    }
  }
  resetAddEnemyCooldown() {
    this.addEnemyOnCooldown = false;
  }

  // waits for all player projectiles to clear, and temporarily disable player (for cutscene to play) 
  // also heal player and update score
  setBoss() {
    this.player.disabled = true;
    if (Object.values(this.allMovingObjects.projectiles).length === 0) {
      this.boss = new boss(this);
      this.score += this.player.health * 100;
      this.healPlayer();
      this.bossFight = true;
      this.gameView.switchGameInformation();
    }
  }

  // secret ending if both player and boss die
  setWin() {
    if (this.player?.health <= 0) this.secretEnd = true;
    if (!this.gameOver) {
      this.score += this.player.health * 200;
      this.win = true;
    }
  }
  setGameOver() {
    if (this.boss?.health <= 0) {
      this.secretEnd = true;
    } else if (!this.win) {
      this.gameOver = true;
    }
  }

  // resetting the game on retries
  reset() {
    this.enemyWave = 0;
    this.addEnemyOnCooldown = true;
    this.addedEnemies = 0;
    this.enemiesRemaining = 0;
    this.enemyWaveCount = 0;
    this.score = 0;
    this.gameOver = false;
    this.win = false;
    this.secretEnd = false;
    this.startScreen = false;
    for (const id in this.timers) delete this.timers[id];
    for (const type in this.allMovingObjects) {
      for (const id in this.allMovingObjects[type]) {
        delete this.allMovingObjects[type][id];
      }
    }
    this.idCounter = 1;
    this.player = new player_ship(this);
    this.boss = null;
    this.bossFight = false;
    this.gameView.switchGameInformation();
  }
}
/* harmony default export */ var game = (Game);
;// CONCATENATED MODULE: ./src/scripts/game_view.js
// GameView handles anything canvas/html related, and event handlers
// Also creates the single Game object that handles all game logic



class GameView {
  // player movement keybind mappings
  static UP_KEYS = ["ArrowUp", 'w'];
  static DOWN_KEYS = ["ArrowDown", 's'];
  static RIGHT_KEYS = ["ArrowRight", 'd'];
  static LEFT_KEYS = ["ArrowLeft", 'a'];

  // prevent shooting when clicking these html elements
  static IGNORE_TARGETS = ["sound-on", "sound-off", "sound-icons-container", "touch-on", "touch-off", "touch-container", "pause-on", "pause-off", "pause-container"];
  constructor(canvas, canvasContext) {
    this.ctx = canvasContext;
    this.canvas = canvas;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.game = new game(canvas, this);

    // html game info elements that get updated throughout the game
    this.scoreSpan = document.getElementById("score");
    this.playerHealthBar = document.getElementById("player-health-bar");
    this.bossHealthBar = document.getElementById("boss-health-bar");
    this.bossInfo = document.getElementById("boss-info");
    this.waveInfo = document.getElementById("wave-info");
    this.waveSpan = document.getElementById("wave-number");
    this.enemiesRemainingSpan = document.getElementById("enemies-remaining");

    // moving background in the canvas element
    // x, y are the background position offsets as it moves (only y changes)
    // dy controls change in speed
    const backgroundImg = new Image();
    backgroundImg.src = "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/c73080e6-fa02-4ce0-a799-d37804d79578/game_background.jpg";
    this.bgSettings = {
      img: backgroundImg,
      x: 0,
      y: 700,
      dy: 0.777
    };

    // mouse follow options
    this.touchOnElement = document.getElementById("touch-on");
    this.touchOffElement = document.getElementById("touch-off");
    this.mouseFollow = true;
    this.mousePosition = null; // {x: xValue, y: yValue}

    // pause options
    this.pauseOnElement = document.getElementById("pause-on");
    this.pauseOffElement = document.getElementById("pause-off");
    this.pauseText = document.getElementById("pause-text");
    this.pause = false;
    this.toggleSound = false;

    // only want to draw start, win, and game over messages once;
    this.messageDrawn = false;
    this.bindInstructionsHandler();
    this.bindStartHandler();
  }

  // starts up the animate recursive call loop, and draws initial background
  start() {
    this.lastTime = 0;
    this.drawBackground();
    requestAnimationFrame(this.animate.bind(this));
  }

  // draw next state of the game, or start/win/game over message
  // takes in time, which is automatically given and kept track off in recursive calls
  animate(time) {
    if (this.game.startScreen || this.game.gameOver || this.game.win) {
      if (this.pause) this.handlePauseToggle();
      this.drawStartWinGameOver();
    } else if (!this.pause) {
      this.draw();
      this.updateGameInfo();
      const timeDelta = time - this.lastTime;
      this.game.step(timeDelta);
    }
    this.lastTime = time;
    requestAnimationFrame(this.animate.bind(this));
  }

  // draw start/win/game over message once and remove player controls
  drawStartWinGameOver() {
    if (!this.messageDrawn) {
      const message = this.game.startScreen ? ["Tap to", "START"] : this.game.secretEnd ? "🫡" : this.game.gameOver ? "GAME OVER" : "YOU WIN";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#ef9841";
      if (this.game.startScreen) {
        this.ctx.font = `40px 'Special Elite'`;
        this.ctx.fillText(message[0], this.canvasWidth / 2, this.canvasHeight / 2 - 50);
        this.ctx.font = `48px 'Special Elite'`;
        this.ctx.fillText(message[1], this.canvasWidth / 2, this.canvasHeight / 2);
      } else {
        this.ctx.font = `48px 'Special Elite'`;
        this.ctx.fillText(message, this.canvasWidth / 2, this.canvasHeight / 2);
      }
      this.messageDrawn = true;
      if (this.game.gameOver || this.game.win) {
        this.removeControlHandlers();
        this.updateScore();
        setTimeout(this.drawRetryKey.bind(this, this.ctx), 3000);
      }
      ;
    }
  }
  drawRetryKey() {
    const message = "Tap to retry";
    this.ctx.font = `24px 'Special Elite'`;
    this.ctx.fillText(message, this.canvasWidth / 2, this.canvasHeight / 2 + 50);
    this.bindRetryHandler();
  }
  drawPause() {
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#ef9841";
    this.ctx.font = `48px 'Special Elite'`;
    this.ctx.fillText("PAUSED", this.canvasWidth / 2, this.canvasHeight / 2);
  }

  // draw moving background and then all game objects
  draw() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.drawBackground();
    for (let key in this.game.allMovingObjects) {
      Object.values(this.game.allMovingObjects[key]).forEach(obj => obj.draw(this.ctx));
    }
  }

  // canvas background moves vertically downward
  drawBackground() {
    const img = this.bgSettings.img;

    // if end is reached, reset image back to beginning
    if (this.bgSettings.y > this.canvasHeight) {
      this.bgSettings.y -= img.height;
    }

    // if looping around, cut remaining end and draw below new
    if (this.bgSettings.y > 0) {
      this.ctx.drawImage(img, this.bgSettings.x, this.bgSettings.y - img.height, img.width, img.height);
    }

    // draw background and then update new position
    this.ctx.drawImage(img, this.bgSettings.x, this.bgSettings.y, img.width, img.height);
    this.bgSettings.y += this.bgSettings.dy;
  }

  // updates all game info related html elements
  updateGameInfo() {
    this.updateScore();
    this.updateHealthBar('player');
    if (this.game.bossFight) {
      this.updateHealthBar('boss');
    } else {
      this.waveSpan.innerText = this.game.enemyWave;
      this.enemiesRemainingSpan.innerText = this.game.enemiesRemaining;
    }
  }
  updateScore() {
    this.scoreSpan.innerText = this.game.score;
  }

  // updates either boss or player hp
  // type is a string of either 'player' or 'boss'
  updateHealthBar(type) {
    let obj, healthBar;
    if (type === 'player') {
      obj = this.game.player;
      healthBar = this.playerHealthBar;
    } else {
      obj = this.game.boss;
      healthBar = this.bossHealthBar;
    }
    let health = obj.health;
    const healthPoint = document.createElement("li");
    healthPoint.setAttribute("class", `${type}-health-point`);
    if (type === 'boss') health = Math.ceil(health / (boss.MAX_HEALTH / 10));
    if (healthBar.children.length < health) {
      for (let i = 0; i < health - healthBar.children.length; i++) {
        healthBar.appendChild(healthPoint);
      }
    } else if (healthBar.children.length > health) {
      for (let i = 0; i < healthBar.children.length - health; i++) {
        const lastChild = healthBar.lastChild;
        if (lastChild) healthBar.removeChild(healthBar.lastChild);
      }
    }
  }

  // switches between boss and enemy wave html elements 
  switchGameInformation() {
    if (this.game.bossFight) {
      this.waveInfo.style.display = "none";
      this.bossInfo.style.display = "flex";
    } else {
      this.waveInfo.style.display = "flex";
      this.bossInfo.style.display = "none";
    }
  }

  // start playing the game
  handleStartKey(event) {
    if (event?.key === " ") event.preventDefault();
    this.canvas.scrollIntoView();
    this.game.startScreen = false;
    document.removeEventListener("keypress", this.startHandler);
    this.canvas.removeEventListener("pointerdown", this.startHandler);
    this.bindControlHandlers();
    setTimeout(this.game.resetAddEnemyCooldown.bind(this.game), 1500);
    this.messageDrawn = false;
  }
  handleInstructionsButton() {
    const instructionsContainer = document.getElementById("instructions");
    instructionsContainer.classList.toggle("instructions-hidden");
  }
  bindInstructionsHandler() {
    this.instructionsButtonHandler = this.handleInstructionsButton.bind(this);
    const instructionsButton = document.getElementById("start-game");
    instructionsButton.addEventListener("click", this.instructionsButtonHandler);
  }
  bindStartHandler() {
    this.startHandler = this.handleStartKey.bind(this);
    document.addEventListener("keypress", this.startHandler);
    this.canvas.addEventListener("pointerdown", this.startHandler);
  }

  // retry on win/game over
  handleRetryKey(event) {
    if (event?.key === " ") event.preventDefault();
    this.canvas.scrollIntoView();
    document.removeEventListener("keypress", this.retryHandler);
    this.canvas.removeEventListener("pointerdown", this.retryHandler);
    this.game.reset();
    this.bindControlHandlers();
    setTimeout(this.game.resetAddEnemyCooldown.bind(this.game), 1500);
    this.messageDrawn = false;
  }
  bindRetryHandler() {
    this.retryHandler = this.handleRetryKey.bind(this);
    document.addEventListener("keypress", this.retryHandler);
    this.canvas.addEventListener("pointerdown", this.retryHandler);
  }

  // mouse/touch follow movements
  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const xScale = this.canvas.width / rect.width;
    const yScale = this.canvas.height / rect.height;
    const x = (event.clientX - rect.left) * xScale;
    const y = (event.clientY - rect.top) * yScale;
    this.mousePosition = {
      x,
      y
    };
  }
  handleMouseOut() {
    this.mousePosition = null;
  }
  handleMouseFollowToggle() {
    if (this.mouseFollow) {
      this.touchOnElement.style.display = 'none';
      this.touchOffElement.style.display = 'block';
    } else {
      this.touchOnElement.style.display = 'block';
      this.touchOffElement.style.display = 'none';
    }
    this.mouseFollow = !this.mouseFollow;
  }

  // pause/unpause
  handlePauseToggle() {
    if ((this.game.startScreen || this.game.gameOver || this.game.win) && !this.pause) {
      return;
    }
    if (this.pause) {
      this.game.resumeTimers();
      this.pauseOnElement.style.display = 'none';
      this.pauseOffElement.style.display = 'block';
      this.pauseText.innerText = 'pause';
    } else {
      this.game.pauseTimers();
      this.pauseOnElement.style.display = 'block';
      this.pauseOffElement.style.display = 'none';
      this.pauseText.innerText = 'play';
      this.drawPause();
    }
    this.pause = !this.pause;
  }

  // pause and mute when tabbed out or game is out of focus
  handleVisibilityChange() {
    if (document.hidden && !(this.game.startScreen || this.game.gameOver || this.game.win) && !this.pause) {
      this.handlePauseToggle();
    }
    if (document.hidden && this.game.sounds.toggle) {
      this.game.sounds.handleSoundToggle();
      this.toggleSound = true;
    } else if (!document.hidden && this.toggleSound) {
      this.game.sounds.handleSoundToggle();
      this.toggleSound = false;
    }
  }

  // setting option keybinds
  handleSettingKeybinds(event) {
    if (event.key === "m") this.handleMouseFollowToggle();else if (event.key === "k") this.game.sounds.handleSoundToggle();else if (event.key === "p") this.handlePauseToggle();
  }

  // player controls (arrow/wasd to move, spacebar to shoot)
  handleKeyDown(event) {
    event.preventDefault();
    if (GameView.RIGHT_KEYS.includes(event.key)) this.game.player.keysPressed.right = true;else if (GameView.LEFT_KEYS.includes(event.key)) this.game.player.keysPressed.left = true;else if (GameView.UP_KEYS.includes(event.key)) this.game.player.keysPressed.up = true;else if (GameView.DOWN_KEYS.includes(event.key)) this.game.player.keysPressed.down = true;else if (event.key === " ") this.game.player.keysPressed.shoot = true;
  }
  handleKeyUp(event) {
    event.preventDefault();
    if (GameView.RIGHT_KEYS.includes(event.key)) this.game.player.keysPressed.right = false;else if (GameView.LEFT_KEYS.includes(event.key)) this.game.player.keysPressed.left = false;else if (GameView.UP_KEYS.includes(event.key)) this.game.player.keysPressed.up = false;else if (GameView.DOWN_KEYS.includes(event.key)) this.game.player.keysPressed.down = false;else if (event.key === " ") this.game.player.keysPressed.shoot = false;
  }

  // mouse click/hold to shoot
  handleMouseDown(event) {
    const parentId = event.target.parentNode.id;
    if (!GameView.IGNORE_TARGETS.includes(parentId)) this.game.player.keysPressed.shoot = true;
  }
  handleMouseUp() {
    this.game.player.keysPressed.shoot = false;
  }

  // binding and removing player controls
  bindControlHandlers() {
    this.keyDownHandler = this.handleKeyDown.bind(this);
    this.keyUpHandler = this.handleKeyUp.bind(this);
    this.mouseDownHandler = this.handleMouseDown.bind(this);
    this.mouseUpHandler = this.handleMouseUp.bind(this);
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.mouseOutHandler = this.handleMouseOut.bind(this);
    document.addEventListener("keydown", this.keyDownHandler);
    document.addEventListener("keyup", this.keyUpHandler);
    document.addEventListener("pointerdown", this.mouseDownHandler);
    document.addEventListener("pointerup", this.mouseUpHandler);
    document.addEventListener("pointermove", this.mouseMoveHandler);
    document.addEventListener("pointerout", this.mouseOutHandler);
  }
  removeControlHandlers() {
    document.removeEventListener("keydown", this.keyDownHandler);
    document.removeEventListener("keyup", this.keyUpHandler);
    document.removeEventListener("pointerdown", this.mouseDownHandler);
    document.removeEventListener("pointerup", this.mouseUpHandler);
    document.removeEventListener("pointermove", this.mouseMoveHandler);
    document.removeEventListener("pointerout", this.mouseOutHandler);
  }
}
/* harmony default export */ var game_view = (GameView);
;// CONCATENATED MODULE: ./src/index.js

const preloadedImages = [];
const imageUrls = ["https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/466ac424-0a07-406e-84cb-4510aef458c8/logo.png", "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/07783292-53fc-470b-8b8c-2299bd8e7a01/boss1.png", "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/740c1152-1afc-40a3-8d50-8e2cdec8261f/enemy1.pngg", "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/48067fa2-57f9-42c8-baed-7207d4b4085c/player1.png", "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/c73080e6-fa02-4ce0-a799-d37804d79578/game_background.jpg", "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/dfd05171-57ad-4a36-9e7b-7110cdab1baf/explosion1.png", "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/a8f574e9-b0db-4cb8-bc91-f626fae49fd6/explosion2.png", "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/f0cc2cc7-6f4f-4ecb-80d9-b13bbd04720c/enemy_projectile.png"];
imageUrls.forEach((url, i) => {
  preloadedImages[i] = new Image();
  preloadedImages[i].src = url;
});
window.addEventListener("load", () => {
  window.canvas = document.getElementById("game-view");
  window.ctx = canvas.getContext("2d");
  const view = new game_view(canvas, ctx);
  view.start();
});
}();
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
!function() {
// extracted by mini-css-extract-plugin

}();
/******/ })()
;
//# sourceMappingURL=main.js.map