export type FirestoreDatabaseType = "DATASTORE_MODE" | "FIRESTORE_NATIVE";

export type GoogleCloudDatabase = {
  id: string;
  location?: string;
  type: FirestoreDatabaseType;
  edition?: string;
};
