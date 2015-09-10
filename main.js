var w = window.innerWidth * window.devicePixelRatio;
var h = window.innerHeight * window.devicePixelRatio;

    var game = new Phaser.Game(w, h, Phaser.AUTO, 'game_container',
    {
        preload: preload,
        create: create,
        update: update,
        render: render
    });

/*
var game = new Phaser.Game(1440, 720, Phaser.AUTO, 'game_container',
{
    preload: preload,
    create: create,
    update: update,
    render: render
});
*/

function preload()
{

    // game.load.tilemap('desert', 'assets/tilemaps/maps/desert.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/sprites/tileset_sample.png');
    game.load.image('player', 'assets/player.png');

}

var map;

var marker;
var currentTile;
var cursors;
var lastCursorPosition;
var cursorDelta;

var player;
var shadowTexture;
var lightSprite;

function create()
{

    game.canvas.oncontextmenu = function(e)
    {
        e.preventDefault();
    }

    game.physics.startSystem(Phaser.Physics.ARCADE);

    map = DungeonBuilder.CreateNewDungeon();

    player = game.add.sprite(32, 32, 'player');
    player.x = Math.floor(map.width / 2) * 32;
    player.y = Math.floor(map.height / 2) * 32;

    game.physics.enable(player);

    game.physics.arcade.gravity.y = 0;

    player.body.bounce.y = 0.2;
    player.body.linearDamping = 1;
    player.body.collideWorldBounds = true;

    screenmask = new Phaser.Rectangle(0, 0, 1440, 720);

    lastCursorPosition = new Phaser.Point(0, 0);
    cursorDelta = new Phaser.Point(0, 0);

    game.camera.follow(player);

    shadowTexture = game.add.bitmapData(game.width, game.height);

    // Create an object that will use the bitmap as a texture
    lightSprite = game.add.image(game.camera.x, game.camera.y, shadowTexture);

    // Set the blend mode to MULTIPLY. This will darken the colors of
    // everything below this sprite.
    lightSprite.blendMode = Phaser.blendModes.MULTIPLY;

    cursors = game.input.keyboard.createCursorKeys();
}

function update()
{
    game.physics.arcade.collide(player, map.collisionLayer);

    cursorDelta.x = game.input.mousePointer.x - lastCursorPosition.x;
    cursorDelta.y = game.input.mousePointer.y - lastCursorPosition.y;

    if (game.input.mousePointer.rightButton.isDown)
    {
        game.camera.x -= cursorDelta.x;
        game.camera.y -= cursorDelta.y;
    }

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -150;
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 150;
    }
    if (cursors.up.isDown)
    {
        player.body.velocity.y = -150;
    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = 150;
    }

    lightSprite.reset(game.camera.x, game.camera.y);
    updateShadowTexture();

    lastCursorPosition.x = game.input.mousePointer.x;
    lastCursorPosition.y = game.input.mousePointer.y;

}

function updateShadowTexture() {
    // Draw shadow
    shadowTexture.context.fillStyle = 'rgb(100, 100, 100)';
    shadowTexture.context.fillRect(0, 0, game.width, game.height);

    var radius = 100 + game.rnd.integerInRange(1,2),
        heroX = player.position.x + 16 - game.camera.x,
        heroY = player.position.y + 16 - game.camera.y;

    // Draw circle of light with a soft edge
    var gradient =
        shadowTexture.context.createRadialGradient(
            heroX, heroY, 100 * 0.75,
            heroX, heroY, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)');

    shadowTexture.context.beginPath();
    shadowTexture.context.fillStyle = gradient;
    shadowTexture.context.arc(heroX, heroY, radius, 0, Math.PI*2, false);
    shadowTexture.context.fill();

    // This just tells the engine it should update the texture cache
    shadowTexture.dirty = true;
}

function render()
{

    var t = map.getTileWorldXY(player.worldPosition.x, player.worldPosition.y);

    if (t)
    {
        game.debug.text('Tile = ' + t.index, 32, 32, '#efefef');
    }

    game.debug.bodyInfo(player, 32, 64);

}
