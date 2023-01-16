import React from "react";
import { Link } from "@reach/router";

const HomePage = () => {
  return (
    <div>
      <h1>Lost and Found</h1>
      <Link to="/skeleton">Sign in</Link>
    </div>
  );
};

export default HomePage;
