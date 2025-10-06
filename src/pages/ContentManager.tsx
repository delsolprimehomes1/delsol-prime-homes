import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { ContentImportManager } from '@/components/ContentImportManager';
import { FunnelValidationDashboard } from '@/components/FunnelValidationDashboard';
import { EnhancedFunnelLinkManager } from '@/components/EnhancedFunnelLinkManager';
import { BottleneckResolutionDashboard } from '@/components/BottleneckResolutionDashboard';
import { ClusterFieldInterface } from '@/components/cluster/ClusterFieldInterface';
import { BlogFieldInterface } from '@/components/blog/BlogFieldInterface';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ContentManagerSidebar } from '@/components/content-manager/ContentManagerSidebar';
import { Database, FileText, Languages, Zap } from 'lucide-react';

const ContentManager = () => {
  const [activeView, setActiveView] = useState('cluster');
  
  const breadcrumbItems = [
    { label: 'Content Manager', current: true }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'cluster':
        return <ClusterFieldInterface />;
      case 'blog':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Blog Content Manager</CardTitle>
              <CardDescription>
                Create TOFU/MOFU/BOFU blog posts linked to QA clusters with comprehensive schema support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlogFieldInterface />
            </CardContent>
          </Card>
        );
      case 'import':
        return <ContentImportManager />;
      case 'scheduled':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Publications</CardTitle>
              <CardDescription>
                View and manage scheduled QA cluster publications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Redirecting to Scheduled Content dashboard...
              </p>
              <iframe 
                src="/scheduled-content" 
                className="w-full h-[600px] border-0 rounded-lg"
                title="Scheduled Content"
              />
            </CardContent>
          </Card>
        );
      case 'funnel':
        return <FunnelValidationDashboard />;
      case 'bottlenecks':
        return <BottleneckResolutionDashboard />;
      case 'links':
        return <EnhancedFunnelLinkManager />;
      case 'analytics':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
              <CardDescription>
                Track import progress and content performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Content Manager - 400+ Questions Framework</title>
        <meta name="description" content="Manage multilingual content import for the Costa del Sol property knowledge base" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <ContentManagerSidebar 
            activeView={activeView} 
            onViewChange={setActiveView} 
          />
          
          <div className="flex-1">
            <Navbar />
            
            <main className="pt-20">
              {/* Header with Sidebar Toggle */}
              <section className="py-4 bg-background border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
                  <SidebarTrigger />
                  <Breadcrumb items={breadcrumbItems} />
                </div>
              </section>
              
              {/* Hero Section */}
              <section className="luxury-gradient py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-4xl mx-auto">
                    <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                      Content Management Center
                    </h1>
                    <p className="text-lg sm:text-xl text-white/90 mb-8">
                      Import and manage the 400+ multilingual questions framework
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                      <Badge className="bg-white/10 text-white border-white/20 px-4 py-2">
                        <Database className="w-4 h-4 mr-2" />
                        Enhanced Database Schema
                      </Badge>
                      <Badge className="bg-white/10 text-white border-white/20 px-4 py-2">
                        <Languages className="w-4 h-4 mr-2" />
                        7 Languages Supported
                      </Badge>
                      <Badge className="bg-white/10 text-white border-white/20 px-4 py-2">
                        <FileText className="w-4 h-4 mr-2" />
                        JSON-LD Optimized
                      </Badge>
                      <Badge className="bg-white/10 text-white border-white/20 px-4 py-2">
                        <Zap className="w-4 h-4 mr-2" />
                        AI/LLM Ready
                      </Badge>
                    </div>
                  </div>
                </div>
              </section>

              {/* Content Area */}
              <section className="py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  {renderContent()}
                </div>
              </section>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default ContentManager;