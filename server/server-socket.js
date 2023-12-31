let io;

const socket = require("socket.io-client/lib/socket");
const gameLogic = require("./game-logic");

const lobbyToGameIntervalId = {};
const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const getAllConnectedUsers = () => Object.values(socketToUserMap);
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];
const getIntervalIdfromLobbyId = (lobbyKey) => lobbyToGameIntervalId[lobbyKey];

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

const shutDownRunningGame = (key) => {
  const intervalID = getIntervalIdfromLobbyId(key);
  if (intervalID) {
    console.log("GAME HAS BEEN KILLED");
    clearInterval(intervalID);
    delete lobbyToGameIntervalId[key];
  }
};

const deleteLobby = (user, key) => {
  shutDownRunningGame(key);
  const player2Id = gameLogic.deleteLobby(user, key);
  if (player2Id !== null) {
    const player2Socket = getSocketFromUserID(player2Id);
    player2Socket.emit("displayHostLeft", "HOST LEFT");
  }
};
const deletePlayer2 = (user, key) => {
  shutDownRunningGame(key);
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

  // Allows Player2 to Navigate to Game Page
  player2Socket.emit("gameHasStarted", true);

  // Starts Game //
  startRunningGame(key, user._id, player2Id);
};
/*------------------------ End of Lobby System----------------------*/

/** Start running game: game loop emits game states to all clients at 60 frames per second */
const startRunningGame = (key, user1Id, user2Id) => {
  const player1Socket = getSocketFromUserID(user1Id);
  const player2Socket = getSocketFromUserID(user2Id);
  console.log("Game is Running...");
  const intervalId = setInterval(() => {
    const hasWon = gameLogic.checkGameWin(key, user1Id, user2Id);
    const distanceFromEachOther = gameLogic.getDistanceFromEachOther(key, user1Id, user2Id);
    const gameUpdate = [hasWon, distanceFromEachOther];
    player1Socket.emit("gameUpdate", gameUpdate);
    player2Socket.emit("gameUpdate", gameUpdate);
  }, 1000 / 5); // 60 frames per second
  lobbyToGameIntervalId[key] = intervalId;
};
const resetToWaitingRoom = (user, key) => {
  shutDownRunningGame(key);
  const otherPlayerId = gameLogic.resetPlayerPosition(user._id, key);
  const mySocket = getSocketFromUserID(user._id);
  const otherSocket = getSocketFromUserID(otherPlayerId);
  mySocket.emit("resetToWaitingRoom", "RESET TO WAITING ROOM");
  otherSocket.emit("resetToWaitingRoom", "RESET TO WAITING ROOM");
};

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
  resetToWaitingRoom: resetToWaitingRoom,
};
