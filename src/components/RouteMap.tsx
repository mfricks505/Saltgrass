'use client';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

function LocationMarkers({ onChange }: any) {
  const [positions, setPositions] = useState<any[]>([]);

  useMapEvents({
    click(e: any) {
      const newPos = [...positions, e.latlng];
      setPositions(newPos);
      onChange(newPos);
    }
  });

  return (
    <>
      {positions.map((pos, i) => <Marker key={i} position={pos} />)}
      {positions.length > 1 && <Polyline positions={positions} color="#10b981" />}
    </>
  );
}

export default function RouteMap({ onWaypointsChange }: any) {
  return (
    <MapContainer center={[30.42, -87.22]} zoom={11} className="h-[500px] rounded-3xl z-0">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarkers onChange={onWaypointsChange} />
    </MapContainer>
  );
}