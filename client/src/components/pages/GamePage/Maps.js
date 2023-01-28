import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, StreetViewPanorama, Marker } from "@react-google-maps/api";
import { post, get } from "../../../utilities";
import CountDownTimer from "../../modules/Timer";
import "./Maps.css";
import { socket } from "../../../client-socket.js";
import { Link } from "@reach/router";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

//Used to Center Map during "Pick a Location Screen" to mimic typcial map structure;
//ie. North America on the left, Europe/ Africa in middle and Asia on the right
const mapCenter = {
  lat: 20,
  lng: 0,
};

const markerCoordinates = [
  {
    label: "Boston",
    position: { lat: 42.345573, lng: -71.098326 },
    startPositions: [
      { lat: 42.345573, lng: -71.098326 }, // Fenway area
      { lat: 42.35650542248174, lng: -71.0620105380493 }, //Boston Commons
      { lat: 42.360126338885586, lng: -71.05587522572742 }, // Quincy Market
    ],
  },
  {
    label: "NewYorkCity",
    position: { lat: 40.75497751666591, lng: -73.98997420018596 },
    startPositions: [{ lat: 40.75497751666591, lng: -73.98997420018596 }],
  },
  {
    label: "LosAngeles",
    position: { lat: 34.01820940007115, lng: -118.2999255824083 },
    startPositions: [{ lat: 34.01820940007115, lng: -118.2999255824083 }],
  },
];

