import React from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";

import "../../utilities.css";
import "./HomePage.css";
import { Link } from "@reach/router";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const HomePage = ({ userId, handleLogin, handleLogout, googleClientId }) => {
  return (
    <Container className="vh-100 HomePage-container" fluid={true}>
      <Row className="HomePage-title homepage-middle-signin">Lost & Found</Row>
      <Row>
        <Col></Col>
        <Col xs={4} className="align-items-center">
          <GoogleOAuthProvider clientId={googleClientId}>
            {userId ? (
              <div className="HomePage-logout-container">
                <Row className="align-items-center HomePage-playButton">
                  <Link
                    to="/lobby/"
                    className="HomePage-playButton"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    Play
                  </Link>
                </Row>
                <button
                  onClick={() => {
                    googleLogout();
                    handleLogout();
                  }}
                  className="HomePage-logoutButton"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="HomePage-signin-container">
                <div className="HomePage-signin-text">Log In</div>
                <GoogleLogin
                  onSuccess={handleLogin}
                  onError={(err) => console.log(err)}
                  theme="outline"
                  shape="pill"
                />
              </div>
            )}
          </GoogleOAuthProvider>
        </Col>
        <Col></Col>
      </Row>
    </Container>
  );
};

export default HomePage;
