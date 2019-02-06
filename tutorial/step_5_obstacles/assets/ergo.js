/**
 * Created by Alvin Wan (alvinwan.com)
 **/

const POSITION_X_LEFT = -0.5;
const POSITION_X_CENTER = 0;
const POSITION_X_RIGHT = 0.5;

/************
 * CONTROLS *
 ************/

// Position is one of 0 (left), 1 (center), or 2 (right)
var player_position_index = 1;

/**
 * Move player to provided index
 * @param {int} Lane to move player to
 */
function movePlayerTo(position_index) {
  player_position_index = position_index;

  var position = {x: 0, y: 0, z: 0}
  if      (position_index == 0) position.x = POSITION_X_LEFT;
  else if (position_index == 1) position.x = POSITION_X_CENTER;
  else                          position.x = POSITION_X_RIGHT;
  document.getElementById('player').setAttribute('position', position);
}

/**
 * Determine how `movePlayerTo` will be fired. Use camera's rotation.
 **/
function setupControls() {
  AFRAME.registerComponent('lane-controls', {
    tick: function (time, timeDelta) {
      var rotation = this.el.object3D.rotation;

      if      (rotation.y > 0.1)  movePlayerTo(0);
      else if (rotation.y < -0.1) movePlayerTo(2);
      else                        movePlayerTo(1);
    }
  })
}

/*********
 * TREES *
 *********/

var templateTreeLeft;
var templateTreeCenter;
var templateTreeRight;
var templates;
var treeContainer;
var numberOfTrees = 0;
var treeTimer;

function setupTrees() {
  templateTreeLeft    = document.getElementById('template-tree-left');
  templateTreeCenter  = document.getElementById('template-tree-center');
  templateTreeRight   = document.getElementById('template-tree-right');
  treeContainer       = document.getElementById('tree-container');
  templates           = [templateTreeLeft, templateTreeCenter, templateTreeRight];

  removeTree(templateTreeLeft);
  removeTree(templateTreeRight);
  removeTree(templateTreeCenter);
}

function teardownTrees() {
  clearInterval(treeTimer);
}

function removeTree(tree) {
  tree.parentNode.removeChild(tree);
}

function addTree(el) {
  numberOfTrees += 1;
  el.id = 'tree-' + numberOfTrees;
  treeContainer.appendChild(el);
}

function addTreeTo(position_index) {
  var template = templates[position_index];
  addTree(template.cloneNode(true));
}

/**
 * Add any number of trees across different lanes, randomly.
 **/
function addTreesRandomly(
  {
    probTreeLeft = 0.5,
    probTreeCenter = 0.5,
    probTreeRight = 0.5,
    maxNumberTrees = 2
  } = {}) {

  var trees = [
    {probability: probTreeLeft,   position_index: 0},
    {probability: probTreeCenter, position_index: 1},
    {probability: probTreeRight,  position_index: 2},
  ]
  shuffle(trees);

  var numberOfTreesAdded = 0;
  trees.forEach(function (tree) {
    if (Math.random() < tree.probability && numberOfTreesAdded < maxNumberTrees) {
      addTreeTo(tree.position_index);
      numberOfTreesAdded += 1;
    }
  });

  return numberOfTreesAdded;
}

function addTreesRandomlyLoop({intervalLength = 500} = {}) {
  treeTimer = setInterval(addTreesRandomly, intervalLength);
}

/********
 * GAME *
 ********/

setupControls();  // TODO: AFRAME.registerComponent has to occur before window.onload?

window.onload = function() {
  setupTrees();
  addTreesRandomlyLoop();
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
