const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let platforms;
let stars;
let score = 0;
let scoreText;
let canDoubleJump = false;
let boss;
let bossActive = false;
let bossSpeed = 100;

function preload() {
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('star', 'https://labs.phaser.io/assets/demoscene/star.png');
    this.load.spritesheet('dude', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    // Создание босса, используя тот же спрайт, что и игрок, но с измененным цветом
    boss = this.physics.add.sprite(750, 450, 'dude');
    boss.setTint(0xff0000);  // Изменяем цвет босса на красный
    boss.setBounce(0.2);
    boss.setCollideWorldBounds(true);
    boss.setVisible(false); // Прячем босса, пока он не нужен
    boss.setActive(false);

    this.physics.add.collider(boss, platforms); // Чтобы босс мог стоять на платформах
    this.physics.add.collider(player, boss, hitBoss, null, this); // Столкновение игрока с боссом
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (player.body.touching.down) {
        canDoubleJump = true;
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-500);
    } else if (cursors.up.isDown && canDoubleJump) {
        player.setVelocityY(-450);
        canDoubleJump = false;
    }

    // Проверка на появление босса при достижении 300 очков
    if (score >= 30 && !bossActive) {
        boss.setVisible(true);
        boss.setActive(true);
        bossActive = true;
        boss.setVelocityX(bossSpeed); // Установить скорость для босса
    }

    // Логика движения босса
    if (bossActive) {
        if (boss.x >= 750) {
            boss.setVelocityX(-bossSpeed); // Меняем направление движения налево
        } else if (boss.x <= 50) {
            boss.setVelocityX(bossSpeed); // Меняем направление движения направо
        }
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    // Проверяем, если все звезды собраны
    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }
}

function hitBoss(player, boss) {
    // Логика столкновения игрока с боссом
    // Можно уменьшить жизнь игрока, проиграть анимацию или просто перезапустить игру
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;

    this.time.delayedCall(1000, () => {
        this.scene.restart();
    });
}
