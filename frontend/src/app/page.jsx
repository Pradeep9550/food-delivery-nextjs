'use client';

export const dynamic = "force-dynamic"; // ✅ Next.js route config

import dynamicImport from "next/dynamic"; // ✅ RENAMED
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const UserDashboard = dynamicImport(
  () => import('@/components/UserDashboard'),
  { ssr: false }
);

const OwnerDashboard = dynamicImport(
  () => import('@/components/OwnerDashboard'),
  { ssr: false }
);

const DeliveryBoy = dynamicImport(
  () => import('@/components/DeliveryBoy'),
  { ssr: false }
);

export default function HomePage() {
  const { userData, authLoading } = useSelector(state => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !userData) {
      router.replace('/signin');
    }
  }, [authLoading, userData, router]);

  // ⏳ wait till auth resolves
  if (authLoading) return null;

  if (!userData) return null;

  return (
    <>
      {userData.role === "user" && <UserDashboard />}
      {userData.role === "owner" && <OwnerDashboard />}
      {userData.role === "deliveryBoy" && <DeliveryBoy />}
    </>
  );
}