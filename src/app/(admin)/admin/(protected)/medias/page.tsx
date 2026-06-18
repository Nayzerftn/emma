import { AdminHeading } from "@/components/admin/AdminShell";
import { MediaManager } from "@/components/admin/MediaManager";

export default function AdminMedias() {
  return (
    <>
      <AdminHeading
        title="Médias"
        description="Photos du site (bucket public site-photos)."
      />
      <MediaManager />
    </>
  );
}
