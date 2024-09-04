import React, { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { useTranslation } from "react-i18next";
import { Box, Modal, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  height: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 8,
};

const MyMapComponent = () => {
  const [map, setMap] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [center, setCenter] = useState({ lat: "", lng: "" });
  const [open, setOpen] = useState(false);
  const [locationData, setLocationData] = useState({
    city: "",
    state: "",
    country: "",
  });
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { t } = useTranslation("translations");

  const handleLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  useEffect(() => {
    const fetchWeatherData = async (lat, lng) => {
      const apiKey = "d8a63be92e9856c6b85717af421ab957"; // Replace with your actual API key
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const weatherDetails = {
          temperature: data.main.temp,
          description: data.weather[0].description,
          windSpeed: data.wind.speed,
          humidity: data.main.humidity,
        };

        return weatherDetails;
      } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
      }
    };

    const fetchLocationData = async (lat, lng) => {
      const locationURI = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

      try {
        const response = await fetch(locationURI);
        const data = await response.json();
        console.log("Nominatim API Response:", data); // Log the response for debugging

        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "City Not Found";
        const state = data.address.state || "State Not Found";
        const country = data.address.country || "Country Not Found";

        console.log("Parsed Location Data:", { city, state, country }); // Log the parsed data
        return { city, state, country };
      } catch (error) {
        console.error("Error fetching location data:", error);
        return {
          city: "City Not Found",
          state: "State Not Found",
          country: "Country Not Found",
        };
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    };

    const showError = () => {
      alert("Couldn't fetch location at this time.");
    };

    const showPosition = async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setCenter({ lat, lng });

      try {
        const weatherDetails = await fetchWeatherData(lat, lng);
        setWeatherData(weatherDetails);

        const locationDetails = await fetchLocationData(lat, lng);
        setLocationData(locationDetails);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getLocation();
  }, []);

  return (
    <APIProvider apiKey="AIzaSyCJ5OJwzBUMaFXx93pJgcN1T9dxUh8oUws">
      <button onClick={handleOpen} className="loc-btn">
        {t("Obtain Location")}
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <div className="header">
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
            <h2 className="header-title">{t("Location")}</h2>
            <h2 className="save-btn" onClick={handleClose}>
              Ok
            </h2>
          </div>
          <div id="location-display">{`${locationData.city}, ${locationData.state}, ${locationData.country}`}</div>
          <Map
            mapContainerStyle={{ width: "100%", height: "400px" }}
            defaultZoom={11}
            gestureHandling={"greedy"}
            mapId={"7933c8f34647f686"}
            center={center}
            onLoad={handleLoad}>
            <AdvancedMarker position={center} />
            {weatherData && (
              <InfoWindow position={center}>
                <div>
                  <p id="location-display">{`${locationData.city}, ${locationData.state}, ${locationData.country}`}</p>
                  <p>Temperature: {weatherData.temperature}°C</p>
                  <p>Description: {weatherData.description}</p>
                  <p>Wind Speed: {weatherData.windSpeed} m/s</p>
                  <p>Humidity: {weatherData.humidity}%</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </Box>
      </Modal>
    </APIProvider>
  );
};

export default MyMapComponent;
