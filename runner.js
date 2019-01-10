/******
 * Created by Alvin Wan (alvinwan.com)
 ******/

/************
 * CONTROLS *
 ************/

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

/*********
 * TREES *
 *********/

var templateTreeLeft;
var templateTreeCenter;
var templateTreeRight;
var treeContainer;
var numberOfTrees = 0;

function setupTrees() {
  templateTreeLeft = document.getElementById('template-tree-left');
  templateTreeCenter = document.getElementById('template-tree-center');
  templateTreeRight = document.getElementById('template-tree-right');
  treeContainer = document.getElementById('tree-container');
}

function addTree(el) {
  numberOfTrees += 1;
  el.id = 'tree-' + numberOfTrees;
  treeContainer.appendChild(el);
}

// WARNING: Hack, instead of using a proper physics system with colliders
function addTreeEffect(treeIndex) {
  setTimeout(function() {
    if (player_position_index == treeIndex) {
      alert('You lose!');
    }
  }, (14.5 / 21) * 5000)
}

function addTreeLeft() {
  addTree(templateTreeLeft.cloneNode(true));
  addTreeEffect(0);
}

function addTreeRight() {
  addTree(templateTreeRight.cloneNode(true));
  addTreeEffect(2);
}

function addTreeCenter() {
  addTree(templateTreeCenter.cloneNode(true));
  addTreeEffect(1);
}

function addTreesRandomly(config) {

  config = config || {}
  probTreeLeft = config['probTreeLeft'] || 0.5;
  probTreeRight = config['probTreeRight'] || 0.5;
  probTreeCenter = config['probTreeCenter'] || 0.5;
  maxNumberTrees = config['maxNumberTrees'] || 2;

  numberOfTreesAdded = 0;

  var trees = [
    {probability: probTreeLeft, addTreeFunction: addTreeLeft},
    {probability: probTreeCenter, addTreeFunction: addTreeCenter},
    {probability: probTreeRight, addTreeFunction: addTreeRight},
  ]
  shuffle(trees);

  for (i = 0; i < trees.length; i++) {
    tree = trees[i];
    if (Math.random() < tree.probability && numberOfTreesAdded < maxNumberTrees) {
      tree.addTreeFunction();
      numberOfTreesAdded += 1;
    }
  }

  return numberOfTreesAdded;
}

function loopAddTreesRandomly(config) {
  config = config || {};
  intervalLength = config['intervalLength'] || 500;

  console.log('Starting to loop trees...')
  setInterval(addTreesRandomly, intervalLength);
}

/********
 * MAIN *
 ********/

window.onload = function() {
  setupControls();
  setupTrees();

  loopAddTreesRandomly();
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
