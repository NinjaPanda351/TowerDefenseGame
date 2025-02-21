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
	{ x: 144 - 3, y: 144 },
	{ x: 144 - 3, y: 336 },
	{ x: 272 - 3, y: 336 },
	{ x: 272 - 3, y: 208},
	{ x: 400 - 3, y: 208},
	{ x: 400 - 3, y: 80},
	{ x: 528 - 3, y: 80},
	{ x: 528 - 3, y: 400},
	{ x: 656 - 3, y: 400}
];

const gameEngine = new GameEngine();
const gameManager = new GameManager(gameEngine, levelData, enemyWaypoints);

const ASSET_MANAGER = new AssetManager();

const SPRITE_MAP = {
	GRASS: "resources/Environment/Grass/spr_grass_02.png",
	GROUND: "resources/Environment/Grass/spr_grass_03.png",
	BAT: "resources/Enemies/spr_bat.png",
	BIG_SLIME: "resources/Enemies/spr_big_slime.png",
	DEMON: "resources/Enemies/spr_demon.png",
	GHOST: "resources/Enemies/spr_ghost.png",
	GOBLIN: "resources/Enemies/spr_goblin.png",
	KING_SLIME: "resources/Enemies/spr_king_slime.png",
	NORMAL_SLIME: "resources/Enemies/spr_normal_slime.png",
	SKELETON: "resources/Enemies/spr_skeleton.png",
	ZOMBIE: "resources/Enemies/spr_zombie.png"
};

Object.keys(SPRITE_MAP).forEach(key => {
	ASSET_MANAGER.queueDownload(SPRITE_MAP[key]);
});

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