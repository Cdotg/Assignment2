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
    constructor({position,
                 velocity,
                  color = 'red',
                  imageSrc, scale = 1,
                  framesMax = 1, offset = { x: 0, y: 0 },
                  sprites,
                  attackBox = {offset:{x:100, y:100},width: undefined, height:undefined},
                  canvas,
                  gravity }) {
        super({
            position,
            imageSrc,
            scale,
            framesMax,
            offset
        });

        this.velocity = velocity;
        this.width = 50; // Default width
        this.height = 150;
        this.lastKey;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset: attackBox.offset,
            width: attackBox.width,
            height: attackBox.height,
        };
        this.color = color;
        this.isAttacking;
        this.health = 100;
        this.sprites = sprites;
        this.canvas = canvas;
        this.gravity = gravity;

        for (const sprite in sprites){
            sprites[sprite].image = new Image();
            sprites[sprite].image.src = sprites[sprite].imageSrc;
        }
    }

    update(c) {
        this.draw(c);
        this.animateFrames();

        // Set attack box position in front of the fighter
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Gravity simulation
        if (this.position.y + this.height + this.velocity.y >= this.canvas.height - 96) {
            this.velocity.y = 0;
            this.position.y = 330;
        } else {
            this.velocity.y += this.gravity;
        }
    }
 
    switchSprite(sprite) {
        // Override when attacking
        if (this.image === this.sprites.attack.image && this.frameCurrent < this.sprites.attack.framesMax - 1) return;

        // Prevent switching to the same sprite
        if (this.image === this.sprites[sprite].image) return;

        this.image = this.sprites[sprite].image;
        this.framesMax = this.sprites[sprite].framesMax;
        this.frameCurrent = 0;
    }

    attack() {
        this.switchSprite('attack');
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }
}
