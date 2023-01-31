import Maps from "./Maps";
import React, { useState, useEffect } from "react";
import NotLoggedIn from "../NotLoggedInPage.js";

const Game = (props) => {
  if (props.userId === undefined) {
    return <NotLoggedIn />;
  }
  return (
    <Maps
      gameKey={props.gameKey}
      isHost={props.isHost}
      setGameKey={props.setGameKey}
      timer={props.timer}
    />
  );
};
export default Game;
