"use client";

import { useCallback, useState } from "react";
import { initiateWhopAuth } from "@/lib/iframe";
import { Button } from "@/components/ui/button";

export function WhopAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      await initiateWhopAuth();
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Button onClick={handleAuth} disabled={isLoading}>
      {isLoading ? "Connecting..." : "Connect with Whop"}
    </Button>
  );
}

