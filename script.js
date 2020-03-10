window.onload = () => {

    document.getElementById('start-game').onclick = () => {
        startGame();
        document.getElementById('bg-start').style.visibility = 'hidden';
        document.getElementById('start-game').style.visibility = 'hidden';
        document.getElementById('retry-game').style.visibility = 'visible';
    };

    document.getElementById('retry-game').onclick = () =>{
        restartGame();    
    };


    //-----START GAME
    function startGame(){
        gameArea.start();
    }

    //VARIABLES
    let minHeight = 20;
    let maxHeight = 100;
    let minWidth = 10;
    let maxWidth = 20;
    let minGap = 200;
    let maxGap = 500;
    
    var gameObstacles = [];
    var gap = randomGap();

    //var gameSpeed = 0;
    var keys = {};
    var gravity  = 1;

    let size;
    let initialSpawnTimer = 200;
    let spawnTimer = initialSpawnTimer;

    var gameLoop; 
    var gamePaused = false;
    var isGameOver = false;
    //var audioJump = document.getElementById("audio");
    //var audioGameOver = document.getElementById("audioGameOver");
    //var colors = ["black", "red", "green"];

    //-----GAME CONTROL
    var gameArea = {

        canvas: document.createElement("canvas"),

        start: function() {
            this.canvas.height = 600;
            this.canvas.width =  1200;
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);
            this.context = this.canvas.getContext("2d");
            this.gameSpeed = 3;
            this.gravity = 1;
            this.frame = 0;
            this.score = 0;
            this.highScore = 0;
            // this.pause = false;
            console.log(this.highScore);
            scoreText.update("SCORE: 0");


            if(window.localStorage.getItem('highScore'))
            {
                this.highScore = window.localStorage.getItem('highScore');
            }
            highScoreText.update("HIGHSCORE: " + this.highScore);

            gameLoop = window.requestAnimationFrame(updateGame);            
        },

        clear: function () {
            gameArea.context.clearRect(0,0, this.canvas.width, this.canvas.height);
        },

        stop: function (){
            // gameObstacles = [];
            // spawnTimer = initialSpawnTimer;
            // gameSpeed = 3;
            window.localStorage.setItem('highScore', gameArea.highScore);
            //clearInterval(this.interval);
            cancelAnimationFrame(gameLoop);
            // score = 0;
            //audioGameOver.play();
        }
    };

    //-----IMAGES
    // var imgBackgroud = new Image();
    // imgBackgroud.src = "./images/bg.png";
    
    var imgPlayerDown = new Image();
    imgPlayerDown.scr = "./images/4-fall.gif";

    var imgPlayerWalk = new Image();
    imgPlayerWalk.scr = "./images/2-walk.gif";
    
    class CreateImage{
        constructor(){
            this.img = new Image();
            this.x = 0;
            // this.id = id;
            //this.ctx = gameArea;
            this.speedBG = -0.5;
            this.width = 1600;
            this.height = 600;
        }

        move() {
            this.x += this.speedBG;
            this.x %= this.width;
        }
        
        draw() {
            this.img.src = "./images/bg.png";
            gameArea.context.drawImage(this.img, this.x, 0, this.width, this.height);
            if (this.speedBG < 0) {
                gameArea.context.drawImage(this.img, this.x + this.width, 0, this.width, this.height);
                console.log(this.img);
                console.log(this.x);
            }
             else {
               gameArea.context.drawImage(this.img, this.x - this.width, 0, this.width, this.height);
             }
            
        }
    }

    var imgBackgroundObj = new CreateImage();
      

    //INTERVAL
    function everyInterval(n){
        if(gameArea.frame % n === 0)
        {
            return true;
        }
        else{
            return false;
        }
    }

    //GAP
    function randomGap()
    {
        return Math.floor(minGap + Math.random() * (maxGap - minGap +1));
    }

    //-----PLAYER
    var player = {
        x: 20,
        y: 500 - 150, 
        height: 30,
        width: 30,
        speedY: 0,
        jumpForce: 15,
        originalHeight: 30,
        isGrounded: false,
        jumpTimer: 0,

        update: function (){
            gameArea.context.fillStyle = "black";
           gameArea.context.fillRect(this.x, this.y, 30, 30);    
            //gameArea.context.drawImage(imgPlayerWalk, this.x, this.y, imgPlayerWalk.width, imgPlayerWalk.height);
        },

        jump(){
            if(this.isGrounded && this.jumpTimer === 0)
            {
                this.jumpTimer = 1;
                this.speedY = -this.jumpForce;
                

            }
            else if(this.jumpTimer > 0 && this.jumpTimer < 15)
            {
                this.jumpTimer = this.jumpTimer + 1;
                this.speedY = -this.jumpForce - (this.jumpTimer / 50);
            }
        },
     
        // crashWith: function(obs){
        //     //Player.x + player.width > obstacle.x && player.x < obstacle.x + obstacle.width  && player.y > obstacle.y
        //     if(this.x + 30 > obs.x && this.x < obs.x + obs.width && this.y + 30 > obs.y)
        //     {
        //         return true;
        //     }else{
        //         return false;
        //     }
        // },

        animate: function(){

            if(keys['ArrowUp'])
            {
                this.jump();
            }
            else{
                this.jumpTimer = 0;
            }

            if(keys['ArrowDown'])
            {
                this.height = this.originalHeight/2;
            }else{
                this.height = this.originalHeight;
            }

            this.y = this.y + this.speedY;

            if(player.y + player.height < gameArea.canvas.height)
            {
                this.speedY = this.speedY + gravity;
                this.isGrounded = false;
                console.log(this.isGrounded);
            }
            else{
                player.speedY = 0;
                player.isGrounded = true;
                player.y = gameArea.canvas.height - this.height;
            }
        },
    };

    //-----EVENT LISTENERS
    document.addEventListener('keydown', function(e){
        keys[e.code] = true;
    });

    document.addEventListener('keyup', function(e){
        keys[e.code] = false;
    });



    //-----OBSTACLES
    function obstacle(){
        this.height = size;// Math.floor(minHeight + Math.random() * (maxHeight-minHeight +1));
        this.width = size;//Math.floor(minWidth + Math.random() * (maxWidth-minWidth +1));
        this.x = gameArea.canvas.width + size; //1200
        this.y = gameArea.canvas.height - size;//this.height;
        //this.index = Math.floor(Math.random() * colors.length);
        //this.color = colors[this.index];
        this.speedX = - gameArea.gameSpeed;
        this.draw = function(){
            //gameArea.context.fillStyle = this.color;
            gameArea.context.fillStyle = "black";
            gameArea.context.fillRect(this.x, this.y, this.width, this.height);
        }

        this.update = function(){
            this.x = this.x + this.speedX;
            this.draw();
            this.speedX = - gameArea.gameSpeed;
        }
    }

    function randomInRange(min, max)
    {
        return Math.round(Math.random()*(max-min) + min);
    }

    function spawnObstacles()
    {
        size = randomInRange(20, 70);
        let type = randomInRange(0,1);

        let obs= new obstacle();
        
        if(type === 1)
        {
            obs.y = obs.y - player.originalHeight -10;
        }
        
        gameObstacles.push(obs);

    }


    //-----SCORE
    var scoreText = {
        x: 50,
        y: 50,
        update: function(text){
            gameArea.context.fillStyle = "white";
            //gameArea.context.strokeStyle = "black";
            gameArea.context.font = "50px VT323";
            gameArea.context.fillText(text, this.x, this.y);
            //gameArea.context.strokeText(text, this.x, this.y);
        }
    }

    var highScoreText = {
        x: 800, 
        y: 50, 
        update: function(text){
            gameArea.context.fillStyle = "white";
            //gameArea.context.strokeStyle = "black";
            gameArea.context.font = "50px VT323";
            gameArea.context.fillText(text, this.x, this.y);
           // gameArea.context.strokeText(text, this.x, this.y);
        }
    }

   function updateGame()
   {
       //CLEAR CANVAS
       gameArea.clear();

        //BACKGROUND IMGs
       imgBackgroundObj.speedBG = -gameArea.gameSpeed/3;
      // imgBackgroundObj2.speedBG = -gameArea.gameSpeed/3;
       
       imgBackgroundObj.draw();
       imgBackgroundObj.move();
    //    imgBackgroundObj2.draw(); 
    //    imgBackgroundObj2.move();
    //    console.log(imgBackgroundObj.x);
    //    console.log(imgBackgroundObj2.x);
      
     
       //SPAWN OBSTACLES
       spawnTimer = spawnTimer - 1;
       if(spawnTimer <= 0)
       {
           spawnObstacles();
           console.log("New Obstacle");
           spawnTimer = initialSpawnTimer - gameArea.gameSpeed * 8;
           
           if(spawnTimer < 60)
           {
               spawnTimer = 60;
           }
       }

       for(let i = 0; i < gameObstacles.length; i++)
       {
           let initObstacle = gameObstacles[i];

           if(initObstacle.x + initObstacle.width < 0)
           {
               gameObstacles.splice(i,1);
           }

           if(player.x < initObstacle.x + initObstacle.width &&
               player.x + player.width > initObstacle.x &&
               player.y < initObstacle.y + initObstacle.height &&
               player.y + player.height > initObstacle.y)
           {
            //    gameArea.stop();
            //    return;
                isGameOver = true;
                gameOver(isGameOver);
           }

           initObstacle.update();
       }
       

       //UPDATE PLAYER
       player.animate();
       player.update();
       
       gameArea.gameSpeed = gameArea.gameSpeed + 0.003;
      

       //TIME GENERATE OBSTACLE
      // gameArea.frame = gameArea.frame + 1;

       //COUNT SCORE
       gameArea.score = gameArea.score + 1; //0.01;
       scoreText.update("SCORE: " + gameArea.score); //Math.floor(gameArea.score));
       //gameArea.highScore = gameArea.score;
       highScoreText.update("HIGHSCORE: " + gameArea.highScore);

       if(gameArea.score >= gameArea.highScore)
       {
           gameArea.highScore = gameArea.score;
           highScoreText.update("HIGHSCORE: " + gameArea.highScore);
       }

      if(!isGameOver)
      {
        gameLoop = requestAnimationFrame(updateGame);
      }
      
   }
   
   function gameOver(isGameOver)
   {
        highScoreText.update("HIGHSCORE: " + gameArea.highScore);

        if(gameArea.score >= gameArea.highScore)
        {
            gameArea.highScore = gameArea.score;
            highScoreText.update("HIGHSCORE: " + gameArea.highScore);
        }
        gameArea.stop();
   }

   function restartGame()
   {
    //    minGap = 200;
    //    maxGap = 500;
    //    gameObstacles = [];   
    //    gameArea.clear();
    //    gameObstacles = [];
    //    spawnTimer = initialSpawnTimer;
    //    gameSpeed = 3;
    //    gameArea.score = 0;
    //    keys = {};
    //    gravity  = 1;
    //    size;
    //    initialSpawnTimer = 200;
    //    gameLoop; 
    //    gamePaused = false;
    //    isGameOver = false;
    //    gameArea.clear();
    //    startGame();
    location.reload();
   }
  

};

