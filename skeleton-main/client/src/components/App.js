import React, { useState, useEffect } from "react";
import { Router } from "@reach/router";
import jwt_decode from "jwt-decode";

import NotFound from "./pages/NotFound.js";
import HomePage from "./pages/HomePage.js";
import LobbyPage from "./pages/LobbyPage.js";
import NavBar from "./modules/NavBar.js";
import Game from "./pages/GamePage/Game.js";

import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";
import WaitingRoom from "./pages/WaitingRoom.js";

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);
      }
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    console.log(`Logged in as ${decodedCredential.name}`);
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
  };

  return (
    <>
      <div>
        <Router>
          <HomePage
            path="/"
            handleLogin={handleLogin}
            handleLogout={handleLogout}
            userId={userId}
          />
          <LobbyPage path="/lobby" userId={userId} />
          <WaitingRoom path="/waitingroom" userId={userId} />
          <Game path="/Game" userId={userId} />
          <NotFound default />
        </Router>
      </div>
    </>
  );
};

export default App;
