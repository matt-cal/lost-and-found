import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, StreetViewPanorama, Marker } from "@react-google-maps/api";
import { post, get } from "../../../utilities";
import CountDownTimer from "../../modules/Timer";
import "./Maps.css";
import { socket } from "../../../client-socket.js";
import { Link } from "@reach/router";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
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
    startPositions: [
      { lat: 40.75497751666591, lng: -73.98997420018596 },
      { lat: 40.758178849300116, lng: -73.98558608871517 }, // Times Square
      { lat: 40.758461553906756, lng: -73.97915694453665 }, // Rockefeller Center
      { lat: 40.750225095780856, lng: -73.99467693104403 }, // Madison Square Garden
    ],
  },
  {
    label: "LosAngeles",
    position: { lat: 34.01820940007115, lng: -118.2999255824083 },
    startPositions: [
      { lat: 34.01820940007115, lng: -118.2999255824083 },
      { lat: 34.101758695296375, lng: -118.34026733124281 }, // HollyWood Boulevard
    ],
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
  // Dynamic States //
  const [insidePano, setInsidePano] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [distanceApart, setDistanceApart] = useState(-999999);
  // Important Constants
  const hoursMinSecs = props.timer;

  // GETS WIN CONDITION //
  useEffect(() => {
    const callback1 = (gameUpdate) => {
      const hasWon = gameUpdate[0];
      const distance = gameUpdate[1];
      if (hasWon) {
        setGameWon(true);
      }
      console.log("DISTANCE", distance);
      setDistanceApart(distance);
    };
    socket.on("gameUpdate", callback1);
    return () => {
      socket.off("gameUpdate", callback1);
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
    const callback = (startLocation) => {
      setSpawnPlayer2(true);
      setPlayer2Start(startLocation);
    };
    if (!props.isHost) {
      socket.on("spawnPlayer2", callback);
    }
    return () => {
      socket.off("spawnPlayer2", callback);
    };
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
    <div id="map-container" className="border-rose-500">
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
        // Working Timer inside the Panoramic
        <>
          <div id="Pano-Banner">
            <span id="Pano-Title"> Lost&Found </span>
            <button onClick={handleResetGame} id="Pano-GiveUp">
              Give Up
            </button>
            <div id="Pano-Timer">
              <CountDownTimer
                hoursMinSecs={hoursMinSecs}
                setGameLost={setGameLost}
              ></CountDownTimer>
            </div>
          </div>
          <div id="hotAndCold"> About {distanceApart.toFixed(1)} Miles Apart </div>
        </>
      ) : (
        <>
          <div id="Map-Banner">
            <span id="Map-Title"> Choose a Location </span>
            <button onClick={handleResetGame} id="Map-GiveUp">
              &#x2191; Back
            </button>
            <div id="Map-Timer">
              <p>
                {props.timer.hours >= 10 ? props.timer.hours : "0" + String(props.timer.hours)}:
                {props.timer.minutes >= 10
                  ? props.timer.minutes
                  : "0" + String(props.timer.minutes)}
                :
                {props.timer.seconds >= 10
                  ? props.timer.seconds
                  : "0" + String(props.timer.seconds)}
              </p>
            </div>
          </div>
          <button
            id="Map-Instructions"
            onClick={() => {
              window.alert("Double-Click on a Marker to Choose a Location");
            }}
          >
            ?
          </button>
        </>
      )}
      {gameWon ? (
        <Container id="Win-Modal" className="gameOverPopUp">
          <Row className="row1">
            <Col className="col">
              <h2> You Found Each Other! </h2>
              <hr />
            </Col>
          </Row>
          <Row className="row2">
            <Col className="col">
              <button onClick={handleLeaveLobby}>
                <Link to="/lobby" style={{ textDecoration: "none", color: "white" }}>
                  Quit Lobby
                </Link>
              </button>
            </Col>
          </Row>
          <Row className="row3">
            <Col className="col">
              <button onClick={handleResetGame}> Play Again </button>
            </Col>
          </Row>
        </Container>
      ) : (
        <></>
      )}
      {gameLost ? (
        <Container id="Lose-Modal" className="gameOverPopUp">
          <Row className="row1">
            <Col className="col">
              <h2> You Could Not Find Each Other </h2>
              <hr />
            </Col>
          </Row>
          <Row className="row2">
            <Col className="col">
              <button onClick={handleLeaveLobby}>
                <Link to="/lobby" style={{ textDecoration: "none", color: "white" }}>
                  Quit Lobby
                </Link>
              </button>
            </Col>
          </Row>
          <Row className="row3">
            <Col className="col">
              <button onClick={handleResetGame}> Play Again </button>
            </Col>
          </Row>
        </Container>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <></>
  );
}

export default Maps;
