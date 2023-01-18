import React from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";

import "../../utilities.css";
import "./HomePage.css";
import { Link } from "@reach/router";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "89445914111-u81dif2k5ba9g2bm0h5rvuotfo7f9tup.apps.googleusercontent.com";

const HomePage = ({ userId, handleLogin, handleLogout }) => {
  return (
    <div className="HomePage-container">
      <div className="HomePage-title">Lost & Found</div>
      <div className="HomePage-content">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {userId ? (
            <div className="HomePage-logout-container">
              <Link to="/lobby/" className="HomePage-playButton">
                Play
              </Link>
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
            <div className="HomePage-signin-container u-flexColumn u-flex-alignCenter ">
              <p className="HomePage-signin-text">Log In</p>
              <GoogleLogin
                onSuccess={handleLogin}
                onError={(err) => console.log(err)}
                theme="filled_blue"
                shape="pill"
              />
            </div>
          )}
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default HomePage;
