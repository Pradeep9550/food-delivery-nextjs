// app/order-placed/page.jsx
'use client';

import { FaCircleCheck } from "react-icons/fa6";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderPlaced() {
    const router = useRouter();

    return (
        <div className='min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden pt-20'>
            <FaCircleCheck className='text-green-500 text-6xl mb-4' />
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>Order Placed!</h1>
            <p className='text-gray-600 max-w-md mb-6'>
                Thank you for your purchase. Your order is being prepared.  
                You can track your order status in the "My Orders" section.
            </p>
            <div className='flex gap-4'>
                <button 
                    className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg font-medium transition'
                    onClick={() => router.push("/my-orders")}
                >
                    View My Orders
                </button>
                <Link 
                    href="/"
                    className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg text-lg font-medium transition'
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}