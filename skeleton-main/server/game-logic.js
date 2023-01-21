let location; //Somehow get latLng Coordinates
let time_setting;

/*------------------ Lobby System-------------------  */
const allLobbies = {};

const findAndAddToLobby = (user, key) => {
  for (const hostID in allLobbies) {
    if (allLobbies[hostID].lobbyKey === key) {
      allLobbies[hostID].player2 = { id: user._id, userName: user.name };
      console.log("ANSWERRRRR", allLobbies[hostID]);
    }
  }
};

const generateLobbyKey = () => {
  return "JSYFOWN";
};

const createLobby = (user) => {
  const lobbyKey = generateLobbyKey();
  const lobby = {
    lobbyKey: lobbyKey,
    player1: { id: user._id, userName: user.name },
    player2: {},
    hasGameStarted: false,
  };
  allLobbies[user._id] = lobby;
  console.log(allLobbies);
};
const getKey = (user) => {
  const lobby = allLobbies[user._id];
  return lobby.lobbyKey;
};

const getPlayer1Info = (user) => {
  const lobby = allLobbies[user._id];
  return lobby.player1.userName;
};

const getPlayer2Info = (user) => {
  const lobby = allLobbies[user._id];
  return lobby.player2.userName;
};

const joinLobby = (user, key) => {
  findAndAddToLobby(user, key);
};

const checkFullLobby = (user) => {
  if (allLobbies[user._id].player2 === {}) {
    return false;
  }
  return true;
};
/*------------------ End of Lobby System-------------------  */

/* GameState */
const gameState = {
  gameWon: null,
  players: {},
  timer: null,
};

/* Time Logic */
const updateTime = () => {};

/* Player Logic */
const spawnPlayer = (id) => {
  console.log("In spawnPlayer function");
  gameState.players[id] = {
    position: location,
  };
  console.log("gameState", gameState);
};

const removePlayer = (id) => {
  if (gameState.players[id] != undefined) {
    delete gameState.players[id];
  }
};

const updatePlayerPosition = (id, newCoords) => {
  // If player doesn't exist, don't move anything
  if (gameState.players[id] == undefined) {
    return;
  }
  gameState.players.position = newCoords;
};

const checkWin = () => {
  Object.keys(gameState.players).forEach((pid1) => {
    Object.keys(gameState.players).forEach((pid2) => {
      if (pid1 !== pid2) {
        if ((gameState.players[pid1].position = gameState.players[pid2].position)) {
          return true;
        }
      }
    });
  });
};
const updateGameState = () => {
  checkWin();
};

const resetWinState = () => {
  gameState.gameWon = null;
};

module.exports = {
  gameState,
  spawnPlayer,
  updatePlayerPosition,
  removePlayer,
  updateGameState,
  resetWinState,
  createLobby,
  getPlayer1Info,
  getKey,
  joinLobby,
  getPlayer2Info,
  checkFullLobby,
};
