import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import AIOptimizationDashboard from '@/components/AIOptimizationDashboard';

const AIOptimizationPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Phase 1: AI Optimization Dashboard - DelSolPrimeHomes</title>
        <meta name="description" content="Comprehensive AI optimization dashboard for Costa del Sol property content - targeting 9.8/10 AI citation score" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen pt-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Phase 1: AI Optimization Dashboard
              </h1>
              <p className="text-muted-foreground">
                Calculate AI optimization scores for all 168 QA articles targeting 9.8/10 citation readiness
              </p>
            </div>
            
            <AIOptimizationDashboard />
          </div>
        </div>
      </main>
    </>
  );
};

export default AIOptimizationPage;