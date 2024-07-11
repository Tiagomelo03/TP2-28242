var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 338,
    physics: {
        default: "arcade",
        arcade: {
        gravity:{ y:0 },
        debug: false
        }
    },
};

var game = new Phaser.Game(config);
const width = game.config.width;
const height = game.config.height;

var preloadScene = new Phaser.Scene('PreloadScene');
var level1Scene = new Phaser.Scene('Level1Scene');
var gameOverScene = new Phaser.Scene('GameOverScene');
var winScene = new Phaser.Scene('WinScene');

game.scene.add('PreloadScene', preloadScene);
game.scene.add('Level1Scene', level1Scene);
game.scene.add('GameOverScene', gameOverScene);
game.scene.add('WinScene', winScene);

game.scene.start('PreloadScene');

preloadScene.preload = function(){
    this.load.tilemapTiledJSON('level1', 'assets/Level1.json');

    this.load.spritesheet('monkey', 'assets/monkey.png',{ frameWidth: 32, frameHeight: 25 });
    this.load.spritesheet('trunk', 'assets/trunk.png', { frameWidth: 32, frameHeight:42 });
    
    this.load.image('startBackground', 'assets/startBackground.png');
    this.load.image('logo', 'assets/logo.png');
    this.load.image('tiles1', 'assets/maps_tileset.png');
    this.load.image('bulletRight', 'assets/bullet_right.png');
    this.load.image('bulletLeft', 'assets/bullet_left.png');
    this.load.image('heart', 'assets/heart.png');
    this.load.image('banana', 'assets/banana.png');
    this.load.image('key', 'assets/key.png')

    loadingBar(this);
}

