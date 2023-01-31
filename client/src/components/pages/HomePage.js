import React from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";

import "../../utilities.css";
import "./HomePage.css";
import { Link } from "@reach/router";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "89445914111-u81dif2k5ba9g2bm0h5rvuotfo7f9tup.apps.googleusercontent.com";

const HomePage = ({ userId, handleLogin, handleLogout }) => {
  return (
    <Container className="vh-100 HomePage-container" fluid={true}>
      <Row className="HomePage-title homepage-middle-signin">Lost & Found</Row>
      <Row>
        <Col></Col>
        <Col xs={4} className="align-items-center">
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {userId ? (
              <div className="HomePage-logout-container">
                <Row className="align-items-center HomePage-playButton">
                  <Link to="/lobby/" className="HomePage-playButton">
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
              <Row className="align-items-center HomePage-signin-container homepage-middle-signin">
                <Col className="HomePage-signin-text">
                  {" "}
                  Log In
                  <Row className="HomePage-signin-text align-items-center">
                    <GoogleLogin
                      className="homepage-middle-signup"
                      onSuccess={handleLogin}
                      onError={(err) => console.log(err)}
                      theme="outline"
                      shape="pill"
                    />
                  </Row>
                </Col>
              </Row>
            )}
          </GoogleOAuthProvider>
        </Col>
        <Col></Col>
      </Row>
    </Container>
  );
};

export default HomePage;
