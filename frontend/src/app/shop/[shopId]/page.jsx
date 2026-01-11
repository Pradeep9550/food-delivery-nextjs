// app/shop/[shopId]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { serverUrl } from '@/lib/constants';
import { FaStore, FaUtensils, FaArrowLeft } from "react-icons/fa";
import { FaMapPin } from "react-icons/fa6";  // ✅ Correct icon
import FoodCard from '@/components/FoodCard';
import Image from 'next/image';

export default function Shop() {
    const { shopId } = useParams();
    const [items, setItems] = useState([]);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const handleShop = async () => {
        try {
            const result = await axios.get(
                `${serverUrl}/api/item/get-by-shop/${shopId}`,
                { withCredentials: true }
            );
            console.log(result.data, "item/get-by-shop")
            setShop(result.data.shop);
            setItems(result.data.items || []);
        } catch (error) {
            console.error("Error fetching shop:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shopId) {
            handleShop();
        }
    }, [shopId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading shop details...</p>
                </div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Shop Not Found</h1>
                    <button 
                        className="bg-[#ff4d2d] text-white px-6 py-2 rounded-lg hover:bg-[#e64526] transition"
                        onClick={() => router.push("/")}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Back Button */}
            <button 
                className='absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow-md transition'
                onClick={() => router.push("/")}
            >
                <FaArrowLeft />
                <span>Back</span>
            </button>

            {/* Shop Hero Section */}
            <div className='relative w-full h-64 md:h-80 lg:h-96'>
                <div className='relative w-full h-full'>
                    <Image 
                        src={shop.image} 
                        alt={shop.name}
                        fill
                        className='object-cover'
                    />
                </div>
                <div className='absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 flex flex-col justify-center items-center text-center px-4'>
                    <FaStore className='text-white text-4xl mb-3 drop-shadow-md' />
                    <h1 className='text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg'>{shop.name}</h1>
                    <div className='flex items-center justify-center gap-2 mt-2'>
                        <FaMapPin size={22} color='white' /> {/* ✅ Changed to FaMapPin */}
                        <p className='text-lg font-medium text-gray-200'>{shop.address}</p>
                    </div>
                    <p className='text-gray-300 mt-2'>{shop.city}, {shop.state}</p>
                </div>
            </div>

            {/* Menu Section */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
                <h2 className='flex items-center justify-center gap-3 text-3xl font-bold mb-10 text-gray-800'>
                    <FaUtensils className='text-[#ff4d2d]' /> Our Menu
                </h2>

                {items.length > 0 ? (
                    <div className='flex flex-wrap justify-center gap-8'>
                        {items.map((item) => (
                            <FoodCard data={item} key={item._id} />
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-10'>
                        <p className='text-gray-500 text-lg'>No items available in this shop</p>
                        <button 
                            className='mt-4 bg-[#ff4d2d] text-white px-6 py-2 rounded-lg hover:bg-[#e64526] transition'
                            onClick={() => router.push("/")}
                        >
                            Browse Other Shops
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}