preloadScene.create = function(){
    const background = this.add.image(400, 169, 'startBackground');
    const logo = this.add.image(250, 30, 'logo').setScale(0.3).setOrigin(0);
    let pressKeyText = this.add.text(width/2 - 80, 150, 'PRESS "SPACE" TO START', { font: '15px monospace'});

    this.anims.create({
        key: 'leftMonkey',
        frames: this.anims.generateFrameNumbers('monkey', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'idleMonkey',
        frames: [ { key: 'monkey', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'rightMonkey',
        frames: this.anims.generateFrameNumbers('monkey', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'leftEnemy',
        frames: this.anims.generateFrameNumbers('trunk', { start: 0, end: 1}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'rightEnemy',
        frames: this.anims.generateFrameNumbers('trunk', { start: 2, end: 3}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'idleEnemy',
        frames: this.anims.generateFrameNumbers('trunk', { start: 2, end: 3}),
        frameRate: 10,
        repeat: -1
    });

    this.time.addEvent({
        delay: 1500,
        callback: ()=>{ pressKeyText.setTint(0x6b8aff); },
        loop: true
        });

    this.time.addEvent({
        delay: 3000,
        callback: ()=>{pressKeyText.setTint(0x000000); },
        loop: true
    });

    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

preloadScene.update = function(){
    if(Phaser.Input.Keyboard.JustDown(spaceKey)){
        this.scene.stop();
        this.scene.start('Level1Scene');
    };
}

/*let monkey, trunk, layer, bullet1, bullet2, bullet3, bullet4, heart1, heart2, heart3, bananas, scoreText, key;
let score = 0;
let hp = 3;
let target = new Phaser.Math.Vector2();*/

let player, enemy, layer, bullet, bullet1, bullet2, bullet3, heart, heart1, heart2, bananas, scoreText, key;
let target = new Phaser.Math.Vector2();

let score = 0;
let life = 3;

level1Scene.preload = function(){}

level1Scene.create = function()
{
    this.cameras.main.setBackgroundColor("#6b8aff");

    this.physics.world.setBounds(0, 0, 3600, 338);

    var map = this.make.tilemap({ key: 'level1' });
    var tileset = map.addTilesetImage('maps_tileset', 'tiles1');
    layer = map.createDynamicLayer('Terrain', tileset, 0, 0);

    this.cameras.main.setBounds(0, 0, 3600, 200);

    const collisionRanges = [
        { start: 0, end: 2 }, 
        { start: 8, end: 10 }, 
        { start: 33, end: 35 }, 
        { start: 41, end: 43 }, 
        { start: 98, end: 100 }, 
        { start: 164, end: 166 }, 
        { start: 263, end: 266 }, 
        { start: 296, end: 299 } 
      ];
      
    collisionRanges.forEach(range => {
    layer.setCollisionBetween(range.start, range.end);
    });


    cursors = this.input.keyboard.createCursorKeys();

    player = this.physics.add.sprite(100, 100, 'monkey');
    enemy = this.physics.add.sprite(350, 100, 'trunk');


    player.setBounce(0.2);
    player.body.setCollideWorldBounds(true);
    enemy.body.setCollideWorldBounds(true);

    this.cameras.main.startFollow(player);
    this.cameras.main.setZoom(1.5);

    player.body.setGravityY(600);
    enemy.body.setGravityY(600);


    this.time.addEvent({
        delay: 4500,
        callback: ()=>{
            bullet = this.physics.add.image(280, 105, 'bulletLeft');
            bullet1 = this.physics.add.image(310, 105, 'bulletRight');
            bullet2 = this.physics.add.image(1790, 170, 'bulletLeft');
            bullet3 = this.physics.add.image(1820, 170, 'bulletRight');
            bullet.body.setVelocity(-100, 0);
            bullet1.body.setVelocity(100, 0);
            bullet2.body.setVelocity(-100, 0);
            bullet3.body.setVelocity(100, 0);
        },
        loop: true
    });

    heart = this.add.tileSprite(135, 60, 560, 494, 'heart').setScale(0.03).setOrigin(0).setScrollFactor(0);
    heart1 = this.add.tileSprite(155, 60, 560, 494, 'heart').setScale(0.03).setOrigin(0).setScrollFactor(0);
    heart2 = this.add.tileSprite(175, 60, 560, 494, 'heart').setScale(0.03).setOrigin(0).setScrollFactor(0);

    key = this.physics.add.image(3400,60, 'key').setGravityY(600);

    bananas = this.physics.add.group({
        key: 'banana',
        repeat: 20,
        setXY: { x: 12, y: 0, stepX: 200 },
    });

    bananas.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setGravityY(600);
    });

    scoreText = this.add.text(195, 60, 'score: 0', { font: '20px monospace', fill: '#000' }).setOrigin(0).setScrollFactor(0);
}

level1Scene.update = function (time, delta)
{
    this.physics.add.collider(key, layer);
    this.physics.add.collider(bananas, layer);
    this.physics.add.overlap(player, bananas, collectBananas, null, this);
    this.physics.add.overlap(player, key, collectKey, null, this);

    this.physics.add.collider(player, layer);
    this.physics.add.collider(enemy, layer, function (_enemy, _layer)
    {   _enemy.setVelocityX(-30);
        _enemy.anims.play('leftEnemy', true);
    if(_enemy.body.touching.left){
        _enemy.setVelocityX(30);
        _enemy.anims.play('rightEnemy', true);
    }
    });

    this.physics.add.overlap(player, bullet, hitBullet, null, this);
    this.physics.add.overlap(player, bullet1, hitBullet1, null, this);
    this.physics.add.overlap(player, bullet2, hitBullet2, null, this);
    this.physics.add.overlap(player, bullet3, hitBullet3, null, this);

    if (life == 2){
                heart2.destroy()};
    if (life == 1){
                heart1.destroy()};
    if (life == 0){
                heart.destroy();
                this.physics.pause();
                this.scene.stop();
                life = 3;
                score = 0;
                this.scene.start('GameOverScene');
                };

    if(player.body.bottom >= game.config.height){
               heart.destroy();
               heart1.destroy();
               heart2.destroy();
               this.physics.pause();
               this.scene.stop();
               life = 3;
               score = 0;
               this.scene.start('GameOverScene');
      };

      function collectBananas (player, banana){
            banana.disableBody(true, true);

            score += 10;
            scoreText.setText('Score: ' + score);

            if (bananas.countActive(true) === 0)
            {
                bananas.children.iterate(function (child) {

                    child.enableBody(true, child.x, 0, true, true);
                });
            }
        }

    function collectKey (player, key){
        key.destroy();
        this.scene.start('WinScene');
    }


    function hitBullet (player, bullet){
        bullet.disableBody(true, true);
        player.setTint(0xff0000);
        this.time.addEvent({
                    delay: 2000,
                    callback: ()=>{
                        player.clearTint();
                    },
                    loop: false
                });
        life -= 1;
    }

     function hitBullet1 (player, bullet1){
        bullet1.disableBody(true, true);
        player.setTint(0xff0000);
        this.time.addEvent({
            delay: 2000,
            callback: ()=>{
                player.clearTint();
            },
            loop: false
        });
        life -= 1;
    }

      function hitBullet2 (player, bullet2){
            bullet2.disableBody(true, true);
            player.setTint(0xff0000);
            this.time.addEvent({
                delay: 2000,
                callback: ()=>{
                    player.clearTint();
                },
                loop: false
            });
            life -= 1;
        }

      function hitBullet3 (player, bullet3)
    {
        bullet3.disableBody(true, true);

        player.setTint(0xff0000);
        this.time.addEvent({
            delay: 2000,
            callback: ()=>{
                player.clearTint();
            },
            loop: false
        });
        life -= 1;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-130);
        player.anims.play('leftMonkey', true);
        }

    else if (cursors.right.isDown) {
        player.setVelocityX(130);
        player.anims.play('Monkey', true);
        }

    else {player.setVelocityX(0);
        player.anims.play('idleMonkey'); }

    if (cursors.up.isDown && player.body.onFloor()) {
    player.setVelocityY(-330);
    }
}


gameOverScene.preload = function(){

}

gameOverScene.create = function(){
    let gameOverText = this.add.text(260, 130, 'GAME OVER', { font: '40px monospace' });
    this.cameras.main.setBackgroundColor("#000000");
    let pressKeyText = this.add.text(250, 190, 'PRESSIONE "SPACE" PARA REINICIAR', { font: '15px monospace'});
    
    this.time.addEvent({
        delay: 200,
        callback: ()=>{
            pressKeyText.setTint(0x000000);
            },
            loop: true
    });
    
    this.time.addEvent({
        delay: 1000,
        callback: ()=>{
            pressKeyText.setTint(0xffffff);            },
            loop: true
    });
    
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

gameOverScene.update = function(){
    if(Phaser.Input.Keyboard.JustDown(spaceKey)){
                this.scene.stop();
                this.scene.start('Level1Scene');
    };
}

var backgroundWin;

winScene.preload = function(){
    this.load.image('youwin', 'assets/youwin.png');
}

winScene.create = function(){
    backgroundWin = this.add.image(400, 169, 'youwin');
}

winScene.update = function(){

}

function loadingBar(scene){
    let progressBar, progressBox, loadingText, percentText;

    progressBar = scene.add.graphics();
    progressBox = scene.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 159, 320, 50);

    loadingText = scene.add.text(width / 2, height / 2 - 50, 'Loading...', {
        font: '20px monospace',
        fill: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);
  
    percentText = scene.add.text(width / 2, height / 2 + 14, '0%', {
        font: '18px monospace',
        fill: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

   scene.load.on('progress', function (value) {
       progressBar.clear();
       progressBar.fillStyle(0xffffff, 1);
       progressBar.fillRect(250, 169, 300 * value, 30);
       percentText.setText(parseInt(value * 100) + '%');
   });

   scene.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
    });
    return;
}