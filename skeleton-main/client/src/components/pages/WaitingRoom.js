import React, { useEffect, useState } from "react";
import "./WaitingRoom.css";
import { get, post } from "../../utilities.js";
import { socket } from "../../client-socket.js";
import { Link } from "@reach/router";

const WaitingRoom = (props) => {
  const [player1, setPlayer1] = useState({ name: "" });
  const [player2, setPlayer2] = useState({ name: "" });
  const [gameKey, setGameKey] = useState({ key: "XXXXXX" });
  const [isHost, setIsHost] = useState("DefaultValue");
  const [didHostLeave, setDidHostLeave] = useState(false);
  // IsPlayer2Here is defined as a state so it could be used as a Dependency in useEffect,
  // allowing the Host to update info once Player2 joins.
  const [isPlayer2Here, setIsPlayer2Here] = useState(false);
  // Gets Lobby Key
  useEffect(() => {
    socket.on("getKey", (key) => {
      setGameKey({ key: key });
    });
  }, []);

  // Gets Host Status
  useEffect(() => {
    if (gameKey.key !== "XXXXXX") {
      //Ensures this useEffect doesn't happen on initial load
      post("/api/getHostStatus", gameKey).then((data) => {
        if (data.isHost) {
          setIsHost(true);
        } else {
          setIsHost(false);
        }
      });
    }
  }, [gameKey, isPlayer2Here]);

  // Gets Username of User and sets their role (either Player1 or Player2)
  useEffect(() => {
    if (isHost !== "DefaultValue") {
      //Ensures this useEffect doesn't happen on initial load
      post("/api/getUserName", gameKey).then((data) => {
        if (isHost) {
          console.log("Setting Player1 to Host..");
          setPlayer1({ name: data.userName });
        } else {
          setPlayer2({ name: data.userName });
        }
      });
    }
  }, [isHost, isPlayer2Here]);

  // Gets Username of the other Player and sets their role (either Player1 or Player2)
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

  // If Host, creates listener socket to know when Player2 joins
  useEffect(() => {
    if (isHost !== "DefaultValue") {
      //Ensures this useEffect doesn't happen on initial load
      if (isHost) {
        socket.on("isPlayer2Here", (response) => {
          setIsPlayer2Here(true);
        });
      } else {
        console.log("Player2s socket turned on");
        socket.on("displayHostLeft", (response) => {
          console.log("Updating didHostLeave");
          setDidHostLeave(true);
        });
      }
    }
  }, [isHost]);

  const handleLeaveLobby = () => {
    if (isHost) {
      post("/api/deleteLobby", gameKey);
    } else {
      post("/api/deletePlayer2", gameKey);
    }
  };

  return !didHostLeave ? (
    <div className="WaitingRoom-container">
      <span className="left-Bar">
        <button onClick={handleLeaveLobby}>
          <Link to="/lobby"> Quit... </Link>
        </button>

        <div className="player-text">Player 1</div>
        <div className="body-container">Name: {player1.name}</div>
        <div className="body-container">Satistics</div>
        <div className="body-container">Key: {gameKey.key}</div>
      </span>
      {isPlayer2Here ? (
        <span>
          <button className="start-button">
            <div className="start-text">Start</div>
          </button>
        </span>
      ) : (
        <span></span>
      )}
      <span className="right-Bar">
        <div className="player-text">Player 2</div>
        <div className="body-container">Name: {player2.name}</div>
        <div className="body-container">Statistics</div>
      </span>
    </div>
  ) : (
    <>
      <div id="Host-Left-Screen">
        <h1> The Host has Left the Game </h1>
        <Link to="/lobby"> Leave Game </Link>
      </div>
    </>
  );
};

export default WaitingRoom;
