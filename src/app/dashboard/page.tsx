import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { checkConnections } from '@/app/actions/connections';
import { getConnectUrl } from '@/app/actions/corsair';

export default async function Home() {
  const connectionStatus = await checkConnections();
  const connectUrl = await getConnectUrl();

  const needsConnection = !connectionStatus.gmail || !connectionStatus.googlecalendar;

  return (
    <DashboardLayout
      connectionStatus={connectionStatus}
      connectUrl={needsConnection ? connectUrl : null}
    />
  );
}
