class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.range = 150;
        this.fireRate = 60;
        this.fireCooldown = 0;
    }

    update() {
        if (this.fireCooldown > 0) {
            this.fireCooldown--;
        } else {
            let target = this.findTarget();
            if (target) {
                target.health -= 10;
                console.log(`Tower at (${this.x}, ${this.y}) hit an enemy!`);
                this.fireCooldown = this.fireRate;
            }
        }
    }

    findTarget() {
        let closest = null;
        let closestDist = this.range;

        for (let entity of gameEngine.entities) {
            if (entity instanceof Enemy) {
                let dist = Math.sqrt((entity.x - this.x) ** 2 + (entity.y - this.y) ** 2);
                if (dist < closestDist) {
                    closest = entity;
                    closestDist = dist;
                }
            }
        }
        return closest;
    }

    draw(ctx) {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x - 16, this.y - 16, 32, 32); // ✅ Tower size
    }
}
