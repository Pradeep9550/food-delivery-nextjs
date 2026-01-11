// hooks/useGetMyShop.jsx
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';
import { serverUrl } from '@/lib/constants';

function useGetMyshop() {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user);

    useEffect(() => {
        const fetchShop = async () => {
            if (!userData || userData.role !== "owner") return;
            
            try {
                const result = await axios.get(`${serverUrl}/api/shop/get-my`, { withCredentials: true });
                console.log(result.data, "shop/get-my")
                dispatch(setMyShopData(result.data));
            } catch (error) {
                console.error("Error fetching shop:", error);
            }
        };
        
        if (userData && userData.role === "owner") {
            fetchShop();
        }
    }, [userData, dispatch]);
}

export default useGetMyshop;