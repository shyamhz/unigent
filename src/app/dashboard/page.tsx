import DashboardLayout from '@/client/components/dashboard/DashboardLayout';
import { getConnectUrl } from '@/server/actions/corsair';
import { isHostedAvailable } from '@/server/services/corsair-hosted';

export default async function Home() {
  const connectUrl = isHostedAvailable() ? await getConnectUrl() : null;

  return (
    <DashboardLayout
      connectUrl={connectUrl}
    />
  );
}
