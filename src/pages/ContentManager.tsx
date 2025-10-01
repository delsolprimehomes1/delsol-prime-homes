import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { ContentImportManager } from '@/components/ContentImportManager';
import { FunnelValidationDashboard } from '@/components/FunnelValidationDashboard';
import { FunnelLinkManager } from '@/components/FunnelLinkManager';
import { EnhancedFunnelLinkManager } from '@/components/EnhancedFunnelLinkManager';
import { BottleneckResolutionDashboard } from '@/components/BottleneckResolutionDashboard';
import { ClusterFieldInterface } from '@/components/cluster/ClusterFieldInterface';
import { BlogFieldInterface } from '@/components/blog/BlogFieldInterface';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, FileText, Languages, Zap } from 'lucide-react';

const ContentManager = () => {
  const breadcrumbItems = [
    { label: 'Content Manager', current: true }
  ];

  return (
    <>
      <Helmet>
        <title>Content Manager - 400+ Questions Framework</title>
        <meta name="description" content="Manage multilingual content import for the Costa del Sol property knowledge base" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen pt-20">
        {/* Breadcrumb Navigation */}
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

        {/* Content Tabs */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="cluster" className="space-y-8">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="cluster">Cluster Mode</TabsTrigger>
                <TabsTrigger value="blog">Blog Manager</TabsTrigger>
                <TabsTrigger value="import">Bulk Import</TabsTrigger>
                <TabsTrigger value="funnel">Funnel Overview</TabsTrigger>
                <TabsTrigger value="bottlenecks">Fix Bottlenecks</TabsTrigger>
                <TabsTrigger value="links">Manual Linking</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cluster" className="space-y-6">
                <ClusterFieldInterface />
              </TabsContent>

              <TabsContent value="blog" className="space-y-6">
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
              </TabsContent>

              <TabsContent value="import" className="space-y-6">
                <ContentImportManager />
              </TabsContent>
              
              <TabsContent value="funnel" className="space-y-6">
                <FunnelValidationDashboard />
              </TabsContent>
              
              <TabsContent value="bottlenecks" className="space-y-6">
                <BottleneckResolutionDashboard />
              </TabsContent>
              
              <TabsContent value="links" className="space-y-6">
                <EnhancedFunnelLinkManager />
              </TabsContent>
              
              
              <TabsContent value="analytics" className="space-y-6">
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
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
    </>
  );
};

export default ContentManager;