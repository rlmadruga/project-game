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


    //-----IMAGES
    

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
        },

        jump(){
            if(this.isGrounded && this.jumpTimer === 0)
            {
                this.jumpTimer = 1;;
                this.speedY = -this.jumpForce;
            }
            else if(this.jumpTimer > 0 && this.jumpTimer < 15)
            {
                this.jumpTimer = this.jumpTimer + 1;
                this.speedY = -this.jumpForce - (this.jumpTimer / 50);
            }
        },
        // newPosition: function(){
        //     if(this.y < 280)
        //     {
        //         this.speedY = 2;
        //         console.log(this.speedY);
        //     }
        //     this.y = this.y + this.speedY;

        //     if(this.speedY === 2 && this.y === 470)
        //     {
        //         this.speedY = 0;
        //     }
        // }, 
        crashWith: function(obs){
            //Player.x + player.width > obstacle.x && player.x < obstacle.x + obstacle.width  && player.y > obstacle.y
            if(this.x + 30 > obs.x && this.x < obs.x + obs.width && this.y + 30 > obs.y)
            {
                return true;
            }else{
                return false;
            }
        },

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

    //JUMP
    // function jump(){
       
    //     player.speedY = -2;
    //     //audioJump.play();
    // }

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

    //-----GAME CONTROL
    var gameArea = {

        canvas: document.createElement("canvas"),

        start: function() {
            this.canvas.height = 500;
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

            gameLoop = window.requestAnimationFrame(updateGame);// updateGame();//this.interval = setInterval(this.updateGameArea, 10); //window.requestAnimationFrame(this.updateGameArea());
            //window.addEventListener("keydown", jump);
        },

        // updateGameArea: function (){

            //CHECK COLLISION
            // for(let i = 0; i < gameObstacles.length; i++)
            // {
            //     if(player.crashWith(gameObstacles[i]))
            //     {
            //         gameArea.stop();
            //         return;
            //     }
            // }
            

            
            // if(keys['KeyP'])
            // {
            //     if(!gamePaused){
            //     gamePaused = true;
            //     cancelAnimationFrame(updateGame);
      
            //     }
            //     else{
            //         gamePaused = false;
            //     }
            // }

            // //CLEAR CANVAS
            // gameArea.clear();
            
            // spawnTimer = spawnTimer - 1;
            // if(spawnTimer <= 0)
            // {
            //     spawnObstacles();
            //     console.log("New Obstacle");
            //     spawnTimer = initialSpawnTimer - gameArea.gameSpeed * 8;
                
            //     if(spawnTimer < 60)
            //     {
            //         spawnTimer = 60;
            //     }
            // }

            // for(let i = 0; i < gameObstacles.length; i++)
            // {
            //     let initObstacle = gameObstacles[i];

            //     if(initObstacle.x + initObstacle.width < 0)
            //     {
            //         gameObstacles.splice(i,1);
            //     }

            //     if(player.x < initObstacle.x + initObstacle.width &&
            //         player.x + player.width > initObstacle.x &&
            //         player.y < initObstacle.y + initObstacle.height &&
            //         player.y + player.height > initObstacle.y)
            //     {
            //         gameArea.stop();
            //         return;
            //     }

            //     initObstacle.update();
            // }
            

            // //UPDATE PLAYER
           
            // //player.newPosition();
            // player.animate();
            // player.update();
            
            // gameArea.gameSpeed = gameArea.gameSpeed + 0.003;
           

            // //TIME GENERATE OBSTACLE
            // gameArea.frame = gameArea.frame + 1;

            // //COUNT SCORE
            // gameArea.score = gameArea.score + 1; //0.01;
            // scoreText.update("SCORE: " + gameArea.score); //Math.floor(gameArea.score));
            // //gameArea.highScore = gameArea.score;
            // highScoreText.update("HIGHSCORE: " + gameArea.highScore);

            // if(gameArea.score > gameArea.highScore)
            // {
            //     gameArea.highScore = gameArea.score;
            //     highScoreText.update("HIGHSCORE: " + gameArea.highScore);
            // }

            // //Request
            // updateGame();//window.requestAnimationFrame(updateGameArea);
           
        // },

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

   function updateGame()
   {

       //CLEAR CANVAS
       gameArea.clear();
    
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

       //Request
      // updateGame();//window.requestAnimationFrame(updateGameArea);
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

