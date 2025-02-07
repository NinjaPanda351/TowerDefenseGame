class BombProjectile extends Projectile {
    constructor(x, y, target, damage) {
        super(x, y, target, damage);
        this.explosionRadius = 50;
    }

    update() {
        if (!this.target || this.target.removeFromWorld) {
            this.removeFromWorld = true;
            return;
        }

        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            for (let entity of gameEngine.entities) {
                if (entity instanceof Enemy) {
                    let dist = Math.sqrt((entity.x - this.x) ** 2 + (entity.y - this.y) ** 2);
                    if (dist < this.explosionRadius) {
                        entity.health -= this.damage;

                        // Spawn floating damage numbers for each enemy hit
                        gameEngine.addEntity(new DamageNumber(entity.x, entity.y, this.damage));
                    }
                }
            }
            this.removeFromWorld = true;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}
