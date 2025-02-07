class WaveManager {
    constructor(enemyWaypoints, economy) {
        this.enemyWaypoints = enemyWaypoints;
        this.economy = economy;

        this.currentWave = 1;
        this.enemiesPerWave = 5;
        this.spawnInterval = 100;
        this.spawnTimer = 0;
        this.enemiesSpawned = 0;
        this.waveActive = false;

        this.updateUI();
    }

    startWave() {
        if (this.waveActive) return; // Prevent starting while wave is active

        this.waveActive = true;
        this.enemiesSpawned = 0;
        this.spawnTimer = 0;
        this.updateUI();

        console.log(`Wave ${this.currentWave} started!`);
    }

    spawnEnemy() {
        const enemy = new Enemy(this.enemyWaypoints, this.economy);
        gameEngine.addEntity(enemy);
        this.enemiesSpawned++;
    }

    update() {
        if (!this.waveActive) return;

        if (this.enemiesSpawned < this.enemiesPerWave) {
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnEnemy();
                this.spawnTimer = 0;
            }
            this.spawnTimer++;
        } else {
            // Check if all enemies are gone before enabling the next wave button
            const activeEnemies = gameEngine.entities.filter(e => e instanceof Enemy);
            if (activeEnemies.length === 0) {
                this.waveActive = false;
                this.enemiesSpawned = 0; // Reset enemy count
                this.economy.earn(this.currentWave * 12 + 15); //Earn money for completing wave
                this.currentWave++; // Increment wave
                this.enemiesPerWave += 2; // Increase difficulty

                this.updateUI();
            }
        }
    }

    updateUI() {
        document.getElementById("wave-number").innerText = this.currentWave;
        document.getElementById("start-wave").disabled = this.waveActive;
    }
}
