// app/add-item/page.jsx
'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import axios from 'axios';
import { setMyShopData } from '@/redux/ownerSlice';
import { serverUrl } from '@/lib/constants';
import { ClipLoader } from 'react-spinners';
import Image from 'next/image';

export default function AddItem() {
    const router = useRouter();
    const { myShopData } = useSelector(state => state.owner);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frontendImage, setFrontendImage] = useState(null);
    const [backendImage, setBackendImage] = useState(null);
    const [category, setCategory] = useState("");
    const [foodType, setFoodType] = useState("veg");
    
    const dispatch = useDispatch();
    
    const categories = [
        "Snacks", "Main Course", "Desserts", "Pizza", "Burgers", 
        "Sandwiches", "South Indian", "North Indian", "Chinese", 
        "Fast Food", "Others"
    ];

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackendImage(file);
            setFrontendImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name || !price || !category || !foodType) {
            alert("Please fill all required fields");
            return;
        }

        if (parseFloat(price) <= 0) {
            alert("Price must be greater than 0");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("category", category);
            formData.append("foodType", foodType);
            formData.append("price", price);
            
            if (backendImage) {
                formData.append("image", backendImage);
            }
            
            const result = await axios.post(
                `${serverUrl}/api/item/add-item`,
                formData,
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            console.log(result.data, "item/add-item ")
            
            dispatch(setMyShopData(result.data));
            router.push("/");
        } catch (error) {
            console.error("Error adding item:", error);
            alert("Failed to add item. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!myShopData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fff9f6]">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-[#ff4d2d] mb-4">Shop Required</h1>
                    <p className="text-gray-600 mb-6">You need to create a shop first to add items</p>
                    <button 
                        className="bg-[#ff4d2d] text-white px-6 py-2 rounded-lg hover:bg-[#e64526] transition"
                        onClick={() => router.push("/create-edit-shop")}
                    >
                        Create Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen pt-20'>
            <div className='absolute top-20 left-4 z-10'>
                <button onClick={() => router.push("/")}>
                    <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
                </button>
            </div>

            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100'>
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-orange-100 p-4 rounded-full mb-4'>
                        <FaUtensils className='text-[#ff4d2d] w-16 h-16' />
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900">
                        Add Food Item
                    </div>
                </div>
                
                <form className='space-y-5' onSubmit={handleSubmit}>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Item Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder='Enter Food Name' 
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Food Image</label>
                        <input 
                            type="file" 
                            accept='image/*' 
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' 
                            onChange={handleImage}
                        />
                        {frontendImage && (
                            <div className='mt-4'>
                                <div className='relative w-full h-48'>
                                    <Image 
                                        src={frontendImage} 
                                        alt="Food preview"
                                        fill
                                        className='object-cover rounded-lg border'
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Price <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="number" 
                            placeholder='0' 
                            min="1"
                            step="0.01"
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select 
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setCategory(e.target.value)}
                            value={category}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((cate, index) => (
                                <option value={cate} key={index}>{cate}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Food Type <span className="text-red-500">*</span>
                        </label>
                        <select 
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setFoodType(e.target.value)}
                            value={foodType}
                            required
                        >
                            <option value="veg">Vegetarian</option>
                            <option value="non veg">Non-Vegetarian</option>
                        </select>
                    </div>

                    <button 
                        className='w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center'
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={20} color='white' /> : "Save"}
                    </button>
                </form>
            </div>
        </div>
    );
}