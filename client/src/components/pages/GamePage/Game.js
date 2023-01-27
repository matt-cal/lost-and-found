import Maps from "./Maps";
import React, { useState, useEffect } from "react";
import { socket } from "../../../client-socket.js";
import { get, post } from "../../../utilities.js";

const Game = (props) => {
  return <Maps gameKey={props.gameKey} isHost={props.isHost} setGameKey={props.setGameKey} />;
};
export default Game;
