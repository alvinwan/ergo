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

function setupTrees() {
  templateTreeLeft    = document.getElementById('template-tree-left');
  templateTreeCenter  = document.getElementById('template-tree-center');
  templateTreeRight   = document.getElementById('template-tree-right');

  removeTree(templateTreeLeft);
  removeTree(templateTreeRight);
  removeTree(templateTreeCenter);
}

function removeTree(tree) {
  tree.parentNode.removeChild(tree);
}

/********
 * GAME *
 ********/

setupControls();  // TODO: AFRAME.registerComponent has to occur before window.onload?

window.onload = function() {
  setupTrees();
}
