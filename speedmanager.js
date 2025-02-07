class SpeedManager {
    constructor() {
        this.speeds = { "Paused": 0, "Normal": 1, "Fast": 2, "Turbo": 3 };
        this.currentSpeed = "Normal";
    }

    setSpeed(speed) {
        if (this.speeds.hasOwnProperty(speed)) {
            this.currentSpeed = speed;
            console.log(`Game Speed Set to: ${speed}`);
            document.getElementById("speed-display").innerText = `Speed: ${speed}`;
        }
    }

    getSpeedMultiplier() {
        return this.speeds[this.currentSpeed];
    }
}
