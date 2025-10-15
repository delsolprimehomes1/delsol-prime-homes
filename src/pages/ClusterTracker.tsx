import { Helmet } from 'react-helmet-async';
import { ClusterTrackerDashboard } from '@/components/ClusterTrackerDashboard';

const ClusterTracker = () => {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Admin: Cluster Tracker - Internal Tool</title>
      </Helmet>
      <ClusterTrackerDashboard />
    </>
  );
};

export default ClusterTracker;
