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
const gameManager = new GameManager(gameEngine, levelData, enemyWaypoints);

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("resources/Environment/Grass/spr_grass_03.png");
ASSET_MANAGER.queueDownload("resources/Environment/Grass/spr_grass_02.png");

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	canvas.width = levelData[0].length * 64;
	canvas.height = levelData.length * 64;
	const ctx = canvas.getContext("2d");

	const gameMap = new Map(levelData);
	gameEngine.addEntity(gameMap);

	const originalUpdate = gameEngine.update.bind(gameEngine);
	gameEngine.update = function () {
		originalUpdate();
		gameManager.update();
	};

	gameEngine.init(ctx);
	gameEngine.start();
});