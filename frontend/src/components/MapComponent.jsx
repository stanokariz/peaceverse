import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import * as topojson from "topojson-client";

/* =====================================================================================
   🌍  TOPOJSON SOURCE
===================================================================================== */
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/* =====================================================================================
   🔶 REGIONAL BLOCKS (INCLUDING MAGHREB)
===================================================================================== */
const REGIONAL_BLOCKS = {
  MAGHREB: ["Algeria","Libya","Mauritania","Morocco","Tunisia"],
  COMESA: [
    "Burundi","Comoros","Democratic Republic of the Congo","Djibouti",
    "Egypt","Eritrea","Eswatini","Ethiopia","Kenya","Libya",
    "Madagascar","Malawi","Mauritius","Rwanda","Seychelles","Somalia",
    "Sudan","Tunisia","Uganda","Zambia","Zimbabwe"
  ],
  ECOWAS: [
    "Benin","Burkina Faso","Cape Verde","Côte d'Ivoire","Gambia","Ghana",
    "Guinea","Guinea-Bissau","Liberia","Mali","Niger","Nigeria",
    "Senegal","Sierra Leone","Togo"
  ],
  SADC: [
    "Angola","Botswana","Comoros","Democratic Republic of the Congo",
    "Eswatini","Lesotho","Madagascar","Malawi","Mauritius","Mozambique",
    "Namibia","Seychelles","South Africa","Tanzania","Zambia","Zimbabwe"
  ],
  EAC: [
    "Burundi","Kenya","Rwanda","South Sudan","Tanzania","Uganda",
    "Democratic Republic of the Congo"
  ],
  ECCAS: [
    "Angola","Burundi","Cameroon","Central African Republic","Chad",
    "Republic of the Congo","Democratic Republic of the Congo",
    "Equatorial Guinea","Gabon","Rwanda","Sao Tome and Principe"
  ]
};

/* =====================================================================================
   🧠 NORMALIZE INCONSISTENT COUNTRY NAMES
===================================================================================== */
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

/* =====================================================================================
   🏳 FLAG ICON CODES FOR ALL AFRICAN COUNTRIES
===================================================================================== */
const FLAGS = {
  Algeria: "dz",
  Angola: "ao",
  Benin: "bj",
  Botswana: "bw",
  "Burkina Faso": "bf",
  Burundi: "bi",
  "Cape Verde": "cv",
  Cameroon: "cm",
  "Central African Republic": "cf",
  Chad: "td",
  Comoros: "km",
  "Republic of the Congo": "cg",
  "Democratic Republic of the Congo": "cd",
  Djibouti: "dj",
  Egypt: "eg",
  "Equatorial Guinea": "gq",
  Eritrea: "er",
  Eswatini: "sz",
  Ethiopia: "et",
  Gabon: "ga",
  Gambia: "gm",
  Ghana: "gh",
  Guinea: "gn",
  "Guinea-Bissau": "gw",
  "Côte d'Ivoire": "ci",
  Kenya: "ke",
  Lesotho: "ls",
  Liberia: "lr",
  Libya: "ly",
  Madagascar: "mg",
  Malawi: "mw",
  Mali: "ml",
  Mauritania: "mr",
  Mauritius: "mu",
  Morocco: "ma",
  Mozambique: "mz",
  Namibia: "na",
  Niger: "ne",
  Nigeria: "ng",
  Rwanda: "rw",
  "Sao Tome and Principe": "st",
  Senegal: "sn",
  Seychelles: "sc",
  "Sierra Leone": "sl",
  Somalia: "so",
  "South Africa": "za",
  "South Sudan": "ss",
  Sudan: "sd",
  Tanzania: "tz",
  Togo: "tg",
  Tunisia: "tn",
  Uganda: "ug",
  Zambia: "zm",
  Zimbabwe: "zw"
};

/* =====================================================================================
   📊 FULL COUNTRY STATISTICS + ICONS
===================================================================================== */
const STAT_ICONS = {
  capital: "🏛️",
  population: "👥",
  gdp: "💰",
  languages: "🗣️"
};

