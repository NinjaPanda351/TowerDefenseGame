class WaveManager {
    constructor(enemyWaypoints, economy, gameManager) {
        this.enemyWaypoints = enemyWaypoints;
        this.economy = economy;
        this.gameManager = gameManager;

        this.currentWave = 1;
        this.enemiesPerWave = 5;
        this.spawnInterval = 100;
        this.spawnTimer = 0;
        this.enemiesSpawned = 0;
        this.waveActive = false;

        this.globalEnemyBuffs = { healthMultiplier: 1, speedMultiplier: 1, rewardMultiplier: 1};

        this.updateUI();
    }

    startWave() {
        if (this.waveActive) return; // Prevent starting while wave is active

        this.waveActive = true;
        this.enemiesSpawned = 0;
        this.spawnTimer = 0;

        // Every 5 waves, enemies get a 10% HP boost
        if (this.currentWave % 5 === 0 && this.currentWave % 10 !== 0) {
            this.applyEnemyBuffs();
        }

        if (this.currentWave % 10 === 0) {
            this.spawnBossWave();
            return;
        }

        this.updateUI();
        console.log(`Wave ${this.currentWave} started!`);
    }

    applyEnemyBuffs() {
        this.globalEnemyBuffs.healthMultiplier *= 1.2; // increase health by 20%
        this.globalEnemyBuffs.speedMultiplier *= 1.1; //increase speed by 10%
        this.globalEnemyBuffs.rewardMultiplier *= 1.2; //increase reward by 20%
    }

    spawnBossWave() {
        this.waveActive = true;
        this.enemiesSpawned = 0;
        this.spawnTimer = 0;

        const boss = new BossEnemy(this.enemyWaypoints, this.economy, this.currentWave);
        gameEngine.addEntity(boss);
    }

    spawnEnemy() {
        const waveEnemyPool = this.getEnemyPool();

        const randomType = waveEnemyPool[Math.floor(Math.random() * waveEnemyPool.length)];
        const enemy = new Enemy(this.enemyWaypoints, randomType, this.economy, this.globalEnemyBuffs, this.gameManager);
        gameEngine.addEntity(enemy);

        this.enemiesSpawned++;
    }

    getEnemyPool() {
        // Dynamic enemy pool based on the wave
        if (this.currentWave < 3) {
            return ["normal_slime", "bat", "goblin"];
        } else if (this.currentWave < 6) {
            return ["normal_slime", "bat", "goblin", "skeleton"];
        } else if (this.currentWave < 9) {
            return ["bat", "goblin", "skeleton", "ghost", "big_slime"];
        } else {
            return ["bat", "goblin", "skeleton", "ghost", "big_slime", "demon", "zombie"];
        }
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
                this.endWave();
            }
        }
    }

    endWave() {
        this.waveActive = false;
        this.enemiesSpawned = 0; // Reset enemy count
        this.economy.earn(this.currentWave * 12 + 15); //Earn money for completing wave
        this.currentWave++; // Increment wave
        this.enemiesPerWave += 2; // Increase difficulty

        this.updateUI();
    }

    updateUI() {
        setTimeout(() => {
            const waveElement = document.getElementById("wave-number");
            if (waveElement) {
                waveElement.innerText = this.currentWave;
            } else {
                console.error("ERROR: Could not find #wave-number in the DOM!");
            }

            const startWaveBtn = document.getElementById("start-wave");
            if (startWaveBtn) {
                startWaveBtn.disabled = this.waveActive;
            } else {
                console.error("ERROR: Could not find #start-wave button in the DOM!");
            }
        }, 0); // Delay ensures the DOM is loaded
    }
}
