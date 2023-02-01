import { Link, useNavigate } from "@reach/router";
import React, { useState, useEffect } from "react";
import { get, post } from "../../utilities.js";
import "../../utilities.css";
import "./LobbyPage.css";
import NotLoggedInPage from "./NotLoggedInPage";
import { socket } from "../../client-socket.js";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const LobbyPage = (props) => {
  if (props.userId === undefined) {
    return <NotLoggedInPage />;
  }

  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [inputedKey, setInputedKey] = useState("");
  const [showModal, setShowModal] = useState(false);

  const getUsername = () => {
    get("/api/getUsername").then((res) => {
      return res.username;
    });
  };

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

  const UsernameModal = (
    <div className="LobbyPage-username-container">
      <div className="LobbyPage-username-display">
        Username:
        <div className="u-bold LobbyPage-name">{username}</div>
      </div>
      <input
        type="text"
        placeholder="New Username"
        className="LobbyPage-username-input LobbyPage-username-button"
        name="message"
        onChange={handleChange}
        value={message}
      />
      <button className="LobbyPage-change-username-button" onClick={changeUsername}>
        Change Username
      </button>
    </div>
  );

  const EnterKeyModal = (
    <span className="LobbyPage-username-container">
      <div className="LobbyPage-key-text u-bold">Enter Lobby Key:</div>
      <input
        type="text"
        placeholder="ABCDEF"
        onChange={(e) => {
          setInputedKey(e.target.value);
        }}
        className="LobbyPage-key-input"
      ></input>
      <button
        onClick={() => {
          post("/api/isValidKey", { key: inputedKey }).then((response) => {
            if (response.res === "VALID") {
              post("/api/joinLobby", { userid: props.userId, enteredKey: inputedKey });
              navigate("/waitingroom");
            } else if (response.res === "FULL") {
              window.alert("The Lobby is Full");
            } else {
              window.alert("That is not a Valid Key");
            }
          });
        }}
        className="LobbyPage-key-submit"
      >
        Submit
      </button>
      <button
        onClick={() => {
          setShowModal(!showModal);
        }}
        className="LobbyPage-key-back"
      >
        Back
      </button>
    </span>
  );

  return (
    <>
      <Container className="vh-100 main-container" fluid="true">
        <Row className="align-items-center" fluid="true">
          <Col></Col>
          <Col xs={8} className = "lobby-title">Lost & Found
          </Col>
          <Col className = "align-items-center center-button"> 
          <button
                className="LobbyPage-quit"
                onClick={() => {
                  navigate("/");
                }}
              >
                Quit
              </button>
          </Col>
        </Row>
        <Row className="LobbyPage-content" fluid="true">
          <Col></Col>
          <Col xs={6} className="Host-Container u-flex-alignCenter">
            <button
              className="Host-Button"
              onClick={() => {
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
                setShowModal(!showModal);
              }}
            >
              Join
            </button>
            {showModal ? EnterKeyModal : UsernameModal}
          </Col>
          <Col></Col>
        </Row>
      </Container>
    </>
  );
};

export default LobbyPage;
