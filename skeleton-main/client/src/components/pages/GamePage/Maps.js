import React, { useState } from "react";
import { GoogleMap, useJsApiLoader, StreetViewPanorama, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};
const mapCenter = {
  lat: 20,
  lng: 0,
};

const markerCoordinates = [
  { label: "Boston", position: { lat: 42.345573, lng: -71.098326 } },
  { label: "NewYorkCity", position: { lat: 40.75497751666591, lng: -73.98997420018596 } },
  { label: "LosAngeles", position: { lat: 34.01820940007115, lng: -118.2999255824083 } },
];

function Maps() {
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

  const getPanorama = () => {
    return panorama;
  };

  return isLoaded ? (
    <>
      // Map Object //
      <GoogleMap
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
        // Panorama //
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
          onPositionChanged={() => {
            if (insidePano) {
              console.log(panorama.location.latLng.lat());
            }
          }}
        />
        // End of Panorama // // Markers //
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
                const marker = markers[location.label];
                marker.setVisible(false);
                panorama.setVisible(true);
                panorama.setPosition(location.position);
                setInsidePano(true);
              }}
            />
          );
        })}
        //End of Markers //
      </GoogleMap>
      // End of Map Object //
    </>
  ) : (
    <></>
  );
}

export default Maps;
