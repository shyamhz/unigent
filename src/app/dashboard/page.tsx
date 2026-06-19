import DashboardLayout from '@/client/components/dashboard/DashboardLayout';
import { getConnectUrl } from '@/server/actions/corsair';
import { isHostedAvailable } from '@/server/services/corsair-hosted';
import { auth, clerkClient } from '@clerk/nextjs/server';

export default async function Home() {
  const { userId, sessionClaims } = await auth();

  let connectUrl: string | null = null;
  let gmailConnected = false;
  let calendarConnected = false;

  if (userId) {
    const meta = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
    const connections = (meta.connections ?? {}) as Record<string, unknown>;
    gmailConnected = connections.gmail === true;
    calendarConnected = connections.calendar === true;

    // Only show connect banner if not both connected
    if (isHostedAvailable() && (!gmailConnected || !calendarConnected)) {
      connectUrl = await getConnectUrl();
    }
  }

  return (
    <DashboardLayout
      connectUrl={connectUrl}
      gmailConnected={gmailConnected}
      calendarConnected={calendarConnected}
    />
  );
}
