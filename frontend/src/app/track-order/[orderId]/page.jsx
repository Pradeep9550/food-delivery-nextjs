// app/track-order/[orderId]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { serverUrl } from '@/lib/constants';
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from '@/components/DeliveryBoyTracking';
import { useSelector } from 'react-redux';

export default function TrackOrderPage() {
    const { orderId } = useParams();
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { socket } = useSelector(state => state.user);
    const [liveLocations, setLiveLocations] = useState({});

    const handleGetOrder = async () => {
        try {
            const result = await axios.get(
                `${serverUrl}/api/order/get-order-by-id/${orderId}`,
                { withCredentials: true }
            );
            console.log(result.data,  "order/get-order-by-id")
            setCurrentOrder(result.data);
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on('updateDeliveryLocation', ({ deliveryBoyId, latitude, longitude }) => {
                setLiveLocations(prev => ({
                    ...prev,
                    [deliveryBoyId]: { lat: latitude, lon: longitude }
                }));
            });

            return () => {
                socket.off('updateDeliveryLocation');
            };
        }
    }, [socket]);

    useEffect(() => {
        if (orderId) {
            handleGetOrder();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fff9f6]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!currentOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fff9f6]">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
                    <button 
                        className="bg-[#ff4d2d] text-white px-6 py-2 rounded-lg hover:bg-[#e64526] transition"
                        onClick={() => router.push("/my-orders")}
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='max-w-4xl mx-auto p-4 flex flex-col gap-6 pt-20'>
            <div className='flex items-center gap-4'>
                <button onClick={() => router.push("/my-orders")}>
                    <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
                </button>
                <h1 className='text-2xl font-bold'>Track Order #{orderId?.slice(-6)}</h1>
            </div>
            
            {currentOrder?.shopOrders?.map((shopOrder, index) => (
                <div className='bg-white p-4 rounded-2xl shadow-md border border-orange-100 space-y-4' key={index}>
                    <div>
                        <p className='text-lg font-bold mb-2 text-[#ff4d2d]'>{shopOrder.shop.name}</p>
                        <p className='font-semibold'>
                            <span>Items:</span> {shopOrder.shopOrderItems?.map(i => i.name).join(", ")}
                        </p>
                        <p><span className='font-semibold'>Subtotal:</span> ₹{shopOrder.subtotal}</p>
                        <p className='mt-6'>
                            <span className='font-semibold'>Delivery address:</span> {currentOrder.deliveryAddress?.text}
                        </p>
                    </div>
                    
                    {shopOrder.status !== "delivered" ? (
                        <>
                            {shopOrder.assignedDeliveryBoy ? (
                                <div className='text-sm text-gray-700'>
                                    <p className='font-semibold'>
                                        <span>Delivery Boy Name:</span> {shopOrder.assignedDeliveryBoy.fullName}
                                    </p>
                                    <p className='font-semibold'>
                                        <span>Delivery Boy contact No.:</span> {shopOrder.assignedDeliveryBoy.mobile}
                                    </p>
                                </div>
                            ) : (
                                <p className='font-semibold'>Delivery Boy is not assigned yet.</p>
                            )}
                        </>
                    ) : (
                        <p className='text-green-600 font-semibold text-lg'>Delivered</p>
                    )}

                    {/* Map Tracking */}
                    {(shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered") && (
                        <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md">
                            <DeliveryBoyTracking 
                                data={{
                                    deliveryBoyLocation: liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                                        lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                                        lon: shopOrder.assignedDeliveryBoy.location.coordinates[0]
                                    },
                                    customerLocation: {
                                        lat: currentOrder.deliveryAddress.latitude,
                                        lon: currentOrder.deliveryAddress.longitude
                                    }
                                }} 
                            />
                        </div>
                    )}

                    {/* Order Status Timeline */}
                    <div className="mt-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Order Status</h3>
                        <div className="flex items-center justify-between">
                            <div className={`text-center ${shopOrder.status === "pending" ? "text-[#ff4d2d]" : "text-gray-400"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${shopOrder.status === "pending" ? "bg-[#ff4d2d] text-white" : "bg-gray-200"}`}>
                                    1
                                </div>
                                <p className="text-sm mt-1">Pending</p>
                            </div>
                            <div className={`flex-1 h-1 ${shopOrder.status === "preparing" || shopOrder.status === "out of delivery" || shopOrder.status === "delivered" ? "bg-[#ff4d2d]" : "bg-gray-300"}`}></div>
                            <div className={`text-center ${shopOrder.status === "preparing" ? "text-[#ff4d2d]" : "text-gray-400"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${shopOrder.status === "preparing" ? "bg-[#ff4d2d] text-white" : "bg-gray-200"}`}>
                                    2
                                </div>
                                <p className="text-sm mt-1">Preparing</p>
                            </div>
                            <div className={`flex-1 h-1 ${shopOrder.status === "out of delivery" || shopOrder.status === "delivered" ? "bg-[#ff4d2d]" : "bg-gray-300"}`}></div>
                            <div className={`text-center ${shopOrder.status === "out of delivery" ? "text-[#ff4d2d]" : "text-gray-400"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${shopOrder.status === "out of delivery" ? "bg-[#ff4d2d] text-white" : "bg-gray-200"}`}>
                                    3
                                </div>
                                <p className="text-sm mt-1">On the Way</p>
                            </div>
                            <div className={`flex-1 h-1 ${shopOrder.status === "delivered" ? "bg-[#ff4d2d]" : "bg-gray-300"}`}></div>
                            <div className={`text-center ${shopOrder.status === "delivered" ? "text-[#ff4d2d]" : "text-gray-400"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${shopOrder.status === "delivered" ? "bg-[#ff4d2d] text-white" : "bg-gray-200"}`}>
                                    4
                                </div>
                                <p className="text-sm mt-1">Delivered</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}