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

//initialize socket
const socketManager = require("./server-socket");
router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

router.get("/user", (req, res) => {
  User.findById(req.query.userid).then((user) => {
    res.send(user);
  });
});

router.post("/spawn", (req, res) => {
  if (req.user) {
    console.log("req.user equaled true in router.post(/spawn...");
    socketManager.addUserToGame(req.user);
  }
  res.send({});
});

router.post("/despawn", (req, res) => {
  if (req.user) {
    socketManager.removeUserFromGame(req.user);
  }
  res.send({});
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
    console.log("REQQQQ", req.body.key);
    res.send({ isHost: socketManager.getHostStatus(req.user, req.body.key), user: req.user });
  }
});

router.post("/joinLobby", (req, res) => {
  if (req.user) {
    socketManager.joinLobby(req.user, req.body.enteredKey);
  }
  res.send({});
});
/*----------------------  END OF LOBBY SYSTEM  --------------------------*/

router.get("/activeUsers", (req, res) => {
  res.send({ activeUsers: socketManager.getAllConnectedUsers() });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
