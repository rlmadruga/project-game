window.onload = () => {

    document.getElementById('start-game').onclick = () => {
        startGame();
    };

    //START GAME
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
    
    //var audioJump = document.getElementById("audio");
    //var audioGameOver = document.getElementById("audioGameOver");
    //var colors = ["black", "red", "green"];


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

    //PLAYER
    var player = {
        x: 20,
        y: 470, 
        speedY: 0,

        update: function (){
            gameArea.context.fillStyle = "black";
            gameArea.context.fillRect(this.x, this.y, 30, 30);    
        },

        newPosition: function(){
            if(this.y < 280)
            {
                this.speedY = 2;
                console.log(this.speedY);
            }
            this.y = this.y + this.speedY;

            if(this.speedY === 2 && this.y === 470)
            {
                this.speedY = 0;
            }
        }, 
        crashWith: function(obs){
            //Player.x + player.width > obstacle.x && player.x < obstacle.x + obstacle.width  && player.y > obstacle.y
            if(this.x + 30 > obs.x && this.x < obs.x + obs.width && this.y + 30 > obs.y)
            {
                return true;
            }else{
                return false;
            }
        }
    };

    //JUMP
    function jump(){
        //HAVE TO CHECK AGAIN =-
        player.speedY = -2;
        //audioJump.play();
    }

    //OBSTACLES
    function obstacle(){
        this.height = Math.floor(minHeight + Math.random() * (maxHeight-minHeight +1));
        this.width = Math.floor(minWidth + Math.random() * (maxWidth-minWidth +1));
        this.x = 1200;
        this.y = gameArea.canvas.height - this.height;
        //this.index = Math.floor(Math.random() * colors.length);
        //this.color = colors[this.index];
        this.draw = function(){
            //gameArea.context.fillStyle = this.color;
            gameArea.context.fillStyle = "black";
            gameArea.context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    //SCORE
    var scoreText = {
        x: 900,
        y: 50,
        update: function(text){
            gameArea.context.fillStyle = "gray";
            gameArea.context.font = "30px Arial";
            gameArea.context.fillText(text, this.x, this.y);
        }
    }

    //GAME CONTROL
    var gameArea = {

        canvas: document.createElement("canvas"),

        start: function() {
            this.canvas.height = 500;
            this.canvas.width = 1200;
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);
            this.context = this.canvas.getContext("2d");
            this.frame = 0;
            this.score = 0;
            scoreText.update("SCORE: 0");
            this.interval = setInterval(this.updateGameArea, 10);
            window.addEventListener("keydown", jump);
        },

        updateGameArea: function (){
            //CHECK COLLISION
            for(let i = 0; i < gameObstacles.length; i++)
            {
                if(player.crashWith(gameObstacles[i]))
                {
                    gameArea.stop();
                    return;
                }
            }
            
            //CLEAR CANVAS
            gameArea.clear();

            //GENERATE OBSTACLES BASED ON TIME
            if(everyInterval(gap))
            {
                console.log("New obstacle");
                gameObstacles.push(new obstacle());
                gap = randomGap();
                gameArea.frame = 0;
            }
            for(let i = 0; i < gameObstacles.length; i++)
            {
                gameObstacles[i].x -= 1;
                gameObstacles[i].draw();
            }
            //UPDATE PLAYER
            player.newPosition();
            player.update();

            //TIME GENERATE OBSTACLE
            gameArea.frame += 1;

            //COUNT SCORE
            gameArea.score += 0.01;
            scoreText.update("SCORE: " + Math.floor(gameArea.score));
        },

        clear: function () {
            gameArea.context.clearRect(0,0, this.canvas.width, this.canvas.height);
        },

        stop: function (){
            clearInterval(this.interval);
            //audioGameOver.play();
        }
    };

};













