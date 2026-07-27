import { Suspense } from "react";
import { UsersContent } from "./users-content";
import { UsersLoading } from "./users-loading";

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersLoading />}>
      <UsersContent />
    </Suspense>
  );
}
