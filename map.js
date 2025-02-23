class Map {
    constructor(grid) {
        this.grid = grid;
    }

    draw(ctx) {
        const TILE_SIZE = 64;
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                let groundImage;
                if (this.grid[y][x] === 1) {
                    groundImage =  ASSET_MANAGER.getAsset(SPRITE_MAP.GROUND); // Path
                } else {
                    groundImage = ASSET_MANAGER.getAsset(SPRITE_MAP.GRASS); // Buildable Area
                }

                ctx.drawImage(groundImage, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

                ctx.strokeStyle = "black";
                ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    update() {

    }
}