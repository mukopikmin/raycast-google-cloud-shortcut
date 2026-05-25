export type Location = {
  id: string;
  name: string;
};

const locationDisplayNames: Record<string, string> = {
  "asia-east1": "Taiwan",
  "asia-east2": "Hong Kong",
  "asia-northeast1": "Tokyo",
  "asia-northeast2": "Osaka",
  "asia-northeast3": "Seoul",
  "asia-south1": "Mumbai",
  "asia-southeast1": "Singapore",
  "asia-southeast2": "Jakarta",
  "australia-southeast1": "Sydney",
  "europe-central2": "Warsaw",
  "europe-north1": "Finland",
  "europe-west1": "Belgium",
  "europe-west2": "London",
  "europe-west3": "Frankfurt",
  "europe-west4": "Netherlands",
  "europe-west6": "Zurich",
  "me-central1": "Doha",
  "me-central2": "Dammam",
  "me-west1": "Tel Aviv",
  "northamerica-northeast1": "Montreal",
  "southamerica-east1": "Sao Paulo",
  "us-central1": "Iowa",
  "us-east1": "South Carolina",
  "us-east4": "Northern Virginia",
  "us-west1": "Oregon",
  "us-west2": "Los Angeles",
  "us-west3": "Salt Lake City",
  "us-west4": "Las Vegas",
  asia: "Asia",
  europe: "Europe",
  us: "United States",
};

export const createLocation = (locationId: string, displayName?: string): Location => {
  return {
    id: locationId,
    name: displayName && displayName !== locationId ? displayName : (locationDisplayNames[locationId] ?? locationId),
  };
};
