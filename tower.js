class Tower {
    constructor(x, y, type = "basic") {
        this.x = x;
        this.y = y;
        this.type = type;

        const towerStats = {
            "basic": { damage: 10, fireRate: 60, range: 150 },
            "sniper": { damage: 40, fireRate: 120, range: 300 },
            "rapid": { damage: 5, fireRate: 20, range: 100 },
            "bomb": { damage: 20, fireRate: 90, range: 150 },
        }

        if (towerStats[type]) {
            this.damage = towerStats[type].damage;
            this.fireRate = towerStats[type].fireRate;
            this.range = towerStats[type].range;
        } else {
            console.error("Unknown tower type: ${type}");
        }

        this.fireCooldown = 0;
    }

    update() {
        if (this.fireCooldown > 0) {
            this.fireCooldown--;
        } else {
            let target = this.findTarget();
            if (target) {
                if (this.type === "bomb") {
                    this.shootExplosive(target);
                } else {
                    this.shootProjectile(target);
                }
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

    shootProjectile(target) {
        const projectile = new Projectile(this.x, this.y, target, this.damage);
        gameEngine.addEntity(projectile);
    }

    shootExplosive(target) {
        const explosion = new BombProjectile(this.x, this.y, target, this.damage);
        gameEngine.addEntity(explosion);
    }

    draw(ctx) {
        ctx.fillStyle = this.type === "sniper" ? "brown" :
            this.type === "rapid" ? "black" :
                this.type === "bomb" ? "orange" : "blue";
        ctx.fillRect(this.x - 16, this.y - 16, 32, 32);
    }
}
