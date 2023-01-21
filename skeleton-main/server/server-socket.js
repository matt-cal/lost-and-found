let io;

const gameLogic = require("./game-logic");

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const getAllConnectedUsers = () => Object.values(socketToUserMap);
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

/* Create a Lobby with the host User inside */
const createLobby = (user) => {
  return gameLogic.createLobby(user);
};
const getKey = (user) => {
  return gameLogic.getKey(user);
};

const getPlayer1Info = (user) => {
  return gameLogic.getPlayer1Info(user);
};

const getPlayer2Info = (user) => {
  return gameLogic.getPlayer2Info(user);
};

const joinLobby = (user, key) => {
  gameLogic.joinLobby(user, key);
};

const checkFullLobby = (user) => {
  gameLogic.checkFullLobby(user);
};

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
    if (gameLogic.gameState.gameWon != null) {
      gameLogic.resetWinState();
    }
  }, 1000 / 60); // 60 frames per second
};

startRunningGame();

const addUserToGame = (user) => {
  console.log("In_addUserToGame: User", user);
  gameLogic.spawnPlayer(user._id);
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
  getPlayer1Info: getPlayer1Info,
  getPlayer2Info: getPlayer2Info,
  getKey: getKey,
  joinLobby: joinLobby,
  checkFullLobby: checkFullLobby,
  getIo: () => io,
};
