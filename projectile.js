class Projectile {
    constructor(x, y, target) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.speed = 15;
        this.damage = 10;
        this.removeFromWorld = false;

        this.projectileTargetOffset = 16;
    }

    update() {
        if (!this.target || this.target.removeFromWorld) {
            this.removeFromWorld = true;
            return;
        }

        let dx = this.target.x - this.x + this.projectileTargetOffset;
        let dy = this.target.y - this.y + this.projectileTargetOffset;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            this.target.health -= this.damage;
            this.removeFromWorld = true;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;

        }
    }

    draw(ctx) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}