const COUNTRY_STATS = {
  Algeria: { capital: "Algiers", population: "44 million", gdp: "$163 billion", languages: "Arabic, Berber" },
  Angola: { capital: "Luanda", population: "34 million", gdp: "$74 billion", languages: "Portuguese" },
  Benin: { capital: "Porto-Novo", population: "13 million", gdp: "$17 billion", languages: "French" },
  Botswana: { capital: "Gaborone", population: "2.6 million", gdp: "$18 billion", languages: "English, Tswana" },
  "Burkina Faso": { capital: "Ouagadougou", population: "22 million", gdp: "$19 billion", languages: "French" },
  Burundi: { capital: "Gitega", population: "12 million", gdp: "$3.2 billion", languages: "Kirundi, French" },
  "Cape Verde": { capital: "Praia", population: "0.6 million", gdp: "$2 billion", languages: "Portuguese" },
  Cameroon: { capital: "Yaoundé", population: "27 million", gdp: "$45 billion", languages: "French, English" },
  "Central African Republic": { capital: "Bangui", population: "5 million", gdp: "$2.3 billion", languages: "French, Sango" },
  Chad: { capital: "N'Djamena", population: "17 million", gdp: "$11 billion", languages: "French, Arabic" },
  Comoros: { capital: "Moroni", population: "0.9 million", gdp: "$1.3 billion", languages: "Comorian, French, Arabic" },
  "Republic of the Congo": { capital: "Brazzaville", population: "5.6 million", gdp: "$13 billion", languages: "French" },
  "Democratic Republic of the Congo": { capital: "Kinshasa", population: "96 million", gdp: "$64 billion", languages: "French, Lingala, Swahili" },
  Djibouti: { capital: "Djibouti", population: "1.1 million", gdp: "$3.5 billion", languages: "Arabic, French" },
  Egypt: { capital: "Cairo", population: "109 million", gdp: "$476 billion", languages: "Arabic" },
  "Equatorial Guinea": { capital: "Malabo", population: "1.7 million", gdp: "$12 billion", languages: "Spanish, French, Portuguese" },
  Eritrea: { capital: "Asmara", population: "3.6 million", gdp: "$2.3 billion", languages: "Tigrinya, Arabic, English" },
  Eswatini: { capital: "Mbabane", population: "1.2 million", gdp: "$4.9 billion", languages: "Swazi, English" },
  Ethiopia: { capital: "Addis Ababa", population: "120 million", gdp: "$157 billion", languages: "Amharic" },
  Gabon: { capital: "Libreville", population: "2.3 million", gdp: "$18 billion", languages: "French" },
  Gambia: { capital: "Banjul", population: "2.5 million", gdp: "$2.2 billion", languages: "English" },
  Ghana: { capital: "Accra", population: "33 million", gdp: "$77 billion", languages: "English" },
  Guinea: { capital: "Conakry", population: "14 million", gdp: "$16 billion", languages: "French" },
  "Guinea-Bissau": { capital: "Bissau", population: "2 million", gdp: "$1.7 billion", languages: "Portuguese" },
  "Côte d'Ivoire": { capital: "Yamoussoukro", population: "29 million", gdp: "$70 billion", languages: "French" },
  Kenya: { capital: "Nairobi", population: "54 million", gdp: "$116 billion", languages: "Swahili, English" },
  Lesotho: { capital: "Maseru", population: "2.1 million", gdp: "$2.5 billion", languages: "Sesotho, English" },
  Liberia: { capital: "Monrovia", population: "5.2 million", gdp: "$3.5 billion", languages: "English" },
  Libya: { capital: "Tripoli", population: "7 million", gdp: "$34 billion", languages: "Arabic" },
  Madagascar: { capital: "Antananarivo", population: "28 million", gdp: "$14 billion", languages: "Malagasy, French" },
  Malawi: { capital: "Lilongwe", population: "20 million", gdp: "$13 billion", languages: "English, Chichewa" },
  Mali: { capital: "Bamako", population: "22 million", gdp: "$19 billion", languages: "French" },
  Mauritania: { capital: "Nouakchott", population: "4.8 million", gdp: "$10 billion", languages: "Arabic" },
  Mauritius: { capital: "Port Louis", population: "1.3 million", gdp: "$12 billion", languages: "English, French, Creole" },
  Morocco: { capital: "Rabat", population: "37 million", gdp: "$134 billion", languages: "Arabic, Berber" },
  Mozambique: { capital: "Maputo", population: "32 million", gdp: "$18 billion", languages: "Portuguese" },
  Namibia: { capital: "Windhoek", population: "2.5 million", gdp: "$13 billion", languages: "English" },
  Niger: { capital: "Niamey", population: "25 million", gdp: "$14 billion", languages: "French" },
  Nigeria: { capital: "Abuja", population: "213 million", gdp: "$448 billion", languages: "English" },
  Rwanda: { capital: "Kigali", population: "13 million", gdp: "$11 billion", languages: "Kinyarwanda, English, French" },
  "Sao Tome and Principe": { capital: "São Tomé", population: "0.2 million", gdp: "$0.5 billion", languages: "Portuguese" },
  Senegal: { capital: "Dakar", population: "17 million", gdp: "$28 billion", languages: "French" },
  Seychelles: { capital: "Victoria", population: "100,000", gdp: "$1.2 billion", languages: "French, English, Seychellois Creole" },
  "Sierra Leone": { capital: "Freetown", population: "8 million", gdp: "$4 billion", languages: "English" },
  Somalia: { capital: "Mogadishu", population: "17 million", gdp: "$5.1 billion", languages: "Somali, Arabic" },
  "South Africa": { capital: "Pretoria / Cape Town / Bloemfontein", population: "59 million", gdp: "$405 billion", languages: "11 official languages" },
  "South Sudan": { capital: "Juba", population: "11 million", gdp: "$4.3 billion", languages: "English" },
  Sudan: { capital: "Khartoum", population: "46 million", gdp: "$35 billion", languages: "Arabic, English" },
  Tanzania: { capital: "Dodoma", population: "65 million", gdp: "$75 billion", languages: "Swahili, English" },
  Togo: { capital: "Lomé", population: "8.9 million", gdp: "$8 billion", languages: "French" },
  Tunisia: { capital: "Tunis", population: "12 million", gdp: "$47 billion", languages: "Arabic" },
  Uganda: { capital: "Kampala", population: "45 million", gdp: "$45 billion", languages: "English, Swahili" },
  Zambia: { capital: "Lusaka", population: "20 million", gdp: "$30 billion", languages: "English" },
  Zimbabwe: { capital: "Harare", population: "16 million", gdp: "$21 billion", languages: "English, Shona, Ndebele" }
};

