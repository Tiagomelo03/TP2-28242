var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 338,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }, // Desativar a gravidade para este jogo
            debug: false // Desativar debug do Arcade Physics
        }
    },
};

var game = new Phaser.Game(config);
const width = game.config.width;
const height = game.config.height;

// Criação das cenas do jogo
var preloadScene = new Phaser.Scene('PreloadScene');
var level1Scene = new Phaser.Scene('Level1Scene');
var gameOverScene = new Phaser.Scene('GameOverScene');
var winScene = new Phaser.Scene('WinScene');

game.scene.add('PreloadScene', preloadScene); // Adiciona a cena de pré-carregamento ao jogo
game.scene.add('Level1Scene', level1Scene); // Adiciona a cena do primeiro nível ao jogo
game.scene.add('GameOverScene', gameOverScene); // Adiciona a cena de game over ao jogo
game.scene.add('WinScene', winScene); // Adiciona a cena de vitória ao jogo

game.scene.start('PreloadScene'); // Inicia com a cena de pré-carregamento

preloadScene.preload = function(){
    // Carregamento de recursos do jogo
    this.load.tilemapTiledJSON('level1', 'assets/Level1.json'); // Carrega o mapa do primeiro nível

    this.load.spritesheet('monkey', 'assets/monkey.png',{ frameWidth: 32, frameHeight: 25 }); // Carrega a spritesheet do personagem macaco
    this.load.spritesheet('trunk', 'assets/trunk.png', { frameWidth: 32, frameHeight:42 }); // Carrega a spritesheet do inimigo tronco
    
    // Carrega imagens e outros recursos necessários
    this.load.image('startBackground', 'assets/startBackground.png');
    this.load.image('logo', 'assets/logo.png');
    this.load.image('tiles1', 'assets/maps_tileset.png');
    this.load.image('bulletRight', 'assets/bullet_right.png');
    this.load.image('bulletLeft', 'assets/bullet_left.png');
    this.load.image('heart', 'assets/heart.png');
    this.load.image('banana', 'assets/banana.png');
    this.load.image('key', 'assets/key.png')

    loadingBar(this); // Função para exibir uma barra de carregamento
}

