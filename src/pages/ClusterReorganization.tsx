import { Helmet } from 'react-helmet-async';
import { ClusterReorganizationDashboard } from '@/components/ClusterReorganizationDashboard';

const ClusterReorganization = () => {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Admin: Cluster Reorganization - Internal Tool</title>
      </Helmet>
      <ClusterReorganizationDashboard />
    </>
  );
};

export default ClusterReorganization;
