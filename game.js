const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const cubes = [];

const game = new Phaser.Game(config);

function preload() {
    this.load.image('cube', 'https://labs.phaser.io/assets/sprites/block.png');
}

function create() {

    var ground = this.physics.add.staticGroup();
    ground.create(400, 580, 'cube').setScale(8, 1).refreshBody();

    for (let i = 0; i < 50; i++) {
        let cube = this.physics.add.image(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 300), 'cube');
        cube.setBounce(0.6);
        cubes.push(cube);
    }

    this.physics.add.collider(cubes, ground);
    this.physics.add.collider(cubes, cubes);
}

function update() {

}
