// components/UserOrderCard.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { serverUrl } from '@/lib/constants';
import Image from 'next/image';

function UserOrderCard({ data }) {
    const router = useRouter();
    const [selectedRating, setSelectedRating] = useState({});

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleRating = async (itemId, rating) => {
        try {
            await axios.post(
                `${serverUrl}/api/item/rating`, 
                { itemId, rating }, 
                { withCredentials: true }
            );
            console.log("item/rating");
            setSelectedRating(prev => ({
                ...prev, 
                [itemId]: rating
            }));
        } catch (error) {
            console.error("Error submitting rating:", error);
        }
    };

    return (
        <div className='bg-white rounded-lg shadow p-4 space-y-4'>
            <div className='flex justify-between border-b pb-2'>
                <div>
                    <p className='font-semibold'>Order #{data._id?.slice(-6) || "N/A"}</p>
                    <p className='text-sm text-gray-500'>Date: {formatDate(data.createdAt)}</p>
                </div>
                <div className='text-right'>
                    <p className='text-sm text-gray-500'>
                        {data.paymentMethod === "cod" ? 
                            "Cash on Delivery" : 
                            `Payment: ${data.payment ? "Paid" : "Pending"}`
                        }
                    </p>
                    <p className={`font-medium ${data.shopOrders?.[0]?.status === "delivered" ? "text-green-600" : "text-blue-600"}`}>
                        {data.shopOrders?.[0]?.status || "Processing"}
                    </p>
                </div>
            </div>

            {data.shopOrders?.map((shopOrder, index) => (
                <div className='border rounded-lg p-3 bg-[#fffaf7] space-y-3' key={index}>
                    <p className='font-semibold'>{shopOrder.shop?.name || "Shop"}</p>
                    <div className='flex space-x-4 overflow-x-auto pb-2'>
                        {shopOrder.shopOrderItems?.map((item, itemIndex) => (
                            <div key={itemIndex} className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'>
                                <div className='relative w-full h-24'>
                                    <Image 
                                        src={item.item?.image || '/default-food.jpg'} 
                                        alt={item.name}
                                        fill
                                        className='object-cover rounded'
                                    />
                                </div>
                                <p className='text-sm font-semibold mt-1 truncate'>{item.name}</p>
                                <p className='text-xs text-gray-500'>
                                    Qty: {item.quantity} x ₹{item.price}
                                </p>
                                
                                {shopOrder.status === "delivered" && (
                                    <div className='flex space-x-1 mt-2'>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star}
                                                className={`text-lg ${selectedRating[item.item?._id] >= star ? 'text-yellow-400' : 'text-gray-400'}`}
                                                onClick={() => handleRating(item.item?._id, star)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className='flex justify-between items-center border-t pt-2'>
                        <p className='font-semibold'>Subtotal: ₹{shopOrder.subtotal || 0}</p>
                        <span className='text-sm font-medium text-blue-600'>{shopOrder.status || "Processing"}</span>
                    </div>
                </div>
            ))}

            <div className='flex justify-between items-center border-t pt-2'>
                <p className='font-semibold'>Total: ₹{data.totalAmount || 0}</p>
                <button 
                    className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm'
                    onClick={() => router.push(`/track-order/${data._id}`)}
                >
                    Track Order
                </button>
            </div>
        </div>
    );
}

export default UserOrderCard;