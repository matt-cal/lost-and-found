import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./NotLoggedInPage.css";
import { useNavigate } from "@reach/router";

const NotLoggedInPage = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/");
  };
  return (
    <Container id="NotLoggedIn-Container" className="vh-100 NLI-main-container" fluid="true">
      <Row className="NotLoggedIn-row1">
        <Col className="NotLoggedIn-col1">
          <h2 className="title"> Please Log In </h2>
        </Col>
      </Row>
      <Row>
        <Col> </Col>
        <Col className="loginbuttoncol">
          <button className="p-4 LoginPageButton" onClick={handleClick}>
            {" "}
            Go to Login Page{" "}
          </button>
        </Col>
        <Col> </Col>
      </Row>
      <Row>
        <Col></Col>
      </Row>
    </Container>
  );
};
export default NotLoggedInPage;
