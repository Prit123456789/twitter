import React, { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import { Box,Modal} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { InfoWindow } from '@react-google-maps/api';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  height: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 8,
};
const libraries = ['places']; // Include places library for searching

const MyMapComponent = () => {
  const [map, setMap] = useState(null);
  const [weatherData,setWeatherData]=useState();
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0059 }); // Initial center coordinates
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleLoad = (mapInstance) => {
    setMap(mapInstance);
  };
  
  const fetchWeatherData = async (lat, lng) => {
    const apiKey = 'd8a63be92e9856c6b85717af421ab957'; // Replace with your actual API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    
      navigator.geolocation.getCurrentPosition((position) => {
      setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      fetchWeatherData(position.coords.latitude, position.coords.longitude)
      .then((weatherData) => {
        // Update weather state with fetched data
        setWeatherData(weatherData);
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error);
      });
    });
  }, []);
  
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyDCl54pE9PWGkFZ_QDRiJYEJruGc15FUIQ" 
      libraries={libraries}
    >
      <button onClick={()=>{setOpen(true)}} className='loc-btn'>Obtain Location</button>
      
      <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      >  
      <Box sx={style}>
      <div className='header'>
      <IconButton onClick={() => { setOpen(false); }}><CloseIcon/></IconButton></div>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        zoom={10}
        center={center}
        onLoad={handleLoad}
      >
        <Marker position={center} />
  {weatherData && (
    <InfoWindow position={center}>
      <div>
        <h3>{weatherData.name}</h3>
        <p>Temperature: {weatherData.main.temp}°C</p>
        <p>Description: {weatherData.weather[0].description}</p>
      </div>
    </InfoWindow>
  )}
      </GoogleMap>
      </Box>
      </Modal>
    </LoadScript>
  );
};

export default MyMapComponent;

