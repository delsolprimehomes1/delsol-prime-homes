import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIOptimizationDashboard from '@/components/AIOptimizationDashboard';
import Phase2ContentEnhancer from '@/components/Phase2ContentEnhancer';
import Phase3MultilingualDashboard from '@/components/Phase3MultilingualDashboard';

const AIOptimizationPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AI Content Optimization Suite - DelSolPrimeHomes</title>
        <meta name="description" content="Complete 3-phase AI optimization system for Costa del Sol property content - scoring, enhancement, and multilingual distribution" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen pt-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                AI Content Optimization Suite
              </h1>
              <p className="text-muted-foreground">
                Complete 3-phase system: AI scoring, content enhancement, and multilingual distribution for Costa del Sol property content
              </p>
            </div>
            
            <Tabs defaultValue="phase1" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="phase1">Phase 1: AI Scoring</TabsTrigger>
                <TabsTrigger value="phase2">Phase 2: Content Enhancement</TabsTrigger>
                <TabsTrigger value="phase3">Phase 3: Multilingual</TabsTrigger>
              </TabsList>
              
              <TabsContent value="phase1" className="space-y-6">
                <AIOptimizationDashboard />
              </TabsContent>
              
              <TabsContent value="phase2" className="space-y-6">
                <Phase2ContentEnhancer />
              </TabsContent>
              
              <TabsContent value="phase3" className="space-y-6">
                <Phase3MultilingualDashboard />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
};

export default AIOptimizationPage;