import React, { useEffect, useState } from "react";
import "./WaitingRoom.css";
import { get, post } from "../../utilities.js";
import { socket } from "../../client-socket.js";

const WaitingRoom = (props) => {
  const [player1, setPlayer1] = useState({ name: "" });
  const [player2, setPlayer2] = useState({ name: "" });
  const [gameKey, setGameKey] = useState({ key: "XXXXXX" });
  const [isHost, setIsHost] = useState("DefaultValue");
  // IsPlayer2Here is defined as a state so it could be used as a Dependency in useEffect,
  // allowing the Host to update info once Player2 joins.
  const [isPlayer2Here, setIsPlayer2Here] = useState(false);
  let [startClickable, setIsButtonAble] = useState(false);

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
      }
    }
  }, [isHost]);

  const RenderButton = (setIsPlayer2Here) => {
    if(setIsPlayer2Here){
      return (
        <span> 
        <button className="start-button">
        <div className="start-text">
          Start
        </div>
        </button>
      </span>);
    }
  };



  return (
  <div className="WaitingRoom-container">
      <span className="left-Bar">
        <div className="player-text">Player 1</div>
        <div className="body-container">Name: {player1.name}</div>
        <div className="body-container">Ready:</div>
        <div className="body-container">Satistics</div>
        <div className="body-container">Key: {gameKey.key}</div>
      </span>
      <span>{RenderButton}</span>
      <span className="right-Bar">
        <div className="player-text">Player 2</div>
        <div className="body-container">Name:{player2.name}</div>
        <div className="body-container">
          <button>Ready</button>
        </div>
        <div className="body-container">Statistics</div>
      </span>
    </div>
  );
};

export default WaitingRoom;
