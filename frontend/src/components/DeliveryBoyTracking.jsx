// components/DeliveryBoyTracking.jsx
'use client';

import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from 'react';
import scooter from "@/public/assets/scooter.png";
import home from "@/public/assets/home.png";

// Dynamically import for Next.js
const deliveryBoyIcon = new L.Icon({
    iconUrl: '/assets/scooter.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
});

const customerIcon = new L.Icon({
    iconUrl: '/assets/home.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
});

function DeliveryBoyTracking({ data }) {
    const deliveryBoyLat = data.deliveryBoyLocation?.lat || 0;
    const deliveryBoyLon = data.deliveryBoyLocation?.lon || 0;
    const customerLat = data.customerLocation?.lat || 0;
    const customerLon = data.customerLocation?.lon || 0;

    const path = [
        [deliveryBoyLat, deliveryBoyLon],
        [customerLat, customerLon]
    ];

    const center = deliveryBoyLat && deliveryBoyLon ? [deliveryBoyLat, deliveryBoyLon] : [0, 0];

    // Fix for Leaflet icons in Next.js
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
            iconUrl: '/leaflet/images/marker-icon.png',
            shadowUrl: '/leaflet/images/marker-shadow.png',
        });
    }, []);

    return (
        <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md'>
            <MapContainer
                className="w-full h-full"
                center={center}
                zoom={16}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[deliveryBoyLat, deliveryBoyLon]} icon={deliveryBoyIcon}>
                    <Popup>Delivery Boy</Popup>
                </Marker>
                <Marker position={[customerLat, customerLon]} icon={customerIcon}>
                    <Popup>Customer</Popup>
                </Marker>
                <Polyline positions={path} color='blue' weight={4} />
            </MapContainer>
        </div>
    );
}

export default DeliveryBoyTracking;