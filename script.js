window.onload = () => {

    document.getElementById('start-game').onclick = () => {
        startGame();
        document.getElementById('bg-start').style.visibility = 'hidden';
        document.getElementById('triangle-up').style.visibility = 'hidden';
        document.getElementById('triangle-down').style.visibility = 'hidden';
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
    // let pickObstacleFlying;
    // let pickObstacleGround;
    let obstacleNumber;

    var gameLoop; 
    var gamePaused = false;
    var isGameOver = false;
    var playerState = 0;
    var changeHeight = 0;
    //var audioJump = document.getElementById("audio");
    //var audioGameOver = document.getElementById("audioGameOver");
    //var colors = ["black", "red", "green"];

    //===== GAME CONTROL =====
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

    //===== IMAGES ===== 
    
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

    //===== SPRITESHEET =====
    function spriteSheet(path, frameWidth, frameHeight)
    {
        this.image = new Image();
        this.image.src = path;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.framesPerRow = Math.floor(this.image.width / this.frameWidth); 
        // var framesPerRow;
        // var self = this;
        
        
    }

    function animationSprite(spritesheet, frameSpeed, startFrame, endFrame){

        console.log(spritesheet);
        var animationSequence = [];
        var currentFrame = 0;
        var counter = 0;

        for(let frameNumber = startFrame; frameNumber <= endFrame; frameNumber++)
        {
            animationSequence.push(frameNumber);
        }
           
        this.update = function()
        {
               if(counter == (frameSpeed -1))
                {
                    currentFrame = (currentFrame +1) % animationSequence.length;
                }
                counter = (counter + 1) % frameSpeed;
        };

        this.draw = function (x,y)
        {
            var row = Math.floor(animationSequence[currentFrame] / spritesheet.framesPerRow);
            var col = Math.floor(animationSequence[currentFrame] % spritesheet.framesPerRow);

            gameArea.context.drawImage(spritesheet.image, 
                col * spritesheet.frameWidth, row* spritesheet.frameHeight, spritesheet.frameWidth, spritesheet.frameHeight,
                x, y, 
                spritesheet.frameWidth, spritesheet.frameHeight); 
        };
    }

    //===== PLAYER ANIMATIONS =====
    var playerSprite =  new spriteSheet("./images/caverman.png", 97, 71);
    var walkSprite = new animationSprite(playerSprite, 4, 7, 13); //0
    var downSprite = new animationSprite(playerSprite, 4, 21, 23); //1
    var jumpSprite = new animationSprite(playerSprite, 4, 14, 16); //2
    var fallSPrite = new animationSprite(playerSprite, 4, 17, 19); //3
    var playerGameOverSprite = new spriteSheet("./images/fire-meat.png", 84, 55);
    var playerGameOverAnin = new animationSprite(playerGameOverSprite, 4, 0, 3);


    //===== PLAYER =====
    var player = {
        x: 100,
        y: 600 - 150, 
        height: 65, //71
        width: 44, //97
        speedY: 0,
        jumpForce: 15,
        originalHeight: 65, //30
        isGrounded: false,
        jumpTimer: 0,
       
        update: function (){

            // walkSprite.update();
            // walkSprite.draw();
            
            // gameArea.context.fillStyle = "black";
            // gameArea.context.fillRect(this.x, this.y, 30, 30);    
            //gameArea.context.drawImage(imgPlayerWalk, this.x, this.y, imgPlayerWalk.width, imgPlayerWalk.height);
        },

        jump(){
            if(this.isGrounded && this.jumpTimer === 0)
            {
                playerState = 2;
                this.jumpTimer = 1;
                this.speedY = -this.jumpForce;
                
                
            }
            else if(this.jumpTimer > 0 && this.jumpTimer < 15)
            {
                this.jumpTimer = this.jumpTimer + 1;
                this.speedY = -this.jumpForce - (this.jumpTimer / 50);
                playerState = 2;
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
                // playerState = 2;
                console.log(playerState);
            }
            else{
                playerState = 0;
                this.jumpTimer = 0;
            }

            if(keys['ArrowDown'])
            {
                playerState = 1;
                //this.originalHeight = 65;
                this.height = this.originalHeight; ///2;
            }else{
                this.originalHeight = 65;
                this.height = this.originalHeight;
                playerState = 0;
            }

            this.y = this.y + this.speedY;

            if(player.y + player.height < gameArea.canvas.height)
            {
                playerState = 3;
                this.speedY = this.speedY + gravity;
                this.isGrounded = false;
                // console.log(this.isGrounded);
            }
            else{
                player.speedY = 0;
                player.isGrounded = true;
                player.y = gameArea.canvas.height - this.height;
                //playerState = 0;
            }
            //this.update();
            if(playerState === 0)
            {
                walkSprite.draw(this.x, this.y);
            }
            
        },
    };


    //=====EVENT LISTENERS =====
    document.addEventListener('keydown', function(e){
        keys[e.code] = true;
    });

    document.addEventListener('keyup', function(e){
        keys[e.code] = false;
    });

    function randomInRange(min, max)
    {
        return Math.round(Math.random()*(max-min) + min);
    }


    //===== OBSTACLES SPRITES =====
    var plantSprite =  new spriteSheet("./images/plant-1.png", 135, 85); //1
    var plantAninSprite = new animationSprite(plantSprite, 5, 0, 14);  

    // var plantSprite = {
    //     sprite: new spriteSheet("./images/plant-1.png", 135, 85),
    //     animation: new animationSprite(new spriteSheet("./images/plant-1.png",135,85), 4, 0, 14), 
    //     width: 62,
    //     height: 42,
    //     x: 1200 + 62,
    //     y: 600- 42,
    //     speedX: - gameArea.gameSpeed/3,

    //     // move(){
    //     //     this.x = this.x + this.speedX;
    //     //     // this.speedX = - gameArea.gameSpeed/3;
    //     // }
    // };

    var miniTyrSprite =  new spriteSheet("./images/mini-tyrannosaurus-2.png", 80, 69); //2
    var miniTyrAninSprite = new animationSprite(miniTyrSprite, 5, 6, 11); 

    // var miniTyrSprite = {
    //     sprite: new spriteSheet("./images/mini-tyrannosaurus-2.png", 80, 70),
    //     animation: new animationSprite(new spriteSheet("./images/mini-tyrannosaurus-2.png", 80, 70), 4, 6, 11),  
    //     width: 40,
    //     height: 35,
    //     x: 1200 + 40,
    //     y: 600 - 35,
    //     speedX: - gameArea.gameSpeed/3,
        
    //     // move(){
    //     //     this.x = this.x + this.speedX;
            
    //     // }
    // };

    var tyrSprite =  new spriteSheet("./images/tyrannosaurus-2.png", 151, 105); //3
    var tyrAninSprite = new animationSprite(tyrSprite, 5, 7, 18);

    // var tyrSprite = {
    //     sprite: new spriteSheet("./images/tyrannosaurus-2.png", 151, 105),
    //     animation: new animationSprite(new spriteSheet("./images/tyrannosaurus-2.png", 151, 105), 4, 7, 18),  
    //     width: 70,
    //     height: 50,
    //     x: 1200 + 70,
    //     y: 600 - 50,
    //     speedX: - gameArea.gameSpeed/3,
        
    //     // move(){
    //     //     this.x = this.x + this.speedX;
            
    //     // }
    // };

 
    //FLYING ENEMIES
    var pteroSprite =  new spriteSheet("./images/pterodactyl-1.png", 126, 113); //1
    var pteroAninSprite = new animationSprite(pteroSprite, 5, 0, 7);

    // var pteroSprite = {
    //     sprite: new spriteSheet("./images/pterodactyl-1.png", 126, 113),
    //     animation: new animationSprite(new spriteSheet("./images/pterodactyl-1.png", 126, 113), 4, 0, 7),  
    //     width: 63,
    //     height: 62,
    //     x: 1200 + 63,
    //     y: 600- randomInRange(100, 500),
    //     speedX: - gameArea.gameSpeed/3,
        
    //     // move(){
    //     //     this.x = this.x + this.speedX;
            
    //     // }
    // };

    var batSprite =  new spriteSheet("./images/bat-1.png", 52, 57); //2
    var batAninSprite = new animationSprite(batSprite, 5, 0, 7);

    // var batSprite = {
    //     sprite: new spriteSheet("./images/bat-1.png", 51, 57),
    //     animation: new animationSprite(new spriteSheet("./images/bat-1.png", 51, 57), 4, 0, 7),  
    //     width: 51 *1.5,
    //     height: 52 *1.5,
    //     x: 1200 + (51 *1.5),
    //     y: 600 - randomInRange(100, 500),
    //     speedX: - gameArea.gameSpeed/3,
        
    //     // move(){
    //     //     this.x = this.x + this.speedX;
           
    //     // }
    // };

    var dragonSprite =  new spriteSheet("./images/dragon-1.png", 98, 65); //3
    var dragonAninSprite = new animationSprite(dragonSprite, 5, 0, 7);
   

    // var dragonSprite = {
    //     sprite: new spriteSheet("./images/dragon-1.png", 98, 65),
    //     animation: new animationSprite(new spriteSheet("./images/dragon-1.png", 98, 65), 4, 0, 7),  
    //     width: 44,
    //     height: 32,
    //     x: 1200 + 44,
    //     y: 600 - randomInRange(100, 500),
    //     speedX: - gameArea.gameSpeed/3,
        
    //     // move(){
    //     //     this.x = this.x + this.speedX;
    //     //     console.log(this.x, this.speedX);
            
    //     // }
    // };

    // var arr = [plantSprite, tyrSprite, miniTyrSprite, pteroSprite, batSprite, dragonSprite];
    

    //===== OBSTACLES =====


    function obstacle(){
       
       
        this.height = 0;// Math.floor(minHeight + Math.random() * (maxHeight-minHeight +1));
        this.width = 0;//Math.floor(minWidth + Math.random() * (maxWidth-minWidth +1));
        this.x = 1200; //1200
        this.y = 0;
        this.id = 0;
        this.speedX = - gameArea.gameSpeed;

        this.move = function(){
            this.x = this.x + this.speedX;
            // console.log(`X: ${this.x}`);
            this.speedX = - gameArea.gameSpeed;
        };
    }

    // function spawnFlying(x, y, obs)
    // {
    //     dragonAninSprite.update();
    //     dragonAninSprite.draw(x,y);
    //     obs.move();
    //     if(obs.x + obs.width < 0)
    //     {

    //     }
        
    // }
    
    function spawnObstacles()
    {
        let type = randomInRange(0,1);     
        
        size = randomInRange(100, 400); //100 -510
        let obs = new obstacle();
        // console.log(`TYPE: ${type}`);
        if(type === 1){
            // console.log(obs);
            let pickObstacle = Math.floor(Math.random() * (3-1) +1);
            console.log(pickObstacle);
            if(pickObstacle === 1)
            {
               obs.id = 1;
              obs.width = 126 -15;
              obs.height = 113 -10;
              obs.y = 600 - size;
              console.log("PTERO");
            }
            else if(pickObstacle === 2) 
            {
                obs.id= 2;
              obs.width = 51;
              obs.height = 57;
              obs.y = 600 - size;
              console.log("BAT");
            }   
            else if(pickObstacle === 3) 
            {
                obs.id = 3;
              obs.width = 98;
              obs.height = 65;
              obs.y = 600 - size; 
              console.log("DRAGON");
            } 
        }else{

            let pickObstacleGround = Math.floor(Math.random() * (3 - 1)  + 1);
            console.log(`PICKGROUNG: ${pickObstacleGround}`);
            if(pickObstacleGround === 1)
            {
                obs.id = 4;
              obs.width = plantSprite.frameWidth -10;
              obs.height = plantSprite.frameHeight-5;
              obs.y = 600 - obs.height;
              console.log("PLANT");
            }
            else if(pickObstacleGround === 2) 
            {
                obs.id = 5;
              obs.width = miniTyrSprite.frameWidth -10;
              obs.height = miniTyrSprite.frameHeight -10;
              obs.y = 610 - obs.height;
              console.log("MINI");
            }   
            else if(pickObstacleGround === 3) 
            {
                obs.id = 6;
              obs.width = tyrSprite.frameWidth;
              obs.height = tyrSprite.frameHeight;
              obs.y = 600 - obs.height;
              console.log("TYR");
            } 
        }
        gameObstacles.push(obs);
       

    }


    //===== SCORE =====
    var scoreText = {
        x: 50,
        y: 50,
        update: function(text){
            gameArea.context.fillStyle = "white";
            gameArea.context.font = "50px VT323";
            gameArea.context.fillText(text, this.x, this.y);
        }
    }

    var highScoreText = {
        x: 850, 
        y: 50, 
        update: function(text){
            gameArea.context.fillStyle = "white";
            //gameArea.context.strokeStyle = "black";
            gameArea.context.font = "50px VT323";
            gameArea.context.fillText(text, this.x, this.y);
           // gameArea.context.strokeText(text, this.x, this.y);
        }
    }

   //====== UPDATE GAME =====
   function updateGame()
   {
       //CLEAR CANVAS
       gameArea.clear();

        //BACKGROUND IMG
       imgBackgroundObj.speedBG = -gameArea.gameSpeed/3;      
       imgBackgroundObj.draw();
       imgBackgroundObj.move();
    
      
       //SPAWN OBSTACLES
       spawnTimer = spawnTimer - 1;
       if(spawnTimer <= 0)
       {
           spawnObstacles();
           console.log("New Obstacle");
           spawnTimer = initialSpawnTimer - gameArea.gameSpeed * 8;
        //    console.log(spawnTimer);
           if(spawnTimer < 60)
           {    
               if(gameArea.score >= 3000 && gameArea.score < 5000)
               {
                spawnTimer = 50;
               }
                else if(gameArea.score >= 1000 && gameArea.score < 3000)
                {
                    spawnTimer = 55;
                }
                spawnTimer = 60;
           }
       }

       for(let i = 0; i < gameObstacles.length; i++)
       {
           console.log("ENTROU FOR");
           let initObstacle = gameObstacles[i];
            console.log(initObstacle);
           if(player.x < initObstacle.x + initObstacle.width &&
            player.x + (player.width) > initObstacle.x && 
            player.y < initObstacle.y + initObstacle.height &&
            player.y + (player.height - changeHeight) > initObstacle.y)
            {
                gameArea.clear();
                playerGameOverAnin.update();
                playerGameOverAnin.draw(530,400);
                isGameOver = true;
                gameOver(isGameOver);
            }
           
            if(initObstacle.id === 1)
            {
                pteroAninSprite.update();
                pteroAninSprite.draw(initObstacle.x, initObstacle.y);
                initObstacle.move();
                
            }
            else if(initObstacle.id === 2)
            {
                batAninSprite.update();
                batAninSprite.draw(initObstacle.x, initObstacle.y);
                initObstacle.move();
            }
            else if(initObstacle.id === 3)
            {
                dragonAninSprite.update();
                dragonAninSprite.draw(initObstacle.x, initObstacle.y);
                initObstacle.move();
            }
            else if(initObstacle.id === 4)
            {
                plantAninSprite.update();
                plantAninSprite.draw(initObstacle.x, initObstacle.y);
                initObstacle.move();
            }
            else if(initObstacle.id === 5)
            {
                miniTyrAninSprite.update();
                miniTyrAninSprite.draw(initObstacle.x, initObstacle.y);
                initObstacle.move();
            }
            else if(initObstacle.id === 6)
            {
                tyrAninSprite.update();
                tyrAninSprite.draw(initObstacle.x, initObstacle.y);
                initObstacle.move();
            }


            //    initObstacle.animation.update();
            //     initObstacle.animation.draw(initObstacle.x, initObstacle.y);
            //     //initObstacle.x = initObstacle.x + initObstacle.speedX;
            
            //     initObstacle.x = initObstacle.x + 10;
           if(initObstacle.x + initObstacle.width < 0)
           {
               gameObstacles.splice(i,1);
           }
           
        //    initObstacle.update();
       }
       

       //UPDATE PLAYER
       player.animate();
       //player.update();
       if(playerState === 0) {
            walkSprite.update();
            walkSprite.draw(player.x, player.y);
            changeHeight = 0;
       }
       else if(playerState === 1)
       {
           changeHeight = -30;
           console.log(playerState);
           downSprite.update();
           downSprite.draw(player.x, player.y);
       }
       else if(playerState === 2)
       {
            jumpSprite.update();
            jumpSprite.draw(player.x, player.y);
       }
       else if(playerState === 3)
       {
           fallSPrite.update();
           fallSPrite.draw(player.x, player.y);
       }
       
       
       //console.log(player.y);
       //playerSprite.draw(player.x, player.y);


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
        
        gameArea.context.globalAlpha = 1;
        gameArea.context.fillStyle = "#B37746";
        
        //Score Background
        gameArea.context.fillRect(40, 12, 250, 50);
        
        //Highscore Background
        gameArea.context.fillRect(840, 12, 330, 50);
        
        //Game Over Background
        gameArea.context.fillRect(0,0, gameArea.canvas.width, gameArea.canvas.height); //310,170, 550, 250
        gameArea.context.globalAlpha = 1;

        gameArea.context.fillStyle = "white";
        gameArea.context.font = "bold 200px VT323";
        gameArea.context.fillText("OH NO!", 390, 350);

       

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

