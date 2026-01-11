// components/OwnerItemCard.jsx
'use client';

import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { FaPen, FaTrashAlt } from "react-icons/fa";
import axios from 'axios';
import { setMyShopData } from '@/redux/ownerSlice';
import { serverUrl } from '@/lib/constants';
import Image from 'next/image';

function OwnerItemCard({ data }) {
    const router = useRouter();
    const dispatch = useDispatch();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        
        try {
            const result = await axios.get(`${serverUrl}/api/item/delete/${data._id}`, { withCredentials: true });
            console.log(result.data, "item/delete")
            dispatch(setMyShopData(result.data));
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    return (
        <div className='flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl'>
            <div className='w-36 h-36 flex-shrink-0 bg-gray-50 relative'>
                <Image 
                    src={data.image} 
                    alt={data.name}
                    fill
                    className='object-cover'
                />
            </div>
            <div className='flex flex-col justify-between p-3 flex-1'>
                <div>
                    <h2 className='text-base font-semibold text-[#ff4d2d]'>{data.name}</h2>
                    <p><span className='font-medium text-gray-700'>Category:</span> {data.category}</p>
                    <p><span className='font-medium text-gray-700'>Food Type:</span> {data.foodType}</p>
                </div>
                <div className='flex items-center justify-between'>
                    <div className='text-[#ff4d2d] font-bold'>₹{data.price}</div>
                    <div className='flex items-center gap-2'>
                        <div 
                            className='p-2 cursor-pointer rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d]'
                            onClick={() => router.push(`/edit-item/${data._id}`)}
                        >
                            <FaPen size={16} />
                        </div>
                        <div 
                            className='p-2 cursor-pointer rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d]'
                            onClick={handleDelete}
                        >
                            <FaTrashAlt size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OwnerItemCard;