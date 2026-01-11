// hooks/useGetItemsByCity.jsx
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setItemsInMyCity } from '../redux/userSlice';
import { serverUrl } from '@/lib/constants';

function useGetItemsByCity() {
    const dispatch = useDispatch();
    const { currentCity } = useSelector(state => state.user);

    useEffect(() => {
        const fetchItems = async () => {
            if (!currentCity) return;
            
            try {
                const result = await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`, { withCredentials: true });
                console.log(result.data, "item/get-by-city")
                dispatch(setItemsInMyCity(result.data));
            } catch (error) {
                console.error("Error fetching items:", error);
            }
        };
        fetchItems();
    }, [currentCity, dispatch]);
}

export default useGetItemsByCity;