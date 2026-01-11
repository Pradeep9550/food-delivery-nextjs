// hooks/useGetShopByCity.jsx
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setShopsInMyCity } from '../redux/userSlice';
import { serverUrl } from '@/lib/constants';

function useGetShopByCity() {
    const dispatch = useDispatch();
    const { currentCity } = useSelector(state => state.user);

    useEffect(() => {
        const fetchShops = async () => {
            if (!currentCity) return;
            
            try {
                const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`, { withCredentials: true });
                console.log(result.data, "shop/get-by-city")
                dispatch(setShopsInMyCity(result.data));
            } catch (error) {
                console.error("Error fetching shops:", error);
            }
        };
        
        if (currentCity) {
            fetchShops();
        }
    }, [currentCity, dispatch]);
}

export default useGetShopByCity;