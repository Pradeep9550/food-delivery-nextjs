// components/UserDashboard.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
const Nav = dynamic(() => import("./Nav"), { ssr: false });

import { categories } from '@/lib/categories';
import CategoryCard from './CategoryCard';
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import FoodCard from './FoodCard';
import Image from 'next/image';

function UserDashboard() {
    const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(state => state.user);
    const cateScrollRef = useRef(null);
    const shopScrollRef = useRef(null);
    const router = useRouter();
    
    const [showLeftCateButton, setShowLeftCateButton] = useState(false);
    const [showRightCateButton, setShowRightCateButton] = useState(false);
    const [showLeftShopButton, setShowLeftShopButton] = useState(false);
    const [showRightShopButton, setShowRightShopButton] = useState(false);
    const [updatedItemsList, setUpdatedItemsList] = useState([]);

    const handleFilterByCategory = (category) => {
        if (category === "All") {
            setUpdatedItemsList(itemsInMyCity || []);
        } else {
            const filteredList = itemsInMyCity?.filter(i => i.category === category) || [];
            setUpdatedItemsList(filteredList);
        }
    };

    useEffect(() => {
        setUpdatedItemsList(itemsInMyCity || []);
    }, [itemsInMyCity]);

    const updateButton = (ref, setLeftButton, setRightButton) => {
        const element = ref.current;
        if (element) {
            setLeftButton(element.scrollLeft > 0);
            setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth);
        }
    };

    const scrollHandler = (ref, direction) => {
        if (ref.current) {
            ref.current.scrollBy({
                left: direction === "left" ? -200 : 200,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        const cateRef = cateScrollRef.current;
        const shopRef = shopScrollRef.current;

        const handleCateScroll = () => updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
        const handleShopScroll = () => updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);

        if (cateRef) {
            updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
            cateRef.addEventListener('scroll', handleCateScroll);
        }

        if (shopRef) {
            updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);
            shopRef.addEventListener('scroll', handleShopScroll);
        }

        return () => {
            if (cateRef) cateRef.removeEventListener("scroll", handleCateScroll);
            if (shopRef) shopRef.removeEventListener("scroll", handleShopScroll);
        };
    }, [categories, shopInMyCity]);

    // Fix: Add Image component import
    const ImageComponent = ({ src, alt, ...props }) => {
        return <Image src={src} alt={alt} {...props} />;
    };

    return (
        <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
            <Nav />

            {/* Search Results */}
            {searchItems && searchItems.length > 0 && (
                <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-20'>
                    <h1 className='text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2'>
                        Search Results
                    </h1>
                    <div className='w-full h-auto flex flex-wrap gap-6 justify-center'>
                        {searchItems.map((item) => (
                            <FoodCard data={item} key={item._id} />
                        ))}
                    </div>
                </div>
            )}

            <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px] mt-20">
                <h1 className='text-gray-800 text-2xl sm:text-3xl'>Inspiration for your first order</h1>
                <div className='w-full relative'>
                    {showLeftCateButton && (
                        <button 
                            className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10'
                            onClick={() => scrollHandler(cateScrollRef, "left")}
                        >
                            <FaCircleChevronLeft />
                        </button>
                    )}

                    <div className='w-full flex overflow-x-auto gap-4 pb-2 scrollbar-hide' ref={cateScrollRef}>
                        {categories.map((cate, index) => (
                            <CategoryCard 
                                name={cate.category} 
                                image={cate.image} 
                                key={index} 
                                onClick={() => handleFilterByCategory(cate.category)}
                            />
                        ))}
                    </div>

                    {showRightCateButton && (
                        <button 
                            className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10'
                            onClick={() => scrollHandler(cateScrollRef, "right")}
                        >
                            <FaCircleChevronRight />
                        </button>
                    )}
                </div>
            </div>

            <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
                <h1 className='text-gray-800 text-2xl sm:text-3xl'>Best Shop in {currentCity || "Your City"}</h1>
                <div className='w-full relative'>
                    {showLeftShopButton && (
                        <button 
                            className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10'
                            onClick={() => scrollHandler(shopScrollRef, "left")}
                        >
                            <FaCircleChevronLeft />
                        </button>
                    )}

                    <div className='w-full flex overflow-x-auto gap-4 pb-2 scrollbar-hide' ref={shopScrollRef}>
                        {shopInMyCity?.map((shop, index) => (
                            <CategoryCard 
                                name={shop.name} 
                                image={shop.image} 
                                key={index} 
                                onClick={() => router.push(`/shop/${shop._id}`)}
                            />
                        ))}
                    </div>

                    {showRightShopButton && (
                        <button 
                            className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10'
                            onClick={() => scrollHandler(shopScrollRef, "right")}
                        >
                            <FaCircleChevronRight />
                        </button>
                    )}
                </div>
            </div>

            <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px] mb-10'>
                <h1 className='text-gray-800 text-2xl sm:text-3xl'>Suggested Food Items</h1>
                <div className='w-full h-auto flex flex-wrap gap-[20px] justify-center'>
                    {updatedItemsList?.map((item, index) => (
                        <FoodCard key={index} data={item} />
                    ))}
                    {(!updatedItemsList || updatedItemsList.length === 0) && (
                        <p className='text-gray-500 text-center w-full'>No food items available in your city</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;