import React, { useState } from "react";
import { Dropdown, Option } from "./Dropdown";

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
import pandemicStyle from "./mapStyles";
import apocalypseStyle from "./mapStyles2";

const libraries = ["places"];
const mapContainerStyle = {
    height: "100vh",
    width: "100vw",
  };

  const center = {
    lat: 28.599608,
    lng: -81.200454
};

const google = window.google;

const options = {
    styles: pandemicStyle, 
    disableDefaultUI: true,
    zoomControl: true,
};

const ampstyl = [pandemicStyle, apocalypseStyle];

// const options2 = {
//    styles: apocalyseStyle,
//    disableDefaultUI: true,
//    zoomControl: true,
// };

const styleDex = -1;

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

    const panTo = React.useCallback(({lat, lng}) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(18);
    }, []);

    if (loadError) return "Error loading maps";
    if (!isLoaded) return "Loading maps";

    return (<div>
        <h1>
            <span role = "img" aria-label = "hot_dog">🌭</span>
            Food On The Move{" "}
            <span role = "img" aria-label = "truck">🚚</span>
        </h1>
        
        <Search panTo={panTo} />
        <Locate panTo={panTo} />
        <Favorite/>
        <ChooseStyle />
        

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
                animation={google.maps.Animation.DROP}
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
    </div>
    );
}

function Locate({ panTo }) {
    return (
        <button className="locate" onClick={() => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    panTo({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                }, 
                () => null
            );
        }}>
            <img src="LocateMe.png" alt="compass" />
        </button>
    );
}

function Search({ panTo }) {
    const {
        ready, 
        value, 
        suggestions: { status, data }, 
        setValue, 
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            location: {lat: () => 28.599608, lng: () => -81.200454},
            radius: 200 * 1000, 
        },
    });

    return (
        <div className="search">
            <Combobox 
                onSelect={async (address) => {
                    setValue(address, false);
                    clearSuggestions();

                    try {
                        const results = await getGeocode({ address });
                        const { lat, lng } = await getLatLng(results[0]);
                        panTo({ lat,lng });
                    } catch (error) {
                        console.log("Error has occured");
                    }
            }}
        >
                <ComboboxInput 
                    value={value} 
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                disabled={!ready}
                placeholder="Enter an Address"
                />
                <ComboboxPopover>
                    <ComboboxList>
                        {status === "OK" && 
                            data.map(({ id, description }) => (
                            <ComboboxOption key={id} value={description} />
                        ))}
                    </ComboboxList>
                </ComboboxPopover>
            </Combobox>
        </div>
    );
}

function ChooseStyle() {
    const [optionValue, setOptionValue] = useState("");

    const selections = [pandemicStyle, apocalypseStyle];

    const handleSelect = (e) => {
        console.log(e.target.value);
        console.log(styleDex);
    };

    

    return (
        <div className="dropdown">
            <Dropdown
                onChange={handleSelect}
            >
                <Option selected value="Change Theme" />
                <Option id="0" value="Pandemic" 
                    onClick = {() => {
                        styleDex = 1;
                        options.styles = ampstyl[styleDex-1];
                        <GoogleMap options={options}/>
                }}></Option>
                <Option id="1" value="Apocalypse"
                    onClick = {() => {
                        styleDex = 2
                        options.styles = ampstyl[styleDex-1];
                        <GoogleMap options={options}/>
                }}></Option>
            </Dropdown>
        </div>
    );
}

function Favorite() {
    return (
        <img src = "pin.png" alt = "tack" className = "favorites"/>
    )
}

export default App;