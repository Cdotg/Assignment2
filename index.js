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

    const shop = new Sprite({
        position: { x: 600, y: 210 },
        imageSrc: 'img/shop.png',
        scale: 2.5,
        framesMax: 6
    });

    const player = new Fighter({
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        imageSrc: 'img/samurai2/IDLE.png',
        framesMax: 5,
        scale: 2.5,
        offset: { x: 32, y: -60
        },
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
        },
        canvas: canvas,
        gravity: gravity
    });

    const enemy = new Fighter({
        position: { x: 400, y: 100 },
        velocity: { x: 0, y: 0 },
        color: 'blue',
        offset: { x: -50, y: 0 },
        canvas: canvas,
        gravity: gravity
    });

    const keys = {
        a: { pressed: false },
        d: { pressed: false },
        ArrowLeft: { pressed: false },
        ArrowRight: { pressed: false }
    };

    decreaseTimer();

    function animate() {
        window.requestAnimationFrame(animate);
        c.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        background.update(c);
        shop.update(c);
        player.update(c);
        // enemy.update(c);

        player.velocity.x = 0;
        enemy.velocity.x = 0;

        // Player movement
        if (keys.a.pressed && player.lastKey === 'a') {
            player.velocity.x = -5;
            player.switchSprite('run');
        } else if (keys.d.pressed && player.lastKey === 'd') {
            player.velocity.x = 5;
            player.switchSprite('run');
        } else if (player.velocity.y === 0) {
            player.switchSprite('idle');
        }

        // Player jump

        if (player.velocity.y < 0) {
            player.switchSprite('jump');
        } else if (player.velocity.y > 0) {
            player.switchSprite('run')

        }

        // Enemy movement
        if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
            enemy.velocity.x = -5;
        } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
            enemy.velocity.x = 5;
        }

        // Collision detection
        if (
            rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
            player.isAttacking
        ) {
            player.isAttacking = false;
            enemy.health -= 20;
            document.querySelector('#enemyHealth').style.width = enemy.health + '%';
        }

        if (
            rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
            enemy.isAttacking
        ) {
            enemy.isAttacking = false;
            player.health -= 20;
            document.querySelector('#playerHealth').style.width = player.health + '%';
        }

        // End game based on health
        if (enemy.health <= 0 || player.health <= 0) {
            determineWinner({ player, enemy, timerId });
        }
    }
    animate();

    // FORWARD PLAYER 1
    window.addEventListener('keydown', (event) => {
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
                    if (keys.a.pressed) {
                        player.velocity.x = -5;
                    } else if (keys.d.pressed) {
                        player.velocity.x = 5;
                    }
                }
                break;
            case ' ':
                player.attack();
                break;
            case 'ArrowRight':
                keys.ArrowRight.pressed = true;
                enemy.lastKey = 'ArrowRight';
                break;
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = 'ArrowLeft';
                break;
            case 'ArrowUp':
                enemy.velocity.y = -15;
                break;
            case 'ArrowDown':
                enemy.isAttacking = true;
                break;
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
