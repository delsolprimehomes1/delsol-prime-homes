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
import { Button } from '@/components/ui/button';
import { Database, FileText, Languages, Zap, Layers, Upload, Calendar, Workflow, AlertTriangle, Link as LinkIcon, BarChart } from 'lucide-react';

const ContentManager = () => {
  const [activeView, setActiveView] = useState('cluster');
  
  const breadcrumbItems = [
    { label: 'Content Manager', current: true }
  ];

  const navigationGroups = [
    {
      label: 'Content Creation',
      items: [
        { id: 'cluster', title: 'Cluster Mode', icon: Layers },
        { id: 'blog', title: 'Blog Manager', icon: FileText },
        { id: 'import', title: 'Bulk Import', icon: Upload },
      ],
    },
    {
      label: 'Publishing',
      items: [
        { id: 'scheduled', title: 'Scheduled', icon: Calendar },
      ],
    },
    {
      label: 'Optimization',
      items: [
        { id: 'funnel', title: 'Funnel Overview', icon: Workflow },
        { id: 'bottlenecks', title: 'Fix Bottlenecks', icon: AlertTriangle },
        { id: 'links', title: 'Manual Linking', icon: LinkIcon },
      ],
    },
    {
      label: 'Insights',
      items: [
        { id: 'analytics', title: 'Analytics', icon: BarChart },
      ],
    },
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
      
      <div className="min-h-screen">
        <Navbar />
        
        <main className="pt-20">
          {/* Breadcrumb */}
          <section className="py-4 bg-background border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Horizontal Navigation */}
          <section className="bg-background border-b sticky top-16 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-wrap gap-6">
                {navigationGroups.map((group) => (
                  <div key={group.label} className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">
                      {group.label}
                    </span>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeView === item.id;
                      return (
                        <Button
                          key={item.id}
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setActiveView(item.id)}
                          className="gap-2"
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{item.title}</span>
                        </Button>
                      );
                    })}
                  </div>
                ))}
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
    </>
  );
};

export default ContentManager;