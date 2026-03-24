import axios from "axios";

export const getCoordinatesFromAddress = async (
  address: string
): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const response = await axios.get(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}`
    );

    if (
      response.data &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.data.features &&
      response.data.features.length > 0
    ) {
      // First feature
      const feature = response.data.features[0];
      if (feature.geometry && feature.geometry.coordinates) {
        // GeoJSON coordinates are [longitude, latitude]
        const [longitude, latitude] = feature.geometry.coordinates;
        return { latitude, longitude };
      }
    }
    return null;
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
};

export const calculateDistanceInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};
