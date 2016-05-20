var game = {x: 0,
            time: 0,
            miss: 0,
            player1Score: 0,
            player2Score: 0,
            player1: 'Player 1',
            player2: 'Player 2',
            mouseX: 0,
            mouseY: 0,
            score: function(el) {
              if(el.attr('id', 'enemy-missile')) {
                game.player1Score ++
                el.attr('id', 'hit')
                el.remove()
              }
            },
            $board: $('#game-board'),
            $start: $('#start'),
            $player1Scoreboard: $('#player1Scoreboard'),
            $player2Scoreboard: $('#player2Scoreboard'),
            $timer: $('#timer'),
            randBetween: function(a,b) {
                    return Math.floor((Math.random()*b)+a); //Generates a random number between a and b
                    },
            svgEl: function(tagName) {
                    return document.createElementNS("http://www.w3.org/2000/svg", tagName); //required code to use SVG elements
                    },
            $enemyMissile: $('#enemy-missile'),
            $playerMissile: $('player-missile'),
            timer: function() {
                      setInterval(function() {
                        game.time ++
                        game.$timer.text(': ' + game.time)
                      }, 1000)
                    },
            }
  var xx = function() {
    return game.randBetween(20,50)
  }
  game.toLeft = game.$board.offset().left + 15;
  game.toTop = game.$board.offset().top;

function faster() {
  if (game.time < 15) {
    return game.randBetween(5000,7000)
  } else if (game.time < 25) {
    return game.randBetween(4500, 6000)
  } else if (game.time < 35) {
    return game.randBetween(3000, 5000)
  } else if (game.time < 45) {
    return game.randBetween(2500, 4000)
  } else if (game.time < 55) {
    return game.randBetween(2000, 3000)
  } else if (game.time < 65) {
    return game.randBetween(1000, 2000)
  }
}

// This initializes an explosion at the beginning so the rest of the code works
// but it is not visible
var explosionEl = game.svgEl("circle");
$explosionEl = $(explosionEl).attr({
  cx: 0,
  cy: 0,
  r: 0,
  fill:"white",
  id: 'player-missile'
});
game.$board.append($explosionEl)

// set the current player to player 1
game.currentPlayer = game.player2

// function to switch turns
function switchTurns() {
  if (game.currentPlayer == game.player1) {
    game.currentPlayer = game.player2;
    game.$player2Scoreboard.addClass('scoreboard underline')
    game.$player1Scoreboard.removeClass('underline')
  } else {
    game.currentPlayer = game.player1;
    game.$player1Scoreboard.addClass('scoreboard underline')
    game.$player2Scoreboard.removeClass('underline')
  }
}

function missileInterval() {
  switchTurns()
  game.timer();
  // console.log(game.currentPlayer)
  setInterval(function(){
    new Missile();
  }, game.randBetween(400, 1100))
}

// starts the game when the start button is clicked
game.$start.on('click', missileInterval)


// Function to grab the coordinates of where the mouse is clicked
// and then generate an explosion on those coordinates
game.$board.on('click',  function(event) {
  game.mouseX = event.clientX - game.toLeft;
  game.mouseY = event.clientY - game.toTop;
  // console.log('x: ' + game.mouseX + ' y: ' + game.mouseY)
  // var explosionEl = game.svgEl("circle");
  // console.log(game.mouseX)
  $explosionEl.attr({
    cx: game.mouseX,// (game.$board.width() / 2),
    cy: game.mouseY, //game.$board.height(),
    r: 1,
    fill:"black",
    id: 'player-missile'
  });

  // animates the explosion by enlarging the radius, using the random num generator
  var flightExplosion = game.svgEl("circle");
  $flightExplosion = $(flightExplosion).attr({
    cx: (game.$board.width() / 2),
    cy: game.$board.height(),
    r: 2,
    fill:"red",
    id: 'player-missile'
  });
  game.$board.append($flightExplosion)
  $flightExplosion.animate({cx: game.mouseX, cy: game.mouseY}, {
    step: function(now) {
      $(this).attr("cx", now);
      $(this).attr("cy", now);
      // console.log('y: ' + $(this).attr('cy') + ' x: ' + $(this).attr('cx'))
    },
    duration: 200,
    easing: 'linear',
    done: function(){
      $(this).animate({r: xx()},
        {
        duration: 300, //duration of the animation in milliseconds
        step: function(now) {
          $(this).attr("r", now);
        },
        easing: 'linear',
        //when the animation is done, perform the following actions
        done: function() {
          $explosionEl.attr('r', 60)
          $explosionEl.animate({r: xx()}, {
            duration: 100,
            step: function(now) {$(this).attr("r", now)}
          })
          $(this).remove()
        }
      })
    }
  })
})




// constructor for a new missile
function Missile() {
  game.x = game.randBetween(20, 1100); //randomizes the x value of where the missile will fall from
  var missileEl = game.svgEl('circle')
  $missileEl = $(missileEl)
  $missileEl.attr({ //the attributes of each new missile
    cx: game.x,
    cy: 0,
    r: 5,
    stroke: 'orange',
    fill: 'red',
    id: 'enemy-missile'
  })
  game.$board.append($missileEl); //appends a new missile to the game board
  // var $enemyR = $enemyMissile.attr('r');
  $missileEl.animate({ cy: 610 }, {//animate the cy value of the missile
    duration: faster(),
    easing: 'linear',
    step: function(now) {
      // console.log(Number($explosionEl.attr('cx')));
      //the below code checks for a collision by looking at the distance any missile
      //is from an explosion and then compares the radius' to see if they actually collided
      //and if they did collide, it removes that element from the board
       $(this).attr("cy", now);
      // console.log($(this).attr("cy"));
      var dy = (Number($explosionEl.attr("cy")) - Number($(this).attr("cy")))
      var dx = (Number($explosionEl.attr("cx")) - Number($(this).attr("cx")))
      var distance = Math.sqrt((dx*dx) + (dy*dy))
      if(distance < ( Number($(this).attr('r')) + Number($explosionEl.attr('r')))) {
          // $(this).remove()
          game.score($(this))
      }
    },
    done: function() { //when the animation is done, remove the falling missile
      $(this).animate({r: 80,}, {
        duration: 200,
        step: function(now) {
          $(this).attr('r', now)
        },
        done: function() {
            $(this).remove()
        }
      })
    }
  });
}


function stopAnimation() {
    game.time = 0
    $missileEl.finish()
    $missileEl.addClass('no-display')
    $explosionEl.addClass('no-display')
    // $missileEl.stop();
    game.$board.children().remove()
    // game.$board.off();
    // window.clearInterval(missileInterval)
    // clearInterval(timer)
    game.$timer.text('Game Over')
    switchTurns();
}
