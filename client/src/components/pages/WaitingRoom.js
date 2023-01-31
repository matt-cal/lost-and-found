import React, { useEffect, useState } from "react";
import "./WaitingRoom.css";
import { get, post } from "../../utilities.js";
import { socket } from "../../client-socket.js";
import { Link, useNavigate } from "@reach/router";
import Game from "./GamePage/Game";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const WaitingRoom = (props) => {
  const [player1, setPlayer1] = useState({ name: "" });
  const [player1GamesPlayed, setPlayer1GamesPlayed] = useState("");
  const [player2GamesPlayed, setPlayer2GamesPlayed] = useState("");
  const [player2, setPlayer2] = useState({ name: "" });
  const [gameKey, setGameKey] = useState({ key: "XXXXXX" });
  const [isHost, setIsHost] = useState("DefaultValue");
  const [didHostLeave, setDidHostLeave] = useState(false);
  const [isPlayer2Here, setIsPlayer2Here] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 30 });
  const navigate = useNavigate();

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
      get("/api/getGamesPlayed").then((data) => {
        if (isHost) {
          setPlayer1GamesPlayed(data.gamesPlayed);
        } else {
          setPlayer2GamesPlayed(data.gamesPlayed);
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
      if (isPlayer2Here) {
        post("/api/getOtherPlayerName", gameKey).then((data) => {
          get("/api/getOtherPlayerGamesPlayed", data).then((res) => {
            if (isHost) {
              setPlayer2GamesPlayed(res.gamesPlayed);
            } else {
              setPlayer1GamesPlayed(res.gamesPlayed);
            }
          });
        });
      }
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
      get("/api/getTimer", gameKey).then((time) => {
        setTimer(time);
      });
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
    navigate("/lobby");
  };

  const startGame = () => {
    // increase games played for both players
    post("/api/updateGamesPlayed", gameKey);
    get("/api/getTimer", gameKey).then((time) => {
      setTimer(time);
    });
    post("/api/startGame", gameKey);
    setHasGameStarted(true);
  };

  /****************** <HTML/>  ********************/
  const htmlDisplayNothing = <span> </span>;

  const htmlActiveStartButton = (
    <span>
      <button className="start-button" onClick={startGame}>
        <div className="start-text">Start</div>
      </button>
    </span>
  );

  const htmleDisbaledStartActive = (
    <span>
      <button className="start-button-disabled" disabled>
        <div className="start-text-disabled">Start</div>
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
      <Container className="vh-100 WaitingRoom-container" fluid="true">
        <Row className="align-items-center top-padding" fluid="true">
          <Col className="u-textCenter">
            <button className="buttons" onClick={handleLeaveLobby}>
              Quit...
            </button>
          </Col>
          <Col xs={5} className="u-textCenter gamepin-container">
            Game Pin: {gameKey.key}
          </Col>
          <Col className="u-textCenter">
            <div id="timeControlContainer">
              <button
                className="buttons"
                onClick={() => {
                  post("/api/setTimer", { key: gameKey.key, hours: 0, minutes: 0, seconds: 30 });
                }}
              >
                30 seconds
              </button>
              <button
                className="buttons"
                onClick={() => {
                  post("/api/setTimer", { key: gameKey.key, hours: 0, minutes: 2, seconds: 0 });
                }}
              >
                2 minutes
              </button>
              <button
                className="buttons"
                onClick={() => {
                  post("/api/setTimer", { key: gameKey.key, hours: 0, minutes: 5, seconds: 0 });
                }}
              >
                5 minutes
              </button>
            </div>{" "}
          </Col>
        </Row>

        <Row className="player-padding" fluid="true">
          <Col className="u-textCenter align-items-center">
            <div className="player-text"> Player 1 </div>
          </Col>
          <Col xs={5} className="u-textCenter"></Col>
          <Col className="u-textCenter">
            <div className="player-text">Player 2</div>
          </Col>
        </Row>

        <Row className="player-padding">
          <Col className="u-textCenter player-text">
            <div className="body-container"> Name: {player1.name}</div>
            <div className="body-container">Games Played: {player1GamesPlayed}</div>
          </Col>
          <Col xs={5} className="u-textCenter"></Col>
          <Col className="u-textCenter player-text">
            <div className="body-container">Name: {player2.name}</div>
            <div className="body-container">{player2GamesPlayed}</div>
          </Col>
        </Row>
        <Row className="align-items-center row-container">
          <Col></Col>
          <Col xs={5} className="start-container">
            {isPlayer2Here
              ? isHost
                ? htmlActiveStartButton // If Player2 is here and you are Host
                : htmleDisbaledStartActive // If player2 is Here but you are not host
              : htmlDisplayNothing}
          </Col>
          <Col></Col>
        </Row>

        <Row className="align-items-center row-container">
          <Col> </Col>
          <Col xs={5} className="align-items-center description-container">
            Challenge your knowledge of a city and see if you can find each other!
          </Col>
          <Col></Col>
        </Row>
      </Container>
    ) : (
      <Game gameKey={gameKey} isHost={isHost} timer={timer} />
    )
  ) : (
    htmlHostLeftScreen // Host Left
  );
};

export default WaitingRoom;
