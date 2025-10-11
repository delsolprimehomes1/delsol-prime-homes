import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Languages, 
  CheckCircle2, 
  AlertTriangle,
  BarChart3,
  Zap,
  FileText,
  Link,
  Map,
  Target
} from 'lucide-react';
import { runPhase3MultilingualImplementation, type MultilingualResult } from '@/utils/multilingual-translator';
import { generateAllLanguageSitemaps, writeSitemapFiles, getSitemapStatistics } from '@/utils/multilingual-sitemap';
import { SpanishContentFixer } from '@/components/SpanishContentFixer';

interface SitemapStats {
  [language: string]: {
    articles: number;
    lastUpdate: string;
  };
}

const Phase3MultilingualDashboard: React.FC = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingSitemaps, setIsGeneratingSitemaps] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [results, setResults] = useState<MultilingualResult | null>(null);
  const [sitemapStats, setSitemapStats] = useState<SitemapStats | null>(null);
  const [translationComplete, setTranslationComplete] = useState(false);

  const TARGET_SPANISH = 25;
  const TARGET_GERMAN = 20;
  const TARGET_TOTAL = 45; // Initial target: 25 Spanish + 20 German

  const handleStartTranslation = async () => {
    setIsTranslating(true);
    setTranslationComplete(false);
    setCurrentPhase('Preparing translation system...');

    try {
      // Phase 1: Spanish TOFU translations
      setCurrentPhase('🇪🇸 Creating Spanish translations for top 25 TOFU articles...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Visual delay
      
      // Phase 2: German investment/legal translations
      setCurrentPhase('🇩🇪 Creating German translations for 20 investment/legal articles...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Visual delay
      
      // Run the actual translation process
      const translationResults = await runPhase3MultilingualImplementation();
      setResults(translationResults);

      setCurrentPhase('✅ Multilingual implementation complete!');
      setTranslationComplete(true);
    } catch (error) {
      console.error('Translation failed:', error);
      setCurrentPhase('❌ Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerateSitemaps = async () => {
    setIsGeneratingSitemaps(true);
    try {
      setCurrentPhase('🗺️ Generating multilingual sitemaps...');
      
      // Generate sitemaps
      const sitemapData = await generateAllLanguageSitemaps();
      
      // Write sitemap files
      await writeSitemapFiles();
      
      // Get statistics
      const stats = await getSitemapStatistics();
      setSitemapStats(stats);
      
      setCurrentPhase('✅ Sitemaps generated successfully!');
    } catch (error) {
      console.error('Sitemap generation failed:', error);
      setCurrentPhase('❌ Sitemap generation failed');
    } finally {
      setIsGeneratingSitemaps(false);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  const getLanguageFlag = (language: string) => {
    const flags: Record<string, string> = {
      'en': '🇬🇧',
      'es': '🇪🇸',
      'de': '🇩🇪',
      'nl': '🇳🇱',
      'fr': '🇫🇷'
    };
    return flags[language] || '🌍';
  };

  const getLanguageName = (language: string) => {
    const names: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'de': 'German',
      'nl': 'Dutch',
      'fr': 'French'
    };
    return names[language] || language.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Spanish Content Fix Card */}
      <SpanishContentFixer />
      
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                Phase 3: Multilingual Implementation
              </CardTitle>
              <CardDescription>
                Expand beyond English with Spanish and German translations, hreflang support, and localized sitemaps
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleStartTranslation}
                disabled={isTranslating}
                className="min-w-[200px]"
              >
                {isTranslating ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4 mr-2" />
                    Start Translation
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleGenerateSitemaps}
                disabled={isGeneratingSitemaps}
                variant="outline"
              >
                {isGeneratingSitemaps ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Map className="w-4 h-4 mr-2" />
                    Generate Sitemaps
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Card */}
      {(isTranslating || isGeneratingSitemaps) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 animate-pulse" />
              Operation in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="animate-pulse w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">{currentPhase}</span>
              </div>
              <Progress value={results ? 100 : 50} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Dashboard */}
      {results && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Translations</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {results.totalTranslated}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {TARGET_TOTAL} articles
                </p>
                <Progress 
                  value={getProgressPercentage(results.totalTranslated, TARGET_TOTAL)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Spanish (es)</CardTitle>
                <span className="text-lg">🇪🇸</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {results.spanishArticles}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {TARGET_SPANISH} TOFU articles
                </p>
                <Progress 
                  value={getProgressPercentage(results.spanishArticles, TARGET_SPANISH)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">German (de)</CardTitle>
                <span className="text-lg">🇩🇪</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {results.germanArticles}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {TARGET_GERMAN} investment/legal
                </p>
                <Progress 
                  value={getProgressPercentage(results.germanArticles, TARGET_GERMAN)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getProgressPercentage(results.totalTranslated, TARGET_TOTAL)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Phase 3 progress
                </p>
                <Progress 
                  value={getProgressPercentage(results.totalTranslated, TARGET_TOTAL)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>
          </div>

          {/* Operation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Operation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{results.created}</div>
                  <p className="text-sm text-muted-foreground">✅ Created</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{results.updated}</div>
                  <p className="text-sm text-muted-foreground">🔄 Updated</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">{results.skipped}</div>
                  <p className="text-sm text-muted-foreground">⏭️ Skipped</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{results.errors}</div>
                  <p className="text-sm text-muted-foreground">❌ Errors</p>
                </div>
              </div>
              
              {results.errorLog && results.errorLog.length > 0 && (
                <Alert className="mt-4" variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">Translation Errors ({results.errorLog.length})</div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {results.errorLog.slice(0, 5).map((err, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-mono">{err.slug}</span>: {err.error}
                          {err.code && <span className="ml-2 opacity-70">({err.code})</span>}
                        </div>
                      ))}
                      {results.errorLog.length > 5 && (
                        <p className="text-xs italic">+{results.errorLog.length - 5} more errors</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Detailed Results */}
      {results && (
        <Tabs defaultValue="translations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="translations">Translations</TabsTrigger>
            <TabsTrigger value="sitemaps">Sitemaps</TabsTrigger>
            <TabsTrigger value="technical">Technical Details</TabsTrigger>
          </TabsList>

          <TabsContent value="translations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Translation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Spanish Translations */}
                  {results.spanishArticles > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        🇪🇸 Spanish Translations ({results.spanishArticles})
                      </h4>
                      <div className="grid gap-2">
                        {results.translationDetails
                          .filter(detail => detail.language === 'es')
                          .slice(0, 10)
                          .map((detail, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="font-medium">{detail.title}</span>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={detail.action === 'created' ? 'default' : detail.action === 'updated' ? 'secondary' : 'outline'}
                                  className="text-xs"
                                >
                                  {detail.action === 'created' ? '✅' : detail.action === 'updated' ? '🔄' : '⏭️'} {detail.action}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Link className="w-3 h-3 mr-1" />
                                  /qa/es/{detail.slug}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        {results.translationDetails.filter(d => d.language === 'es').length > 10 && (
                          <p className="text-xs text-muted-foreground">
                            +{results.translationDetails.filter(d => d.language === 'es').length - 10} more articles
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* German Translations */}
                  {results.germanArticles > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        🇩🇪 German Translations ({results.germanArticles})
                      </h4>
                      <div className="grid gap-2">
                        {results.translationDetails
                          .filter(detail => detail.language === 'de')
                          .slice(0, 10)
                          .map((detail, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="font-medium">{detail.title}</span>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={detail.action === 'created' ? 'default' : detail.action === 'updated' ? 'secondary' : 'outline'}
                                  className="text-xs"
                                >
                                  {detail.action === 'created' ? '✅' : detail.action === 'updated' ? '🔄' : '⏭️'} {detail.action}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <Link className="w-3 h-3 mr-1" />
                                  /qa/de/{detail.slug}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        {results.translationDetails.filter(d => d.language === 'de').length > 10 && (
                          <p className="text-xs text-muted-foreground">
                            +{results.translationDetails.filter(d => d.language === 'de').length - 10} more articles
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sitemaps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Multilingual Sitemaps
                </CardTitle>
                <CardDescription>
                  Generated sitemaps with hreflang annotations for each language
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sitemapStats ? (
                  <div className="space-y-3">
                    {Object.entries(sitemapStats).map(([language, stats]) => (
                      <div key={language} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getLanguageFlag(language)}</span>
                          <div>
                            <span className="font-medium">{getLanguageName(language)}</span>
                            <p className="text-xs text-muted-foreground">
                              sitemap-{language}.xml
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{stats.articles} URLs</div>
                          <div className="text-xs text-muted-foreground">
                            Updated: {new Date(stats.lastUpdate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Click "Generate Sitemaps" to create multilingual sitemaps
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technical Implementation</CardTitle>
                <CardDescription>
                  URL structure, hreflang, and JSON-LD implementation details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-semibold mb-2">URL Structure</h4>
                    <div className="space-y-1 text-sm font-mono">
                      <div>🇬🇧 English: /qa/article-slug</div>
                      <div>🇪🇸 Spanish: /qa/es/article-slug</div>
                      <div>🇩🇪 German: /qa/de/article-slug</div>
                      <div>🇳🇱 Dutch: /qa/nl/article-slug</div>
                      <div>🇫🇷 French: /qa/fr/article-slug</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-semibold mb-2">Hreflang Implementation</h4>
                    <ul className="text-sm space-y-1">
                      <li>✅ Automatic hreflang link generation</li>
                      <li>✅ x-default pointing to English</li>
                      <li>✅ Canonical URL for each language</li>
                      <li>✅ Cross-language sameAs in JSON-LD</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-semibold mb-2">SEO Features</h4>
                    <ul className="text-sm space-y-1">
                      <li>✅ Language-specific meta descriptions</li>
                      <li>✅ Multilingual JSON-LD structured data</li>
                      <li>✅ OpenGraph locale support</li>
                      <li>✅ Speakable markup for voice search</li>
                      <li>✅ Localized sitemaps with hreflang</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Success Alert */}
      {translationComplete && results && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Phase 3 Complete!</strong> Created {results.totalTranslated} translations: 
            {results.spanishArticles} Spanish articles and {results.germanArticles} German articles. 
            Multilingual structure with hreflang and sameAs linking is now active.
            {results.totalTranslated >= TARGET_TOTAL ? ' 🎉 Target achieved!' : ` Progress: ${getProgressPercentage(results.totalTranslated, TARGET_TOTAL)}% of target.`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Phase3MultilingualDashboard;