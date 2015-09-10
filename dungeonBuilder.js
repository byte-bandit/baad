var DungeonBuilder = {
    CreateNewDungeon: function()
    {
        //  Creates a blank tilemap
        map = game.add.tilemap();

        map.addTilesetImage('Desert', 'tiles', 32, 32);

        layer = map.create('Ground', 50, 50, 32, 32);

        layer.debug = false;

        diggSquareRoom(map, Math.floor(map.width / 2), Math.floor(map.height / 2), 5);

        var c = 0;

        while(c < 100)
        {
            var wallPieceCoords = findNewWallPiece(map);

            var featureToBuild = calculateNewFeatureToBuild(wallPieceCoords.orientation);

            if (checkIfFeatureFits(featureToBuild, wallPieceCoords, map))
            {
                c++;
            }
        }

        placeExit(map);

        layer.resizeWorld();

        map.collisionLayer = layer;

        map.setCollision(12);

        return map;
    }
}

TilesetIndex =
{
    FLOOR: 5,
    WALL: 12,
    EXIT: 32
}

WallOrientation = {
    NORTH: 'North',
    EAST: 'East',
    SOUTH: 'South',
    WEST: 'West'
}

function placeExit(map)
{
    var x;
    var y;
    var tile;

    while(!tile || tile.index != TilesetIndex.FLOOR)
    {
        x = Math.floor(Math.random() * (map.width + 1));
        y = Math.floor(Math.random() * (map.height + 1));
        tile = map.getTile(x, y);
    }

    map.putTile(TilesetIndex.EXIT, x, y);
}

function checkIfFeatureFits(feature, origin, map)
{
    var roomOrigin = {x: origin.x, y: origin.y}
    var wallpieceBreak = {x: origin.x, y: origin.y};

    // Step 1
    switch (origin.orientation)
    {
        case WallOrientation.NORTH:
            roomOrigin.y -= feature.height;
            roomOrigin.x -= Math.floor(feature.width / 2);
            wallpieceBreak.y --;
            break;
        case WallOrientation.EAST:
            roomOrigin.y -= Math.floor(feature.height / 2);
            roomOrigin.x += 1;
            wallpieceBreak.x ++;
            break;
        case WallOrientation.SOUTH:
            roomOrigin.y += 1;
            roomOrigin.x -= Math.floor(feature.width / 2);
            wallpieceBreak.y ++;
            break;
        case WallOrientation.WEST:
            roomOrigin.y -= Math.floor(feature.height / 2);
            roomOrigin.x -= feature.width;
            wallpieceBreak.x --;
            break;
    }

    // Step 2
    for (var i = roomOrigin.x; i < roomOrigin.x + feature.width; i++)
    {
        for (var j = roomOrigin.y; j < roomOrigin.y + feature.height; j++)
        {
            if (map.getTile(i,j) || i < 0 || i >= map.width || j < 0 || j >= map.height)
            {
                return false;
            }
        }
    }

    map.putTile(TilesetIndex.FLOOR, origin.x, origin.y);
    for (var i = roomOrigin.x; i < roomOrigin.x + feature.width; i++)
    {
        for (var j = roomOrigin.y; j < roomOrigin.y + feature.height; j++)
        {
            var index = TilesetIndex.FLOOR;

            if (i == roomOrigin.x || i == roomOrigin.x + feature.width - 1 || j == roomOrigin.y || j == roomOrigin.y + feature.height - 1)
            {
                index = TilesetIndex.WALL;
            }

            map.putTile(index, i, j);
        }
    }
    map.putTile(TilesetIndex.FLOOR, wallpieceBreak.x, wallpieceBreak.y);

    return true;
}

function calculateNewFeatureToBuild(orientation)
{
    var dice = Math.floor((Math.random() * 10) + 1)

    switch (true)
    {
        case (dice < 3):
            //tunnel
            if (orientation == WallOrientation.NORTH || orientation == WallOrientation.SOUTH)
            {
                return {
                    width: 3,
                    height: Math.floor((Math.random() * 3) + 3)
                }
            }
            return {
                width: Math.floor((Math.random() * 3) + 3),
                height: 3
            }
            break;
        case (dice > 2 && dice < 7):
            //rect
            return {
                width: Math.floor((Math.random() * 4) + 5),
                height: Math.floor((Math.random() * 4) + 5)
            }
            break;
        case (dice > 6):
            //square
            var size = Math.floor((Math.random() * 4) + 4)
            return {
                width: size,
                height: size
            }
            break;
    }
}

function diggSquareRoom(map, x, y, size)
{
    var originX = x - Math.floor(size / 2);
    var originY = y - Math.floor(size / 2);

    for (var i = originX; i < originX + size; i++)
    {
        for (var j = originY; j < originY + size; j++)
        {
            var index = TilesetIndex.FLOOR;

            if (i == originX || i == originX + size - 1 || j == originY || j == originY + size - 1)
            {
                index = TilesetIndex.WALL;
            }

            map.putTile(index, i, j);
        }
    }
}

function findNewWallPiece(map)
{
    var x;
    var y;
    var tile;

    while (!tile)
    {
        x = Math.floor(Math.random() * (map.width + 1));
        y = Math.floor(Math.random() * (map.height + 1));
        tile = map.getTile(x, y)
        var o = isWallPiece(map, x, y)

        if (tile && o)
        {
            return {
                x: x,
                y: y,
                orientation: o
            };
        }

        tile = null;
    }


}

function isWallPiece(map, x, y)
{
    var wallcount = 0;
    var orientation;
    var tile;

    tile = map.getTile(x - 1, y);
    if (tile && tile.index == TilesetIndex.FLOOR)
    {
        wallcount++;
        orientation = WallOrientation.EAST;
    }

    tile = map.getTile(x + 1, y);
    if (tile && tile.index == TilesetIndex.FLOOR)
    {
        wallcount++;
        orientation = WallOrientation.WEST;
    }

    tile = map.getTile(x, y - 1);
    if (tile && tile.index == TilesetIndex.FLOOR)
    {
        wallcount++;
        orientation = WallOrientation.SOUTH;
    }

    tile = map.getTile(x, y + 1);
    if (tile && tile.index == TilesetIndex.FLOOR)
    {
        wallcount++;
        orientation = WallOrientation.NORTH;
    }

    if (wallcount == 1)
    {
        return orientation;
    }

    return false;
}
