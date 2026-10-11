"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RetryButton() {
  return (
    <Button className="mt-6" onClick={() => window.location.reload()}>
      <RotateCw className="size-4" aria-hidden />
      Reintentar
    </Button>
  );
}
