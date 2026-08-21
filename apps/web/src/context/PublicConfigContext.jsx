"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { LINKS } from "@veyronix/config";

const PublicConfigContext = createContext({
  supportServer: LINKS.SUPPORT_SERVER,
});

export function PublicConfigProvider({ children }) {
  const [config, setConfig] = useState({
    supportServer: LINKS.SUPPORT_SERVER,
  });

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data?.supportServer) {
          setConfig({ supportServer: data.supportServer });
        }
      })
      .catch(() => {
        // Hata olursa config dosyasindaki varsayilan kullanilmaya devam eder
      });
  }, []);

  return (
    <PublicConfigContext.Provider value={config}>
      {children}
    </PublicConfigContext.Provider>
  );
}

export function usePublicConfig() {
  return useContext(PublicConfigContext);
}
