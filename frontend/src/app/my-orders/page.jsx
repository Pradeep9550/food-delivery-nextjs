// app/my-orders/page.jsx
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { IoIosArrowRoundBack } from "react-icons/io";
import UserOrderCard from '@/components/UserOrderCard';
import OwnerOrderCard from '@/components/OwnerOrderCard';
import { setMyOrders, updateRealtimeOrderStatus } from '@/redux/userSlice';

export default function MyOrders() {
    const { userData, myOrders, socket } = useSelector(state => state.user);
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (socket) {
            socket.on('newOrder', (data) => {
                if (data.shopOrders?.owner?._id === userData?._id) {
                    dispatch(setMyOrders([data, ...myOrders]));
                }
            });

            socket.on('update-status', ({ orderId, shopId, status, userId }) => {
                if (userId === userData?._id) {
                    dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }));
                }
            });

            return () => {
                socket.off('newOrder');
                socket.off('update-status');
            };
        }
    }, [socket, userData, myOrders, dispatch]);

    if (!userData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fff9f6]">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-[#ff4d2d] mb-4">Please Login</h1>
                    <p className="text-gray-600">You need to be logged in to view orders</p>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4 pt-20'>
            <div className='w-full max-w-[800px] p-4'>
                <div className='flex items-center gap-[20px] mb-6'>
                    <div className='cursor-pointer' onClick={() => router.push("/")}>
                        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
                    </div>
                    <h1 className='text-2xl font-bold text-start'>My Orders</h1>
                </div>
                
                <div className='space-y-6'>
                    {myOrders?.length > 0 ? (
                        myOrders.map((order, index) => (
                            userData.role === "user" ? (
                                <UserOrderCard data={order} key={index} />
                            ) : userData.role === "owner" ? (
                                <OwnerOrderCard data={order} key={index} />
                            ) : null
                        ))
                    ) : (
                        <div className='text-center py-10'>
                            <p className='text-gray-500 text-lg'>No orders yet</p>
                            <button 
                                className='mt-4 bg-[#ff4d2d] text-white px-6 py-2 rounded-lg hover:bg-[#e64526] transition'
                                onClick={() => router.push("/")}
                            >
                                Start Shopping
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}