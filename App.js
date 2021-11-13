import React from "react";
import {
    GoogleMap,
    useLoadScript,
    Marker,
    InfoWindow,
} from "@react-google-maps/api";

import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";

import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption,
  } from "@reach/combobox";

import { formatRelative } from "date-fns";
import "@reach/combobox/styles.css";
import mapStyles from "./mapStyles";

const libraries = ["places"];
const mapContainerStyle = {
    height: "100vh",
    width: "100vw",
  };

  const center = {
    lat: 28.599608,
    lng: -81.200454
};

const options = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
  };

function App() {
    const {isLoaded, loadError} = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries
    });

    const [markers, setMarkers] = React.useState([]);
    const [selected, setSelected] = React.useState(null);

    const onMapClick = React.useCallback((e) => {
        setMarkers((current) => [
          ...current,
          {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
            time: new Date(),
          },
        ]);
      }, []);

    const mapRef = React.useRef();
    const onMapLoad = React.useCallback((map) => {
        mapRef.current = map;
    }, []);

    if (loadError) return "Error loading maps";
    if (!isLoaded) return "Loading maps";

    return <div>
        <h1>Food Truck {" "}
            <span role = "img" aria-label = "hot dog truck">🌭🚚</span>
            </h1>
        <GoogleMap 
            mapContainerStyle = {mapContainerStyle} 
            zoom = {8} 
            center = {center}
            options ={options}
            onClick={onMapClick}
            onLoad = {onMapLoad}
            >

            {markers.map(marker => (
            <Marker 
                key = {marker.time.toISOString()} 
                position= {{lat: marker.lat, lng: marker.lng}}
                icon= {{
                    url:"/food-cart.png",
                    scaledSize: new window.google.maps.Size(30,30),
                    origin: new window.google.maps.Point(0,0),
                    anchor: new window.google.maps.Point(15,15),
                }}
                onClick = {() => {
                    setSelected(marker);
                }}
                />
            ))}

            {selected ? (
            <InfoWindow
                position={{ lat: selected.lat, lng: selected.lng }}
                onCloseClick={() => {
                setSelected(null);
                }}
            >
                <div>
                    <h2>
                        <span role="img" aria-label="truck">
                        🚚
                        </span>{" "}
                        Food Truck is here!
                    </h2>
                    <p>Spotted {formatRelative(selected.time, new Date())}</p>
                </div>
            </InfoWindow>) : null}

            </GoogleMap>
    </div>;
}

export default App;