interface SpaceObject {
    x: number;
    y: number;
}

let gameStarted: boolean = false;
let spaceship: SpaceObject = { x: 2, y: 4 }; // Spaceship starts in the middle of the bottom row
let asteroids: SpaceObject[] = [];
let missiles: SpaceObject[] = [];
let score: number = 0;
let spawnRate: number = 0.1; // Initial spawn rate for asteroids
let lives: number = 3; // Number of lives the player has

function initializeGame(): void {
    gameStarted = true;
    asteroids = [];
    missiles = [];
    score = 0;
    spawnRate = 0.1;
    lives = 3;
}

function moveSpaceship(direction: string): void {
    if (direction === 'left' && spaceship.x > 0) {
        spaceship.x -= 1;
    } else if (direction === 'right' && spaceship.x < 4) {
        spaceship.x += 1;
    }
}

function shootMissile(): void {
    missiles.push({ x: spaceship.x, y: spaceship.y - 1 });
    music.playTone(262, music.beat(BeatFraction.Sixteenth)); // Sound effect for shooting
}

function updateAsteroids(): void {
    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].y += 1;
        if (asteroids[i].y === 3) {
            lives--;
            if (lives <= 0) {
                gameStarted = false;
                showEndGameScene();
                return;
            }
        }
    }

    spawnRate = 0.1 + score / 500;

    if (Math.random() < spawnRate) {
        asteroids.push({ x: Math.floor(Math.random() * 5), y: 0 });
    }
}

function updateMissiles(): void {
    for (let i = 0; i < missiles.length; i++) {
        missiles[i].y -= 1;
        if (missiles[i].y < 0) {
            missiles.splice(i, 1);
            i--;
        }
    }
}

function checkCollisions(): void {
    for (let i = 0; i < asteroids.length; i++) {
        for (let j = 0; j < missiles.length; j++) {
            if (asteroids[i].x === missiles[j].x && asteroids[i].y === missiles[j].y) {
                asteroids.splice(i, 1);
                missiles.splice(j, 1);
                i--;
                j--;
                score++;
                music.playTone(523, music.beat(BeatFraction.Sixteenth)); // Sound effect for asteroid destruction
                break;
            }
        }
    }
}

function draw(): void {
    basic.clearScreen();
    if (gameStarted) {
        led.plot(spaceship.x, spaceship.y);
        missiles.forEach((missile: SpaceObject) => {
            led.plot(missile.x, missile.y);
        });
        asteroids.forEach((asteroid: SpaceObject) => {
            led.plot(asteroid.x, asteroid.y);
        });
    }
}

function showEndGameScene(): void {
    basic.clearScreen();
    music.playTone(131, music.beat(BeatFraction.Whole)); // Sound effect for game over
    basic.showNumber(score);
}

function gameLoop(): void {
    if (!gameStarted) {
        return;
    }
    updateAsteroids();
    updateMissiles();
    checkCollisions();
    draw();
    basic.pause(200);
}

input.onButtonPressed(Button.A, function () {
    if (!gameStarted) {
        initializeGame();
    } else {
        moveSpaceship('left');
    }
});

input.onButtonPressed(Button.B, function () {
    if (gameStarted) {
        moveSpaceship('right');
    }
});

input.onButtonPressed(Button.AB, function () {
    if (gameStarted) {
        shootMissile();
    }
});

basic.forever(function () {
    gameLoop();
});