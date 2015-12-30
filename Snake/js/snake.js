
var Coord = function (x,y) {
  this.posX = x;
  this.posY = y;
};

Coord.prototype.isEqual = function (coord) {
  return (coord.posX == this.posX) && (coord.posY == this.posY);
};

Coord.prototype.plus = function (dir) {
  switch (dir) {
    case "N":
    return new Coord(this.posX - 1, this.posY);
    break;
    case "S":
    return new Coord(this.posX + 1, this.posY);
    break;
    case "E":
    return new Coord(this.posX, this.posY + 1);
    break;
    case "W":
    return new Coord(this.posX, this.posY - 1);
    break;
  }
};

var Snake = function (board) {
  this.dir = "N";
  this.board = board;
  this.segments = [new Coord(this.board.size/2, this.board.size/2)];
  this.score = 0;
  this.turning = false;
};

Snake.prototype.move = function () {
  var head = this.segments[this.segments.length-1];
  var tail = this.segments[0];
  var nextCoord = (head.plus(this.dir));
  if (this.causesGameOver(nextCoord) === true) {
      return "Game Over";
  } else {
    this.segments.push(nextCoord);
  }
  if (head.isEqual(this.board.food.pos)) {
    this.eat(tail);
  } else {
    this.segments.shift();
  }
  this.turning = false;
  return "";
};

Snake.prototype.causesGameOver = function (coord) {
  return this.occupiesPosition (coord) || this.outOfBounds (coord)
};

Snake.prototype.outOfBounds = function (coord) {
  if ( coord.posX < 0 || coord.posX > 19 || coord.posY < 0 || coord.posY > 19) {
    return true;
  }
};

Snake.prototype.occupiesPosition = function (coord) {
  var occupies = false;
  this.segments.forEach(function (segment) {
    if (segment.isEqual(coord)) {
      occupies =  true;
      return occupies;
    }
  });
  return occupies;
};

Snake.prototype.eat = function (tail) {
  this.segments.unshift(tail);
  this.board.food.setFoodPos();
  this.addToScore();
};

Snake.prototype.addToScore = function () {
  this.score += 50;
};

Snake.prototype.turn = function (dir) {
  if (this.turning === true) {
    return;
  }
  if (this.dir == "N" && dir == "S") {
    return;
  } else if (this.dir == "W" && dir == "E") {
    return;
  } else if (this.dir == "E" && dir == "W") {
    return;
  } else if (this.dir == "S" && dir == "N") {
    return;
  } else {
    this.dir = dir;
    this.turning = true;
  }
};

var Food = function (board) {
  this.board = board;
  this.setFoodPos();
}

Food.prototype.setFoodPos = function () {
  var resetCoord = function () {
    return new Coord ( Math.floor((Math.random() * 20)), Math.floor((Math.random() * 20)) );
  };
  testCoord = resetCoord();
  while (this.board.snake.occupiesPosition(testCoord) === true) {
    testCoord = resetCoord();
  }
  this.pos = testCoord;
};


 var Board = function (size) {
   this.size = size;
   this.snake = new Snake(this);
   this.food = new Food(this);
 };


 var View = function ($el, $start, $restart, $scoreboard, $highscore) {
   this.board = new Board(20);
   this.$el = $el;
   this.$start = $start;
   this.$restart = $restart;
   this.$scoreboard = $scoreboard;
   this.$highscore = $highscore;
   $(this.$restart).find("button").on("click", this.handleRestart.bind(this));
   $(this.$start).find("button").on("click", this.handleStart.bind(this));
   this.setupGrid();
   $(window).on("keydown", this.handleKeyPress.bind(this));
 };

 View.prototype.handleStart = function (e) {
   this.$start.addClass("hide");
   this.intervalId = setInterval( this.step.bind(this), 100);
 };

 View.prototype.handleRestart = function (e) {
   this.$restart.addClass("hide");
   this.board = new Board(20);
   this.intervalId = setInterval( this.step.bind(this), 100);
 };

 View.prototype.step = function () {
   result =  this.board.snake.move();
   if (result === "Game Over") {
     clearInterval(this.intervalId);
     if ((this.highScore === undefined && this.board.snake.score > 0) ||
        this.board.snake.score > this.highScore) {
       this.highScore = this.board.snake.score;
       this.$restart.find("#score").html("<span>You got " + this.board.snake.score + " points.</span> <br> <span> A new high score!</span>");
       this.$highscore.text("High Score: " + this.highScore);
     } else {
       this.$restart.find("#score").text("You got " + this.board.snake.score + " points!");

     }
     this.$restart.removeClass("hide");
   }
   this.render();
 };

 View.prototype.setupGrid = function () {
  var html = "";
  for (var i = 0; i < this.board.size; i++) {
    html += "<ul>";
    for (var j = 0; j < this.board.size; j++) {
      html += "<li></li>";
    }
    html += "</ul>";
  };

  this.$el.html(html);
  this.$li = this.$el.find("li");
};


View.prototype.updateClasses = function (coords, className) {
  this.$li.filter("." + className).removeClass();
  coords.forEach(function(coord){
    var flatCoord = (coord.posX * this.board.size) + coord.posY;
    this.$li.eq(flatCoord).addClass(className);
  }.bind(this));
};

View.prototype.render = function () {
  this.updateClasses([this.board.food.pos], "food");
  this.updateClasses(this.board.snake.segments, "snake");
  this.$scoreboard.text("Score: " + this.board.snake.score);
};

 View.prototype.handleKeyPress = function (e) {
   e.preventDefault();
   var dir = ""
   switch (e.which) {
     case 38:
      dir = "N";
      break;
     case 40:
      dir = "S";
      break;
     case 39:
      dir = "E";
      break;
     case 37:
      dir = "W";
      break;
   }
   if (dir != "") {
     this.board.snake.turn(dir);
   }
 };
