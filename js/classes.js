class Sprite {
    constructor({ position, velocity, color = 'red', imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 } }) {
        this.position = position;
        this.width = 1024; // Set width to canvas width
        this.height = 576; // Set height to canvas height
        this.color = color; // Add color property
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.frameCurrent = 0;
        this.frameElapsed = 0;
        this.framesHold = 5;
        this.offset = offset;
    }

    draw(c) { // Pass `c` explicitly
        c.drawImage(
            this.image,
            this.frameCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            (this.image.width / this.framesMax) * this.scale,
            this.image.height * this.scale
        );
    }

    animateFrames() {
        this.frameElapsed++;

        if (this.frameElapsed % this.framesHold === 0) {
            if (this.frameCurrent < this.framesMax - 1) {
                this.frameCurrent++;
            } else {
                this.frameCurrent = 0;
            }
        }
    }

    update(c) {
        this.draw(c);
        this.animateFrames();
    }
}

class Fighter extends Sprite {
    constructor({ position, velocity, color = 'red', imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, sprites }) {
        super({
            position,
            imageSrc,
            scale,
            framesMax,
            offset
        });

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
        this.sprites = sprites;

        for (const sprite in sprites){
            sprites[sprite].image = new Image()
            sprites[sprite].image.src = sprites[sprite].imageSrc

        }

        console.log(this.sprites);
    }

    update(c) {
        this.draw(c);
        this.animateFrames();

        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Gravity simulation
        if (this.position.y + this.height + this.velocity.y >= 560) {
            this.velocity.y = 0;
        } else {
            this.velocity.y += 0.7;
        }
    }

    switchSprite(sprite) {
        if (this.image === this.sprites[sprite].image) return;
        this.image = this.sprites[sprite].image;
        this.framesMax = this.sprites[sprite].framesMax;
        this.frameCurrent = 0;
    }

    attack() {
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }
}
