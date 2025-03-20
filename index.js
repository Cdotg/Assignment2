// Import TensorFlow.js
let model; // ✅ Global model variable
let trainingData = []; // ✅ Move training data to the top
// Load AI Model (Persistent Learning)
async function loadModel() {
    try {
        model = await tf.loadLayersModel('localstorage://ai-enemy-model');
        console.log("AI model loaded from storage!");
    } catch (error) {
        console.log("No saved model found, using default AI.");
        model = tf.sequential();
        model.add(tf.layers.dense({ units: 8, inputShape: [4], activation: 'relu' }));
        model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 4, activation: 'softmax' }));
        model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy' });
    }
}





let gameStarted = false;
let gameMode = 'twoPlayer';

const backgroundMusic = new Audio('audio/background.mp3');
const gameMusic = new Audio('audio/battle.mp3');

document.addEventListener('DOMContentLoaded', async () => {
    await loadModel();  // ✅ Load AI model first
    const canvas = document.querySelector('canvas');
    const c = canvas.getContext('2d');

    canvas.width = 1024;
    canvas.height = 576;

    const gravity = 1;

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
            idle: { imageSrc: 'img/samurai2/IDLE.png', framesMax: 5 },
            run: { imageSrc: 'img/samurai2/RUN.png', framesMax: 8 },
            jump: { imageSrc: 'img/samurai2/JUMP.png', framesMax: 3 },
            attack: { imageSrc: 'img/samurai2/ATTACK 1.png', framesMax: 5 },
            takeHit: { imageSrc: 'img/samurai2/HURT.png', framesMax: 4 },
            death: { imageSrc: 'img/samurai2/DEATH.png', framesMax: 9 }
        },
        attackBox: { offset: { x: 200, y: 140 }, width: 10, height: 25 },
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
            idle: { imageSrc: 'img/panda/IDLE.png', framesMax: 8 },
            run: { imageSrc: 'img/panda/RUN.png', framesMax: 8 },
            jump: { imageSrc: 'img/panda/JUMP.png', framesMax: 3 },
            attack: { imageSrc: 'img/panda/ATTACK 1.png', framesMax: 7 },
            takeHit: { imageSrc: 'img/panda/HURT.png', framesMax: 4 },
            death: { imageSrc: 'img/panda/DEATH.png', framesMax: 9 }
        },
        attackBox: { offset: { x: -150, y: 125 }, width: 10, height: 25 },
        canvas: canvas,
        gravity: gravity
    });

    const keys = {
        a: { pressed: false },
        d: { pressed: false },
        ArrowLeft: { pressed: false },
        ArrowRight: { pressed: false }
    };

    let trainingData = [];


async function trainModel() {
    if (trainingData.length === 0) return;  // Avoid training on empty data

    const inputs = tf.tensor2d(trainingData.map(d => d[0]));
    const labels = tf.tensor2d(trainingData.map(d => {
        let arr = [0, 0, 0, 0];
        arr[d[1]] = 1;
        return arr;
    }));

    await model.fit(inputs, labels, { epochs: 20 });
    console.log("AI training complete!");

    // 🔹 Save Model to Local Storage
    await model.save('localstorage://ai-enemy-model');
    localStorage.setItem('ai-trained', 'true'); // Mark AI as trained
    console.log("Model saved!");
}


function recordTrainingData(player, enemy) {
    const distance = player.position.x - enemy.position.x;
    const playerAttacking = player.isAttacking ? 1 : 0;
    const enemyHealth = enemy.health / 100;
    const randomness = Math.random();
    const action = Math.floor(Math.random() * 4); // Random move for training

    trainingData.push([[distance, playerAttacking, enemyHealth, randomness], action]);

    // 🔹 After collecting enough data, train AI automatically
    if (trainingData.length > 500) {
        trainModel();
    }
}

function updateEnemyAI(player, enemy) {
    if (!model) return; // ✅ Avoid AI trying to run without a model

    const distance = player.position.x - enemy.position.x;
    const playerAttacking = player.isAttacking ? 1 : 0;
    const enemyHealth = enemy.health / 100;
    const randomness = Math.random();

    // Prepare input tensor
    const input = tf.tensor2d([[distance, playerAttacking, enemyHealth, randomness]]);
    
    // Predict best move
    model.predict(input).data().then(predictions => {
        const actionIndex = predictions.indexOf(Math.max(...predictions)); // Choose highest value action
        
        if (actionIndex === 0 && distance > 50) {
            enemy.velocity.x = 5;
            enemy.switchSprite('run'); 
        } else if (actionIndex === 1 && distance < -50) {
            enemy.velocity.x = -5;
            enemy.switchSprite('run'); 
        } else if (actionIndex === 2) {
            enemy.velocity.x = 0;
            enemy.switchSprite('idle');
            enemy.attack(); // AI attacks when close
        } else if (actionIndex === 3 && enemy.velocity.y === 0) {
            enemy.velocity.y = -15; // AI jumps randomly
        }
    });
}



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
            player.velocity.x = -7;
            player.switchSprite('run');
        } else if (keys.d.pressed && player.lastKey === 'd' && !player.dead) {
            player.velocity.x = 10;
            player.switchSprite('run');
        } else if (player.velocity.y === 0 && !player.isAttacking && !player.dead) {
            player.switchSprite('idle');
        }

        if (player.velocity.y < 0) {
            player.switchSprite('jump');
        } else if (player.velocity.y > 0) {
            player.switchSprite('run');
        }

        if (gameMode === 'singlePlayer') {
            recordTrainingData(player, enemy); // Collect data for AI
            updateEnemyAI(player, enemy); // AI-controlled enemy
        }
        
        
        
         else {
            if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft' && !enemy.dead) {
                enemy.velocity.x = -5;
                enemy.switchSprite('run');
            } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight' && !enemy.dead) {
                enemy.velocity.x = 5;
                enemy.switchSprite('run');
            } else if (enemy.velocity.y === 0 && !enemy.isAttacking && !enemy.dead) {
                enemy.switchSprite('idle');
            }

            if (enemy.velocity.y < 0) {
                enemy.switchSprite('jump');
            } else if (enemy.velocity.y > 0) {
                enemy.switchSprite('run');
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
                        player.velocity.y = -20;
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
                        enemy.velocity.y = -17;
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

    animate();

    const modeButton = document.getElementById('modeToggle');
    modeButton.addEventListener('click', () => {
        if (gameMode === 'twoPlayer') {
            gameMode = 'singlePlayer';
            modeButton.innerText = 'Switch to Two Player';
        } else {
            gameMode = 'twoPlayer';
            modeButton.innerText = 'Switch to Single Player';
        }
    });

    const startGameBtn = document.getElementById('startGameBtn');
    startGameBtn.addEventListener('click', () => {
        startGameBtn.style.display = 'none';
        gameStarted = true;
        backgroundMusic.pause();
        gameMusic.currentTime = 0;
        gameMusic.loop = true;
        gameMusic.play();
        decreaseTimer();
    });

    const restartGameBtn = document.getElementById('restartGameBtn');
    restartGameBtn.addEventListener('click', () => {
        gameMusic.pause();
        location.reload();
    });

    backgroundMusic.currentTime = 3;
    backgroundMusic.loop = true;
    backgroundMusic.play();

    backgroundMusic.addEventListener('ended', () => {
        backgroundMusic.currentTime = 3;
        backgroundMusic.play();
    });

    backgroundMusic.play();

    function resetAI() {
        localStorage.removeItem('ai-trained');
        localStorage.removeItem('ai-enemy-model');
        console.log("AI model reset!");
    }
    
});
