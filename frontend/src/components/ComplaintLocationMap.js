import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
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

const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const ComplaintLocationMap = ({ path = [], routePath = [], lat, lng, height = 280 }) => {
  // Prioritize routePath (actual road route), fallback to path or single coordinates
  const displayPath = useMemo(() => {
    // First, check if routePath exists and has valid coordinates
    if (Array.isArray(routePath) && routePath.length > 0) {
      const points = routePath
        .map((point) => ({ lat: Number(point?.lat), lng: Number(point?.lng) }))
        .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));

      if (points.length > 0) {
        return points;
      }
    }

    // Fallback to path if routePath is not available
    if (Array.isArray(path) && path.length > 0) {
      const points = path
        .map((point) => ({ lat: Number(point?.lat), lng: Number(point?.lng) }))
        .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));

      if (points.length > 0) {
        return points;
      }
    }

    // Final fallback to single lat/lng
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [{ lat, lng }];
    }

    return [];
  }, [routePath, path, lat, lng]);

  const center = useMemo(() => {
    if (displayPath.length > 0) {
      return [displayPath[0].lat, displayPath[0].lng];
    }

    return null;
  }, [displayPath]);

  const totalLengthMeters = useMemo(() => {
    if (displayPath.length < 2) {
      return 0;
    }

    let total = 0;
    for (let i = 1; i < displayPath.length; i += 1) {
      total += haversine(
        displayPath[i - 1].lat,
        displayPath[i - 1].lng,
        displayPath[i].lat,
        displayPath[i].lng
      );
    }

    return total;
  }, [displayPath]);

  if (!center) {
    return <p className="help-text">Location not available for this complaint.</p>;
  }

  const polylinePoints = displayPath.map((point) => [point.lat, point.lng]);
  const start = displayPath[0];
  const end = displayPath[displayPath.length - 1];
  const isRealRoute = Array.isArray(routePath) && routePath.length > 0;

  return (
    <div>
      <MapContainer center={center} zoom={15} style={{ height, width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[start.lat, start.lng]} />
        {displayPath.length > 1 && <Marker position={[end.lat, end.lng]} />}
        {displayPath.length > 1 && (
          <Polyline 
            positions={polylinePoints} 
            color={isRealRoute ? "#2196f3" : "#d32f2f"}
            weight={isRealRoute ? 6 : 5}
            opacity={isRealRoute ? 0.8 : 1}
          />
        )}
      </MapContainer>

      {displayPath.length > 1 && (
        <p className="help-text" style={{ marginTop: '0.5rem' }}>
          {isRealRoute && <span style={{ color: '#2196f3', fontWeight: 'bold' }}>✓ Actual Road Route • </span>}
          Road length: {totalLengthMeters >= 1000
            ? `${(totalLengthMeters / 1000).toFixed(2)} km`
            : `${Math.round(totalLengthMeters)} m`}
        </p>
      )}
    </div>
  );
};

export default ComplaintLocationMap;
