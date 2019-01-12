/**
 * Created by Alvin Wan (alvinwan.com)
 **/

/********************
 * DESKTOP CONTROLS *
 ********************/

const PLAYER_POSITION_LEFT = {x: -0.5, y: 0, z: 0}
const PLAYER_POSITION_CENTER = {x: 0, y: 0, z: 0}
const PLAYER_POSITION_RIGHT = {x: 0.5, y: 0, z: 0}

// maps 0 to left, 1 to center, 2 to right
const PLAYER_POSITION_MAPPING = [
  PLAYER_POSITION_LEFT,
  PLAYER_POSITION_CENTER,
  PLAYER_POSITION_RIGHT
]

var player_position_index = 1;  // start at 1 for center

function movePlayerTo(to) {
  if (to > 2) to = 2;
  if (to < 0) to = 0;

  player_position_index = to;
  position = PLAYER_POSITION_MAPPING[player_position_index];
  document.getElementById('player-container').setAttribute('position', position);
}

function setupControls() {
  window.onkeydown = function(e) {
    if (maybeStartGame()) return;

    switch (e.keyCode) {
      case 37:  // left
      case 65:  // a
        movePlayerTo(player_position_index - 1)
        break;
      case 39:  // right
      case 68:  // d
        movePlayerTo(player_position_index + 1)
        break;
      case 38:  // up
      case 87:  // w
        break;
      case 40:  // down
      case 83:  // s
        break;
      default:
        break;
    }
  }
}

/*******************
 * MOBILE CONTROLS *
 *******************/

var startGameTimer = null;
var startGameIn;

function setupStartGameTimer() {
  document.getElementById('game-start-timer').setAttribute('value', '');
}

function runStartGameTimer() {
  startGameTimer = setInterval(updateStartGameTimer, 1000);

  startGameIn = 11;
  updateStartGameTimer();
}

function updateStartGameTimer() {
  startGameIn -= 1;
  console.log(startGameIn, document.getElementById('game-start-timer'))
  document.getElementById('game-start-timer').setAttribute('value', startGameIn);

  if (startGameIn == 0) {
    startGame();
    teardownStartGameTimer();
  }
}

function teardownStartGameTimer() {
  clearInterval(startGameTimer);
  startGameTimer = null;
  document.getElementById('game-start-timer').setAttribute('value', '');
}

AFRAME.registerComponent('lane-controls', {
  tick: function () {
    if (mobileAndTabletcheck()) {
      var rotation = this.el.object3D.rotation;

      if (!isGameRunning) {
        if (-0.4 < rotation.y && rotation.y < 0.4 && -0.4 < rotation.x && rotation.x < 0.4) {
          if (startGameTimer == null) {
            runStartGameTimer();
          }
        } else if (startGameTimer) {
          teardownStartGameTimer();
        }
      }

      if (rotation.y > 0.1) movePlayerTo(0);
      else if (rotation.y < -0.1) movePlayerTo(2);
      else movePlayerTo(1);
    }
  }
})

/*********
 * TREES *
 *********/

var templateTreeLeft;
var templateTreeCenter;
var templateTreeRight;
var treeContainer;
var numberOfTrees = 0;
var treeTimer;

function setupTrees() {
  templateTreeLeft = document.getElementById('template-tree-left');
  templateTreeCenter = document.getElementById('template-tree-center');
  templateTreeRight = document.getElementById('template-tree-right');
  treeContainer = document.getElementById('tree-container');

  removeTree(templateTreeLeft);
  removeTree(templateTreeRight);
  removeTree(templateTreeCenter);

  templateTreeLeft = templateTreeLeft.cloneNode(true);
  templateTreeCenter = templateTreeCenter.cloneNode(true);
  templateTreeRight = templateTreeRight.cloneNode(true);
}

function teardownTrees() {
  clearInterval(treeTimer);
}

function addTree(el) {
  numberOfTrees += 1;
  el.id = 'tree-container-' + numberOfTrees;
  el.children[0].id = 'tree-' + numberOfTrees;
  treeContainer.appendChild(el);
}

function removeTree(tree) {
  tree.parentNode.removeChild(tree);
}

