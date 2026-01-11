// app/forgot-password/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoIosArrowRoundBack } from "react-icons/io";
import axios from 'axios';
import { serverUrl } from '@/lib/constants';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [err, setErr] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!email) {
            setErr("Email is required");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true });
            console.log("auth/send-otp")
            setErr("");
            setStep(2);
        } catch (error) {
            setErr(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setErr("OTP is required");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true });
            console.log("auth/verify-otp")
            setErr("");
            setStep(3);
        } catch (error) {
            setErr(error?.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setErr("Passwords do not match");
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            setErr("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true });
            console.log("auth/reset-password");
            
            setErr("");
            router.push("/signin");
        } catch (error) {
            setErr(error?.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]'>
            <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8'>
                <div className='flex items-center gap-4 mb-6'>
                    <Link href="/signin">
                        <IoIosArrowRoundBack size={30} className='text-[#ff4d2d] cursor-pointer' />
                    </Link>
                    <h1 className='text-2xl font-bold text-center text-[#ff4d2d]'>Forgot Password</h1>
                </div>

                {step === 1 && (
                    <div>
                        <div className='mb-6'>
                            <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                            <input 
                                type="email" 
                                className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff4d2d]' 
                                placeholder='Enter your Email' 
                                onChange={(e) => setEmail(e.target.value)} 
                                value={email} 
                                required
                            />
                        </div>
                        <button 
                            className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer flex items-center justify-center`}
                            onClick={handleSendOtp}
                            disabled={loading}
                        >
                            {loading ? <ClipLoader size={20} color='white' /> : "Send OTP"}
                        </button>
                        {err && <p className='text-red-500 text-center my-[10px]'>*{err}</p>}
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <div className='mb-6'>
                            <label htmlFor="otp" className='block text-gray-700 font-medium mb-1'>OTP</label>
                            <input 
                                type="text" 
                                className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff4d2d]' 
                                placeholder='Enter OTP' 
                                onChange={(e) => setOtp(e.target.value)} 
                                value={otp} 
                                required
                            />
                        </div>
                        <button 
                            className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer flex items-center justify-center`}
                            onClick={handleVerifyOtp}
                            disabled={loading}
                        >
                            {loading ? <ClipLoader size={20} color='white' /> : "Verify OTP"}
                        </button>
                        {err && <p className='text-red-500 text-center my-[10px]'>*{err}</p>}
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <div className='mb-6'>
                            <label htmlFor="newPassword" className='block text-gray-700 font-medium mb-1'>New Password</label>
                            <input 
                                type="password" 
                                className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff4d2d]' 
                                placeholder='Enter New Password' 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                value={newPassword}
                            />
                        </div>
                        <div className='mb-6'>
                            <label htmlFor="confirmPassword" className='block text-gray-700 font-medium mb-1'>Confirm Password</label>
                            <input 
                                type="password" 
                                className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff4d2d]' 
                                placeholder='Confirm Password' 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                value={confirmPassword} 
                                required
                            />
                        </div>
                        <button 
                            className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer flex items-center justify-center`}
                            onClick={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? <ClipLoader size={20} color='white' /> : "Reset Password"}
                        </button>
                        {err && <p className='text-red-500 text-center my-[10px]'>*{err}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}