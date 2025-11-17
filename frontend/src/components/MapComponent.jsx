import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import * as topojson from "topojson-client";

// 🌍 World topojson source
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// 🟡 Regional blocks
const REGIONAL_BLOCKS = {
    COMESA: [
        "Burundi", "Comoros", "Democratic Republic of the Congo", "Djibouti",
        "Egypt", "Eritrea", "Eswatini", "Ethiopia", "Kenya", "Libya",
        "Madagascar", "Malawi", "Mauritius", "Rwanda", "Seychelles", "Somalia",
        "Sudan", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
    ],
    ECOWAS: [
        "Benin", "Burkina Faso", "Cabo Verde", "Côte d'Ivoire", "Gambia", "Ghana",
        "Guinea", "Guinea-Bissau", "Liberia", "Mali", "Niger", "Nigeria",
        "Senegal", "Sierra Leone", "Togo"
    ],
    SADC: [
        "Angola", "Botswana", "Comoros", "Democratic Republic of the Congo",
        "Eswatini", "Lesotho", "Madagascar", "Malawi", "Mauritius", "Mozambique",
        "Namibia", "Seychelles", "South Africa", "Tanzania", "Zambia", "Zimbabwe"
    ],
    EAC: ["Burundi", "Kenya", "Rwanda", "South Sudan", "Tanzania", "Uganda", "Democratic Republic of the Congo"]
};

// 🧠 Normalize inconsistent names
function normalizeName(name) {
    return name
        .replace("Dem. Rep. Congo", "Democratic Republic of the Congo")
        .replace("Congo, Dem. Rep.", "Democratic Republic of the Congo")
        .replace("Congo, Republic of", "Republic of the Congo")
        .replace("Swaziland", "Eswatini")
        .replace("eSwatini", "Eswatini")
        .replace("Cote d'Ivoire", "Côte d'Ivoire")
        .replace("Ivory Coast", "Côte d'Ivoire")
        .replace("Cabo Verde", "Cape Verde")
        .trim();
}

// 🏳️ ISO flag codes
const FLAGS = {
    Algeria: "dz", Angola: "ao", Benin: "bj", Botswana: "bw", "Burkina Faso": "bf",
    Burundi: "bi", "Cabo Verde": "cv", Cameroon: "cm", "Central African Republic": "cf",
    Chad: "td", Comoros: "km", "Republic of the Congo": "cg",
    "Democratic Republic of the Congo": "cd", Djibouti: "dj", Egypt: "eg",
    "Equatorial Guinea": "gq", Eritrea: "er", Eswatini: "sz", Ethiopia: "et",
    Gabon: "ga", Gambia: "gm", Ghana: "gh", Guinea: "gn", "Guinea-Bissau": "gw",
    "Côte d'Ivoire": "ci", Kenya: "ke", Lesotho: "ls", Liberia: "lr", Libya: "ly",
    Madagascar: "mg", Malawi: "mw", Mali: "ml", Mauritania: "mr", Mauritius: "mu",
    Morocco: "ma", Mozambique: "mz", Namibia: "na", Niger: "ne", Nigeria: "ng",
    Rwanda: "rw", "Sao Tome and Principe": "st", Senegal: "sn", Seychelles: "sc",
    "Sierra Leone": "sl", Somalia: "so", "South Africa": "za", "South Sudan": "ss",
    Sudan: "sd", Tanzania: "tz", Togo: "tg", Tunisia: "tn", Uganda: "ug",
    Zambia: "zm", Zimbabwe: "zw"
};

// 🧾 Info snippets
const INFO = {
    Kenya: "Kenya plays a leading role in COMESA and EAC promoting regional trade and innovation.",
    Nigeria: "Nigeria drives economic integration and youth development through ECOWAS.",
    SouthAfrica: "SADC’s powerhouse, fostering regional industrialization and unity.",
    Egypt: "COMESA member spearheading trade links between North and Sub-Saharan Africa.",
    Rwanda: "Champion of digital governance and peacebuilding across East Africa.",
};

// 🎨 Colors for each bloc
const BLOCK_COLORS = {
    COMESA: "#FFD700",
    ECOWAS: "#4CAF50",
    SADC: "#2196F3",
    EAC: "#FF5722",
    NONE: "#E0E0E0"
};

