// app/page.jsx
'use client';

import { useSelector } from 'react-redux';
import UserDashboard from '@/components/UserDashboard';
import OwnerDashboard from '@/components/OwnerDashboard';
import DeliveryBoy from '@/components/DeliveryBoy';

export default function HomePage() {
    const { userData } = useSelector(state => state.user);

    if (!userData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fff9f6]">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[#ff4d2d] mb-4">Loading...</h1>
                    <p className="text-gray-600">Please wait while we load your dashboard</p>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full min-h-screen bg-[#fff9f6]'>
            {userData.role === "user" && <UserDashboard />}
            {userData.role === "owner" && <OwnerDashboard />}
            {userData.role === "deliveryBoy" && <DeliveryBoy />}
        </div>
    );
}