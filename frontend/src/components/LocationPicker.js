import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const defaultCenter = [18.5204, 73.8567]; // Pune default for this project

const ClickHandler = ({ onMapClick, isDrawingLocked }) => {
  useMapEvents({
    click(e) {
      if (!isDrawingLocked) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
};

const RecenterMap = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 15);
    }
  }, [center, map]);
  return null;
};

const normalizePath = (path) => {
  if (!Array.isArray(path)) return [];
  return path.filter(point => point && Number.isFinite(point.lat) && Number.isFinite(point.lng));
};

const LocationPicker = ({ selectedPath = [], onPathChange }) => {
  const [isDrawingFinished, setIsDrawingFinished] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchCenter, setSearchCenter] = useState(null);
  
  const safePath = normalizePath(selectedPath);

  const handleLocationSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchError('Enter a place name to search.');
      setSearchResults([]);
      return;
    }

    setIsSearchingLocation(true);
    setSearchError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
      );

      if (!response.ok) throw new Error('Search unavailable right now.');

      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) {
        setSearchResults([]);
        setSearchError('No matching place found.');
        return;
      }

      const normalizedResults = results
        .map((item) => ({
          lat: Number(item?.lat),
          lng: Number(item?.lon),
          label: item?.display_name || 'Unknown location'
        }))
        .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));

      if (normalizedResults.length === 0) {
        setSearchResults([]);
        setSearchError('No valid coordinates found.');
        return;
      }

      setSearchResults(normalizedResults);
      setSearchCenter({ lat: normalizedResults[0].lat, lng: normalizedResults[0].lng });
    } catch (error) {
      setSearchResults([]);
      setSearchError('Search failed due to network error.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const center = useMemo(() => {
    if (safePath.length > 0) return [safePath[0].lat, safePath[0].lng];
    return defaultCenter;
  }, [safePath]);

  const appendPoint = (point) => {
    onPathChange([...safePath, point]);
  };

  const handleReset = () => {
    onPathChange([]);
    setIsDrawingFinished(false);
    setSearchCenter(null);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pt = { lat: position.coords.latitude, lng: position.coords.longitude };
        appendPoint(pt);
        setSearchCenter(pt);
      },
      (error) => console.warn('Geolocation failed:', error.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary" onClick={handleUseCurrentLocation}>
          📍 Use My Location
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          🔄 Reset Markers
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsDrawingFinished(true)}
          disabled={safePath.length === 0 || isDrawingFinished}
        >
          ✅ Finish Drawing
        </button>
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city/area (e.g., Pune, Haveli)"
            style={{ flex: '1 1 280px' }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLocationSearch}
            disabled={isSearchingLocation}
          >
            {isSearchingLocation ? 'Searching...' : 'Search Place'}
          </button>
        </div>

        {searchError && (
          <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#ffebee', borderRadius: 4, color: '#d32f2f', fontSize: '0.9rem' }}>
            {searchError}
          </div>
        )}

        {searchResults.length > 0 && (
          <div style={{ marginTop: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 6, maxHeight: 160, overflowY: 'auto', backgroundColor: '#fff' }}>
            {searchResults.map((result, index) => (
              <button
                key={`${result.lat}-${result.lng}-${index}`}
                type="button"
                onClick={() => {
                  setSearchCenter({ lat: result.lat, lng: result.lng });
                  setSearchResults([]);
                  setSearchQuery(result.label.split(',')[0]);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  borderBottom: index === searchResults.length - 1 ? 'none' : '1px solid #f0f0f0',
                  padding: '0.6rem 0.75rem',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {result.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '0.75rem', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <MapContainer center={center} zoom={13} style={{ height: 350, width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {searchCenter && <RecenterMap center={searchCenter} />}
          <ClickHandler onMapClick={appendPoint} isDrawingLocked={isDrawingFinished} />
          
          {safePath.length > 0 && (
            <>
              {safePath.map((p, i) => (
                 <Marker key={i} position={[p.lat, p.lng]} />
              ))}
              
              {safePath.length > 1 && (
                <Polyline
                  positions={safePath.map((p) => [p.lat, p.lng])}
                  color="#d32f2f"
                  weight={5}
                />
              )}
            </>
          )}
        </MapContainer>
      </div>

      <div className="help-text" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
        <p>💡 Click on the map to drop markers and draw the exact location or length of the road issue.</p>
        {safePath.length > 0 && (
          <p style={{ color: 'var(--secondary-green)', fontWeight: '600', marginTop: '0.2rem' }}>
            ✓ {safePath.length} point(s) recorded.
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
