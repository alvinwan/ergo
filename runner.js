/******
 * Created by Alvin Wan (alvinwan.com)
 ******/

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

AFRAME.registerComponent('lane-controls', {
  tick: function () {
    var angleInRadians = this.el.object3D.rotation.y;
    if (angleInRadians > 0.1) movePlayerTo(0);
    else if (angleInRadians < -0.1) movePlayerTo(2);
    else movePlayerTo(1);
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
  gameOverScoreDisplay.innerHTML = score;
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

function setupAllMenus() {
  menuStart = document.getElementById('start-menu');
  menuGameOver = document.getElementById('game-over');
  menuContainer = document.getElementById('menu-container');

  menuGameOver.style.display = "none";
}

function hideAllMenus() {
  menuContainer.style.display = "none";
}

function showGameOverMenu() {
  menuContainer.style.display = "flex";
  menuStart.style.display = "none";
  menuGameOver.style.display = "inline-block";
}

/********
 * GAME *
 ********/

function gameOver() {
  isGameRunning = false;
  showGameOverMenu();
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
  isGameRunning = true;
  hideAllMenus();
  loopAddTreesRandomly();

  setupScore();
  updateScoreDisplay();
}

window.onload = function() {
  setupAllMenus();
  setupControls();
  setupTrees();
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
