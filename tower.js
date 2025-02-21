class Tower {
    constructor(x, y, type = "basic") {
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = 1;
        this.upgradeCostModifier = 0;

        this.targetingModes = ["Nearest", "Lowest Health", "Farthest", "Highest Health"];
        this.targetingIndex = 0;
        this.targetingMode = this.targetingModes[this.targetingIndex];

        const towerStats = {
            "basic": { damage: 10, fireRate: 60, range: 150 },
            "sniper": { damage: 40, fireRate: 120, range: 300 },
            "rapid": { damage: 5, fireRate: 20, range: 100 },
            "bomb": { damage: 20, fireRate: 90, range: 150 },
            "flamethrower": { damage: 8, fireRate: 10, range: 120 },
            "ice": { damage: 10, fireRate: 30, range: 140 },
            "minigun": { damage: 3, fireRate: 5, range: 100 },
            "scatter": { damage: 5, fireRate: 20, range: 110 },
            "marksmen": { damage: 60, fireRate: 80, range: 300 },
            "railgun": { damage: 100, fireRate: 150, range: 350 },
            "nuke": { damage: 150, fireRate: 200, range: 180 },
            "cluster": { damage: 50, fireRate: 100, range: 160 }
        };

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

        this.upgradeCostModifier += 5;
        this.level++;
    }

    toggleTargeting() {
        this.targetingIndex = (this.targetingIndex + 1) % this.targetingModes.length;
        this.targetingMode = this.targetingModes[this.targetingIndex];
        document.getElementById("toggle-targeting").innerText = `Target: ${this.targetingMode}`;
    }

    update(deltaTime) {
        if (this.fireCooldown > 0) {
            this.fireCooldown -= deltaTime * 60;
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
        const typeColorMap = {
            "basic": "blue",
            "sniper": "brown",
            "rapid": "black",
            "bomb": "orange",
            "flamethrower": "red",
            "ice": "cyan",
            "minigun": "purple",
            "scatter": "yellow",
            "marksmen": "darkgreen",
            "railgun": "gray",
            "nuke": "black",
            "cluster": "pink"
        };

        ctx.fillStyle = typeColorMap[this.type] || "blue";
        ctx.fillRect(this.x - 16, this.y - 16, 32, 32);

        this.drawRangeRadius(ctx);
    }


    drawRangeRadius(ctx) {
        if (gameManager.selectedTower === this) {
            ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

// Base Evolution Tower Class
class EvolutionTower extends Tower {
    constructor(x, y, type, damage, fireRate, range) {
        super(x, y, type);
        this.damage = damage;
        this.fireRate = fireRate;
        this.range = range;
        this.level = 7;
    }

    update(deltaTime) {
        super.update(deltaTime);
    }

    draw(ctx) {
        const typeColorMap = {
            "flamethrower": "red",
            "ice": "cyan",
            "minigun": "purple",
            "scatter": "yellow",
            "marksmen": "darkgreen",
            "railgun": "gray",
            "nuke": "black",
            "cluster": "pink"
        };

        ctx.fillStyle = typeColorMap[this.type] || "blue";  // Default if type is unknown
        ctx.fillRect(this.x - 16, this.y - 16, 32, 32);

        this.drawRangeRadius(ctx)
    }

}

// Flamethrower Tower
class FlamethrowerTower extends EvolutionTower {
    constructor(x, y) {
        super(x, y, "flamethrower", 8, 10, 120);
    }

    shootProjectile(target) {
        const flame = new Projectile(this.x, this.y, target, this.damage);
        flame.color = "red";
        gameEngine.addEntity(flame);
    }
}

// Ice Tower
class IceTower extends EvolutionTower {
    constructor(x, y) {
        super(x, y, "ice", 10, 30, 140);
    }

    shootProjectile(target) {
        const ice = new Projectile(this.x, this.y, target, this.damage);
        ice.color = "cyan";
        target.speed *= 0.7;  // Slow enemies
        gameEngine.addEntity(ice);
    }
}

// Minigun Tower
class MinigunTower extends EvolutionTower {
    constructor(x, y) {
        super(x, y, "minigun", 3, 5, 100);
    }
}

// Scatter Tower
class ScatterTower extends EvolutionTower {
    constructor(x, y) {
        super(x, y, "scatter", 5, 20, 110);
    }

    shootProjectile(target) {
        for (let i = 0; i < 3; i++) {
            const scatter = new Projectile(this.x, this.y, target, this.damage);
            scatter.color = "yellow";
            scatter.x += Math.random() * 10 - 5;
            scatter.y += Math.random() * 10 - 5;
            gameEngine.addEntity(scatter);
        }
    }
}

// Marksmen Tower
class MarksmenTower extends EvolutionTower {
    constructor(x, y) {
        super(x, y, "marksmen", 60, 80, 300);
    }
}

// Railgun Tower
class RailgunTower extends EvolutionTower {
    constructor(x, y) {
        super(x, y, "railgun", 100, 150, 350);
    }

    shootProjectile(target) {
        const rail = new Projectile(this.x, this.y, target, this.damage);
        rail.color = "gray";
        rail.pierce = true; // Pierce through enemies
        gameEngine.addEntity(rail);
    }
}

// Nuke Tower
class NukeTower extends EvolutionTower {
    constructor(x, y) {
        super(x, y, "nuke", 150, 200, 180);
    }

    shootExplosive(target) {
        const nuke = new BombProjectile(this.x, this.y, target, this.damage * 2);
        nuke.radius = 100;
        gameEngine.addEntity(nuke);
    }
}

// Cluster Bomb Tower
class ClusterTower extends EvolutionTower {
    constructor(x, y) {
        super(x, y, "cluster", 50, 100, 160);
    }

    shootExplosive(target) {
        const bomb = new BombProjectile(this.x, this.y, target, this.damage);
        bomb.color = "pink";
        bomb.onExplode = () => {
            for (let i = 0; i < 3; i++) {
                const miniBomb = new BombProjectile(this.x, this.y, target, this.damage / 2);
                miniBomb.x += Math.random() * 30 - 15;
                miniBomb.y += Math.random() * 30 - 15;
                gameEngine.addEntity(miniBomb);
            }
        };
        gameEngine.addEntity(bomb);
    }
}
