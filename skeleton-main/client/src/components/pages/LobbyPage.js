import { Link } from "@reach/router";
import React, { useState } from "react";
import { get, post } from "../../utilities.js";
import "../../utilities.css";
import "./LobbyPage.css";

const LobbyPage = (props) => {
  const getUsername = () => {
    get("/api/getUsername");
  };

  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const changeUsername = () => {
    // "message" stores input field value
    console.log(message);
  };

  return (
    <>
      <nav className="main-content">
        <div className="lobby-title">Lost & Found</div>
        <div className="Host-Container u-flex-alignCenter u-flexColumn">
          {/*
          <button
            onClick={() => {
              console.log("In onClick in Host Game Button");
              /*post("/api/spawn", { userid: props.userId });
              post("/api/createLobby", { userid: props.userId });
            }}
          ></button>
          */}
          <button
            className="Host-Button"
            onClick={() => {
              console.log("In onClick in Host Game Button");
              /*post("/api/spawn", { userid: props.userId });*/
              post("/api/createLobby", { userid: props.userId });
            }}
          >
            <Link to="/waitingroom" className="Host-Button">
              Host
            </Link>
          </button>

          <button
            className="Join-Button"
            onClick={() => {
              let key = window.prompt("Enter your key");
              post("/api/joinLobby", { userid: props.userId, enteredKey: key });
            }}
          >
            <Link to="/waitingroom" className="Join-Button">
              Join
            </Link>
          </button>
          <div className="LobbyPage-username-container">
            <input
              type="text"
              id="message"
              name="message"
              onChange={handleChange}
              value={message}
            />
            <button onClick={changeUsername}>Change Username</button>
            <button onClick={getUsername}>Get Username</button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default LobbyPage;
