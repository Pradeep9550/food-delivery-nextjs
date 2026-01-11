// components/DeliveryBoy.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";

const Nav = dynamic(() => import("./Nav"), { ssr: false });
const DeliveryBoyTracking = dynamic(
  () => import("./DeliveryBoyTracking"),
  { ssr: false }
);

import axios from 'axios';

import { ClipLoader } from 'react-spinners';


const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
import { serverUrl } from '@/lib/constants';

function DeliveryBoy() {
    const { userData, socket } = useSelector(state => state.user);
    const router = useRouter();
    const [currentOrder, setCurrentOrder] = useState(null);
    const [showOtpBox, setShowOtpBox] = useState(false);
    const [availableAssignments, setAvailableAssignments] = useState([]);
    const [otp, setOtp] = useState("");
    const [todayDeliveries, setTodayDeliveries] = useState([]);
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    console.log(deliveryBoyLocation ,"deliveryBoyLocation")

  useEffect(() => {
  if (typeof window === "undefined") return;
  if (!navigator.geolocation) return;
  if (!userData || userData.role !== "deliveryBoy") return;

  console.log(" Starting location tracking");

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      console.log(" Location:", latitude, longitude);

      setDeliveryBoyLocation({ lat: latitude, lon: longitude });

      if (socket) {
        socket.emit("updateLocation", {
          latitude,
          longitude,
          userId: userData._id
        });
      }
    },
    (error) => {
      console.error(" Geolocation error:", error);
    },
    { enableHighAccuracy: true }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}, [userData, socket]);



    const ratePerDelivery = 50;
    const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0);

    const getAssignments = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-assignments`, { withCredentials: true });
            console.log(result.data, "order/get-assignments ")
            setAvailableAssignments(result.data);
        } catch (error) {
            console.error("Error fetching assignments:", error);
        }
    };

    const getCurrentOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true });
            console.log(result.data, "order/get-current-order")
            setCurrentOrder(result.data);
        } catch (error) {
            console.error("Error fetching current order:", error);
        }
    };

    const acceptOrder = async (assignmentId) => {
        try {
            await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, { withCredentials: true });
            console.log("order/accept-order")
            await getCurrentOrder();
        } catch (error) {
            console.error("Error accepting order:", error);
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on('newAssignment', (data) => {
                setAvailableAssignments(prev => [...prev, data]);
            });

            return () => {
                socket.off('newAssignment');
            };
        }
    }, [socket]);

    const sendOtp = async () => {
        if (!currentOrder) return;
        
        setLoading(true);
        try {
            await axios.post(`${serverUrl}/api/order/send-delivery-otp`, {
                orderId: currentOrder._id,
                shopOrderId: currentOrder.shopOrder._id
            }, { withCredentials: true });
            console.log("order/send-delivery-otp")
            setShowOtpBox(true);
        } catch (error) {
            console.error("Error sending OTP:", error);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!currentOrder || !otp) return;
        
        setMessage("");
        try {
            const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
                orderId: currentOrder._id,
                shopOrderId: currentOrder.shopOrder._id,
                otp
            }, { withCredentials: true });
            console.log(result.data, "order/verify-delivery-otp")
            
            setMessage(result.data.message);
            setTimeout(() => {
                router.refresh();
            }, 2000);
        } catch (error) {
            console.error("Error verifying OTP:", error);
        }
    };

    const handleTodayDeliveries = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { withCredentials: true });
            console.log(result.data,  "order/get-today-deliveries")
            setTodayDeliveries(result.data);
        } catch (error) {
            console.error("Error fetching today's deliveries:", error);
        }
    };

    useEffect(() => {
        if (userData && userData.role === "deliveryBoy") {
            getAssignments();
            getCurrentOrder();
            handleTodayDeliveries();
        }
    }, [userData]);

    if (!userData || userData.role !== "deliveryBoy") {
        return null;
    }

    return (
        <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
            <Nav />
            <div className='w-full max-w-[800px] flex flex-col gap-5 items-center mt-20'>
                {/* Welcome Card */}
                <div className='bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2'>
                    <h1 className='text-xl font-bold text-[#ff4d2d]'>Welcome, {userData.fullName}</h1>
                    <p className='text-[#ff4d2d]'>
                        <span className='font-semibold'>Latitude:</span> {deliveryBoyLocation?.lat?.toFixed(6) || "N/A"}, 
                        <span className='font-semibold'> Longitude:</span> {deliveryBoyLocation?.lon?.toFixed(6) || "N/A"}
                    </p>
                </div>

                {/* Today's Deliveries Chart */}
                <div className='bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100'>
                    <h1 className='text-lg font-bold mb-3 text-[#ff4d2d]'>Today Deliveries</h1>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={todayDeliveries}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
                            <YAxis allowDecimals={false} />
                            <Tooltip formatter={(value) => [value, "orders"]} labelFormatter={label => `${label}:00`} />
                            <Bar dataKey="count" fill='#ff4d2d' />
                        </BarChart>
                    </ResponsiveContainer>

                    <div className='max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center'>
                        <h1 className='text-xl font-semibold text-gray-800 mb-2'>Today's Earning</h1>
                        <span className='text-3xl font-bold text-green-600'>₹{totalEarning}</span>
                    </div>
                </div>

                {/* Available Orders */}
                {!currentOrder && (
                    <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
                        <h1 className='text-lg font-bold mb-4 flex items-center gap-2'>Available Orders</h1>
                        <div className='space-y-4'>
                            {availableAssignments?.length > 0 ? (
                                availableAssignments.map((a, index) => (
                                    <div className='border rounded-lg p-4 flex justify-between items-center' key={index}>
                                        <div>
                                            <p className='text-sm font-semibold'>{a?.shopName}</p>
                                            <p className='text-sm text-gray-500'>
                                                <span className='font-semibold'>Delivery Address:</span> {a?.deliveryAddress.text}
                                            </p>
                                            <p className='text-xs text-gray-400'>
                                                {a.items.length} items | ₹{a.subtotal}
                                            </p>
                                        </div>
                                        <button 
                                            className='bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600'
                                            onClick={() => acceptOrder(a.assignmentId)}
                                        >
                                            Accept
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className='text-gray-400 text-sm'>No Available Orders</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Current Order */}
                {currentOrder && (
                    <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
                        <h2 className='text-lg font-bold mb-3'>📦 Current Order</h2>
                        <div className='border rounded-lg p-4 mb-3'>
                            <p className='font-semibold text-sm'>{currentOrder?.shopOrder.shop.name}</p>
                            <p className='text-sm text-gray-500'>{currentOrder.deliveryAddress.text}</p>
                            <p className='text-xs text-gray-400'>
                                {currentOrder.shopOrder.shopOrderItems.length} items | ₹{currentOrder.shopOrder.subtotal}
                            </p>
                        </div>

                        <DeliveryBoyTracking 
                            data={{ 
                                deliveryBoyLocation: deliveryBoyLocation || {
                                    lat: userData.location.coordinates[1],
                                    lon: userData.location.coordinates[0]
                                },
                                customerLocation: {
                                    lat: currentOrder.deliveryAddress.latitude,
                                    lon: currentOrder.deliveryAddress.longitude
                                }
                            }} 
                        />

                        {!showOtpBox ? (
                            <button 
                                className='mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200'
                                onClick={sendOtp}
                                disabled={loading}
                            >
                                {loading ? <ClipLoader size={20} color='white' /> : "Mark As Delivered"}
                            </button>
                        ) : (
                            <div className='mt-4 p-4 border rounded-xl bg-gray-50'>
                                <p className='text-sm font-semibold mb-2'>
                                    Enter OTP sent to <span className='text-orange-500'>{currentOrder.user.fullName}</span>
                                </p>
                                <input 
                                    type="text" 
                                    className='w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400' 
                                    placeholder='Enter OTP' 
                                    onChange={(e) => setOtp(e.target.value)} 
                                    value={otp}
                                />
                                {message && <p className='text-center text-green-400 text-2xl mb-4'>{message}</p>}
                                <button 
                                    className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all"
                                    onClick={verifyOtp}
                                >
                                    Submit OTP
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DeliveryBoy;