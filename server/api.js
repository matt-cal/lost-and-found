/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/
console.log("---------------------------------------------------");

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

require("dotenv").config();

//initialize socket
const socketManager = require("./server-socket");
const socket = require("socket.io-client/lib/socket");
const { deletePlayer2 } = require("./server-socket");
//game logic
const gameLogic = require("./game-logic");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});
router.get("/getGoogleMapsApiKey", (req, res) => {
  res.send({ key: process.env.GOOGLE_API_KEY });
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

router.get("/user", (req, res) => {
  if (req.user) {
    User.findById(req.query.userid).then((user) => {
      res.send(user);
    });
  }
  res.send({});
});

// --------Game State Stuff-------------

router.post("/resetToWaitingRoom", (req, res) => {
  if (req.user) {
    socketManager.resetToWaitingRoom(req.user, req.body.key);
  }
});

router.post("/setTimer", (req, res) => {
  const time = { hours: req.body.hours, minutes: req.body.minutes, seconds: req.body.seconds };
  if (req.user) {
    gameLogic.setTimer(req.body.key, time);
  }
  res.send({});
});
router.get("/getTimer", (req, res) => {
  if (req.user) {
    res.send(gameLogic.getTimer(req.query.key));
  }
});

router.post("/spawn", (req, res) => {
  if (req.user) {
    console.log("req.user equaled true in router.post(/spawn...");
    console.log(`start location: ${req.body.startLocation1.lat}, ${req.body.startLocation1.lng}`);
    socketManager.addUserToGame(req.user, req.body.startLocation1);

    // if this is player 1's call, emit socket to player 2 for them to spawn
    if (req.body.isHost) {
      socketManager.getIo().emit("spawnPlayer2", req.body.startLocation2);
    }
  }
  res.send({});
});

router.post("/despawn", (req, res) => {
  if (req.user) {
    socketManager.removeUserFromGame(req.user);
  }
  res.send({});
});

router.post("/updatePosition", (req, res) => {
  if (req.user) {
    gameLogic.updatePlayerPosition(req.body.key, req.user._id, req.body.newLocation);
  }
  res.send({});
});

router.post("/calculateDistance", (req, res) => {
  if (req.user) {
    let dist = gameLogic.calcDistance(req.body.location1, req.body.location2);
    res.send({ distance: dist });
  } else {
    res.send({});
  }
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

/*----------------- LOBBY SYSTEM  ------------------------*/

router.post("/createLobby", (req, res) => {
  if (req.user) {
    socketManager.createLobby(req.user);
  }
  res.send({});
});
router.post("/getUserName", (req, res) => {
  if (req.user) {
    res.send({ userName: socketManager.getUserName(req.user, req.body.key) });
  }
});

router.post("/getOtherPlayerName", (req, res) => {
  if (req.user) {
    res.send({ userName: socketManager.getOtherPlayerName(req.user, req.body.key) });
  }
});

router.post("/getHostStatus", (req, res) => {
  if (req.user) {
    res.send({ isHost: socketManager.getHostStatus(req.user, req.body.key), user: req.user });
  }
});

router.post("/joinLobby", (req, res) => {
  if (req.user) {
    socketManager.joinLobby(req.user, req.body.enteredKey);
  }
  res.send({});
});

router.post("/deleteLobby", (req, res) => {
  if (req.user) {
    socketManager.deleteLobby(req.user, req.body.key);
  }
});

router.post("/deletePlayer2", (req, res) => {
  if (req.user) {
    socketManager.deletePlayer2(req.user, req.body.key);
  }
});

router.post("/isValidKey", (req, res) => {
  if (req.user) {
    res.send({ res: socketManager.isValidKey(req.body.key) });
  }
});
router.post("/startGame", (req, res) => {
  if (req.user) {
    socketManager.startGame(req.user, req.body.key);
  }
});
/*----------------------  END OF LOBBY SYSTEM  --------------------------*/

router.get("/activeUsers", (req, res) => {
  res.send({ activeUsers: socketManager.getAllConnectedUsers() });
});

/*----------------------- UserName System---------------------------------*/
router.get("/getUsername", (req, res) => {
  if (req.user) {
    User.findOne({ name: req.user.name }).then((user) => {
      res.send({ username: user.username });
    });
  } else {
    res.send({});
  }
});

router.post("/changeUsername", (req, res) => {
  if (req.user) {
    User.findOne({ name: req.user.name }).then((user) => {
      user.username = req.body.username;
      user.save();
      socketManager.getSocketFromUserID(req.user._id).emit("username", user.username);
    });
    res.send({ message: "updated username" });
  }
});
/*----------------------- End of UserName System---------------------------------*/

// player statistics
router.post("/updateGamesPlayed", (req, res) => {
  if (req.user) {
    gameLogic.updateGamesPlayed(req.body.key);
  }
});

router.get("/getGamesPlayed", (req, res) => {
  if (req.user) {
    User.findOne({ googleid: req.user.googleid }).then((user) => {
      res.send({ gamesPlayed: user.gamesPlayed });
    });
  } else {
    res.send({});
  }
});

router.get("/getOtherPlayerGamesPlayed", (req, res) => {
  if (req.user) {
    const username = req.query.userName;
    User.findOne({ username: username }).then((user) => {
      console.log("found other user: ", user);
      res.send({ gamesPlayed: user.gamesPlayed });
    });
  } else {
    res.send({});
  }
});

router.post("/resetGamesPlayed", (req, res) => {
  if (req.user) {
    User.findOne({ googleid: req.user.googleid }).then((user) => {
      user.gamesPlayed = 0;
      user.save();
    });
  }
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
