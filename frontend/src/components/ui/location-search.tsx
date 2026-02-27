import { useState } from "react";

interface LocationSearchProps {
  onLocationSelect: (data: {
    address: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
  }) => void;
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchLocation = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `countrycodes=in&` +
        `addressdetails=1&` +
        `limit=8`,
        {
          headers: {
            'User-Agent': 'GharKaKitchen/1.0'
          }
        }
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place: any) => {
    const addr = place.address || {};
    onLocationSelect({
      address: addr.road || addr.neighbourhood || addr.suburb || place.display_name.split(", ")[0] || "",
      city: addr.city || addr.town || addr.village || addr.state_district || "",
      state: addr.state || "",
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
    });
    setQuery(place.display_name);
    setResults([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          searchLocation(e.target.value);
        }}
        placeholder="Search for a location..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
      {loading && (
        <div className="absolute right-3 top-3 text-gray-400">
          Searching...
        </div>
      )}
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((place) => (
            <button
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
            >
              <div className="font-medium">{place.display_name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