preloadScene.create = function(){
    // Criação de elementos visuais na cena de pré-carregamento
    const background = this.add.image(400, 169, 'startBackground'); // Adiciona o fundo
    const logo = this.add.image(250, 30, 'logo').setScale(0.3).setOrigin(0); // Adiciona o logo
    let pressKeyText = this.add.text(width/2 - 80, 150, 'PRESS "SPACE" TO START', { font: '15px monospace'}); // Texto para instrução de início

    // Animações dos personagens e inimigos
    this.anims.create({
        key: 'leftMonkey',
        frames: this.anims.generateFrameNumbers('monkey', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    // ... Outras animações

    // Efeitos visuais no texto de início
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

    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Adiciona a tecla de espaço como entrada
}

preloadScene.update = function(){
    // Lógica de atualização da cena de pré-carregamento
    if(Phaser.Input.Keyboard.JustDown(spaceKey)){
        this.scene.stop(); // Para a cena atual
        this.scene.start('Level1Scene'); // Inicia a cena do primeiro nível
    };
}

// Definições de variáveis globais para uso nas cenas subsequentes
let player, enemy, layer, bullet, bullet1, bullet2, bullet3, heart, heart1, heart2, bananas, scoreText, key;
let target = new Phaser.Math.Vector2(); // Vetor para controle de posição

let score = 0; // Pontuação inicial
let life = 3; // Vida inicial


/*------------------------------------------------------------------------------------------*/


level1Scene.preload = function() {
    // Aqui poderia ser adicionado o código para pré-carregar recursos adicionais, se necessário
}

level1Scene.create = function() {
    // Configuração inicial da cena

    // Define a cor de fundo da câmera principal
    this.cameras.main.setBackgroundColor("#6b8aff");

    // Define os limites do mundo físico para a cena
    this.physics.world.setBounds(0, 0, 3600, 338);

    // Carrega o mapa de azulejos usando o tilemap 'level1'
    var map = this.make.tilemap({ key: 'level1' });
    var tileset = map.addTilesetImage('maps_tileset', 'tiles1');
    layer = map.createDynamicLayer('Terrain', tileset, 0, 0);

    // Define os limites da câmera principal para seguir o jogador
    this.cameras.main.setBounds(0, 0, 3600, 200);

    // Define colisões em faixas específicas do mapa
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

    // Captura das teclas do cursor para movimentação do jogador
    cursors = this.input.keyboard.createCursorKeys();

    // Adiciona o jogador e o inimigo à cena com física arcade
    player = this.physics.add.sprite(100, 100, 'monkey');
    enemy = this.physics.add.sprite(350, 100, 'trunk');

    // Define propriedades físicas para o jogador e o inimigo
    player.setBounce(0.2);
    player.body.setCollideWorldBounds(true);
    enemy.body.setCollideWorldBounds(true);

    // Faz a câmera principal seguir o jogador
    this.cameras.main.startFollow(player);
    this.cameras.main.setZoom(1.5);

    // Define a gravidade para o jogador e o inimigo
    player.body.setGravityY(600);
    enemy.body.setGravityY(600);

    // Evento periódico para criar balas
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

    // Exibe corações para representar vidas do jogador
    heart = this.add.tileSprite(135, 60, 560, 494, 'heart').setScale(0.03).setOrigin(0).setScrollFactor(0);
    heart1 = this.add.tileSprite(155, 60, 560, 494, 'heart').setScale(0.03).setOrigin(0).setScrollFactor(0);
    heart2 = this.add.tileSprite(175, 60, 560, 494, 'heart').setScale(0.03).setOrigin(0).setScrollFactor(0);

    // Adiciona uma chave ao final do nível
    key = this.physics.add.image(3400, 60, 'key').setGravityY(600);

    // Adiciona bananas como itens colecionáveis
    bananas = this.physics.add.group({
        key: 'banana',
        repeat: 20,
        setXY: { x: 12, y: 0, stepX: 200 },
    });
    bananas.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setGravityY(600);
    });

    // Exibe o texto da pontuação na tela
    scoreText = this.add.text(195, 60, 'score: 0', { font: '20px monospace', fill: '#000' }).setOrigin(0).setScrollFactor(0);
}

level1Scene.update = function (time, delta) {
    // Lógica de atualização da cena por quadro

    // Adiciona colisores e verificações de sobreposição
    this.physics.add.collider(key, layer);
    this.physics.add.collider(bananas, layer);
    this.physics.add.overlap(player, bananas, collectBananas, null, this);
    this.physics.add.overlap(player, key, collectKey, null, this);
    this.physics.add.collider(player, layer);
    this.physics.add.collider(enemy, layer, function (_enemy, _layer) {
        _enemy.setVelocityX(-30);
        _enemy.anims.play('leftEnemy', true);
        if(_enemy.body.touching.left){
            _enemy.setVelocityX(30);
            _enemy.anims.play('rightEnemy', true);
        }
    });

    // Verifica sobreposições entre o jogador e as balas
    this.physics.add.overlap(player, bullet, hitBullet, null, this);
    this.physics.add.overlap(player, bullet1, hitBullet1, null, this);
    this.physics.add.overlap(player, bullet2, hitBullet2, null, this);
    this.physics.add.overlap(player, bullet3, hitBullet3, null, this);

    // Lógica para remover corações conforme o jogador perde vidas
    if (life == 2){
        heart2.destroy();
    }
    if (life == 1){
        heart1.destroy();
    }
    if (life == 0){
        heart.destroy();
        this.physics.pause();
        this.scene.stop();
        life = 3;
        score = 0;
        this.scene.start('GameOverScene');
    }

    // Verifica se o jogador caiu fora da tela
    if(player.body.bottom >= game.config.height){
        heart.destroy();
        heart1.destroy();
        heart2.destroy();
        this.physics.pause();
        this.scene.stop();
        life = 3;
        score = 0;
        this.scene.start('GameOverScene');
    }

    // Função para coletar bananas e aumentar a pontuação
    function collectBananas (player, banana) {
        banana.disableBody(true, true);
        score += 10;
        scoreText.setText('Score: ' + score);
        if (bananas.countActive(true) === 0) {
            bananas.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });
        }
    }

    // Função para coletar a chave e iniciar a cena de vitória
    function collectKey (player, key) {
        key.destroy();
        this.scene.start('WinScene');
    }

    // Funções para lidar com o jogador sendo atingido pelas balas
    function hitBullet (player, bullet) {
        bullet.disableBody(true, true);
        player.setTint(0xff0000);
        this.time.addEvent({
            delay: 2000,
            callback: ()=> {
                player.clearTint();
            },
            loop: false
        });
        life -= 1;
    }

    function hitBullet1 (player, bullet1) {
        bullet1.disableBody(true, true);
        player.setTint(0xff0000);
        this.time.addEvent({
            delay: 2000,
            callback: ()=> {
                player.clearTint();
            },
            loop: false
        });
        life -= 1;
    }

    function hitBullet2 (player, bullet2) {
        bullet2.disableBody(true, true);
        player.setTint(0xff0000);
        this.time.addEvent({
            delay: 2000,
            callback: ()=> {
                player.clearTint();
            },
            loop: false
        });
        life -= 1;
    }

    function hitBullet3 (player, bullet3) {
        bullet3.disableBody(true, true);
        player.setTint(0xff0000);
        this.time.addEvent({
            delay: 2000,
            callback: ()=> {
                player.clearTint();
            },
            loop: false
        });
        life -= 1;
    }

    // Lógica para movimentação do jogador com as teclas do cursor
    if (cursors.left.isDown) {
        player.setVelocityX(-130);
        player.anims.play('leftMonkey', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(130);
        player.anims.play('rightMonkey', true);
    } else {
        player
 
/*-------------------------------------------------------------------------*/


// Definição da cena de Game Over
gameOverScene.preload = function(){

}

gameOverScene.create = function(){
    // Texto exibido na tela de Game Over
    let gameOverText = this.add.text(260, 130, 'GAME OVER', { font: '40px monospace' });
    // Define a cor de fundo da câmera para preto
    this.cameras.main.setBackgroundColor("#000000");
    // Texto exibido para instruir o jogador a pressionar espaço para reiniciar
    let pressKeyText = this.add.text(250, 190, 'PRESSIONE "SPACE" PARA REINICIAR', { font: '15px monospace'});
    
    // Evento periódico para alternar a cor do texto de "PRESSIONE SPACE PARA REINICIAR"
    this.time.addEvent({
        delay: 200,
        callback: ()=>{
            pressKeyText.setTint(0x000000); // Define a cor do texto como preto
        },
        loop: true
    });
    
    this.time.addEvent({
        delay: 1000,
        callback: ()=>{
            pressKeyText.setTint(0xffffff); // Define a cor do texto como branca
        },
        loop: true
    });
    
    // Captura da tecla de espaço como entrada para reiniciar o jogo
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

gameOverScene.update = function(){
    // Verifica se a tecla de espaço foi pressionada
    if(Phaser.Input.Keyboard.JustDown(spaceKey)){
        // Para a cena atual de Game Over e inicia a cena 'Level1Scene'
        this.scene.stop();
        this.scene.start('Level1Scene');
    };
}

// Variável para armazenar o fundo da cena de vitória
var backgroundWin;

winScene.preload = function(){
    // Carrega a imagem exibida na cena de vitória
    this.load.image('youwin', 'assets/youwin.png');
}

winScene.create = function(){
    // Adiciona a imagem de vitória ao centro da cena
    backgroundWin = this.add.image(400, 169, 'youwin');
}

winScene.update = function(){
    // Lógica de atualização da cena de vitória (pode ser adicionada se necessário)
}

// Função para criar e controlar a barra de carregamento
function loadingBar(scene){
    let progressBar, progressBox, loadingText, percentText;

    // Gráficos para a barra de progresso e seu contorno
    progressBar = scene.add.graphics();
    progressBox = scene.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 159, 320, 50);

    // Texto exibido durante o carregamento
    loadingText = scene.add.text(width / 2, height / 2 - 50, 'Loading...', {
        font: '20px monospace',
        fill: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);
  
    // Texto que mostra o percentual de carregamento
    percentText = scene.add.text(width / 2, height / 2 + 14, '0%', {
        font: '18px monospace',
        fill: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // Evento de progresso de carregamento para atualizar a barra de progresso
    scene.load.on('progress', function (value) {
       progressBar.clear();
       progressBar.fillStyle(0xffffff, 1);
       progressBar.fillRect(250, 169, 300 * value, 30);
       percentText.setText(parseInt(value * 100) + '%');
    });

    // Evento de conclusão do carregamento para remover elementos visuais da barra
    scene.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
    });
}
