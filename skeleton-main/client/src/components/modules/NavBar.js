import React from "react";
import { Link } from "@reach/router";

import "./NavBar.css";

/**
 * The navigation bar at the top of all pages. Takes no props.
 */
const NavBar = () => {
  return (
    <nav className="NavBar-container NavBar-center">
      <div class="NavBar-title">
        <ul>
            Lost & Found
        </ul>
    </div>
      <div className="NavBar-linkContainer u-inlineBlock">
        <Link to="/" className="NavBar-link">
          Home
        </Link>
        <Link to="/profile/" className="NavBar-link">
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;