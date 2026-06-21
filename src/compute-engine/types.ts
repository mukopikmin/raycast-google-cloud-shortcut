export type ComputeEngineInstance = {
  id: string;
  name: string;
  status: string;
  zone: string;
  machineType: string;
  internalIp?: string;
  externalIp?: string;
  url: string;
};
