import { Link } from "@reach/router";
import React, { useState, useEffect } from "react";
import { get, post } from "../../utilities.js";
import "../../utilities.css";
import "./LobbyPage.css";
import { socket } from "../../client-socket.js";

const LobbyPage = (props) => {
  const getUsername = () => {
    get("/api/getUsername").then((res) => {
      return res.username;
    });
  };

  const [username, setUsername] = useState("");

  socket.on("username", (data) => setUsername(data));

  useEffect(() => {
    get("/api/getUsername").then((data) => setUsername(data.username));
  }, []);

  // message stores input field value
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const changeUsername = () => {
    let body = { username: message };
    post("/api/changeUsername", body).then((res) => {
      console.log(res.message);
    });
  };

  return (
    <>
      <nav className="main-content">
        <div className="lobby-title">Lost & Found</div>
        <div className="Host-Container u-flex-alignCenter u-flexColumn">
          <button
            className="Host-Button"
            onClick={() => {
              console.log("In onClick in Host Game Button");
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
            <div>Username: {username}</div>
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