/* =====================================================================================
   🎨 COLORS FOR BLOCS
===================================================================================== */
const BLOCK_COLORS = {
  MAGHREB: "#8B008B", // Purple
  COMESA: "#FFFF00",  
  ECOWAS: "#00AA00",  
  SADC: "#0000FF",    
  EAC: "#FF0000",     
  ECCAS: "#FF7F00",   
  NONE: "#E0E0E0"
};

/* =====================================================================================
   🌍 MAP COMPONENT
===================================================================================== */
export default function MapComponent() {
  const [hovered, setHovered] = useState(null);
  const [hoverBlocs, setHoverBlocs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [africanGeos, setAfricanGeos] = useState([]);

  /* Load Africa topology */
  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(data => {
        const world = topojson.feature(data, data.objects.countries).features;
        const africa = world.filter(f => {
          const { coordinates, type } = f.geometry;
          let lons = [], lats = [];

          if (type === "Polygon")
            coordinates[0].forEach(([lon, lat]) => { lons.push(lon); lats.push(lat); });
          else if (type === "MultiPolygon")
            coordinates.forEach(p => p[0].forEach(([lon, lat]) => { lons.push(lon); lats.push(lat); }));

          const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
          const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;

          return centerLat > -40 && centerLat < 40 && centerLon > -25 && centerLon < 60;
        });
        setAfricanGeos(africa);
      });
  }, []);

  function getCountryFill(name) {
    const memberships = Object.entries(REGIONAL_BLOCKS)
      .filter(([_, list]) => list.includes(name))
      .map(([key]) => key);

    if (memberships.length === 0) return BLOCK_COLORS.NONE;
    if (memberships.length === 1) return BLOCK_COLORS[memberships[0]];

    return `url(#pattern-${name.replace(/\s/g, "")})`;
  }

  function renderPatterns() {
    const multiCountries = africanGeos.filter(geo => {
      const name = normalizeName(geo.properties.name);
      const m = Object.entries(REGIONAL_BLOCKS).filter(([_, list]) => list.includes(name));
      return m.length > 1;
    });

    return (
      <defs>
        {multiCountries.map(geo => {
          const name = normalizeName(geo.properties.name);
          const memberships = Object.entries(REGIONAL_BLOCKS)
            .filter(([_, list]) => list.includes(name))
            .map(([key]) => key);

          const stripeWidth = 12 / memberships.length;

          return (
            <pattern
              key={name}
              id={`pattern-${name.replace(/\s/g, "")}`}
              patternUnits="userSpaceOnUse"
              width="12"
              height="12"
              patternTransform="rotate(45)"
            >
              {memberships.map((bloc, i) => (
                <rect
                  key={bloc}
                  x={i * stripeWidth}
                  width={stripeWidth}
                  height="12"
                  fill={BLOCK_COLORS[bloc]}
                />
              ))}
            </pattern>
          );
        })}
      </defs>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full bg-white rounded-2xl shadow-xl p-6 mt-10 relative overflow-hidden"
    >
      <h3 className="text-2xl font-bold text-center mb-4 text-primary">
        African Regional Economic Communities
      </h3>

      {hovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bg-primary text-white px-4 py-2 rounded-full shadow-lg text-sm"
          style={{ top: 20, left: "50%", transform: "translateX(-50%)" }}
        >
          <strong>{hovered}</strong>
          {hoverBlocs.length > 0 && (
            <div className="text-xs mt-1">
              ({hoverBlocs.join(", ")})
            </div>
          )}
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
            {renderPatterns()}

            <Geographies geography={{ type: "FeatureCollection", features: africanGeos }}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const name = normalizeName(geo.properties.name);
                  const fill = getCountryFill(name);
                  const blocs = Object.entries(REGIONAL_BLOCKS)
                    .filter(([_, list]) => list.includes(name))
                    .map(([bloc]) => bloc);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#666"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", cursor: "pointer" },
                        hover: { opacity: 0.7, outline: "none" },
                        pressed: { outline: "none" }
                      }}
                      onMouseEnter={() => {
                        setHovered(name);
                        setHoverBlocs(blocs);
                      }}
                      onMouseLeave={() => {
                        setHovered(null);
                        setHoverBlocs([]);
                      }}
                      onClick={() => setSelected(name)}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        ) : (
          <p>Loading map...</p>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white p-6 rounded-xl max-w-sm w-full relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 font-bold"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={`https://flagcdn.com/48x36/${FLAGS[selected]}.png`}
                  alt={selected}
                  className="w-8 h-6 object-cover rounded-sm"
                />
                <h2 className="text-xl font-bold">{selected}</h2>
              </div>

              {/* REGIONAL MEMBERSHIP WITH COLORS */}
              <div className="mb-4 text-sm">
                <strong>Region(s):</strong>{" "}
                {Object.entries(REGIONAL_BLOCKS)
                  .filter(([_, list]) => list.includes(selected))
                  .map(([bloc]) => (
                    <span
                      key={bloc}
                      className="px-2 py-1 rounded text-white mr-2 text-xs"
                      style={{ backgroundColor: BLOCK_COLORS[bloc] }}
                    >
                      {bloc}
                    </span>
                  ))}
                {Object.entries(REGIONAL_BLOCKS).every(([_, list]) => !list.includes(selected)) && (
                  <span className="text-gray-500">None</span>
                )}
              </div>

              {COUNTRY_STATS[selected] ? (
                <ul className="space-y-2 text-gray-700">
                  {Object.entries(COUNTRY_STATS[selected]).map(([key, val]) => (
                    <li key={key}>
                      <span className="mr-2">{STAT_ICONS[key]}</span>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {val}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No data available</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
