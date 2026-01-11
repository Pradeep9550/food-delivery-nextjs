// app/signup/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ClipLoader } from "react-spinners";
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '@/redux/userSlice';
import { serverUrl } from '@/lib/constants';
import Link from 'next/link';

export default function SignUp() {
    const primaryColor = "#ff4d2d";
    const bgColor = "#fff9f6";
    const borderColor = "#ddd";
    
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("user");
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user);

    useEffect(() => {
        if (userData) {
            router.push("/");
        }
    }, [userData, router]);

    const handleSignUp = async () => {
        if (!fullName || !email || !password || !mobile) {
            setErr("All fields are required");
            return;
        }

        setLoading(true);
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signup`, {
                fullName, email, password, mobile, role
            }, { withCredentials: true });
            
            console.log(result.data, "auth/signup")
            dispatch(setUserData(result.data));
            setErr("");
            router.push("/");
        } catch (error) {
            setErr(error?.response?.data?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        if (!mobile) {
            return setErr("Mobile number is required");
        }
        
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                fullName: result.user.displayName,
                email: result.user.email,
                role,
                mobile
            }, { withCredentials: true });
            
            console.log("auth/google-auth")
            dispatch(setUserData(data));
            router.push("/");
        } catch (error) {
            console.error("Google auth error:", error);
            setErr("Google authentication failed");
        }
    };

    return (
        <div className='min-h-screen w-full flex items-center justify-center p-4' style={{ backgroundColor: bgColor }}>
            <div className={`bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]`} style={{ border: `1px solid ${borderColor}` }}>
                <h1 className={`text-3xl font-bold mb-2`} style={{ color: primaryColor }}>Vingo</h1>
                <p className='text-gray-600 mb-8'>Create your account to get started with delicious food deliveries</p>

                <div className='mb-4'>
                    <label htmlFor="fullName" className='block text-gray-700 font-medium mb-1'>Full Name</label>
                    <input 
                        type="text" 
                        className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff4d2d]' 
                        placeholder='Enter your Full Name' 
                        style={{ border: `1px solid ${borderColor}` }}
                        onChange={(e) => setFullName(e.target.value)} 
                        value={fullName} 
                        required
                    />
                </div>

                <div className='mb-4'>
                    <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                    <input 
                        type="email" 
                        className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff4d2d]' 
                        placeholder='Enter your Email' 
                        style={{ border: `1px solid ${borderColor}` }}
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        required
                    />
                </div>

                <div className='mb-4'>
                    <label htmlFor="mobile" className='block text-gray-700 font-medium mb-1'>Mobile</label>
                    <input 
                        type="tel" 
                        className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff4d2d]' 
                        placeholder='Enter your Mobile Number' 
                        style={{ border: `1px solid ${borderColor}` }}
                        onChange={(e) => setMobile(e.target.value)} 
                        value={mobile} 
                        required
                    />
                </div>

                <div className='mb-4'>
                    <label htmlFor="password" className='block text-gray-700 font-medium mb-1'>Password</label>
                    <div className='relative'>
                        <input 
                            type={`${showPassword ? "text" : "password"}`} 
                            className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff4d2d] pr-10' 
                            placeholder='Enter your password' 
                            style={{ border: `1px solid ${borderColor}` }}
                            onChange={(e) => setPassword(e.target.value)} 
                            value={password} 
                            required
                        />
                        <button 
                            className='absolute right-3 cursor-pointer top-[14px] text-gray-500'
                            onClick={() => setShowPassword(prev => !prev)}
                            type="button"
                        >
                            {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                        </button>
                    </div>
                </div>

                <div className='mb-6'>
                    <label htmlFor="role" className='block text-gray-700 font-medium mb-1'>Role</label>
                    <div className='flex gap-2'>
                        {["user", "owner", "deliveryBoy"].map((r) => (
                            <button
                                key={r}
                                className='flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer capitalize'
                                onClick={() => setRole(r)}
                                style={
                                    role === r ?
                                    { backgroundColor: primaryColor, color: "white" }
                                    : { border: `1px solid ${primaryColor}`, color: primaryColor }
                                }
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer flex items-center justify-center`}
                    onClick={handleSignUp}
                    disabled={loading}
                >
                    {loading ? <ClipLoader size={20} color='white' /> : "Sign Up"}
                </button>
                
                {err && <p className='text-red-500 text-center my-[10px]'>*{err}</p>}

                <button 
                    className='w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition cursor-pointer duration-200 border-gray-400 hover:bg-gray-100'
                    onClick={handleGoogleAuth}
                >
                    <FcGoogle size={20} />
                    <span>Sign up with Google</span>
                </button>
                
                <p className='text-center mt-6'>
                    Already have an account?{" "}
                    <Link href="/signin" className='text-[#ff4d2d] font-medium hover:underline'>
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}