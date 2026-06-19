import DashboardLayout from '@/client/components/dashboard/DashboardLayout';
import { getConnectUrl } from '@/server/actions/corsair';
import { isHostedAvailable } from '@/server/services/corsair-hosted';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = (user.publicMetadata ?? {}) as Record<string, unknown>;

  // Gate: if not approved, redirect to waiting page
  if (meta.access_allowed !== true) {
    redirect('/waiting');
  }

  const connections = (meta.connections ?? {}) as Record<string, unknown>;
  const gmailConnected = connections.gmail === true;
  const calendarConnected = connections.calendar === true;

  let connectUrl: string | null = null;
  if (isHostedAvailable() && (!gmailConnected || !calendarConnected)) {
    connectUrl = await getConnectUrl();
  }

  return (
    <DashboardLayout
      connectUrl={connectUrl}
      gmailConnected={gmailConnected}
      calendarConnected={calendarConnected}
    />
  );
}
