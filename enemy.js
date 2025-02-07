class Enemy {
    constructor(waypoints, type = "basic", economy, buffs = { healthMultiplier: 1, speedMultiplier: 1, rewardMultiplier: 1}) {
        this.waypoints = waypoints;
        this.economy = economy;

        const enemyStats = {
            "basic": { speed: 113, health: 100, reward: 10 },
            "fast": { speed: 225, health: 50, reward: 8 },
            "tank": { speed: 57, health: 300, reward: 20 },
            "regenerating": { speed: 90, health: 150, reward: 15 },
            "armored": { speed: 75, health: 200, reward: 18 }
        };

        const stats = enemyStats[type] || enemyStats["basic"];
        this.type = type;
        this.speed = stats.speed * buffs.speedMultiplier;
        this.health = stats.health * buffs.healthMultiplier;
        this.reward = stats.reward * buffs.rewardMultiplier;

        this.currentWaypoint = 0;
        this.x = this.waypoints[0].x;
        this.y = this.waypoints[0].y;

        this.distanceTraveled = 0;
        this.removeFromWorld = false;
    }

    update(deltaTime) {
        if (this.health <= 0) {
            this.economy.earn(this.reward);
            this.removeFromWorld = true;
            return;
        }

        if (this.currentWaypoint < this.waypoints.length) {
            let target = this.waypoints[this.currentWaypoint];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            let adjustedSpeed = this.speed * deltaTime; // Scale speed

            if (distance < adjustedSpeed) {
                this.x = target.x;
                this.y = target.y;
                this.currentWaypoint++;
            } else {
                this.x += (dx / distance) * adjustedSpeed;
                this.y += (dy / distance) * adjustedSpeed;
            }
        } else {
            this.removeFromWorld = true; // Enemy reaches end
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.getColor();
        ctx.fillRect(this.x, this.y, 40, 40);

        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y - 10, (this.health / 100) * 40, 5);
    }

    getColor() {
        switch (this.type) {
            case "fast": return "red";
            case "tank": return "pink";
            case "regenerating": return "green";
            case "armored": return "darkblue";
            default: return "black"; // Basic enemy
        }
    }

    takeDamage(damage) {
        this.health -= damage;
    }
}
