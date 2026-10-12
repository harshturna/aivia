"use client";

import { useEffect, useState } from "react";

/**
 * Whether the main pointer is a mouse or trackpad (TICKET-076): dragging pieces is offered only
 * then, so a long press on a phone does not start the system's drag and drop.
 */
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    setFine(query.matches);
    const on = () => setFine(query.matches);
    query.addEventListener("change", on);
    return () => query.removeEventListener("change", on);
  }, []);
  return fine;
}
