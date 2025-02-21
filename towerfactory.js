class TowerFactory {
    static createTower(type, x, y) {
        console.log(`Creating tower of type: ${type} at (${x}, ${y})`);

        switch (type) {
            case "basic": return new Tower(x, y, "basic");
            case "sniper": return new Tower(x, y, "sniper");
            case "rapid": return new Tower(x, y, "rapid");
            case "bomb": return new Tower(x, y, "bomb");

            // Evolutions
            case "flamethrower": return new FlamethrowerTower(x, y);
            case "ice": return new IceTower(x, y);
            case "marksmen": return new MarksmenTower(x, y);
            case "railgun": return new RailgunTower(x, y);
            case "minigun": return new MinigunTower(x, y);
            case "scatter": return new ScatterTower(x, y);
            case "nuke": return new NukeTower(x, y);
            case "cluster": return new ClusterTower(x, y);

            default:
                console.error(`Unknown tower type: ${type}`);
                return null;
        }
    }
}
