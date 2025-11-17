import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet.heat";
import { useEffect, useState } from "react";
import api from "../api";

export default function Heatmap() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    api.get("/analytics/heatmap").then((res) => {
      const heatData = res.data.heatmap.map((p) => [
        p.lat, p.lng, p.weight
      ]);
      setPoints(heatData);
    });
  }, []);

  return (
    <div className="rounded-xl overflow-hidden shadow-xl">
      <MapContainer
        center={[9.05, 38.7]} // Ethiopia center
        zoom={5}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <HeatmapLayer
          points={points}
          radius={25}
          maxZoom={18}
        />
      </MapContainer>
    </div>
  );
}

function HeatmapLayer({ points }) {
  useEffect(() => {
    if (!window.L || !points.length) return;
    const map = window.mapInstance;

    const heat = window.L.heatLayer(points, { radius: 25 });
    heat.addTo(map);

    return () => heat.remove();
  }, [points]);

  return null;
}
