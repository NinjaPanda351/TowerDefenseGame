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

        // Every 5 waves, enemies get a 10% HP boost
        if (this.currentWave % 5 === 0) {
            Enemy.globalHealthMultiplier *= 1.1;
            console.log(`Enemies are getting stronger! Health increased by 10%!`);
        }

        this.updateUI();
        console.log(`Wave ${this.currentWave} started!`);
    }


    spawnEnemy() {
        const enemyTypes = ["basic", "fast", "tank", "regenerating", "armored"];

        // Decide enemy types based on the wave number
        let possibleEnemies;
        if (this.currentWave < 3) {
            possibleEnemies = ["basic", "fast"];
        } else if (this.currentWave < 6) {
            possibleEnemies = ["basic", "fast", "tank"];
        } else if (this.currentWave < 9) {
            possibleEnemies = ["fast", "tank", "regenerating"];
        } else {
            possibleEnemies = enemyTypes; // Unlock all types after wave 9
        }

        const randomType = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
        const enemy = new Enemy(this.enemyWaypoints, randomType, this.economy);
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
