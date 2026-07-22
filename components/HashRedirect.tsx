"use client";

import { useEffect } from "react";

export default function HashRedirect({ id }: { id: string }) {
  useEffect(() => {
    window.location.replace(`/#${id}`);
  }, [id]);

  return null;
}
