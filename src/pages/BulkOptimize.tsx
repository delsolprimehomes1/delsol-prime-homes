import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import Navbar from '@/components/Navbar';
import { BulkOptimizationDashboard } from '@/components/BulkOptimizationDashboard';
import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';

const BulkOptimize = () => {
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-center">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-64"></div>
                <div className="h-4 bg-muted rounded w-48"></div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Bulk Content Optimization - DelSolPrimeHomes Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Navbar />
      <main className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Admin Badge */}
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-muted-foreground">Admin Only</span>
          </div>

          <BulkOptimizationDashboard />
        </div>
      </main>
    </>
  );
};

export default BulkOptimize;
