// import Paddle from './paddle'


// for class Game

const GAMESTATE = {
    PAUSED:0,
    RUNING:1,
    MENU:2,
    GAMEOVER:3,
    NEWLEVEL:4
}

class paddle{
    constructor(game){
        this.gameWidth = game.gameWidth;
        this.width = 100;
        this.height = 30;

        this.position = {
            x:game.gameWidth/2-this.width/2,
            y:game.gameHeight-this.height-10,

        }

        this.maxSpeed = 10;
        this.speed = 0;
    }


    moveLeft(){
        this.speed = -this.maxSpeed
    }

    moveRight(){
        this.speed = this.maxSpeed
    }
    stop(){
        this.speed = 0; 
    }

    draw(ctx){
        ctx.fillRect(this.position.x,this.position.y,this.width,this.height)
    }
    update(deltaTime){
        this.position.x+= this.speed ;
        if(this.position.x<0){ 
            this.position.x =0
        }
        if(this.position.x + this.width > this.gameWidth){ 
            this.position.x = this.gameWidth - this.width;
        }
    }
}
class counter {
    constructor(){
        this.counter = document.getElementById("counter")
    }
    draw(ctx){
        ctx.fillText('fddscss',20,20);
    }
}

class Brick {
    constructor(game,position){
        this.image = document.getElementById("img_brick");
        this.position=position; 
       this.width = 80;
       this.height =24;

        this.game = game;
        this.markedForDeletion = false;
    }

    update(){
        if(detectCollision(this.game.ball,this)){
            this.game.ball.speed.y = -this.game.ball.speed.y
            this.markedForDeletion = true;
        }
    }

    draw(ctx){
        ctx.drawImage(this.image,this.position.x,this.position.y,this.width,this.height)

    }
}

class InputHandler{
    constructor(Paddle,game){
        document.addEventListener('keydown',()=>{
            
            switch(event.keyCode){
                case 37: Paddle.moveLeft();
                    break;
                case 39: Paddle.moveRight();
                    break;
                case 27: game.togglePause();    // Escape tab
                    break;
                case 32: game.start();  // space tab
                    break;
            }
        })

        document.addEventListener('keyup',()=>{
            
            switch(event.keyCode){
                case 37: 
                if(Paddle.speed<0)    
                    Paddle.stop();
                    break;
                case 39:
                if(Paddle.speed>0)
                    Paddle.stop();
                    break;
            }
        })
    }
}


class Game{
    constructor(gameWidth,gameHeight){
        
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.gameState = GAMESTATE.MENU
        this.Paddle = new paddle(this);
        new InputHandler(this.Paddle,this)
        new counter()
        this.gameObjects = []
        this.bricks = []
        this.lives = 10
        this.levels = [level1,level2,level3,level4,level5]
        this.currentLevel = 0
    }

    start(){

        if(this.gameState!==GAMESTATE.MENU && this.gameState!==GAMESTATE.NEWLEVEL) return

        this.gameState = GAMESTATE.RUNING;

        this.ball = new Ball(this);  
        this.bricks = buildLevel(this,this.levels[this.currentLevel])
        this.ball.reset()

        this.gameObjects = [
            this.ball,
            this.Paddle
        ]
    }


    update(deltaTime){

        if(this.lives==0) {
            this.gameState = GAMESTATE.GAMEOVER
        }

       if(this.gameState===GAMESTATE.PAUSED || this.gameState===GAMESTATE.MENU || this.gameState.GAMEOVER) return 

      if(this.bricks.length==0) {
          this.currentLevel++
          this.gameState = GAMESTATE.NEWLEVEL
          this.start()
        }

        [...this.gameObjects,...this.bricks].forEach(object => object.update(deltaTime));
        this.bricks = this.bricks.filter(object=>!object.markedForDeletion)
    }

    draw(ctx){
        [...this.gameObjects,...this.bricks].forEach(object=> object.draw(ctx));

        if(this.gameState===GAMESTATE.PAUSED){
            ctx.rect(0,0,this.gameWidth,this.gameHeight);
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fill();


            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Paused",400,300);
            ctx.font = "20px Arial";
            ctx.fillText("Press Escape Key to Continue",400,350);
        }
        ctx.fillStyle = "blue"


         if(this.gameState===GAMESTATE.MENU){
            ctx.rect(0,0,this.gameWidth,this.gameHeight);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Press SpaceBar to Start!",400,300);
            
        }

        if(this.gameState===GAMESTATE.GAMEOVER){
            ctx.rect(0,0,this.gameWidth,this.gameHeight);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER!",400,300);
            
        }


    }

