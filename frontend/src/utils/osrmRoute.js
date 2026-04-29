/**
 * Fetch route from OSRM API with fallback handling
 * @param {number} lat1 - Start latitude
 * @param {number} lng1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lng2 - End longitude
 * @returns {Promise<Object>} Object containing path array, distance, and duration
 */
export const fetchOSRMRoute = async (lat1, lng1, lat2, lng2) => {
  const mirrors = [
    'https://router.project-osrm.org/route/v1/driving',
    'https://routing.openstreetmap.de/routed-car/route/v1/driving'
  ];

  for (const base of mirrors) {
    try {
      const url = `${base}/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`OSRM Rate limit on ${base}, trying next mirror...`);
          continue; // Try next mirror on 429
        }
        console.error(`OSRM API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        continue;
      }

      const route = data.routes[0];
      const geometry = route.geometry;
      
      if (!geometry || !geometry.coordinates) {
        continue;
      }

      const routePath = geometry.coordinates
        .filter((coordinate) => Array.isArray(coordinate) && coordinate.length >= 2)
        .map(([lng, lat]) => [lat, lng]);

      return {
        path: routePath,
        distance: route.distance || 0,
        duration: route.duration || 0
      };
    } catch (error) {
      console.error('Error fetching OSRM route:', error);
    }
  }

  // If all fail
  return { path: [], distance: 0, duration: 0 };
};

// Kept for backward compatibility but modified to just use the new function
export const getRouteInfo = async (lat1, lng1, lat2, lng2) => {
  const result = await fetchOSRMRoute(lat1, lng1, lat2, lng2);
  return { distance: result.distance, duration: result.duration };
};
