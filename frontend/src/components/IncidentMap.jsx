// src/components/IncidentMap.jsx
import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function IncidentMap({ incidents, loading }) {
  if (loading) return <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />;

  const center = [0, 0];
  const zoom = 2;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="w-full h-96 rounded-xl shadow-md"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />
      {incidents.map((i, idx) => (
        i.location?.lat && i.location?.lng && (
          <CircleMarker
            key={idx}
            center={[i.location.lat, i.location.lng]}
            radius={5 + (i.severity === "critical" ? 3 : 0)}
            color={i.severity === "critical" ? "red" : "orange"}
            fillOpacity={0.7}
          >
            <Popup>
              <strong>{i.category}</strong> <br />
              Severity: {i.severity} <br />
              Date: {new Date(i.createdAt).toLocaleDateString()}
            </Popup>
          </CircleMarker>
        )
      ))}
    </MapContainer>
  );
}
