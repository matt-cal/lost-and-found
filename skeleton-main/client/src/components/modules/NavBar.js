import React from "react";
import { Link } from "@reach/router";

import "./NavBar.css";

/**
 * The navigation bar at the top of all pages. Takes no props.
 */
const NavBar = () => {
  return (
    <nav className="NavBar-container NavBar-center">
      <div class="NavBar-title u-textcenter">
            Lost & Found
      </div>
      <div className="NavBar-linkContainer u-inlineBlock">
        <Link to="/profile/" className="NavBar-link u-inlineBlock">
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;