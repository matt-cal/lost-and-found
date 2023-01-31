let location; //Somehow get latLng Coordinates
let time_setting;
const User = require("./models/user");

/*------------------ Lobby System-------------------  */
const allLobbies = {};
const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOBBYKEYLENGTH = 6;
const MAXDISTNEEDEDTOWIN = 0.05;

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
    gameInfo: {
      startTime: { hours: 0, minutes: 10, seconds: 0 },
      hotAndCold: false,
    },
    gameState: {
      gameCity: null,
      isGameOngoing: false,
      hasGameBeenOne: false,
    },
  };
  console.log("Lobby ${lobbyKey} has been created");
  // Adding Host to Game
  lobby.players[user._id] = {
    isHost: true,
    position: { lat: null, lng: null },
  };
  // Get player username from database
  // add username to lobby
  User.findOne({ name: user.name }).then((data) => {
    lobby.players[user._id].userName = data.username;
  });
  console.log(`Player1 was added to Lobby ${lobbyKey} as Host`);
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
  allLobbies[key].players[user._id] = {
    isHost: false,
    position: { lat: null, lng: null },
  };
  // Get player username from database
  // add username to lobby
  User.findOne({ name: user.name }).then((data) => {
    allLobbies[key].players[user._id].userName = data.username;
  });
  console.log(`Player2 was added to Lobby ${key} as host`);
  return hostID;
};

const getHostStatus = (user, key) => {
  const lobby = allLobbies[key];
  console.log("In getHostStatus...", lobby);
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
  let player2Id = null;
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
    console.log("THIS IS LOBBY KEY", lobbyKey);
    if (lobbyKey === key) {
      const lobby = allLobbies[lobbyKey];
      console.log("THIS IS THE LOBBY", lobby);
      if (Object.keys(lobby.players).length < 2) {
        return "VALID";
      } else return "FULL";
    }
  }
  return "NOTVALID";
};
const startGame = (user, key) => {
  let player2Id;
  const lobby = allLobbies[key];
  for (const playerID in lobby.players) {
    if (playerID !== user._id) {
      player2Id = playerID;
    }
  }
  // WHAT HAPPENS WHEN GAME STARTS // PUT HERE //
  allLobbies[key].gameState.isGameOngoing = true;

  return player2Id;
};
/*------------------ End of Lobby System-------------------  */
const resetPlayerPosition = (id, key) => {
  let otherPlayerId;
  const lobby = allLobbies[key];
  for (const playerID in lobby.players) {
    if (playerID !== id) {
      otherPlayerId = playerID;
    }
  }

  allLobbies[key].players[id].position = { lat: null, lng: null };
  return otherPlayerId;
};

const getDistanceFromEachOther = (key, id1, id2) => {
  const lobby = allLobbies[key];
  const position1 = lobby.players[id1].position;
  const position2 = lobby.players[id2].position;
  return calcDistance(position1, position2);
};
// calculate distance in miles between two locations (lat/lng objects)
const calcDistance = (location1, location2) => {
  let lat1 = location1.lat;
  let lon1 = location1.lng;
  let lat2 = location2.lat;
  let lon2 = location2.lng;
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    return dist;
  }
};

/* GameState */
const gameState = {
  gameWon: null,
  players: {},
  timer: null,
};

/* Time Logic */
const setTimer = (key, time) => {
  allLobbies[key].gameInfo.startTime = time;
};
const getTimer = (key) => {
  return allLobbies[key].gameInfo.startTime;
};

/* Player Logic */
const spawnPlayer = (id, startLocation) => {
  console.log("In spawnPlayer function");
  gameState.players[id] = {
    position: startLocation,
  };
  console.log("gameState", gameState);
  console.log(
    `Start: ${gameState.players[id].position.lat}, ${gameState.players[id].position.lng}`
  );
};

const removePlayer = (id) => {
  if (gameState.players[id] != undefined) {
    delete gameState.players[id];
  }
};

const updatePlayerPosition = (key, id, newCoords) => {
  allLobbies[key].players[id].position = newCoords;
};

const checkGameWin = (key, id1, id2) => {
  const lobby = allLobbies[key];
  const distanceFromEachOther = getDistanceFromEachOther(key, id1, id2);
  if (
    (lobby.players[id1].position.lat != null) &
    (lobby.players[id1].position.lng != null) &
    (lobby.players[id2].position.lat != null) &
    (lobby.players[id2].position.lng != null) &
    (distanceFromEachOther <= MAXDISTNEEDEDTOWIN)
  ) {
    return true;
  } else {
    return false;
  }
};

const updateGameState = () => {
  gameState.gameWon = checkWin();
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
  calcDistance,
  checkGameWin,
  resetPlayerPosition,
  setTimer,
  getTimer,
  getDistanceFromEachOther,
};
