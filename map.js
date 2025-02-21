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
                    groundImage =  ASSET_MANAGER.getAsset("resources/Environment/Grass/spr_grass_03.png"); // Path
                } else {
                    groundImage = ASSET_MANAGER.getAsset("resources/Environment/Grass/spr_grass_02.png"); // Buildable Area
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