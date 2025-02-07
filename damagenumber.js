class DamageNumber {
    constructor(x, y, damage) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.lifetime = 30;
        this.opacity = 1;
    }

    update() {
        this.y -= 0.5;
        this.opacity -= 0.03;
        this.lifetime--;

        if (this.lifetime <= 0) {
            this.removeFromWorld = true; // Remove from the game
        }
    }

    draw(ctx) {
        ctx.font = "16px Arial";
        ctx.fillStyle = `rgba(255, 0, 0, ${this.opacity})`;
        ctx.fillText(this.damage, this.x, this.y);
    }
}