    togglePause(){
        if(this.gameState==GAMESTATE.PAUSED){
            this.gameState=GAMESTATE.RUNING
        }else if(this.gameState==GAMESTATE.RUNING){
            this.gameState=GAMESTATE.PAUSED
        }
    }
}




class Ball{
    constructor(game){
        this.image = document.getElementById("img_ball");
        
        this.size = 20

        this.game = game;

        this.gameHeight = game.gameHeight;
        this.gameWidth = game.gameWidth;

        this.reset()
    }

    reset(){
        this.position={x:400,y:550}
        this.speed={x:8,y:-6}
    }

    draw(ctx){
        ctx.drawImage(this.image,this.position.x,this.position.y,this.size,this.size)

    }
    update(deltaTime){

        

        this.position.x+=this.speed.x
        this.position.y+=this.speed.y
        
        // wall on left or right

        if(this.position.x+this.size>this.gameWidth || this.position.x<0){
            
            this.speed.x = -this.speed.x
        }

        // wall on top 

        if(this.position.y<0){
            // console.log("passed!")
            this.speed.y = -this.speed.y
        }
        // wall on bottom

        if(this.position.y+this.size>this.gameHeight ){
            this.game.lives--
            this.reset()

        }

        // collision of ball with the paddle
        if(detectCollision(this,this.game.Paddle)){
            this.speed.y = -this.speed.y
            this.position.y = this.game.Paddle.position.y - this.size;
        }

    }
}


buildLevel = (game,level)=>{
    let bricks = []

    level.forEach((row,rowIndex)=>{
        row.forEach((brick,brickIndex)=>{
            if(brick==1){
                let position={
                    x:80*brickIndex,
                    y:50+24*rowIndex
                }
                bricks.push(new Brick(game,position))
            }
        })
    })

    return bricks
}

const level1 = [
    // [0,1,0,1,0,1,0,1,0,1],
    // [1,1,1,1,1,1,1,1,1,1],
    // [1,1,1,1,1,1,1,1,1,1],
    // [1,1,1,1,1,1,1,1,1,1]
    [0,0,0,0,0,0,0,0,1,0]
]

const level2 = [
    // [0,0,0,1,0,1,0,1,0,1],
    // [1,0,1,0,1,1,1,1,1,1],
    // [1,1,1,1,1,0,1,1,1,1],
    [1,0,1,0,1,0,1,0,0,1]
]
const level3 = [
    // [0,0,0,1,0,1,0,1,0,1],
    // [1,0,1,0,1,1,1,1,1,1],
    [0,1,0,0,1,0,0,1,0,1],
    [1,0,0,1,0,0,1,0,0,1]
]
const level4 = [
    [1,0,1,1,0,1,1,0,1,1],
    [1,1,1,0,0,1,1,0,1,1]
]
const level5 = [
    [1,1,1,1,1,1,0,1,1,1],
    [1,1,1,0,1,1,1,0,1,1]
]




detectCollision = (ball,gameObject) =>{

    let bottomBall = ball.position.y + ball.size
    let topBall = ball.position.y
    let topObject = gameObject.position.y
    let leftSideObject = gameObject.position.x
    let rightSideObject = gameObject.position.x + gameObject.width
    let bottomObject = gameObject.position.y+gameObject.height

    if(bottomBall>=topObject && bottomBall<=bottomObject&& ball.position.x>=leftSideObject&&ball.position.x+ball.size<=rightSideObject){
        return true
    }
    else return false

}



let canvas = document.getElementById('gameScreen');
let ctx = canvas.getContext('2d');

const gameWidth = 800;
const gameHeight = 600;

let game = new Game(gameWidth,gameHeight); 
//game.start();

// ctx.fillStyle = '#f00'
// ctx.fillRect(20,20,100,100);

// ctx.fillStyle = 'green' 
// ctx.fillRect(145,20,100,100);
ctx.fillStyle = "blue";

let lastTime = 0;



gameLoop = (timeStamp)=>{
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0,0,gameWidth,gameHeight);
   game.update(deltaTime);
   game.draw(ctx);
    requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)