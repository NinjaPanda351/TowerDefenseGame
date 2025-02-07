// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};

        // Options and the Details
        this.options = options || {
            debugging: false,
        };

        this.speedManager = new SpeedManager();
    };

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            if (this.speedManager.getSpeedMultiplier() > 0) {
                this.loop();
            }
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    };

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });
        
        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
        });

        this.ctx.canvas.addEventListener("keydown", event => this.keys[event.key] = true);
        this.ctx.canvas.addEventListener("keyup", event => this.keys[event.key] = false);
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Ensure the map is drawn first
        if (this.entities.length > 0 && this.entities[0] instanceof Map) {
            this.entities[0].draw(this.ctx);
        }

        // Now draw all other entities (enemies, towers, etc.)
        for (let i = 1; i < this.entities.length; i++) {
            let entity = this.entities[i];
            if (entity?.draw) {
                entity.draw(this.ctx);
            }
        }
    }

    update() {
        let deltaTime = this.timer.tick() * this.speedManager.getSpeedMultiplier();
        if (deltaTime > 0.1) deltaTime = 0.1;  //Prevent large jumps on lag spikes

        for (let i = 0; i < this.entities.length; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                if (typeof entity.update === "function") {
                    entity.update(deltaTime);
                }
            }
        }

        this.entities = this.entities.filter(entity => !entity.removeFromWorld);
    }

    loop() {
        this.update();
        this.draw();
    };

}

// KV Le was here :)