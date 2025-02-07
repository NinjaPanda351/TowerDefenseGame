class Tower {
    constructor(x, y, type = "basic") {
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = 1;

        this.targetingModes = ["Nearest", "Lowest Health", "Farthest", "Highest Health"];
        this.targetingIndex = 0;
        this.targetingMode = this.targetingModes[this.targetingIndex];

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

    upgrade(stat) {
        if (stat === "damage") this.damage += 5;
        if (stat === "fireRate") this.fireRate = Math.max(10, this.fireRate - 5);
        if (stat === "range") this.range += 20;

        this.level++;
    }

    toggleTargeting() {
        this.targetingIndex = (this.targetingIndex + 1) % this.targetingModes.length;
        this.targetingMode = this.targetingModes[this.targetingIndex];
        document.getElementById("toggle-targeting").innerText = `Target: ${this.targetingMode}`;
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
        let bestTarget = null;
        let bestValue = this.targetingMode === "Lowest Health" ? Infinity : -Infinity;
        let bestDistance = Infinity;

        for (let entity of gameEngine.entities) {
            if (entity instanceof Enemy) {
                let dist = Math.sqrt((entity.x - this.x) ** 2 + (entity.y - this.y) ** 2);

                // Ensure target is within range
                if (dist > this.range) continue;

                if (this.targetingMode === "Nearest") {
                    if (!bestTarget || dist < bestValue) {
                        bestTarget = entity;
                        bestValue = dist;
                    }
                } else if (this.targetingMode === "Lowest Health") {
                    if (entity.health < bestValue || (entity.health === bestValue && dist < bestDistance)) {
                        bestTarget = entity;
                        bestValue = entity.health;
                        bestDistance = dist; // If two enemies have the same health, prioritize the closer one
                    }
                } else if (this.targetingMode === "Farthest") {
                    if (entity.distanceTraveled > bestValue) {
                        bestTarget = entity;
                        bestValue = entity.distanceTraveled;
                    }
                } else if (this.targetingMode === "Highest Health") {
                    if (entity.health > bestValue || (entity.health === bestValue && dist < bestDistance)) {
                        bestTarget = entity;
                        bestValue = entity.health;
                        bestDistance = dist; // If two enemies have the same health, prioritize the closer one
                    }
                }
            }
        }

        return bestTarget;
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

        if (gameManager.selectedTower === this) {
            ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}
