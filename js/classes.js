class Sprite {
    constructor({ position, velocity, color = 'red', offset, imageSrc }) {
        this.position = position;
        this.width = 1024; // Set width to canvas width
        this.height = 576; // Set height to canvas height
        this.color = color; // Add color property
        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw(c) { // Pass `c` explicitly
        c.fillStyle = this.color; // Use the color property
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update(c) {
        this.draw(c);
    }
}

class Fighter {
    constructor({ position, velocity, color = 'red', offset }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 50;
        this.height = 150;
        this.lastKey;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset,
            width: 100,
            height: 50
        };
        this.color = color;
        this.isAttacking;
        this.health = 100;
    }

    draw(c) { // Pass `c` explicitly
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);

        // Draw attack box if attacking
        if (this.isAttacking) {
            c.fillStyle = 'green';
            c.fillRect(
                this.attackBox.position.x,
                this.attackBox.position.y,
                this.attackBox.width,
                this.attackBox.height
            );
        }
    }

    update(c) {
        this.draw(c);
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Gravity simulation
        if (this.position.y + this.height + this.velocity.y >= 576) {
            this.velocity.y = 0;
        } else {
            this.velocity.y += 0.7;
        }
    }

    attack() {
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }
}
