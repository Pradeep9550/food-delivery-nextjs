// hooks/useUpdateLocation.jsx
import axios from 'axios';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { serverUrl } from '@/lib/constants';

function useUpdateLocation() {
    const { userData } = useSelector(state => state.user);

    useEffect(() => {
        const updateLocation = async (lat, lon) => {
            if (!userData) return;
            
            try {
                await axios.post(`${serverUrl}/api/user/update-location`, 
                    { lat, lon }, 
                    { withCredentials: true }
                );
                console.log("user/update-location");
            } catch (error) {
                console.error("Error updating location:", error);
            }
        };

        if (userData) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    updateLocation(pos.coords.latitude, pos.coords.longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                }
            );

            return () => {
                navigator.geolocation.clearWatch(watchId);
            };
        }
    }, [userData]);
}

export default useUpdateLocation;