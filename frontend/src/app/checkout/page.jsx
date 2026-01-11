// app/checkout/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard, FaMobileScreenButton } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { addMyOrder } from '@/redux/userSlice';
import { serverUrl } from '@/lib/constants';
import { setAddress, setLocation } from '@/redux/mapSlice';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const useMap = dynamic(
    () => import('react-leaflet').then((mod) => mod.useMap),
    { ssr: false }
);

function RecenterMap({ location }) {
    const map = useMap();
    useEffect(() => {
        if (location.lat && location.lon) {
            map.setView([location.lat, location.lon], 16, { animate: true });
        }
    }, [location, map]);
    return null;
}

export default function CheckOut() {
    const { location, address } = useSelector(state => state.map);
    const { cartItems, totalAmount, userData } = useSelector(state => state.user);
    const [addressInput, setAddressInput] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const router = useRouter();
    const dispatch = useDispatch();
    
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIKEY;
    const deliveryFee = totalAmount > 500 ? 0 : 40;
    const AmountWithDeliveryFee = totalAmount + deliveryFee;

    const onDragEnd = (e) => {
        const { lat, lng } = e.target._latlng;
        dispatch(setLocation({ lat, lon: lng }));
        getAddressByLatLng(lat, lng);
    };

    const getCurrentLocation = () => {
        if (userData?.location?.coordinates) {
            const latitude = userData.location.coordinates[1];
            const longitude = userData.location.coordinates[0];
            dispatch(setLocation({ lat: latitude, lon: longitude }));
            getAddressByLatLng(latitude, longitude);
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    dispatch(setLocation({ lat, lon }));
                    getAddressByLatLng(lat, lon);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                }
            );
        }
    };

    const getAddressByLatLng = async (lat, lng) => {
        try {
            const result = await axios.get(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
            );
            dispatch(setAddress(result?.data?.results[0]?.address_line2 || result?.data?.results[0]?.address_line1));
        } catch (error) {
            console.error("Error getting address:", error);
        }
    };

    const getLatLngByAddress = async () => {
        if (!addressInput.trim()) return;
        
        try {
            const result = await axios.get(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`
            );
            if (result.data.features.length > 0) {
                const { lat, lon } = result.data.features[0].properties;
                dispatch(setLocation({ lat, lon }));
            }
        } catch (error) {
            console.error("Error getting coordinates:", error);
        }
    };

    const handlePlaceOrder = async () => {
        if (!addressInput.trim()) {
            alert("Please enter delivery address");
            return;
        }

        if (!location.lat || !location.lon) {
            alert("Please select delivery location on map");
            return;
        }

        try {
            const result = await axios.post(
                `${serverUrl}/api/order/place-order`,
                {
                    paymentMethod,
                    deliveryAddress: {
                        text: addressInput,
                        latitude: location.lat,
                        longitude: location.lon
                    },
                    totalAmount: AmountWithDeliveryFee,
                    cartItems
                },
                { withCredentials: true }
            );
            console.log(result.data, "order/place-order ")

            if (paymentMethod === "cod") {
                dispatch(addMyOrder(result.data));
                router.push("/order-placed");
            } else {
                const orderId = result.data.orderId;
                const razorOrder = result.data.razorOrder;
                openRazorpayWindow(orderId, razorOrder);
            }
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Please try again.");
        }
    };

    const openRazorpayWindow = (orderId, razorOrder) => {
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: razorOrder.amount,
            currency: 'INR',
            name: "Vingo",
            description: "Food Delivery Website",
            order_id: razorOrder.id,
            handler: async function (response) {
                try {
                    const result = await axios.post(
                        `${serverUrl}/api/order/verify-payment`,
                        {
                            razorpay_payment_id: response.razorpay_payment_id,
                            orderId
                        },
                        { withCredentials: true }
                    );
                    console.log(result.data, "order/verify-payment")
                    dispatch(addMyOrder(result.data));
                    router.push("/order-placed");
                } catch (error) {
                    console.error("Payment verification error:", error);
                    alert("Payment verification failed");
                }
            },
            prefill: {
                name: userData?.fullName || "",
                email: userData?.email || "",
                contact: userData?.mobile || ""
            },
            theme: {
                color: "#ff4d2d"
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    useEffect(() => {
        setAddressInput(address || "");
    }, [address]);

    return (
        <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center p-6 pt-20'>
            <div className='absolute top-20 left-4 z-10'>
                <button onClick={() => router.push("/")}>
                    <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
                </button>
            </div>
            
            <div className='w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6'>
                <h1 className='text-2xl font-bold text-gray-800'>Checkout</h1>

                {/* Delivery Location */}
                <section>
                    <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>
                        <IoLocationSharp className='text-[#ff4d2d]' /> Delivery Location
                    </h2>
                    <div className='flex gap-2 mb-3'>
                        <input 
                            type="text" 
                            className='flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]' 
                            placeholder='Enter Your Delivery Address..' 
                            value={addressInput} 
                            onChange={(e) => setAddressInput(e.target.value)} 
                        />
                        <button 
                            className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center'
                            onClick={getLatLngByAddress}
                        >
                            <IoSearchOutline size={17} />
                        </button>
                        <button 
                            className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center'
                            onClick={getCurrentLocation}
                        >
                            <TbCurrentLocation size={17} />
                        </button>
                    </div>
                    
                    {/* Map */}
                    <div className='rounded-xl border overflow-hidden h-64'>
                        {typeof window !== 'undefined' && (
                            <MapContainer
                                className="w-full h-full"
                                center={[location?.lat || 28.6139, location?.lon || 77.2090]}
                                zoom={location?.lat ? 16 : 12}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <RecenterMap location={location} />
                                {location?.lat && location?.lon && (
                                    <Marker 
                                        position={[location.lat, location.lon]} 
                                        draggable 
                                        eventHandlers={{ dragend: onDragEnd }} 
                                    />
                                )}
                            </MapContainer>
                        )}
                    </div>
                </section>

                {/* Payment Method */}
                <section>
                    <h2 className='text-lg font-semibold mb-3 text-gray-800'>Payment Method</h2>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div 
                            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                                paymentMethod === "cod" 
                                ? "border-[#ff4d2d] bg-orange-50 shadow" 
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setPaymentMethod("cod")}
                        >
                            <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100'>
                                <MdDeliveryDining className='text-green-600 text-xl' />
                            </span>
                            <div>
                                <p className='font-medium text-gray-800'>Cash On Delivery</p>
                                <p className='text-xs text-gray-500'>Pay when your food arrives</p>
                            </div>
                        </div>
                        <div 
                            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                                paymentMethod === "online" 
                                ? "border-[#ff4d2d] bg-orange-50 shadow" 
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setPaymentMethod("online")}
                        >
                            <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                                <FaCreditCard className='text-blue-700 text-lg' />
                            </span>
                            <div>
                                <p className='font-medium text-gray-800'>UPI / Credit / Debit Card</p>
                                <p className='text-xs text-gray-500'>Pay Securely Online</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Order Summary */}
                <section>
                    <h2 className='text-lg font-semibold mb-3 text-gray-800'>Order Summary</h2>
                    <div className='rounded-xl border bg-gray-50 p-4 space-y-2'>
                        {cartItems.map((item, index) => (
                            <div key={index} className='flex justify-between text-sm text-gray-700'>
                                <span>{item.name} x {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <hr className='border-gray-200 my-2' />
                        <div className='flex justify-between font-medium text-gray-800'>
                            <span>Subtotal</span>
                            <span>₹{totalAmount}</span>
                        </div>
                        <div className='flex justify-between text-gray-700'>
                            <span>Delivery Fee</span>
                            <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
                        </div>
                        <div className='flex justify-between text-lg font-bold text-[#ff4d2d] pt-2'>
                            <span>Total</span>
                            <span>₹{AmountWithDeliveryFee}</span>
                        </div>
                    </div>
                </section>

                {/* Place Order Button */}
                <button 
                    className='w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold'
                    onClick={handlePlaceOrder}
                >
                    {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
                </button>
            </div>
        </div>
    );
}