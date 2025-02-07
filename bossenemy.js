class BossEnemy extends Enemy {
    constructor(waypoints, economy, waveNumber) {
        super(waypoints, economy);

        this.speed = 90; // Slightly slower
        this.maxHealth = 600 + (waveNumber * 100); // Scale health
        this.health = this.maxHealth;

        this.specialAbility = waveNumber % 20 === 0 ? "Shield" : "Heal"; // Alternates between abilities
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.specialAbility === "Shield") {
            this.health = Math.min(this.maxHealth, this.health + 0.5); // Slowly regenerates
        } else if (this.specialAbility === "Heal") {
            if (this.health < this.maxHealth * 0.5) {
                this.health += 5; // Heals itself
            }
        }
    }

    draw(ctx) {
        super.draw(ctx);
        ctx.fillStyle = "purple";
        ctx.fillRect(this.x - 12, this.y - 12, 24, 24);
    }
}
