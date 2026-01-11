import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
} from '../redux/userSlice';
import { setAddress, setLocation } from '../redux/mapSlice';

function useGetCity() {
  const dispatch = useDispatch();
  const { userData } = useSelector(state => state.user);
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIKEY;

  useEffect(() => {
    // ✅ SSR GUARD
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        dispatch(setLocation({ lat: latitude, lon: longitude }));

        try {
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          );

          const data = result?.data?.results?.[0];
          if (!data) return;

          dispatch(setCurrentCity(data.city || data.county));
          dispatch(setCurrentState(data.state));
          dispatch(
            setCurrentAddress(data.address_line2 || data.address_line1)
          );
          dispatch(setAddress(data.address_line2));
        } catch (error) {
          console.error('Error getting location:', error);
        }
      },
      (error) => {
        console.warn('Geolocation permission denied', error);
      }
    );
  }, [dispatch, apiKey]); // ❌ removed userData (not required)

}

export default useGetCity;
