let io;

const socket = require("socket.io-client/lib/socket");
const gameLogic = require("./game-logic");

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const getAllConnectedUsers = () => Object.values(socketToUserMap);
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

/*------------------------ Lobby System----------------------*/

const startRunningLobby = (user, key) => {
  // Mechanism for immediately getting the key after creating lobby
  const hostSocket = userToSocketMap[user._id];
  hostSocket.emit("getKey", key);

  /*
  setInterval(() => {
    isLobbyFull(hostSocket, user);
  }, 1000 / 60); */
};

const createLobby = (user) => {
  const lobbyKey = gameLogic.generateLobbyKey();
  startRunningLobby(user, lobbyKey);
  return gameLogic.createLobby(user, lobbyKey);
};

const joinLobby = (user, key) => {
  // Gives key to Player2, allowing Player2 screen to update and have all necessary info
  const joineeSocket = userToSocketMap[user._id];
  joineeSocket.emit("getKey", key);

  const hostID = gameLogic.joinLobby(user, key); //Inserts Player2 to Lobby

  // Lets Player1 know Player2 is in lobby, allowing Player1 to update info about Player2
  const hostSocket = userToSocketMap[hostID];
  hostSocket.emit("isPlayer2Here", "I AM HERE");
};

const getHostStatus = (user, key) => {
  return gameLogic.getHostStatus(user, key);
};

const getUserName = (user, key) => {
  return gameLogic.getUserName(user, key);
};

const getOtherPlayerName = (user, key) => {
  return gameLogic.getOtherPlayerName(user, key);
};

const deleteLobby = (user, key) => {
  const player2Id = gameLogic.deleteLobby(user, key);
  if (player2Id !== null) {
    const player2Socket = getSocketFromUserID(player2Id);
    player2Socket.emit("displayHostLeft", "HOST LEFT");
  }
};
const deletePlayer2 = (user, key) => {
  const player1Id = gameLogic.deletePlayer2(user, key);
  const player1Socket = getSocketFromUserID(player1Id);
  player1Socket.emit("resetPlayer2", "PLAYER2 LEFT");
};
const isValidKey = (key) => {
  return gameLogic.isValidKey(key);
};

const startGame = (user, key) => {
  const player2Id = gameLogic.startGame(user, key);
  const player2Socket = getSocketFromUserID(player2Id);
  player2Socket.emit("gameHasStarted", true);
};
/*------------------------ End of Lobby System----------------------*/

/** Send game state to client */
const sendGameState = () => {
  io.emit("update", gameLogic.gameState);
};

/** Start running game: game loop emits game states to all clients at 60 frames per second */
const startRunningGame = () => {
  console.log("Game has started");
  setInterval(() => {
    gameLogic.updateGameState();
    sendGameState();
    // Reset game 5 seconds after someone wins.
    if (gameLogic.gameState.gameWon) {
      console.log("GAME WON");
      gameLogic.resetWinState();
    }
  }, 1000 / 60); // 60 frames per second
};

startRunningGame();

const addUserToGame = (user, startLocation) => {
  console.log("In_addUserToGame: User", user);
  gameLogic.spawnPlayer(user._id, startLocation);
};

const removeUserFromGame = (user) => {
  gameLogic.removePlayer(user._id);
};

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    // FIXME: is this the behavior you want?
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;
  io.emit("activeUsers", { activeUsers: getAllConnectedUsers() });
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user._id];
  delete socketToUserMap[socket.id];
  io.emit("activeUsers", { activeUsers: getAllConnectedUsers() });
};

module.exports = {
  init: (http) => {
    io = require("socket.io")(http);

    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);
      socket.on("disconnect", (reason) => {
        console.log("Reason for Disconnection", reason);
        const user = getUserFromSocketID(socket.id);
        removeUser(user, socket);
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,
  getSocketFromUserID: getSocketFromUserID,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,
  getAllConnectedUsers: getAllConnectedUsers,
  addUserToGame: addUserToGame,
  removeUserFromGame: removeUserFromGame,
  createLobby: createLobby,
  joinLobby: joinLobby,
  getHostStatus: getHostStatus,
  getUserName: getUserName,
  getOtherPlayerName: getOtherPlayerName,
  deleteLobby: deleteLobby,
  deletePlayer2: deletePlayer2,
  getIo: () => io,
  isValidKey: isValidKey,
  startGame: startGame,
};
