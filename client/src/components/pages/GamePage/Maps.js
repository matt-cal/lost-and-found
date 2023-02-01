import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, StreetViewPanorama, Marker } from "@react-google-maps/api";
import { post, get } from "../../../utilities";
import CountDownTimer from "../../modules/Timer";
import "./Maps.css";
import { socket } from "../../../client-socket.js";
import { Link, useNavigate } from "@reach/router";
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
  {
    label: "GuatemalaCity",
    position: { lat: 14.61461978239971, lng: -90.53378068194324 },
    startPositions: [
      { lat: 14.6425101, lng: -90.5137341 }, //Palacio Nacional de La Cultura
      { lat: 14.6159573, lng: -90.5384 },
      { lat: 14.6035143, lng: -90.5163084 },
    ],
  },
  {
    label: "BuenosAires",
    position: { lat: -34.606719530404426, lng: -58.44802698731579 },
    startPositions: [
      { lat: -34.607845138872555, lng: -58.37373686458325 },
      { lat: -34.582695584841794, lng: -58.392013844453395 },
      { lat: -34.588017496719445, lng: -58.45154997513493 },
      { lat: -34.62357660489178, lng: -58.40718348862815 },
    ],
  },
  {
    label: "Moscow",
    position: { lat: 55.755750649783664, lng: 37.61759254686577 },
    startPositions: [
      // { lat: 55.74442675430616, lng: 37.61877267310163 },
      { lat: 55.7554145, lng: 37.6212819 },
      { lat: 55.7612488, lng: 37.5744103 },
      { lat: 55.7674543, lng: 37.8302904 },
    ],
  },
  {
    label: "CapeTown",
    position: { lat: -33.93003486559483, lng: 18.550283676293898 },
    startPositions: [
      { lat: -33.9060081, lng: 18.4195747 },
      { lat: -33.893167, lng: 18.5041745 },
      { lat: -34.0341305, lng: 18.3564229 },
      { lat: -33.9495236, lng: 18.5088059 },
    ],
  },
  {
    label: "Mumbai",
    position: { lat: 19.073938775479657, lng: 72.8713227913605 },
    startPositions: [
      { lat: 19.0768763, lng: 72.8361846 },
      { lat: 19.0198362, lng: 72.8322088 },
      { lat: 19.0370261, lng: 72.8419262 },
    ],
  },
  {
    label: "Jakarta",
    position: { lat: -6.226315061232996, lng: 106.84873253689871 },
    startPositions: [
      { lat: -6.174204, lng: 106.830355 },
      { lat: -6.1758002, lng: 106.7708719 },
      { lat: -6.2048304, lng: 106.8858548 },
      { lat: -6.2011877, lng: 106.8136785 },
      { lat: -6.1863864, lng: 106.89514 },
      { lat: -6.3007439, lng: 106.8976264 },
      { lat: -6.1755204, lng: 106.8220584 },
    ],
  },
  {
    label: "Toronto",
    position: { lat: 43.6951476948252, lng: -79.45259465757317 },
    startPositions: [
      { lat: 43.6951476948252, lng: -79.45259465757317 },
      { lat: 43.64787131934134, lng: -79.3778126287389 },
      { lat: 43.65432199190001, lng: -79.39282320175265 },
      { lat: 43.654833328054785, lng: -79.37998044593088 },
      { lat: 43.66163071838289, lng: -79.37661849990288 },
      { lat: 43.65403964243329, lng: -79.39802480175264 },
    ],
  },
  {
    label: "Mexico City",
    position: { lat: 19.430945541920916, lng: -99.13032178472584 },
    startPositions: [
      { lat: 19.42725914218213, lng: -99.16701246667387 },
      { lat: 19.4357649362407, lng: -99.15440033023675 },
      { lat: 19.44312030807394, lng: -99.16510510960639 },
    ],
  },
  {
    label: "Sao Paulo",
    position: { lat: -23.55701231699019, lng: -46.639621638571725 },
    startPositions: [
      { lat: -23.541234034248014, lng: -46.62986089626963 },
      { lat: -23.53185385119119, lng: -46.634824502685525 },
      { lat: -23.5518104063957, lng: -46.63498538513296 },
    ],
  },
  {
    label: "Paris",
    position: { lat: 48.85686254929828, lng: 2.3511455449446585 },
    startPositions: [
      { lat: 48.85669100255333, lng: 2.2935411022514436 },
      { lat: 48.85756403038054, lng: 2.3175073121416467 },
      { lat: 48.87519835720103, lng: 2.2957840013466897 },
    ],
  },
  {
    label: "Dakar",
    position: { lat: 14.71678740970817, lng: -17.46777283555944 },
    startPositions: [
      { lat: 14.711922529101765, lng: -17.4684477913519 },
      { lat: 14.7130798978063, lng: -17.454937431447405 },
      { lat: 14.72204554867228, lng: -17.46356200766978 },
    ],
  },
  {
    label: "Jerusalem",
    position: { lat: 31.767230445694, lng: 35.21473190489244 },
    startPositions: [
      { lat: 31.771108835597857, lng: 35.22310762473546 },
      { lat: 31.766889933747013, lng: 35.20288383317736 },
      { lat: 31.779163123132207, lng: 35.21229921474367 },
    ],
  },
  {
    label: "Tokyo",
    position: { lat: 35.68576316009195, lng: 139.7699133929063 },
    startPositions: [
      { lat: 35.66164890541168, lng: 139.767586691229 },
      { lat: 35.66514912106313, lng: 139.7836698594209 },
      { lat: 35.65015375694661, lng: 139.78720675445894 },
    ],
  },
  {
    label: "Barcelona",
    position: { lat: 41.38506266151195, lng: 2.1591597879117144 },
    startPositions: [
      { lat: 41.38773589606016, lng: 2.175568582080129 },
      { lat: 41.38578482224457, lng: 2.1695638693498447 },
      { lat: 41.38913611995076, lng: 2.1862472287068635 },
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
  const [stopTimer, setStopTimer] = useState(false);
  // Important Constants
  const hoursMinSecs = props.timer;
  // Gets Random Start Position //
  const [spawnPlayer2, setSpawnPlayer2] = useState(false);
  const [player2Start, setPlayer2Start] = useState(null);
  const navigate = useNavigate();

  // GETS WIN CONDITION //
  useEffect(() => {
    const callback1 = (gameUpdate) => {
      const hasWon = gameUpdate[0];
      const distance = gameUpdate[1];
      if (hasWon) {
        setStopTimer(true);
        panorama.setOptions({ disableDefaultUI: true, clickToGo: false });
        setGameWon(true);
      }
      setDistanceApart(distance);
    };
    socket.on("gameUpdate", callback1);
    return () => {
      socket.off("gameUpdate", callback1);
    };
  }, [insidePano]);

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
    navigate("/lobby");
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
        zoom={2.5}
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
            setPanorama(null);
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
                panorama={panorama}
                stopTimer={stopTimer}
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
              <button onClick={handleLeaveLobby}>Quit Lobby</button>
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
