class GameManager {
    constructor(gameEngine, levelData, enemyWaypoints) {
        this.gameEngine = gameEngine;
        this.levelData = levelData;
        this.enemyWaypoints = enemyWaypoints;
        this.selectedTowerType = "basic";
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 120;

        this.economy = new Economy();

        this.towerCosts = {
            "basic": 50,
            "sniper": 100,
            "rapid": 75,
            "bomb": 125
        }

        this.selectedTower = null;

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

        document.getElementById("gameWorld").addEventListener("click", (e) => this.handleClick(e));
        document.getElementById("upgrade-damage").addEventListener("click", () => this.upgradeTower("damage"));
        document.getElementById("upgrade-fireRate").addEventListener("click", () => this.upgradeTower("fireRate"));
        document.getElementById("upgrade-range").addEventListener("click", () => this.upgradeTower("range"));
        document.getElementById("toggle-targeting").addEventListener("click", () => this.toggleTargeting());
        document.getElementById("sell-tower").addEventListener("click", () => this.sellTower());
    }

    handleClick(event) {
        const canvas = document.getElementById("gameWorld");
        const rect = canvas.getBoundingClientRect();
        const menu = document.getElementById("upgrade-menu");

        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        let tileX = Math.floor(mouseX / 64) * 64;
        let tileY = Math.floor(mouseY / 64) * 64;

        console.log(`Click detected at (${mouseX}, ${mouseY})`);
        console.log(`Grid Position: (${tileX}, ${tileY})`);

        // Check if clicking on the upgrade menu
        let menuRect = menu.getBoundingClientRect();
        if (
            event.clientX >= menuRect.left &&
            event.clientX <= menuRect.right &&
            event.clientY >= menuRect.top &&
            event.clientY <= menuRect.bottom
        ) {
            console.log("Clicked inside the upgrade menu. Ignoring click.");
            return;
        }

        let clickedTower = this.gameEngine.entities.find(entity =>
            entity instanceof Tower &&
            Math.abs(entity.x - (tileX + 32)) < 10 &&
            Math.abs(entity.y - (tileY + 32)) < 10
        );

        if (clickedTower) {
            console.log("Tower clicked:", clickedTower);

            if (this.selectedTower === clickedTower) {
                console.log("Clicking the same tower. Closing upgrade menu.");
                this.hideUpgradeMenu();
                this.selectedTower = null;
                return;
            }

            console.log("Tower selected for upgrade.");
            this.selectedTower = clickedTower;
            this.showUpgradeMenu(tileX, tileY);
            return;
        }

        // If menu was open, close it and prevent placing a tower
        if (!menu.classList.contains("hidden")) {
            console.log("Clicked outside tower. Closing upgrade menu.");
            this.hideUpgradeMenu();
            return;
        }

        // No tower detected, check if tile is buildable
        let tileOccupied = this.gameEngine.entities.some(entity =>
            entity instanceof Tower && entity.x === tileX + 32 && entity.y === tileY + 32
        );

        if (!tileOccupied) {
            console.log("Empty tile detected. Attempting to place tower.");
            this.placeTower(tileX, tileY);
        } else {
            console.log("Tile occupied. Cannot place tower.");
        }
    }

    showUpgradeMenu(tileX, tileY) {
        console.log("Tower Stats:", this.selectedTower); // Check selected tower

        const menu = document.getElementById("upgrade-menu");

        if (!menu || !this.selectedTower) {
            console.error("ERROR: Upgrade menu or selected tower not found!");
            return;
        }

        menu.classList.remove("hidden");
        menu.classList.add("visible");

        let posX = tileX + 70;
        let posY = tileY - 20;

        if (posX + menu.offsetWidth > window.innerWidth) {
            posX = tileX - menu.offsetWidth - 10;
        }

        if (posY + menu.offsetHeight > window.innerHeight) {
            posY = window.innerHeight - menu.offsetHeight - 10;
        }

        menu.style.left = `${posX}px`;
        menu.style.top = `${posY}px`;

        // Check if UI elements exist before modifying them
        const dmgElement = document.getElementById("upgrade-damage");
        const fireRateElement = document.getElementById("upgrade-fireRate");
        const rangeElement = document.getElementById("upgrade-range");
        const targetElement = document.getElementById("toggle-targeting");

        if (dmgElement && fireRateElement && rangeElement && targetElement) {
            dmgElement.innerText = `Damage: ${this.selectedTower.damage} (+5)`;
            fireRateElement.innerText = `Fire Rate: ${this.selectedTower.fireRate} (-5)`;
            rangeElement.innerText = `Range: ${this.selectedTower.range} (+20)`;
            targetElement.innerText = `Target: ${this.selectedTower.targetingMode}`;
        } else {
            console.error("ERROR: One or more UI elements not found in the DOM.");
        }

        console.log("Upgrade menu should now be visible at:", posX, posY);
    }

    hideUpgradeMenu() {
        const menu = document.getElementById("upgrade-menu");
        if (menu) {
            menu.classList.add("hidden");
            menu.classList.remove("visible");
            console.log("Upgrade menu hidden.");
        } else {
            console.error("ERROR: Upgrade menu not found.");
        }
    }

    upgradeTower(stat) {
        if (!this.selectedTower) return;

        const upgradeCost = 50;
        if (this.economy.spend(upgradeCost)) {
            this.selectedTower.upgrade(stat);

            // Refresh UI after upgrade
            this.showUpgradeMenu(this.selectedTower.x - 32, this.selectedTower.y - 32);
        }
    }

    toggleTargeting() {
        if (!this.selectedTower) return;

        this.selectedTower.toggleTargeting();
        document.getElementById("toggle-targeting").innerText = `Target: ${this.selectedTower.targetingMode}`;
    }

    placeTower(tileX, tileY) {
        console.log(`🛠 Placing tower at (${tileX}, ${tileY})`);

        // Check if tile is buildable
        if (!this.levelData[tileY / 64] || this.levelData[tileY / 64][tileX / 64] !== 0) {
            console.log("Can't place tower here! This tile is not buildable.");
            return;
        }

        let towerCost = this.towerCosts[this.selectedTowerType];

        // Spend money before placing tower
        if (!this.economy.spend(towerCost)) {
            console.log("Not enough money to place tower.");
            return;
        }

        // Place tower
        const tower = new Tower(tileX + 32, tileY + 32, this.selectedTowerType);
        this.gameEngine.addEntity(tower);
        console.log(`Placed ${this.selectedTowerType} Tower at (${tileX}, ${tileY})`);
    }

    sellTower() {
        if (!this.selectedTower) return;

        let baseCost = this.towerCosts[this.selectedTower.type] || 0;
        let refundAmount = Math.floor(baseCost * 0.75 + (this.selectedTower.level - 1) * 50 * 0.6);

        console.log(`💰 Selling tower for $${refundAmount}`);

        this.economy.earn(refundAmount);

        this.gameEngine.entities = this.gameEngine.entities.filter(entity => entity !== this.selectedTower);

        this.hideUpgradeMenu();

        this.selectedTower = null;
    }

    spawnEnemy() {
        const enemy = new Enemy(this.enemyWaypoints, this.economy);
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