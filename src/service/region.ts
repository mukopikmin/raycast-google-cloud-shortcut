export type RegionID =
  | "asia-east1"
  | "asia-east2"
  | "asia-northeast1"
  | "asia-northeast2"
  | "asia-northeast3"
  | "asia-south1"
  | "asia-southeast1"
  | "asia-southeast2"
  | "australia-southeast1"
  | "europe-north1"
  | "europe-west1"
  | "europe-west2"
  | "europe-west3"
  | "europe-west4"
  | "europe-west6"
  | "northamerica-northeast1"
  | "southamerica-east1"
  | "us-central1"
  | "us-east1"
  | "us-east4"
  | "us-west1";

export type Region = {
  id: RegionID;
  name: string;
};

export const regions: Region[] = [
  { id: "asia-east1", name: "Asia East 1 (Taiwan)" },
  { id: "asia-east2", name: "Asia East 2 (Hong Kong)" },
  { id: "asia-northeast1", name: "Asia Northeast 1 (Tokyo)" },
  { id: "asia-northeast2", name: "Asia Northeast 2 (Osaka)" },
  { id: "asia-northeast3", name: "Asia Northeast 3 (Seoul)" },
  { id: "asia-south1", name: "Asia South 1 (Mumbai)" },
  { id: "asia-southeast1", name: "Asia Southeast 1 (Singapore)" },
  { id: "asia-southeast2", name: "Asia Southeast 2 (Jakarta)" },
  { id: "australia-southeast1", name: "Australia Southeast 1 (Sydney)" },
  { id: "europe-north1", name: "Europe North 1 (Finland)" },
  { id: "europe-west1", name: "Europe West 1 (Belgium)" },
  { id: "europe-west2", name: "Europe West 2 (London)" },
  { id: "europe-west3", name: "Europe West 3 (Frankfurt)" },
  { id: "europe-west4", name: "Europe West 4 (Netherlands)" },
  { id: "europe-west6", name: "Europe West 6 (Zurich)" },
  { id: "northamerica-northeast1", name: "North America Northeast 1 (Montreal)" },
  { id: "southamerica-east1", name: "South America East 1 (São Paulo)" },
  { id: "us-central1", name: "US Central 1 (Iowa)" },
  { id: "us-east1", name: "US East 1 (South Carolina)" },
  { id: "us-east4", name: "US East 4 (Northern Virginia)" },
  { id: "us-west1", name: "US West 1 (Oregon)" },
];
