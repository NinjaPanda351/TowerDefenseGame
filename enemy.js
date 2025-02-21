class Enemy {
    constructor(waypoints, type, economy, buffs = { healthMultiplier: 1, speedMultiplier: 1, rewardMultiplier: 1 }) {
        this.waypoints = waypoints;
        this.economy = economy;

        const enemyStats = {
            "bat": { speed: 150, health: 80, reward: 10, sprite: SPRITE_MAP.BAT, frameCount: 4, frameWidth: 10 },
            "big_slime": { speed: 90, health: 300, reward: 20, sprite: SPRITE_MAP.BIG_SLIME, frameCount: 4, frameWidth: 14 },
            "demon": { speed: 120, health: 200, reward: 18, sprite: SPRITE_MAP.DEMON, frameCount: 4, frameWidth: 10 },
            "ghost": { speed: 100, health: 150, reward: 15, sprite: SPRITE_MAP.GHOST, frameCount: 8, frameWidth: 10 },
            "goblin": { speed: 170, health: 100, reward: 12, sprite: SPRITE_MAP.GOBLIN, frameCount: 4, frameWidth: 11 },
            "king_slime": { speed: 70, health: 500, reward: 50, sprite: SPRITE_MAP.KING_SLIME, frameCount: 4, frameWidth: 16},
            "normal_slime": { speed: 100, health: 100, reward: 10, sprite: SPRITE_MAP.NORMAL_SLIME, frameCount: 4, frameWidth: 12 },
            "skeleton": { speed: 110, health: 150, reward: 15, sprite: SPRITE_MAP.SKELETON, frameCount: 4, frameWidth: 8},
            "zombie": { speed: 85, health: 200, reward: 15, sprite: SPRITE_MAP.ZOMBIE, frameCount: 4, frameWidth: 8}
        };

        const stats = enemyStats[type];
        this.type = type;
        this.speed = stats.speed * buffs.speedMultiplier;
        this.health = stats.health * buffs.healthMultiplier;
        this.reward = stats.reward * buffs.rewardMultiplier;
        this.maxHealth = stats.health * buffs.healthMultiplier;
        this.sprite = stats.sprite;

        this.currentWaypoint = 0;
        this.x = this.waypoints[0].x;
        this.y = this.waypoints[0].y;

        this.distanceTraveled = 0;
        this.removeFromWorld = false;

        this.animator = new Animator(
            ASSET_MANAGER.getAsset(this.sprite),
            0, 0, stats.frameWidth, 8,
            stats.frameCount, 0.1, 0,
            false, true
        );
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

            let adjustedSpeed = this.speed * deltaTime;

            if (distance < adjustedSpeed) {
                this.x = target.x;
                this.y = target.y;
                this.currentWaypoint++;
            } else {
                this.x += (dx / distance) * adjustedSpeed;
                this.y += (dy / distance) * adjustedSpeed;
            }
        } else {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        if (this.animator) {
            this.animator.drawFrame(1/60, ctx, this.x, this.y, 4);
        } else {
            ctx.fillStyle = "gray";
            ctx.fillRect(this.x, this.y, 40, 40);
        }

        // Health bar
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y - 10, (this.maxHealth / 100) * 40, 5);
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y - 10, (this.health / 100) * 40, 5);
    }

    takeDamage(damage) {
        this.health -= damage;
    }
}
