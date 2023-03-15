import MovingObject from "./moving_object";
import Projectile from "./projectile";
import Sound from "./sound";

class Ship extends MovingObject {
  constructor(objArgs, projectileArgs) {
    super(objArgs);
    this.projectileArgs = projectileArgs;
    this.cooldown = projectileArgs.cooldown;
    this.shootOnCooldown = false;
    this.projectileSound = "defaultProjectile";
  }

  shootProjectile() {
    if (!this.shootOnCooldown) {
      const dx = this.projectileArgs.xAdjustment;
      const dy = this.projectileArgs.yAdjustment;
      this.projectileArgs.objArgs.position = [this.position[0] + this.width/(2+dx), this.position[1] + dy];
      const projectile = new Projectile(this.projectileArgs);
      this.game.allMovingObjects.projectiles.push(projectile);
      this.shootOnCooldown = true;
      this.playShootSound();
      setTimeout(this.resetCooldown.bind(this), this.cooldown);
    }
  }

  playShootSound() {
    this.game.sounds.add(this.projectileSound);
  }

  resetCooldown() {
    this.shootOnCooldown = false;
  }

  damageTaken(damage) {
    this.health -= damage;
    // when hp === 0 handled in subclasses
  }
}

export default Ship;