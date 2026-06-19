import DashboardLayout from '@/client/components/dashboard/DashboardLayout';
import { isHostedAvailable, isPluginConnected } from '@/server/services/corsair-hosted';
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

  // Check connection status from Corsair (source of truth)
  let gmailConnected = false;
  let calendarConnected = false;

  if (isHostedAvailable()) {
    try {
      [gmailConnected, calendarConnected] = await Promise.all([
        isPluginConnected(userId, 'gmail'),
        isPluginConnected(userId, 'googlecalendar'),
      ]);
    } catch {
      // Fall back to Clerk metadata if Corsair is unreachable
      const connections = (meta.connections ?? {}) as Record<string, unknown>;
      gmailConnected = connections.gmail === true;
      calendarConnected = connections.calendar === true;
    }
  }

  const showConnectBanner = isHostedAvailable() && (!gmailConnected || !calendarConnected);

  return (
    <DashboardLayout
      showConnectBanner={showConnectBanner}
      gmailConnected={gmailConnected}
      calendarConnected={calendarConnected}
    />
  );
}
