"use client";

import { useEffect, useState } from "react";

export interface UTMs {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
}

export const useUTMs = (): UTMs => {
  const [utms, setUtms] = useState<UTMs>({
    source: "",
    medium: "",
    campaign: "",
    content: "",
    term: "",
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setUtms({
      source: urlParams.get("utm_source") || "",
      medium: urlParams.get("utm_medium") || "",
      campaign: urlParams.get("utm_campaign") || "",
      content: urlParams.get("utm_content") || "",
      term: urlParams.get("utm_term") || "",
    });
  }, []);

  return utms;
};
