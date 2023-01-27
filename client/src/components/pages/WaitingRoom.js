import React, { useEffect, useState } from "react";
import "./WaitingRoom.css";
import { get, post } from "../../utilities.js";
import { socket } from "../../client-socket.js";
import { Link, useNavigate } from "@reach/router";
import Game from "./GamePage/Game";

const WaitingRoom = (props) => {
  const [player1, setPlayer1] = useState({ name: "" });
  const [player2, setPlayer2] = useState({ name: "" });
  const [gameKey, setGameKey] = useState({ key: "XXXXXX" });
  const [isHost, setIsHost] = useState("DefaultValue");
  const [didHostLeave, setDidHostLeave] = useState(false);
  const [isPlayer2Here, setIsPlayer2Here] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);

  // Gets Lobby Key //
  useEffect(() => {
    const callback = (key) => {
      console.log("Actual Key", key);
      setGameKey({ key: key });
    };

    socket.on("getKey", callback);
    return () => {
      socket.off("getKey", callback);
    };
  }, []);

  // Gets Host Status //
  useEffect(() => {
    if (gameKey.key !== "XXXXXX") {
      //Ensures this useEffect doesn't happen on initial load
      console.log("Getting Host Status...", gameKey);
      post("/api/getHostStatus", gameKey).then((data) => {
        if (data.isHost) {
          setIsHost(true);
        } else {
          setIsHost(false);
        }
      });
    }
  }, [gameKey, isPlayer2Here]);

  // Gets Username of User // Sets their own role (either Player1 or Player2)
  useEffect(() => {
    if (isHost !== "DefaultValue") {
      //Ensures this useEffect doesn't happen on initial load
      get("/api/getUsername", gameKey).then((data) => {
        if (isHost) {
          console.log("Setting Player1 to Host..");
          setPlayer1({ name: data.username });
        } else {
          setPlayer2({ name: data.username });
        }
      });
    }
  }, [isHost, isPlayer2Here]);

  // Gets Username of the other Player // Sets other Player role (either Player1 or Player2)
  useEffect(() => {
    if (isHost !== "DefaultValue") {
      //Ensures this useEffect doesn't happen on initial load
      post("/api/getOtherPlayerName", gameKey).then((data) => {
        if (isHost) {
          console.log("Setting Player2 to Joinee..");
          setPlayer2({ name: data.userName });
        } else {
          setPlayer1({ name: data.userName });
        }
      });
    }
  }, [isHost, isPlayer2Here]);

  // Holds most of the Socket Work // Where Sockets are turned on
  useEffect(() => {
    const callback1 = (response) => {
      setIsPlayer2Here(true);
    };
    const callback2 = (response) => {
      setIsPlayer2Here(false);
    };
    const callback3 = (response) => {
      setDidHostLeave(true);
    };
    const callback4 = (response) => {
      setHasGameStarted(true);
    };
    const callback5 = (response) => {
      setHasGameStarted(false);
    };
    //Ensures this useEffect doesn't happen on initial load
    if (isHost !== "DefaultValue") {
      socket.on("resetToWaitingRoom", callback5);
      // Player1 Sockets /// Gets info from Player 2 //
      if (isHost) {
        socket.on("isPlayer2Here", callback1);
        socket.on("resetPlayer2", callback2);

        return () => {
          socket.off("isPlayer2Here", callback1);
          socket.off("resetPlayer2", callback2);
          socket.off("resetToWaitingRoom", callback5);
        };
        //Player 2 Sockets // Gets info from Player1 //
      } else {
        setIsPlayer2Here(true);
        socket.on("displayHostLeft", callback3);
        socket.on("gameHasStarted", callback4);
        return () => {
          socket.off("displayHostLeft", callback3);
          socket.off("gameHasStarted", callback4);
          socket.off("resetToWaitingRoom", callback5);
        };
      }
    }
  }, [isHost]);
  const handleLeaveLobby = () => {
    // If Host Leaves, Lobby should be Deleted //
    if (isHost) {
      post("/api/deleteLobby", gameKey);
      // If Player2 Leaves, player2 should be deleted from Lobby
    } else {
      post("/api/deletePlayer2", gameKey);
    }
  };

  const startGame = () => {
    post("/api/startGame", gameKey);
    setHasGameStarted(true);
  };

  /****************** <HTML/>  ********************/
  const htmlDisplayNothing = <span> </span>;

  const htmlLeftBar = (
    <span className="left-Bar">
      <button onClick={handleLeaveLobby}>
        <Link to="/lobby"> Quit... </Link>
      </button>

      <div className="player-text">Player 1</div>
      <div className="body-container">Name: {player1.name}</div>
      <div className="body-container">Statistics</div>
      <div className="body-container">Key: {gameKey.key}</div>
    </span>
  );

  const htmlRightBar = (
    <span className="right-Bar">
      <div className="player-text">Player 2</div>
      <div className="body-container">Name: {player2.name}</div>
      <div className="body-container">Statistics</div>
    </span>
  );

  const htmlActiveStartButton = (
    <span>
      <button className="start-button" onClick={startGame}>
        <div className="start-text">Start</div>
      </button>
    </span>
  );

  const htmleDisbaledStartActive = (
    <span>
      <button className="start-button" disabled>
        <div className="start-text">Start</div>
      </button>
    </span>
  );

  const htmlHostLeftScreen = (
    <div id="Host-Left-Screen">
      <h1> The Host has Left the Game </h1>
      <Link to="/lobby"> Leave Game </Link>
    </div>
  );

  return !didHostLeave ? (
    !hasGameStarted ? (
      <div className="WaitingRoom-container">
        {htmlLeftBar}
        {isPlayer2Here
          ? isHost
            ? htmlActiveStartButton // If Player2 is here and you are Host
            : htmleDisbaledStartActive // If player2 is Here but you are not host
          : htmlDisplayNothing}
        {/* If player2 is not Here */}
        {htmlRightBar}
      </div>
    ) : (
      <Game gameKey={gameKey} isHost={isHost} />
    )
  ) : (
    htmlHostLeftScreen // Host Left
  );
};

export default WaitingRoom;
