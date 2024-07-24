import React from 'react'
import Modal  from '@mui/material';
const Location = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
          } else {
            alert("Geolocation is not supported by this browser.");
          }
          
          function showPosition(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            
          }
          
}

export default Location;
