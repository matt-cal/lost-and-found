import { Link } from "@reach/router";
import React from "react";

import "../../utilities.css";
import "./LobbyPage.css";

const LobbyPage = () => {
  return (
    <>
      <nav className="main-content">
        <div className= "lobby-title">
            Lost & Found
        </div>
      <div className="Host-Container u-flex-alignCenter u-flexColumn">
        <div className="Host-Button"> 
            <Link to="/real_lobby/" className="Host-Button">
                Host
            </Link>
        </div>
        <div className="Join-Button">
            <Link to="/real_lobby/" className="Join-Button">
                Join
            </Link>
        </div>
      </div>
      </nav>
    </>
  );
};

export default LobbyPage;