// PROPS
// props.gameKey
// props.isHost
function Maps(props) {
  // API-HANDLER //
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDMGy9-oVsU4Ei80p5oaAq1SPGFnPlmPjs",
  });

  // GOOGLE MAP OBJECTS //
  const [map, setMap] = useState(null);
  const [panorama, setPanorama] = useState(null);
  const [markers, setMarkers] = useState({});
  const [insidePano, setInsidePano] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);

  // GETS WIN CONDITION //
  useEffect(() => {
    const callback1 = (hasWon) => {
      if (hasWon) {
        setGameWon(true);
      }
    };
    socket.on("hasWon", callback1);
    return () => {
      socket.off("hasWon", callback1);
    };
  }, []);

  // Gets Random Start Position //
  const [spawnPlayer2, setSpawnPlayer2] = useState(false);
  const [player2Start, setPlayer2Start] = useState(null);

  const getRandomInt = (min, max) => {
    // The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  };

  // get two unique start locations, returned as elements in an array
  const getStartPositions = (location) => {
    // get a random index that corresponds to a start position of given location
    const index1 = getRandomInt(0, location.startPositions.length);
    let index2 = index1;
    // get a new index until different from first index
    while (index2 === index1) {
      index2 = getRandomInt(0, location.startPositions.length);
    }
    const location1 = location.startPositions[index1];
    const location2 = location.startPositions[index2];
    return [location1, location2];
  };

  /*---------------------------- Handlers--------------------------------------*/
  // Handles when Either Players Leaves
  const handleLeaveLobby = () => {
    // If Host Leaves, Lobby should be Deleted //
    if (props.isHost) {
      post("/api/deleteLobby", props.gameKey);
      // If Player2 Leaves, player2 should be deleted from Lobby
    } else {
      post("/api/deletePlayer2", props.gameKey);
    }
  };

  // Ensures Game is Rest if Chosen to Play Agiain //
  const handleResetGame = () => {
    setGameWon(false);
    setGameLost(false);
    post("/api/resetToWaitingRoom", props.gameKey);
  };

  const hoursMinSecs = { hours: 0, minutes: 0, seconds: 15 };

  // Component Function Handlers //
  const panoOnChangePositionHandler = () => {
    // Updates Position //
    if (insidePano) {
      let newLocation = {
        lat: panorama.location.latLng.lat(),
        lng: panorama.location.latLng.lng(),
      };

      post("/api/updatePosition", {
        newLocation: newLocation,
        key: props.gameKey.key,
      });

      // Can Remove This Post Request //
      post("/api/calculateDistance", {
        location1: { lat: 42.35650542248174, lng: -71.0620105380493 }, //Boston Common hardcoded
        location2: newLocation,
        test: "test",
      }).then((res) => {
        console.log(res.distance);
      });
    }
  };
  // only for player 2 (not host)
  useEffect(() => {
    if (!props.isHost) {
      socket.on("spawnPlayer2", (startLocation) => {
        setSpawnPlayer2(true);
        setPlayer2Start(startLocation);
      });
    }
  }, []);

  // will set player 2's position once received from socket
  useEffect(() => {
    if (spawnPlayer2) {
      panorama.setPosition(player2Start);
      panorama.setVisible(true);
      setInsidePano(true);
    }
  }, [player2Start]);

  // initially loaded for both players
  return isLoaded ? (
    <div id="map-container">
      <GoogleMap
        className="Map-Container"
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={2}
        onLoad={(map) => {
          setMap(map);
        }}
        onUnmount={(map) => {
          setMap(null);
        }}
        options={{
          disableDefaultUI: true,
          gestureHandling: "none",
          keyboardShortcuts: false,
        }}
      >
        <StreetViewPanorama
          visible={false}
          center={center}
          onUnmount={(panorama) => {
            console.log("onUnmount", panorama);
          }}
          onLoad={(panorama) => {
            panorama.setOptions({
              addressControl: false,
              fullscreenControl: false,
              enableCloseButton: false,
            });
            setPanorama(panorama);
          }}
          onPositionChanged={panoOnChangePositionHandler}
        />
        {markerCoordinates.map((location) => {
          return (
            <Marker
              position={location.position}
              label={location.label}
              key={location.label}
              onLoad={(marker) => {
                markers[location.label] = marker;
              }}
              onClick={(e) => {
                let isBouncing = false;
                const marker = markers[location.label];
                console.log(marker);
                if (isBouncing === false) {
                  marker.setAnimation(google.maps.Animation.BOUNCE);
                  isBouncing = true;
                  window.setTimeout(() => {
                    marker.setAnimation(null);
                    isBouncing = false;
                  }, 5000);
                } else {
                  marker.setAnimation(null);
                  isBouncing = false;
                }
              }}
              onDblClick={(e) => {
                if (props.isHost) {
                  const marker = markers[location.label];
                  // get both starting locations when host selects location
                  const startLocations = getStartPositions(location);
                  const startLocation1 = startLocations[0];
                  const startLocation2 = startLocations[1];
                  post("/api/spawn", {
                    startLocation1: startLocation1,
                    startLocation2: startLocation2,
                    isHost: props.isHost,
                  });
                  marker.setVisible(false);
                  panorama.setVisible(true);
                  panorama.setPosition(startLocation1);
                  setInsidePano(true);
                  // CountDownTimer({hoursMinSecs})
                }
              }}
            />
          );
        })}
      </GoogleMap>
      {insidePano ? (
        <div className="Timer-Container">
          <CountDownTimer hoursMinSecs={hoursMinSecs} setGameLost={setGameLost}></CountDownTimer>
        </div>
      ) : (
        <span></span>
      )}

      {gameWon ? (
        <div id="winScreenContainer" className="gameOverPopup">
          <h2> You Found Each Other </h2>
          <button onClick={handleLeaveLobby}>
            <Link to="/lobby"> Quit to Host/Join Screen </Link>
          </button>
          <button onClick={handleResetGame}> Back to Waiting Room </button>
        </div>
      ) : (
        <></>
      )}
      {gameLost ? (
        <div id="loseScreenContainer" className="gameOverPopup">
          <h2> You Could not Find Each Other on Time :-/ </h2>
          <button onClick={handleLeaveLobby}>
            <Link to="/lobby"> Quit to Host/Join Screen </Link>
          </button>
          <button onClick={handleResetGame}> Back to Waiting Room </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <></>
  );
}

export default Maps;
