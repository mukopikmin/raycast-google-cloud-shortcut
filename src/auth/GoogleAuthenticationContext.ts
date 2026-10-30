import { createContext } from "react";

export const GoogleAuthenticationContext = createContext<(() => Promise<void>) | undefined>(undefined);
