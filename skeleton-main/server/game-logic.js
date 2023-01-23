let location; //Somehow get latLng Coordinates
let time_setting;

/*------------------ Lobby System-------------------  */
const allLobbies = {};
const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOBBYKEYLENGTH = 6;

const generateLobbyKey = () => {
  let result = "";
  const charactersLength = CHARACTERS.length;
  for (let i = 0; i < LOBBYKEYLENGTH; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * charactersLength));
  }
  console.log("Randomly Generated LobbyKey", result);
  return result;
};

const createLobby = (user, lobbyKey) => {
  // Initializing Lobby
  const lobby = {
    lobbyKey: lobbyKey,
    players: {},
    hasGameStarted: false,
  };
  console.log("Lobby ${lobbyKey} has been created");
  // Adding Host to Game
  lobby.players[user._id] = { userName: user.username, isHost: true };
  console.log("Player1 was added to Lobby ${lobbyKey} as Host");
  // Add Lobby to allLobbies queue
  allLobbies[lobbyKey] = lobby;
  return lobby;
};

const joinLobby = (user, key) => {
  // Gets HostID (HostID is the only ID in the lobby at this point)
  let hostID;
  for (const id in allLobbies[key].players) {
    hostID = id;
  }
  // Adds Player2 to Lobby
  allLobbies[key].players[user._id] = { userName: user.username, isHost: false };
  console.log("Player2 was added to Lobby ${key} as host");
  return hostID;
};

const getHostStatus = (user, key) => {
  const lobby = allLobbies[key];
  return lobby.players[user._id].isHost;
};

const getUserName = (user, key) => {
  const lobby = allLobbies[key];
  return lobby.players[user._id].userName;
};

const getOtherPlayerName = (user, key) => {
  const lobby = allLobbies[key];
  for (const playerID in lobby.players) {
    if (playerID !== user._id) {
      return lobby.players[playerID].userName;
    }
  }
  return "Waiting for Player2...";
};
const deleteLobby = (user, key) => {
  let player2Id;
  const lobby = allLobbies[key];
  console.log("game-logic: deleteLobby", lobby);
  for (const playerID in lobby.players) {
    if (playerID !== user._id) {
      player2Id = playerID;
    }
  }
  delete allLobbies[key];
  return player2Id;
};

const deletePlayer2 = (user, key) => {
  let player1Id;
  const lobby = allLobbies[key];
  for (const playerID in lobby.players) {
    if (playerID !== user._id) {
      player1Id = playerID;
    }
  }
  delete allLobbies[key].players[user._id];
  return player1Id;
};
const isValidKey = (key) => {
  for (const lobbyKey in allLobbies) {
    if (lobbyKey === key) {
      return true;
    }
  }
  return false;
};
const startGame = (user, key) => {
  let player2Id;
  const lobby = allLobbies[key];
  for (const playerID in lobby.players) {
    if (playerID !== user._id) {
      player2Id = playerID;
    }
  }

  allLobbies[key].hasGameStarted = true; // THIS IS TEMPORARY // NEED TO CHANGE

  return player2Id;
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
  joinLobby,
  generateLobbyKey,
  getHostStatus,
  getUserName,
  getOtherPlayerName,
  deleteLobby,
  deletePlayer2,
  isValidKey,
  startGame,
};
