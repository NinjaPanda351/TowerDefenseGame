class Map {
    constructor(grid) {
        this.grid = grid;
        this.tileSize = 64;
    }

    draw(ctx) {
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                let groundImage;
                if (this.grid[y][x] === 1) {
                    groundImage =  ASSET_MANAGER.getAsset(SPRITE_MAP.GROUND); // Path
                } else {
                    groundImage = ASSET_MANAGER.getAsset(SPRITE_MAP.GRASS); // Buildable Area
                }

                ctx.drawImage(groundImage, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);

                ctx.strokeStyle = "black";
                ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }
    }

    update() {

    }
}