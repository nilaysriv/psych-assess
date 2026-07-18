import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LogoutButton } from "./logout-button";

export default async function DashboardPage() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({ where: { id: session.userId } })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AssessTrack</h1>
            <p className="text-sm text-gray-500">Signed in as {user?.name ?? user?.email}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          Templates, client roster, and the Awaiting Response queue land here next.
        </div>
      </div>
    </div>
  );
}
