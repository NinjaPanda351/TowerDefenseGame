class GameManager {
    constructor(gameEngine, levelData, enemyWaypoints) {
        this.gameEngine = gameEngine;
        this.levelData = levelData;
        this.enemyWaypoints = enemyWaypoints;
        this.selectedTowerType = "basic";
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 120;

        window.onload = () => this.initUI();
    }

    initUI() {
        document.querySelectorAll(".tower-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                this.selectedTowerType = e.target.dataset.type;
                console.log(`Selected Tower: ${this.selectedTowerType}`);

                document.querySelectorAll(".tower-btn").forEach(btn => btn.style.background = "");
                e.target.style.background = "lightblue";
            });
        });

        document.getElementById("gameWorld").addEventListener("click", (e) => this.placeTower(e));

    }

    placeTower(event) {
        const canvas = document.getElementById("gameWorld");
        const rect = canvas.getBoundingClientRect();

        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        let tileX = Math.floor(mouseX / 64) * 64;
        let tileY = Math.floor(mouseY / 64) * 64;

        console.log(`Click at: (${mouseX}, ${mouseY}) -> Grid: (${tileX}, ${tileY})`);

        let towerExists = this.gameEngine.entities.some(entity =>
            entity instanceof Tower && entity.x === tileX + 32 && entity.y === tileY + 32
        );

        if (towerExists) {
            console.log("Cannot place a tower here! Another tower already exists.");
            return;
        }

        if (this.levelData[tileY / 64] && this.levelData[tileY / 64][tileX / 64] === 0) {
            const tower = new Tower(tileX + 32, tileY + 32, this.selectedTowerType);
            this.gameEngine.addEntity(tower);
            console.log(`Placed ${this.selectedTowerType} Tower at (${tileX}, ${tileY})`);
        } else {
            console.log("Can't place a tower here!");
        }
    }

    spawnEnemy() {
        const enemy = new Enemy(this.enemyWaypoints);
        this.gameEngine.addEntity(enemy);
    }

    update() {
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        this.enemySpawnTimer++;
    }
}