function addTreesRandomly(config) {

  config = config || {}
  probTreeLeft = config['probTreeLeft'] || 0.5;
  probTreeRight = config['probTreeRight'] || 0.5;
  probTreeCenter = config['probTreeCenter'] || 0.5;
  maxNumberTrees = config['maxNumberTrees'] || 2;

  numberOfTreesAdded = 0;

  var trees = [
    {probability: probTreeLeft, template: templateTreeLeft},
    {probability: probTreeCenter, template: templateTreeCenter},
    {probability: probTreeRight, template: templateTreeRight},
  ]
  shuffle(trees);

  for (i = 0; i < trees.length; i++) {
    tree = trees[i];
    if (Math.random() < tree.probability && numberOfTreesAdded < maxNumberTrees) {
      addTree(tree.template.cloneNode(true));
      numberOfTreesAdded += 1;
    }
  }

  return numberOfTreesAdded;
}

function loopAddTreesRandomly(config) {
  config = config || {};
  intervalLength = config['intervalLength'] || 500;

  console.log('Starting to loop trees...')
  treeTimer = setInterval(addTreesRandomly, intervalLength);
}

/**************
 * COLLISIONS *
 **************/

AFRAME.registerComponent('player', {
  tick: function() {
    document.querySelectorAll('.tree .movable').forEach(function(tree) {
      position = tree.getAttribute('position');
      tree_index = tree.getAttribute('data-tree-index');
      tree_id = tree.getAttribute('id');

      if (position.z > 4.5) {
        removeTree(tree);
      }

      if (!isGameRunning) return;

      if (1.8 < position.z && position.z < 2.2 && tree_index == player_position_index) {
        gameOver();
      }

      if (position.z > 2.6 && !countedTrees.has(tree_id)) {
        addScoreForTree(tree_id);
        updateScoreDisplay();
      }
    })
  }
})

/*********
 * SCORE *
 *********/

var score;
var countedTrees;
var gameOverScoreDisplay;
var scoreDisplay;

function setupScore() {
  score = 0;
  countedTrees = new Set();
  scoreDisplay = document.getElementById('score');
  gameOverScoreDisplay = document.getElementById('game-score');
}

function teardownScore() {
  scoreDisplay.setAttribute('value', '');
  gameOverScoreDisplay.setAttribute('value', 'Score: ' + score);
}

function addScoreForTree(tree_id) {
  score += 1;
  countedTrees.add(tree_id);
}

function updateScoreDisplay() {
  scoreDisplay.setAttribute('value', score);
}

/********
 * MENU *
 ********/

var menuStart;
var menuGameOver;
var menuContainer;
var isGameRunning = false;

function hideMenu(el) {
  el.setAttribute('visible', false);
}

function showMenu(el) {
  el.setAttribute('visible', true);
}

function setupAllMenus() {
  menuStart = document.getElementById('start-menu');
  menuGameOver = document.getElementById('game-over');
  menuContainer = document.getElementById('menu-container');

  hideMenu(menuGameOver);
}

function hideAllMenus() {
  hideMenu(menuContainer);
}

function showGameOverMenu() {
  showMenu(menuContainer);
  hideMenu(menuStart);
  showMenu(menuGameOver);
}

/********
 * GAME *
 ********/

function gameOver() {
  isGameRunning = false;
  showGameOverMenu();
  setupInstructions();
  teardownTrees();
  teardownScore();
}

function maybeStartGame() {
  if (!isGameRunning) {
    startGame();
    return true;
  }
  return false;
}

function startGame() {
  if (isGameRunning) return;

  isGameRunning = true;
  hideAllMenus();
  loopAddTreesRandomly();

  setupScore();
  updateScoreDisplay();
}

function instructionsDisplay(cls, display) {
  document.querySelectorAll(cls).forEach(function (el) {
    el.style.display = display
  });
}

function setupInstructions() {
  if (mobileAndTabletcheck()) {
    instructionsDisplay('.desktop-instructions', 'none');
    instructionsDisplay('.mobile-tablet-instructions', 'block');
  } else {
    instructionsDisplay('.desktop-instructions', 'block');
    instructionsDisplay('.mobile-tablet-instructions', 'none');
  }
}

window.onload = function() {
  setupStartGameTimer();
  setupAllMenus();
  setupControls();
  setupTrees();
  setupInstructions();
}

/*************
 * UTILITIES *
 *************/

/**
* Shuffles array in place.
* @param {Array} a items An array containing the items.
*/
function shuffle(a) {
   var j, x, i;
   for (i = a.length - 1; i > 0; i--) {
       j = Math.floor(Math.random() * (i + 1));
       x = a[i];
       a[i] = a[j];
       a[j] = x;
   }
   return a;
}

function mobileAndTabletcheck() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
