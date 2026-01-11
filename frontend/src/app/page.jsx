// app/page.jsx
'use client';

export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const UserDashboard = dynamicImport(() => import('@/components/UserDashboard'), { ssr: false });
const OwnerDashboard = dynamicImport(() => import('@/components/OwnerDashboard'), { ssr: false });
const DeliveryBoy = dynamicImport(() => import('@/components/DeliveryBoy'), { ssr: false });

export default function HomePage() {
  const { userData } = useSelector(state => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!userData) {
      router.replace('/signin'); //  signin page
    }
  }, [userData, router]);

  if (!userData) return null; // redirect ho raha hai, UI mat dikhao

  return (
    <div>
      {userData.role === "user" && <UserDashboard />}
      {userData.role === "owner" && <OwnerDashboard />}
      {userData.role === "deliveryBoy" && <DeliveryBoy />}
    </div>
  );
}
