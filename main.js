const levelData = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
	[1, 1, 1, 0, 0, 0, 1, 0, 1, 0],
	[0, 0, 1, 0, 1, 1, 1, 0, 1, 0],
	[0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
	[0, 0, 1, 1, 1, 0, 0, 0, 1, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const enemyWaypoints = [
	{ x: 0, y: 144 },
	{ x: 144, y: 144 },
	{ x: 144, y: 336 },
	{ x: 272, y: 336 },
	{ x: 272, y: 208},
	{ x: 400, y: 208},
	{ x: 400, y: 80},
	{ x: 528, y: 80},
	{ x: 528, y: 400},
	{ x: 656, y: 400}
];

const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	canvas.width = levelData[0].length * 64;
	canvas.height = levelData.length * 64;
	const ctx = canvas.getContext("2d");

	const gameMap = new Map(levelData);
	gameEngine.addEntity(gameMap);

	let enemySpawnTimer = 0;
	const enemySpawnInterval = 120; //by frames

	function spawnEnemy() {
		const enemy = new Enemy(enemyWaypoints);
		gameEngine.addEntity(enemy);
	}

	const originalUpdate = gameEngine.update.bind(gameEngine);
	gameEngine.update = function () {
		originalUpdate();

		// Handle enemy spawning
		if (enemySpawnTimer >= enemySpawnInterval) {
			spawnEnemy();
			enemySpawnTimer = 0;
		}
		enemySpawnTimer++;
	};

	gameEngine.init(ctx);

	gameEngine.start();
});

window.onload = function () {
	const canvas = document.getElementById("gameWorld");

	if (!canvas) {
		console.error("ERROR: Canvas with ID 'gameWorld' not found!");
		return;
	}

	canvas.addEventListener("click", (e) => {
		const rect = canvas.getBoundingClientRect();

		// Get mouse click coordinates relative to the canvas
		let mouseX = e.clientX - rect.left;
		let mouseY = e.clientY - rect.top;

		// Convert click position to grid coordinates
		let tileX = Math.floor(mouseX / 64) * 64;
		let tileY = Math.floor(mouseY / 64) * 64;

		console.log(`Click at: (${mouseX}, ${mouseY}) -> Grid: (${tileX}, ${tileY})`);

		// Check if tile is buildable (`0` in `levelData`)
		if (levelData[tileY / 64] && levelData[tileY / 64][tileX / 64] === 0) {
			const tower = new Tower(tileX + 32, tileY + 32); // Center tower in tile
			gameEngine.addEntity(tower);
			console.log(`Tower placed at (${tileX}, ${tileY})`);
		} else {
			console.log("Can't place a tower here!");
		}
	});
};