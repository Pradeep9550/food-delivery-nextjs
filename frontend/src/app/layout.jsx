"use client";

import "./globals.css";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "@/redux/store";
import { socket } from "@/lib/socket";
import { setSocketConnected, setSocketId } from "@/redux/userSlice";
import { useEffect } from "react";
import Script from "next/script";
import 'leaflet/dist/leaflet.css';


import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useUpdateLocation from "@/hooks/useUpdateLocation";
import useGetCity from "@/hooks/useGetCity";
import useGetMyshop from "@/hooks/useGetMyShop";
import useGetShopByCity from "@/hooks/useGetShopByCity";
import useGetItemsByCity from "@/hooks/useGetItemsByCity";
import useGetMyOrders from "@/hooks/useGetMyOrders";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Vingo - Food Delivery</title>
      </head>
      <body>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
        <Provider store={store}>
          <AppContent>{children}</AppContent>
        </Provider>
      </body>
    </html>
  );
}

function AppContent({ children }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // init hooks
  useGetCurrentUser();
  useUpdateLocation();
  useGetCity();
  useGetMyshop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();

  // socket.io
  useEffect(() => {
    if (!userData?._id || !socket) return;

    socket.connect();

    socket.on("connect", () => {
      dispatch(setSocketConnected(true));
      dispatch(setSocketId(socket.id));
      socket.emit("identity", { userId: userData._id });
    });

    socket.on("disconnect", () => {
      dispatch(setSocketConnected(false));
      dispatch(setSocketId(null));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [userData?._id, dispatch]);

  return <>{children}</>;
}
