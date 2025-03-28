function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
        rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
        rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
    );
}
function determineWinner({player, enemy, timerId}){
    clearTimeout(timerId);
    document.querySelector('#displayText').style.display = 'flex';
    document.querySelector('#restartGameBtn').style.display = 'inline-block'; // CHANGED: ensure button is clickable
    if (player.health === enemy.health) {
        document.querySelector('#displayText').innerHTML = 'Tie';
    }
    else if(player.health > enemy.health){
        document.querySelector('#displayText').innerHTML = 'Samurai Wins';
    }
    else if(player.health < enemy.health){
        document.querySelector('#displayText').innerHTML = 'Panda Wins';
    }
}
let timer = 60
let timerId
function decreaseTimer(player, enemy) { // UPDATED: Accept player and enemy as arguments
    if (timer > 0) {
        timerId = setTimeout(() => decreaseTimer(player, enemy), 1000); // UPDATED: Slow down timer to 1 second
        timer--;
        document.querySelector('#timer').innerHTML = timer;
    }

    if (timer === 0) {
        determineWinner({ player, enemy, timerId });
    }
}
