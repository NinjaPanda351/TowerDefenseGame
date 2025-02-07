class Enemy {
    constructor(waypoints, type = "basic", economy) {
        this.waypoints = waypoints;
        this.economy = economy;

        const enemyStats = {
            "basic": { speed: 1.5, health: 100, reward: 10 },
            "fast": { speed: 3.0, health: 50, reward: 8 },
            "tank": { speed: 0.75, health: 300, reward: 20 },
            "regenerating": { speed: 1.2, health: 150, reward: 15 },
            "armored": { speed: 1.0, health: 200, reward: 18 }
        };

        const stats = enemyStats[type] || enemyStats["basic"];
        this.type = type;
        this.speed = stats.speed;
        this.health = stats.health;
        this.reward = stats.reward;

        this.currentWaypoint = 0;
        this.x = this.waypoints[0].x;
        this.y = this.waypoints[0].y;

        this.distanceTraveled = 0;
        this.removeFromWorld = false;
    }

    update() {
        if (this.health <= 0) {
            this.economy.earn(this.reward);
            this.removeFromWorld = true;
        }

        if (this.currentWaypoint < this.waypoints.length - 1) {
            let nextWaypoint = this.waypoints[this.currentWaypoint + 1];

            let dx = nextWaypoint.x - this.x;
            let dy = nextWaypoint.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.speed) {
                this.currentWaypoint++;
                this.x = nextWaypoint.x;
                this.y = nextWaypoint.y;
            } else {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }
        } else {
            this.removeFromWorld = true;
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
}
