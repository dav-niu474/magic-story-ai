'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive, Search, Download, Check, Users, GitBranch, Film, Globe, ListTree,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  genre: string;
  description: string;
}

interface AssetLink {
  id: string;
  projectId: string;
  assetType: string;
  sourceAssetId: string;
  sourceProjectId: string;
  sourceAsset: Record<string, unknown> | null;
}

interface AssetLibraryProps {
  projectId: string;
}

type AssetTab = 'character' | 'plot' | 'scene' | 'world';

const ASSET_TABS: { id: AssetTab; label: string; icon: React.ReactNode; accent: string }[] = [
  { id: 'character', label: '角色', icon: <Users size={14} />, accent: 'text-rose-400' },
  { id: 'plot', label: '剧情', icon: <GitBranch size={14} />, accent: 'text-amber-400' },
  { id: 'scene', label: '场景', icon: <Film size={14} />, accent: 'text-orange-400' },
  { id: 'world', label: '世界观', icon: <Globe size={14} />, accent: 'text-teal-400' },
];

export function AssetLibrary({ projectId }: AssetLibraryProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AssetTab>('character');
  const [assets, setAssets] = useState<Array<Record<string, unknown>>>([]);
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          // Exclude current project
          const otherProjects = data.filter((p: Project) => p.id !== projectId);
          setProjects(otherProjects);
          if (otherProjects.length > 0) {
            setSelectedProjectId(otherProjects[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to fetch projects:', e);
      }
    };
    fetchProjects();
  }, [projectId]);

  // Fetch linked assets
  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch(`/api/asset-links?projectId=${projectId}`);
      if (res.ok) {
        const links: AssetLink[] = await res.json();
        const ids = new Set<string>();
        links.forEach(l => ids.add(l.sourceAssetId));
        setLinkedIds(ids);
      }
    } catch (e) {
      console.error('Failed to fetch asset links:', e);
    }
  }, [projectId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Fetch assets from selected project
  const fetchAssets = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      let url = '';
      switch (activeTab) {
        case 'character': url = `/api/characters?projectId=${selectedProjectId}`; break;
        case 'plot': url = `/api/plots?projectId=${selectedProjectId}`; break;
        case 'scene': url = `/api/scenes?projectId=${selectedProjectId}`; break;
        case 'world': url = `/api/world-settings?projectId=${selectedProjectId}`; break;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (activeTab === 'character') {
          setAssets(data.characters || []);
        } else {
          setAssets(Array.isArray(data) ? data : []);
        }
      }
    } catch (e) {
      console.error('Failed to fetch assets:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, activeTab]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleImport = async (assetId: string) => {
    setImporting(assetId);
    try {
      const res = await fetch('/api/asset-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          assetType: activeTab,
          sourceAssetId: assetId,
          sourceProjectId: selectedProjectId,
        }),
      });
      if (res.ok) {
        await fetchLinks();
        await fetchAssets();
      }
    } catch (e) {
      console.error('Failed to import asset:', e);
    } finally {
      setImporting(null);
    }
  };

  const filteredAssets = assets.filter(a => {
    if (!searchQuery) return true;
    const name = (a.name as string) || '';
    const description = (a.description as string) || '';
    return name.includes(searchQuery) || description.includes(searchQuery);
  });

  const sourceProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Archive size={20} className="text-blue-400" />
        <h2 className="text-lg font-bold text-foreground">跨项目资产库</h2>
        <Badge variant="secondary" className="text-xs">{linkedIds.size} 已导入</Badge>
      </div>

      {/* Project Selector */}
      <Card className="bg-card/50 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground font-medium shrink-0">源项目</label>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="flex-1 h-9 px-3 bg-secondary border border-input rounded-md text-sm text-foreground focus:outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.genre})</option>
              ))}
            </select>
            {sourceProject && (
              <span className="text-xs text-muted-foreground">{sourceProject.description?.slice(0, 50)}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Asset Type Tabs */}
      <div className="flex gap-1">
        {ASSET_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                isActive
                  ? `bg-primary/10 ${tab.accent} font-medium`
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={`搜索${ASSET_TABS.find(t => t.id === activeTab)?.label}...`}
          className="pl-8 text-sm h-8"
        />
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-secondary/30 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !selectedProjectId ? (
        <div className="text-center py-12 text-muted-foreground">
          <Archive size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">请选择一个源项目</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">该项目没有{ASSET_TABS.find(t => t.id === activeTab)?.label}资产</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredAssets.map(asset => {
            const assetId = asset.id as string;
            const isLinked = linkedIds.has(assetId);
            const isImporting = importing === assetId;
            return (
              <motion.div
                key={assetId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <Card className={`bg-card/50 ${isLinked ? 'border-emerald-500/25' : 'border-border/50'} hover:border-border transition-colors h-full`}>
                  <CardContent className="p-3 flex flex-col h-full">
                    {/* Character portrait */}
                    {activeTab === 'character' && (asset.portraitUrl as string) && (
                      <img
                        src={asset.portraitUrl as string}
                        alt={asset.name as string}
                        className="w-full h-20 object-cover rounded-md mb-2"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-medium text-foreground text-sm truncate">{asset.name as string}</span>
                        {asset.role && (
                          <Badge variant="outline" className="text-[9px] shrink-0">{asset.role as string}</Badge>
                        )}
                        {asset.plotType && (
                          <Badge variant="outline" className="text-[9px] shrink-0">{asset.plotType as string}</Badge>
                        )}
                        {asset.type && (
                          <Badge variant="outline" className="text-[9px] shrink-0">{asset.type as string}</Badge>
                        )}
                      </div>
                      {(asset.description as string) && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{(asset.description as string).slice(0, 80)}</p>
                      )}
                      {(asset.location as string) && (
                        <p className="text-[10px] text-muted-foreground mt-1">📍 {asset.location as string}</p>
                      )}
                    </div>
                    <div className="mt-2">
                      {isLinked ? (
                        <Button size="sm" variant="ghost" className="w-full h-7 text-xs text-emerald-400" disabled>
                          <Check size={12} className="mr-1" />已导入
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs"
                          disabled={isImporting}
                          onClick={() => handleImport(assetId)}
                        >
                          {isImporting ? '导入中...' : (
                            <><Download size={12} className="mr-1" />导入</>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
