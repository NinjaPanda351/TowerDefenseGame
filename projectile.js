class Projectile {
    constructor(x, y, target, damage) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.speed = 1125;
        this.damage = damage;
        this.pierce = false;
        this.removeFromWorld = false;
        this.projectileTargetOffset = 16;
    }

    update(deltaTime) {
        if (!this.target || this.target.removeFromWorld) {
            this.removeFromWorld = true;
            return;
        }

        let dx = this.target.x - this.x + this.projectileTargetOffset;
        let dy = this.target.y - this.y + this.projectileTargetOffset;
        let distance = Math.sqrt(dx * dx + dy * dy);

        let adjustedSpeed = this.speed * deltaTime;

        if (distance < adjustedSpeed) {
            this.target.takeDamage(this.damage);

            gameEngine.addEntity(new DamageNumber(this.target.x, this.target.y, this.damage));

            this.removeFromWorld = true;
        } else {
            this.x += (dx / distance) * adjustedSpeed;
            this.y += (dy / distance) * adjustedSpeed;
        }
    }

    draw(ctx) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}
