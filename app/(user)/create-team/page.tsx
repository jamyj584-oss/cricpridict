import { Suspense } from "react";
import CreateTeamClient from "./CreateTeamClient";
import LoadingFallback from "../components/LoadingFallback";

export const dynamic = "force-dynamic";

export default function CreateTeamPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateTeamClient />
    </Suspense>
  );
}
