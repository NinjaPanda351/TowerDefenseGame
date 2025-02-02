class Enemy {
    constructor(waypoints) {
        this.waypoints = waypoints;
        this.index = 0;

        // Start at the first waypoint
        if (this.waypoints.length > 0) {
            this.x = this.waypoints[0].x;
            this.y = this.waypoints[0].y;
        } else {
            console.error("ERROR: No waypoints provided for enemy.");
            this.x = 0;
            this.y = 0;
        }

        this.speed = 2;
        this.health = 100;
        this.removeFromWorld = false;
    }

    update() {
        if (this.health <= 0) {
            console.log("enemy defeated");
            this.removeFromWorld = true;
            return;
        }

        if (this.index < this.waypoints.length - 1) {
            let target = this.waypoints[this.index + 1];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > this.speed) {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            } else {
                this.index++; // Move to the next waypoint
            }
        } else {
            console.log("enemy reached the end and is being removed")
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, 40, 40);

        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y - 10, (this.health / 100) * 40, 5);
    }
}
