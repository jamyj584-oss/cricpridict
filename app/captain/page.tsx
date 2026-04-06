import { Suspense } from "react";
import CaptainSelectionClient from "./CaptainSelectionClient";
import LoadingFallback from "../components/LoadingFallback";

export const dynamic = "force-dynamic";

export default function CaptainPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CaptainSelectionClient />
    </Suspense>
  );
}
