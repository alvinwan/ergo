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



window.onload = function() {
  setupControls();
}
