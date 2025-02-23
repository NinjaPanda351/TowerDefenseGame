class GameManager {
    constructor(gameEngine, levelData, enemyWaypoints) {
        this.gameEngine = gameEngine;
        this.speedManager = gameEngine.speedManager;
        this.levelData = levelData;

        this.economy = new Economy(250);
        this.waveManager = new WaveManager(enemyWaypoints, this.economy, this);

        this.upgradeMenuOffsetX = 64;
        this.upgradeMenuOffsetY = 144;

        this.towerCosts = {
            "basic": 50,
            "sniper": 100,
            "rapid": 75,
            "bomb": 125
        }

        this.selectedTowerType = null;
        this.selectedEvoType = null;
        this.selectedTower = null;

        this.lives = 20;
        this.updateLifeUI();

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

        document.getElementById("start-wave").addEventListener("click", () => this.waveManager.startWave());

        document.getElementById("gameWorld").addEventListener("click", (e) => this.handleClick(e));
        document.getElementById("upgrade-damage").addEventListener("click", () => this.upgradeTower("damage"));
        document.getElementById("upgrade-fireRate").addEventListener("click", () => this.upgradeTower("fireRate"));
        document.getElementById("upgrade-range").addEventListener("click", () => this.upgradeTower("range"));
        document.getElementById("toggle-targeting").addEventListener("click", () => this.toggleTargeting());
        document.getElementById("sell-tower").addEventListener("click", () => this.sellTower());

        document.getElementById("evolution-one").addEventListener("click", () => {
            if (!this.selectedTower) return;

            switch (this.selectedTower.type) {
                case "basic":
                    this.selectedEvoType = "flamethrower";
                    break;
                case "sniper":
                    this.selectedEvoType = "marksmen";
                    break;
                case "rapid":
                    this.selectedEvoType = "minigun";
                    break;
                case "bomb":
                    this.selectedEvoType = "nuke";
                    break;
                default:
                    console.error("Unknown tower type for evolution!");
                    return;
            }

            this.evolveTower();
            this.selectedEvoType = null;
        });

        document.getElementById("evolution-two").addEventListener("click", () => {
            if (!this.selectedTower) return;

            switch (this.selectedTower.type) {
                case "basic":
                    this.selectedEvoType = "ice";
                    break;
                case "sniper":
                    this.selectedEvoType = "railgun";
                    break;
                case "rapid":
                    this.selectedEvoType = "scatter";
                    break;
                case "bomb":
                    this.selectedEvoType = "cluster";
                    break;
                default:
                    console.error("Unknown tower type for evolution!");
                    return;
            }

            this.evolveTower();
            this.selectedEvoType = null;
        });

        document.getElementById("speed-pause").addEventListener("click", () => this.speedManager.setSpeed("Paused"));
        document.getElementById("speed-normal").addEventListener("click", () => this.speedManager.setSpeed("Normal"));
        document.getElementById("speed-fast").addEventListener("click", () => this.speedManager.setSpeed("Fast"));
        document.getElementById("speed-turbo").addEventListener("click", () => this.speedManager.setSpeed("Turbo"));

    }

    updateLifeUI() {
        const lifeElement = document.getElementById("life-count");
        if (lifeElement) {
            lifeElement.innerText = this.lives;
        }
    }

    loseLife() {
        this.lives--;
        this.updateLifeUI();

        if (this.lives <= 0) {
            this.endGame();
        }
    }

    endGame() {
        this.gameEngine.stop();
        document.getElementById("game-over-screen").style.display = "flex";
    }

    restartGame() {
        window.location.reload();
    }

    getMouseTile() {
        if (!this.gameEngine.mouse) return null;

        let tileX = Math.floor(this.gameEngine.mouse.x / 64) * 64;
        let tileY = Math.floor(this.gameEngine.mouse.y / 64) * 64;

        return {x: tileX, y: tileY};
    }

    handleClick(event) {
        const canvas = document.getElementById("gameWorld");
        const rect = canvas.getBoundingClientRect();
        const upgradeMenu = document.getElementById("upgrade-menu");
        const evolutionMenu = document.getElementById("evolution-menu");


        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        let tileX = Math.floor(mouseX / 64) * 64;
        let tileY = Math.floor(mouseY / 64) * 64;

        console.log(`Click detected at (${mouseX}, ${mouseY})`);
        console.log(`Grid Position: (${tileX}, ${tileY})`);

        // Check if clicking on the upgrade menu
        const isInsideMenu = (menu) => {
            const menuRect = menu.getBoundingClientRect();
            return (
                event.clientX >= menuRect.left &&
                event.clientX <= menuRect.right &&
                event.clientY >= menuRect.top &&
                event.clientY <= menuRect.bottom
            );
        };

        if (isInsideMenu(upgradeMenu) || isInsideMenu(evolutionMenu)) {
            return; // Ignore click
        }

        let clickedTower = this.gameEngine.entities.find(entity =>
            entity instanceof Tower &&
            Math.abs(entity.x - (tileX + 32)) < 10 &&
            Math.abs(entity.y - (tileY + 32)) < 10
        );

        if (clickedTower) {
            console.log("Tower clicked:", clickedTower);
            document.getElementById("tower-type").innerText = String(clickedTower.type[0]).toUpperCase() + String(clickedTower.type).slice(1) + " Tower";

            if (this.selectedTower === clickedTower) {
                console.log("Clicking the same tower. Closing upgrade menu.");
                this.hideMenu("upgrade-menu");
                this.hideMenu("evolution-menu");
                this.selectedTower = null;
                return;
            }

            console.log("Tower selected for upgrade.");
            this.selectedTower = clickedTower;
            document.getElementById("upgrade-cost").innerText = "Upgrade Cost: " + (50 + this.selectedTower.upgradeCostModifier);

            if (this.selectedTower.level === 6) {
                this.showMenu(this.selectedTower.x, this.selectedTower.y, "evolution-menu");
            } else {
                this.showMenu(this.selectedTower.x, this.selectedTower.y, "upgrade-menu");
            }
            return;
        }

        // If menu was open, close it and prevent placing a tower
        if (!upgradeMenu.classList.contains("hidden")) {
            console.log("Clicked outside tower. Closing upgrade menu.");
            this.hideMenu("upgrade-menu");
            return;
        }

        if (!evolutionMenu.classList.contains("hidden")) {
            this.hideMenu("evolution-menu");
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

    showMenu(tileX, tileY, menuId) {
        if (!this.selectedTower) {
            console.error("No tower selected for menu display");
            return;
        }
        console.log("Tower Stats:", this.selectedTower); // Check selected tower

        const menu = document.getElementById(menuId);

        if (!menu || !this.selectedTower) {
            console.error("ERROR: Upgrade menu or selected tower not found!");
            return;
        }

        menu.style.display = "flex";
        menu.classList.add("visible");
        menu.classList.remove("hidden");

        let posX = tileX + this.upgradeMenuOffsetX;
        let posY = tileY + this.upgradeMenuOffsetY;

        if (posX + menu.offsetWidth > window.innerWidth) {
            posX = tileX - menu.offsetWidth - 10;
        }

        if (posY + menu.offsetHeight > window.innerHeight) {
            posY = window.innerHeight - menu.offsetHeight - 10;
        }

        menu.style.left = `${posX}px`;
        menu.style.top = `${posY}px`;

        if (menuId === "upgrade-menu") {
            this.showUpgradeMenu();
        } else if (menuId === "evolution-menu") {
            this.showEvolutionMenu();
        }
    }

    showUpgradeMenu() {
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
    }

    showEvolutionMenu() {
        const evolutionOne = document.getElementById("evolution-one");
        const evolutionTwo = document.getElementById("evolution-two");

        if (!this.selectedTower) { return; }

        switch (this.selectedTower.type) {
            case "basic":
                evolutionOne.innerText = "Evolve to Flamethrower";
                evolutionTwo.innerText = "Evolve to Ice Tower";
                break;
            case "sniper":
                evolutionOne.innerText = "Evolve to Marksmen Tower";
                evolutionTwo.innerrText = "Evolve to Railgun Tower";
                break;
            case "rapid":
                evolutionOne.innerText = "Evolve to Minigun Tower";
                evolutionTwo.innerText = "Evolve to Scatter Tower";
                break;
            case "bomb":
                evolutionOne.innerText = "Evolve to Nuke Tower";
                evolutionTwo.innerText = "Evolve to Cluster Tower";
                break;
            default:
                console.error("Unknown tower type for evolution.");
                return;
        }
    }

    hideMenu(menuId, preserveSelection = false) {
        const menu = document.getElementById(menuId);
        if (menu) {
            menu.style.display = "none";
            menu.classList.add("hidden");
            menu.classList.remove("visible");

            if (!preserveSelection) {
                this.selectedTower = null;
            }
        } else {
            console.error("ERROR: Upgrade menu not found.");
        }
    }

    upgradeTower(stat) {
        if (!this.selectedTower) return;

        const upgradeCost = 50 + this.selectedTower.upgradeCostModifier;
        document.getElementById("upgrade-cost").innerText = "Upgrade Cost: " + upgradeCost;

        if (this.economy.spend(upgradeCost)) {
            this.selectedTower.upgrade(stat);

            // Refresh UI after upgrade
            if (this.selectedTower.level === 6) {
                this.showMenu(this.selectedTower.x, this.selectedTower.y, "evolution-menu");
                this.hideMenu("upgrade-menu", true);
            } else {
                this.showMenu(this.selectedTower.x, this.selectedTower.y, "upgrade-menu");
            }
        } else {
            console.log("not enough money to upgrade");
        }
    }

    evolveTower() {
        if (!this.selectedTower || !this.selectedEvoType) {
            console.error("No tower selected or evolution type not set.");
            return;
        }

        const evolutionCost = 200;
        if (this.economy.spend(evolutionCost)) {
            console.log(`Evolving ${this.selectedTower.type} into ${this.selectedEvoType}`);

            const oldX = this.selectedTower.x;
            const oldY = this.selectedTower.y;

            // Remove old tower
            this.gameEngine.entities = this.gameEngine.entities.filter(entity => entity !== this.selectedTower);

            // Create evolved tower
            const evoTower = TowerFactory.createTower(this.selectedEvoType, oldX, oldY);

            if (evoTower) {
                console.log(`Successfully created ${this.selectedEvoType} tower at (${oldX}, ${oldY}).`);
                this.gameEngine.addEntity(evoTower);
                this.selectedTower = evoTower;  // Ensure assignment here

                // Hide the evolution menu and show the upgrade menu for the new tower
                this.hideMenu("evolution-menu", true);
                this.showMenu(oldX, oldY, "upgrade-menu");
            } else {
                console.error(`Failed to create evolution tower of type: ${this.selectedEvoType}`);
            }
        } else {
            console.log("Not enough money for evolution.");
        }
    }

    toggleTargeting() {
        if (!this.selectedTower) return;

        this.selectedTower.toggleTargeting();
        document.getElementById("toggle-targeting").innerText = `Target: ${this.selectedTower.targetingMode}`;
    }

    placeTower(tileX, tileY) {
        console.log(`Placing tower at (${tileX}, ${tileY})`);

        const TILE_ROW = tileY / 64;
        const TILE_COL = tileX / 64;

        // Check if tile is buildable
        if (!this.levelData || !this.levelData[TILE_ROW] || this.levelData[TILE_ROW][TILE_COL] !== 0) {
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
        const tower = TowerFactory.createTower(this.selectedTowerType, tileX + 32, tileY + 32);
        this.gameEngine.addEntity(tower);
        console.log(`Placed ${this.selectedTowerType} Tower at (${tileX}, ${tileY})`);
    }

    sellTower() {
        if (!this.selectedTower) return;

        let baseCost = this.towerCosts[this.selectedTower.type] || 0;
        let refundAmount = Math.floor(baseCost * 0.75 + (this.selectedTower.level - 1) * 50 * 0.6);

        console.log(`Selling tower for $${refundAmount}`);

        this.economy.earn(refundAmount);

        this.gameEngine.entities = this.gameEngine.entities.filter(entity => entity !== this.selectedTower);

        this.hideMenu("upgrade-menu");

        this.selectedTower = null;
    }

    update() {
        this.getMouseTile()
        this.waveManager.update();
    }
}

// Function to close the specified menu
function closeMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) {
        menu.style.display = "none";
        menu.classList.add("hidden");
        menu.classList.remove("visible");

        // Reset selected tower if upgrade menu is closed
        if (menuId === "upgrade-menu" || menuId === "evolution-menu") {
            gameManager.selectedTower = null;
        }
    }
}
