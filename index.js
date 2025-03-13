document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const c = canvas.getContext('2d');

    canvas.width = 1024;
    canvas.height = 576;

    const gravity = 0.7;

    const background = new Sprite({
        position: { x: 0, y: 0 },
        imageSrc: 'img/Background.png'
    });

    const player = new Fighter({
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        imageSrc: 'img/samurai2/IDLE.png',
        framesMax: 5,
        scale: 2.5,
        offset: { x: -30, y: -60 },
        sprites: {
            idle:{
                imageSrc: 'img/samurai2/IDLE.png',
                framesMax: 5,
            },
            run:{
                imageSrc: 'img/samurai2/RUN.png',
                framesMax: 8,
            },
            jump:{
                imageSrc: 'img/samurai2/JUMP.png',
                framesMax: 3,
            },
            attack:{
                imageSrc: 'img/samurai2/ATTACK 1.png',
                framesMax: 5,
            },
            takeHit:{
                imageSrc: 'img/samurai2/HURT.png',
                framesMax: 4,
            },
            death:{
                imageSrc: 'img/samurai2/DEATH.png',
                framesMax: 9,
            }
        },
        attackBox:{
            offset: { x: 200, y: 140},
            width: 10, 
            height: 25
        },
        canvas: canvas,
        gravity: gravity
    });

    const enemy = new Fighter({
        position: { x: 800, y: 100 },
        velocity: { x: 0, y: 0 },
        imageSrc: 'img/panda/IDLE.png',
        framesMax: 8,
        scale: 2,
        offset: { x: 80, y: -80 },
        sprites: {
            idle:{
                imageSrc: 'img/panda/IDLE.png',
                framesMax: 8,
            },
            run:{
                imageSrc: 'img/panda/RUN.png',
                framesMax: 8,
            },
            jump:{
                imageSrc: 'img/panda/JUMP.png',
                framesMax: 3,
            },
            attack:{
                imageSrc: 'img/panda/ATTACK 1.png',
                framesMax: 7,
            },
            takeHit:{
                imageSrc: 'img/panda/HURT.png',
                framesMax: 4,
            },
            death:{
                imageSrc: 'img/panda/DEATH.png',
                framesMax: 9,
            }
        },
        attackBox:{
            offset: { x: -150, y: 125 },
            width: 10,
            height: 25
        },
        canvas: canvas,
        gravity: gravity
    });

    const keys = {
        a: { pressed: false },
        d: { pressed: false },
        ArrowLeft: { pressed: false },
        ArrowRight: { pressed: false }
    };

    let timer = 60;
    let timerId;

    function decreaseTimer() {
        if (timer > 0) {
            timerId = setTimeout(decreaseTimer, 1000);
            timer--;
            document.querySelector('#timer').innerHTML = timer;
        }

        if (timer === 0) {
            determineWinner({ player, enemy, timerId });
        }
    }

    function animate() {
        window.requestAnimationFrame(animate);
        c.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        background.update(c);
        c.fillStyle = 'rgba(255, 255, 255, 0.15)';
        c.fillRect(0, 0, canvas.width, canvas.height);
        player.update(c);
        enemy.update(c);

        player.velocity.x = 0;
        enemy.velocity.x = 0;

        // Player movement
        if (keys.a.pressed && player.lastKey === 'a' && !player.dead) {
            player.velocity.x = -5;
            player.switchSprite('run');
        } else if (keys.d.pressed && player.lastKey === 'd' && !player.dead) {
            player.velocity.x = 5;
            player.switchSprite('run');
        } else if (player.velocity.y === 0 && !player.isAttacking && !player.dead) {
            player.switchSprite('idle');
        }

        // Player jump
        if (player.velocity.y < 0) {
            player.switchSprite('jump');
        } else if (player.velocity.y > 0) {
            player.switchSprite('run');
        }

        // Enemy movement
        if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft' && !enemy.dead) {
            enemy.velocity.x = -5;
            enemy.switchSprite('run');
        } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight' && !enemy.dead) {
            enemy.switchSprite('run');
            enemy.velocity.x = 5;
        } else if (enemy.velocity.y === 0 && !enemy.isAttacking && !enemy.dead) {
            enemy.switchSprite('idle');
        }

        // Enemy jump
        if (enemy.velocity.y < 0) {
            enemy.switchSprite('jump');
        } else if (enemy.velocity.y > 0) {
            enemy.switchSprite('run');
        }

        // Collision detection & enemy gets hit
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

        // if player misses
        if (player.isAttacking && player.frameCurrent === 3) {
            player.isAttacking = false;
        }

        // where player gets hit
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

        // if enemy misses
        if (enemy.isAttacking && enemy.frameCurrent === 5) {
            enemy.isAttacking = false;
        }

        
        // End game based on health
        if (enemy.health <= 0 || player.health <= 0) {
            determineWinner({ player, enemy, timerId });
        }
    }

    // Start game immediately
    decreaseTimer();
    animate();

    // FORWARD PLAYER 1
    window.addEventListener('keydown', (event) => {
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
                        player.velocity.y = -15;
                    }
                    break;
                case ' ':
                    player.attack();
                    break;
            }
        }

        if (!enemy.dead) {
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
                        enemy.velocity.y = -15;
                    }
                    break;
                case 'ArrowDown':
                    enemy.attack();
                    break;
            }
        }
    });

    window.addEventListener('keyup', (event) => {
        switch (event.key) {
            case 'd':
                keys.d.pressed = false;
                break;
            case 'a':
                keys.a.pressed = false;
                break;
        }
        // enemy keys
        switch (event.key) {
            case 'ArrowRight':
                keys.ArrowRight.pressed = false;
                break;
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = false;
                break;
        }
    });
});
