export type SecretManagerSecret = {
  id: string;
  name: string;
  url: string;
};

export type SecretManagerSecretsResponse = {
  secrets: { name: string }[];
};
