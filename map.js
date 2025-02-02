class Map {
    constructor(grid) {
        this.grid = grid;
        this.tileSize = 64;
    }

    draw(ctx) {
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] === 1) {
                    ctx.fillStyle = "gray"; // Path
                } else {
                    ctx.fillStyle = "green"; // Buildable Area
                }
                ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                ctx.strokeStyle = "black";
                ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }
    }

    update() {

    }
}