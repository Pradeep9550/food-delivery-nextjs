// hooks/useGetMyOrders.jsx
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMyOrders } from '../redux/userSlice';
import { serverUrl } from '@/lib/constants';

function useGetMyOrders() {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!userData) return;
            
            try {
                const result = await axios.get(`${serverUrl}/api/order/my-orders`, { withCredentials: true });
                console.log(result.data, "order/my-orders");
                dispatch(setMyOrders(result.data));
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };
        
        if (userData) {
            fetchOrders();
        }
    }, [userData, dispatch]);
}

export default useGetMyOrders;