// hooks/useGetCurrentUser.jsx
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { serverUrl } from '@/lib/constants';

function useGetCurrentUser() {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
                console.log(result.data, "user/current")
                dispatch(setUserData(result.data));
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };
        fetchUser();
    }, [dispatch]);
}

export default useGetCurrentUser;