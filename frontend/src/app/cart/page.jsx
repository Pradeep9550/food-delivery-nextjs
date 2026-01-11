// app/cart/page.jsx
'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IoIosArrowRoundBack } from "react-icons/io";
import CartItemCard from '@/components/CartItemCard';
import Link from 'next/link';

export default function CartPage() {
    const router = useRouter();
    const { cartItems, totalAmount } = useSelector(state => state.user);

    return (
        <div className='min-h-screen bg-[#fff9f6] flex justify-center p-6 pt-20'>
            <div className='w-full max-w-[800px]'>
                <div className='flex items-center gap-[20px] mb-6'>
                    <div className='cursor-pointer' onClick={() => router.push("/")}>
                        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
                    </div>
                    <h1 className='text-2xl font-bold text-start'>Your Cart</h1>
                </div>
                
                {cartItems?.length === 0 ? (
                    <div className='text-center py-10'>
                        <p className='text-gray-500 text-lg mb-4'>Your Cart is Empty</p>
                        <Link 
                            href="/" 
                            className='bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition inline-block'
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className='space-y-4'>
                            {cartItems?.map((item, index) => (
                                <CartItemCard data={item} key={index} />
                            ))}
                        </div>
                        <div className='mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border'>
                            <h1 className='text-lg font-semibold'>Total Amount</h1>
                            <span className='text-xl font-bold text-[#ff4d2d]'>₹{totalAmount}</span>
                        </div>
                        <div className='mt-4 flex justify-end'>
                            <button 
                                className='bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer'
                                onClick={() => router.push("/checkout")}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}