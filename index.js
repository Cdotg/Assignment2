let gameStarted = false;
let gameMode = 'twoPlayer';
let difficultyLevel = 'easy';

const movementSpeed = 7;
const jumpHeight = -20;

const backgroundMusic = new Audio('audio/background.mp3');
const gameMusic = new Audio('audio/battle.mp3');

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const c = canvas.getContext('2d');

    canvas.width = 1024;
    canvas.height = 576;

    const gravity = 1;

    const background = new Sprite({
        position: { x: 0, y: 0 },
        imageSrc: 'img/Background.png'
    });

    const keys = {
        a: { pressed: false },
        d: { pressed: false },
        ArrowLeft: { pressed: false },
        ArrowRight: { pressed: false }
    };

    function updateEnemyAI(player, enemy) {
        const distance = player.position.x - enemy.position.x;

        if (difficultyLevel === 'easy') {
            if (distance > 200) {
                enemy.velocity.x = 3;
                enemy.switchSprite('run');
            } else if (distance < -200) {
                enemy.velocity.x = -3;
                enemy.switchSprite('run');
            } else {
                enemy.velocity.x = 0;
                if (Math.random() < 0.3) {
                    enemy.attack();
                } else {
                    enemy.switchSprite('idle');
                }
            }
        } else if (difficultyLevel === 'medium') {
            if (distance > 150) {
                enemy.velocity.x = 5;
                enemy.switchSprite('run');
            } else if (distance < -150) {
                enemy.velocity.x = -5;
                enemy.switchSprite('run');
            } else {
                enemy.velocity.x = 0;
                if (Math.random() < 0.5) {
                    enemy.attack();
                } else {
                    enemy.switchSprite('idle');
                }
            }
        } else if (difficultyLevel === 'hard') {
            if (distance > 100) {
                enemy.velocity.x = 7;
                enemy.switchSprite('run');
            } else if (distance < -100) {
                enemy.velocity.x = -7;
                enemy.switchSprite('run');
            } else {
                enemy.velocity.x = 0;
                if (Math.random() < 0.7) {
                    enemy.attack();
                } else {
                    enemy.switchSprite('idle');
                }
            }

            if (Math.random() < 0.1 && enemy.velocity.y === 0) {
                enemy.velocity.y = -15;
            }
        }
    }

    const startGameBtn = document.getElementById('startGameBtn');
    const modeButton = document.getElementById('modeToggle');
    const difficultyButton = document.getElementById('difficultyToggle');

    let player, enemy;

    function initializeGame() {
        player = new Fighter({
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            imageSrc: 'img/samurai2/IDLE.png',
            framesMax: 5,
            scale: 2.5,
            offset: { x: 100, y: -60 },
            sprites: {
                idle: { imageSrc: 'img/samurai2/IDLE.png', framesMax: 5 },
                run: { imageSrc: 'img/samurai2/RUN.png', framesMax: 8 },
                jump: { imageSrc: 'img/samurai2/JUMP.png', framesMax: 3 },
                attack: { imageSrc: 'img/samurai2/ATTACK 1.png', framesMax: 5 },
                takeHit: { imageSrc: 'img/samurai2/HURT.png', framesMax: 4 },
                death: { imageSrc: 'img/samurai2/DEATH.png', framesMax: 9 }
            },
            attackBox: { offset: { x: 70, y: 140 }, width: 10, height: 25 },
            canvas: canvas,
            gravity: gravity
        });

        enemy = new Fighter({
            position: { x: 800, y: 100 },
            velocity: { x: 0, y: 0 },
            imageSrc: 'img/panda/IDLE.png',
            framesMax: 8,
            scale: 2,
            offset: { x: 80, y: -80 },
            sprites: {
                idle: { imageSrc: 'img/panda/IDLE.png', framesMax: 8 },
                run: { imageSrc: 'img/panda/RUN.png', framesMax: 8 },
                jump: { imageSrc: 'img/panda/JUMP.png', framesMax: 3 },
                attack: { imageSrc: 'img/panda/ATTACK 1.png', framesMax: 7 },
                takeHit: { imageSrc: 'img/panda/HURT.png', framesMax: 4 },
                death: { imageSrc: 'img/panda/DEATH.png', framesMax: 9 }
            },
            attackBox: { offset: { x: -70, y: 125 }, width: 15, height: 25 },
            canvas: canvas,
            gravity: gravity
        });

        gameStarted = false;
        timer = 60;
        document.querySelector('#timer').innerHTML = timer;
        document.querySelector('#displayText').style.display = 'none';
        document.querySelector('#restartGameBtn').style.display = 'none';
        startGameBtn.style.display = 'block';
    }

    initializeGame();

    modeButton.addEventListener('click', () => {
        if (gameMode === 'twoPlayer') {
            gameMode = 'singlePlayer';
            modeButton.innerText = 'Switch to Two Player';
            difficultyButton.disabled = false;
        } else {
            gameMode = 'twoPlayer';
            modeButton.innerText = 'Switch to Single Player';
            difficultyButton.disabled = true;
        }
        initializeGame();
    });

    difficultyButton.addEventListener('click', () => {
        if (difficultyLevel === 'easy') {
            difficultyLevel = 'medium';
            difficultyButton.innerText = 'Difficulty: Medium';
        } else if (difficultyLevel === 'medium') {
            difficultyLevel = 'hard';
            difficultyButton.innerText = 'Difficulty: Hard';
        } else {
            difficultyLevel = 'easy';
            difficultyButton.innerText = 'Difficulty: Easy';
        }
    });

    startGameBtn.addEventListener('click', () => {
        startGameBtn.style.display = 'none';
        gameStarted = true;
        backgroundMusic.pause();
        gameMusic.currentTime = 0;
        gameMusic.loop = true;
        gameMusic.play();
        decreaseTimer(player, enemy);
    });

    const restartGameBtn = document.getElementById('restartGameBtn');
    restartGameBtn.addEventListener('click', () => {
        initializeGame();
    });

    backgroundMusic.currentTime = 3;
    backgroundMusic.loop = true;
    backgroundMusic.play();

    backgroundMusic.addEventListener('ended', () => {
        backgroundMusic.currentTime = 3;
        backgroundMusic.play();
    });

    function animate() {
        window.requestAnimationFrame(animate);
        c.clearRect(0, 0, canvas.width, canvas.height);

        background.update(c);
        c.fillStyle = 'rgba(255, 255, 255, 0.15)';
        c.fillRect(0, 0, canvas.width, canvas.height);

        player.update(c);
        enemy.update(c);

        if (!gameStarted) {
            player.velocity.x = 0;
            enemy.velocity.x = 0;
            return;
        }

        player.velocity.x = 0;
        enemy.velocity.x = 0;

        if (keys.a.pressed && player.lastKey === 'a' && !player.dead) {
            player.velocity.x = -movementSpeed;
            player.switchSprite('run');
        } else if (keys.d.pressed && player.lastKey === 'd' && !player.dead) {
            player.velocity.x = movementSpeed;
            player.switchSprite('run');
        } else if (player.velocity.y === 0 && !player.isAttacking && !player.dead) {
            player.switchSprite('idle');
        }

        if (player.velocity.y < 0) {
            player.switchSprite('jump');
        }

        if (gameMode === 'singlePlayer') {
            updateEnemyAI(player, enemy);
        } else {
            if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft' && !enemy.dead) {
                enemy.velocity.x = -movementSpeed;
                enemy.switchSprite('run');
            } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight' && !enemy.dead) {
                enemy.velocity.x = movementSpeed;
                enemy.switchSprite('run');
            } else if (enemy.velocity.y === 0 && !enemy.isAttacking && !enemy.dead) {
                enemy.switchSprite('idle');
            }

            if (enemy.velocity.y < 0) {
                enemy.switchSprite('jump');
            }
        }

        if (
            rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
            player.isAttacking && player.frameCurrent === 3
        ) {
            enemy.takeHit();
            player.isAttacking = false;

            gsap.to('#enemyHealth', {
                width: enemy.health + '%',
                right: 0
            });
        }

        if (player.isAttacking && player.frameCurrent === 3) {
            player.isAttacking = false;
        }

        if (
            rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
            enemy.isAttacking && enemy.frameCurrent === 5
        ) {
            player.takeHit();
            enemy.isAttacking = false;

            gsap.to('#playerHealth', {
                width: player.health + '%'
            });
        }

        if (enemy.isAttacking && enemy.frameCurrent === 5) {
            enemy.isAttacking = false;
        }

        if (enemy.health <= 0 || player.health <= 0) {
            determineWinner({ player, enemy, timerId });
        }
    }

    animate();

    window.addEventListener('keydown', (event) => {
        if (!gameStarted) return;

        if (!player.dead) {
            switch (event.key) {
                case 'd':
                    keys.d.pressed = true;
                    player.lastKey = 'd';
                    break;
                case 'a':
                    keys.a.pressed = true;
                    player.lastKey = 'a';
                    break;
                case 'w':
                    if (player.velocity.y === 0) {
                        player.velocity.y = jumpHeight;
                    }
                    break;
                case ' ':
                    player.attack();
                    break;
            }
        }

        if (gameMode === 'twoPlayer' && !enemy.dead) {
            switch (event.key) {
                case 'ArrowRight':
                    keys.ArrowRight.pressed = true;
                    enemy.lastKey = 'ArrowRight';
                    break;
                case 'ArrowLeft':
                    keys.ArrowLeft.pressed = true;
                    enemy.lastKey = 'ArrowLeft';
                    break;
                case 'ArrowUp':
                    if (enemy.velocity.y === 0) {
                        enemy.velocity.y = jumpHeight;
                    }
                    break;
                case 'ArrowDown':
                    enemy.attack();
                    break;
            }
        }
    });

    window.addEventListener('keyup', (event) => {
        if (!gameStarted) return;

        switch (event.key) {
            case 'd':
                keys.d.pressed = false;
                break;
            case 'a':
                keys.a.pressed = false;
                break;
        }

        if (gameMode === 'twoPlayer') {
            switch (event.key) {
                case 'ArrowRight':
                    keys.ArrowRight.pressed = false;
                    break;
                case 'ArrowLeft':
                    keys.ArrowLeft.pressed = false;
                    break;
            }
        }
    });
});
