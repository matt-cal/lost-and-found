import React, { useEffect, useState } from "react";
import "./WaitingRoom.css";
import { get, post } from "../../utilities.js";

const WaitingRoom = (props) => {
  console.log("Hereeeee");
  const [player1, setPlayer1] = useState({ name: "default-name" });
  const [player2, setPlayer2] = useState({ name: "default-name" });
  const [gameKey, setGameKey] = useState({ key: "random-key" });

  useEffect(() => {
    get("/api/getPlayer1Info").then((data) => {
      console.log(data);
      setPlayer1({ name: data.userInfo });
      console.log("player1.name", player1.name);
    });
  }, []);

  useEffect(() => {
    get("/api/getKey").then((data) => {
      console.log("in get lobby get requet", data);
      setGameKey({ key: data.key });
      console.log("lobbystate", gameKey);
    });
  }, []);

  return (
    <div className="WaitingRoom-container">
      <span className="left-Bar">
        <div className="player-text">Player 1</div>
        <div className="body-container">Name: {player1.name}</div>
        <div className="body-container">Ready:</div>
        <div className="body-container">Satistics</div>
        <div className="body-container">Key: {gameKey.key}</div>
      </span>
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
