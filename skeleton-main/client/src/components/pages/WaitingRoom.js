
import React from "react";
import "./WaitingRoom.css";

const WaitingRoom = ()=> {
    return(
    <div className="WaitingRoom-container">
        <span className="left-Bar">
            <div className="player-text">
                Player 1
            </div>
            <div className="body-container">
                Name:
            </div>
            <div className="body-container">
                Ready
            </div>
            <div className="body-container">
                Satistics
            </div>
        </span>
        <span className="right-Bar">
        <div className="player-text">
                Player 2
            </div>
            <div className="body-container">
                Name:
            </div>
            <div className="body-container">
                <button>
                    Ready
                </button>
            </div>
            <div className="body-container">
                Satistics
            </div>
        </span>
    </div>
    );
};

export default WaitingRoom;