class Sprite {
    constructor({ position, velocity, color = 'red', imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 } }) {
        this.position = position;
        this.width = 1024;
        this.height = 576;
        this.color = color;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.frameCurrent = 0;
        this.frameElapsed = 0;
        this.framesHold = 8;
        this.offset = offset;
    }

    draw(c) {
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
    constructor({ position, velocity, color = 'red', imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, sprites, attackBox = { offset: { x: 0, y: 0 }, width: undefined, height: undefined }, canvas, gravity }) {
        super({ position, imageSrc, scale, framesMax, offset });

        this.velocity = velocity;
        this.width = 70;
        this.height = 150;
        this.lastKey;
        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            offset: attackBox.offset,
            width: attackBox.width,
            height: attackBox.height
        };
        this.color = color;
        this.isAttacking;
        this.health = 100;
        this.sprites = sprites;
        this.dead = false;
        this.canvas = canvas;
        this.gravity = gravity;
        this.attackCooldown = false; // ADDED: cooldown flag

        for (const sprite in sprites) {
            sprites[sprite].image = new Image();
            sprites[sprite].image.src = sprites[sprite].imageSrc;
        }
    }

    update(c) {
        this.draw(c);
        if (!this.dead) this.animateFrames();

        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y >= this.canvas.height - 96) {
            this.velocity.y = 0;
            this.position.y = 330;
        } else {
            this.velocity.y += this.gravity;
        }
    }

    attack() {
        if (this.attackCooldown) return; // ADDED: check cooldown

        this.switchSprite('attack');
        this.isAttacking = true;
        this.attackCooldown = true; // ADDED: set cooldown

        setTimeout(() => {
            this.attackCooldown = false; // ADDED: reset cooldown after 2 seconds
        }, 2000);
    }

    takeHit() {
        this.health -= 20;

        if (this.health <= 0) {
            this.switchSprite('death');
        } else {
            this.switchSprite('takeHit');
        }
    }

    switchSprite(sprite) {
        if (this.image === this.sprites.death.image) {
            if (this.frameCurrent === this.sprites.death.framesMax - 1) this.dead = true;
            return;
        }

        if (this.image === this.sprites.attack.image && this.frameCurrent < this.sprites.attack.framesMax - 1) return;

        if (this.image === this.sprites.takeHit.image && this.frameCurrent < this.sprites.takeHit.framesMax - 1) return;

        if (this.image === this.sprites[sprite].image) return;

        this.image = this.sprites[sprite].image;
        this.framesMax = this.sprites[sprite].framesMax;
        this.frameCurrent = 0;
    }
}