export default function MapComponent() {
    const [hovered, setHovered] = useState(null);
    const [selected, setSelected] = useState(null);
    const [africanGeos, setAfricanGeos] = useState([]);

    // 🗺️ Load world data and extract Africa
    useEffect(() => {
        fetch(geoUrl)
            .then(res => res.json())
            .then(data => {
                const world = topojson.feature(data, data.objects.countries).features;
                // Show entire Africa
                const africa = world.filter(f => {
                    const coords = f?.geometry?.coordinates?.flat(2);
                    if (!coords || coords.length < 2) return false;
                    const [lon, lat] = coords;
                    return lat > -40 && lat < 40 && lon > -25 && lon < 60;
                });
                setAfricanGeos(africa);
            })
            .catch(err => console.error("❌ Map load error:", err));
    }, []);

    // 🧩 Determine color based on membership
    function getCountryColor(name) {
        const membership = Object.entries(REGIONAL_BLOCKS).filter(([_, list]) =>
            list.includes(name)
        ).map(([key]) => key);

        if (membership.length === 1) return BLOCK_COLORS[membership[0]];
        if (membership.length > 1) return "url(#multiBlockGradient)";
        return BLOCK_COLORS.NONE;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full bg-white rounded-2xl shadow-xl p-6 mt-10 relative overflow-hidden"
        >
            <h3 className="text-2xl font-bold text-center mb-4 text-primary">
                African Regional Economic Communities
            </h3>

            {hovered && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bg-primary text-white text-sm px-3 py-1 rounded-full shadow-lg"
                    style={{ top: 20, left: "50%", transform: "translateX(-50%)" }}
                >
                    {hovered}
                </motion.div>
            )}

            <div className="flex justify-center">
                {africanGeos.length > 0 ? (
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ scale: 300, center: [20, 0] }}
                        width={800}
                        height={500}
                        style={{ width: "100%", height: "auto" }}
                    >
                        {/* Gradient for multi-membership */}
                        <defs>
                            <linearGradient id="multiBlockGradient" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={BLOCK_COLORS.COMESA} />
                                <stop offset="33%" stopColor={BLOCK_COLORS.ECOWAS} />
                                <stop offset="66%" stopColor={BLOCK_COLORS.SADC} />
                                <stop offset="100%" stopColor={BLOCK_COLORS.EAC} />
                            </linearGradient>
                        </defs>

                        <Geographies geography={{ type: "FeatureCollection", features: africanGeos }}>
                            {({ geographies }) =>
                                geographies.map(geo => {
                                    const name = normalizeName(geo.properties.name);
                                    const color = getCountryColor(name);
                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill={color}
                                            stroke="#FFF"
                                            strokeWidth={0.4}
                                            onMouseEnter={() => setHovered(name)}
                                            onMouseLeave={() => setHovered(null)}
                                            onClick={() => setSelected(name)}
                                            style={{
                                                default: { outline: "none", cursor: "pointer", transition: "all 0.3s ease-in-out" },
                                                hover: { fill: "#222", outline: "none" },
                                                pressed: { fill: "#333", outline: "none" }
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ComposableMap>
                ) : (
                    <p className="text-center text-gray-500 mt-10">Loading Africa map...</p>
                )}
            </div>

            {/* Legend */}
            <div className="text-center text-sm text-gray-600 mt-4">
                <p>Regional blocs are color-coded below:</p>
                <div className="flex justify-center mt-2 space-x-4 flex-wrap">
                    {Object.entries(BLOCK_COLORS).map(([block, color]) =>
                        block !== "NONE" ? (
                            <div key={block} className="flex items-center space-x-1">
                                <span className="w-4 h-4 inline-block rounded-sm" style={{ background: color }}></span>
                                <span>{block}</span>
                            </div>
                        ) : null
                    )}
                </div>
            </div>

            {/* Country Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 w-96 text-center relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                                onClick={() => setSelected(null)}
                            >
                                ✕
                            </button>

                            {FLAGS[selected] && (
                                <img
                                    src={`https://flagcdn.com/w320/${FLAGS[selected]}.png`}
                                    alt={`${selected} flag`}
                                    className="mx-auto mb-4 rounded shadow-md"
                                    width="120"
                                    height="80"
                                />
                            )}

                            <h4 className="text-xl font-bold text-primary mb-2">{selected}</h4>
                            <p className="text-gray-700 text-sm mb-4">
                                {INFO[selected] ||
                                    `${selected} contributes to Africa’s regional peace, integration, and economic growth.`}
                            </p>
                            <button
                                onClick={() => setSelected(null)}
                                className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/80"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
