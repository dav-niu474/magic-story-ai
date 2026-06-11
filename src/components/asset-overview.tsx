'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Users,
  GitBranch,
  Film,
  Globe,
  ListTree,
  ArrowRight,
  Import,
  Clock,
} from 'lucide-react';

interface AssetOverviewProps {
  projectId: string;
}

interface AssetCounts {
  characters: number;
  plots: number;
  scenes: number;
  worldSettings: number;
  outlines: number;
}

const STAT_CARDS = [
  { key: 'characters' as keyof AssetCounts, label: '角色', icon: Users, color: 'rose', accent: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', subView: 'characters' as const },
  { key: 'plots' as keyof AssetCounts, label: '剧情', icon: GitBranch, color: 'amber', accent: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', subView: 'plots' as const },
  { key: 'scenes' as keyof AssetCounts, label: '场景', icon: Film, color: 'orange', accent: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', subView: 'scenes' as const },
  { key: 'worldSettings' as keyof AssetCounts, label: '世界观', icon: Globe, color: 'teal', accent: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', subView: 'world' as const },
  { key: 'outlines' as keyof AssetCounts, label: '大纲', icon: ListTree, color: 'blue', accent: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', subView: 'overview' as const },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function AssetOverview({ projectId }: AssetOverviewProps) {
  const [counts, setCounts] = useState<AssetCounts>({ characters: 0, plots: 0, scenes: 0, worldSettings: 0, outlines: 0 });
  const [recentItems, setRecentItems] = useState<Array<{ type: string; name: string; time: string }>>([]);
  const [loading, setLoading] = useState(true);
  const { setAssetSubView } = useAppStore();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [charRes, plotRes, sceneRes, worldRes, outlineRes] = await Promise.all([
        fetch(`/api/characters?projectId=${projectId}`),
        fetch(`/api/plots?projectId=${projectId}`),
        fetch(`/api/scenes?projectId=${projectId}`),
        fetch(`/api/world-settings?projectId=${projectId}`),
        fetch(`/api/outlines?projectId=${projectId}`),
      ]);

      const newCounts: AssetCounts = { characters: 0, plots: 0, scenes: 0, worldSettings: 0, outlines: 0 };
      const recent: Array<{ type: string; name: string; time: string }> = [];

      if (charRes.ok) {
        const data = await charRes.json();
        newCounts.characters = data.characters?.length || 0;
        (data.characters || []).slice(-3).forEach((c: { name: string; updatedAt: string }) => {
          recent.push({ type: '角色', name: c.name, time: c.updatedAt });
        });
      }
      if (plotRes.ok) {
        const data = await plotRes.json();
        newCounts.plots = data.length || 0;
        (data || []).slice(-2).forEach((p: { name: string; updatedAt: string }) => {
          recent.push({ type: '剧情', name: p.name, time: p.updatedAt });
        });
      }
      if (sceneRes.ok) {
        const data = await sceneRes.json();
        newCounts.scenes = data.length || 0;
        (data || []).slice(-2).forEach((s: { name: string; updatedAt: string }) => {
          recent.push({ type: '场景', name: s.name, time: s.updatedAt });
        });
      }
      if (worldRes.ok) {
        const data = await worldRes.json();
        newCounts.worldSettings = data.length || 0;
        (data || []).slice(-2).forEach((w: { name: string; updatedAt: string }) => {
          recent.push({ type: '世界观', name: w.name, time: w.updatedAt });
        });
      }
      if (outlineRes.ok) {
        const data = await outlineRes.json();
        newCounts.outlines = data.length || 0;
      }

      // Sort recent by time
      recent.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentItems(recent.slice(0, 8));
      setCounts(newCounts);
    } catch (e) {
      console.error('Failed to fetch overview data:', e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalAssets = counts.characters + counts.plots + counts.scenes + counts.worldSettings + counts.outlines;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">项目资产总览</h2>
          <p className="text-sm text-muted-foreground mt-1">共 {totalAssets} 项资产</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAssetSubView('library')}
          className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
        >
          <Import size={14} className="mr-1.5" />
          从资产库导入
        </Button>
      </div>

      {/* Stats cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <motion.div key={card.key} variants={item}>
              <Card className={`${card.bg} ${card.border} border hover:scale-[1.02] transition-transform cursor-pointer`}
                onClick={() => setAssetSubView(card.subView)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={18} className={card.accent} />
                    <span className="text-2xl font-bold text-foreground">{counts[card.key]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setAssetSubView(card.subView); }}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mt-2 transition-colors"
                  >
                    查看全部 <ArrowRight size={10} />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Activity */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">最近更新</h3>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-secondary/30 rounded animate-pulse" />
              ))}
            </div>
          ) : recentItems.length > 0 ? (
            <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
              {recentItems.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded hover:bg-secondary/30 transition-colors">
                  <Badge variant="outline" className="text-[10px] shrink-0">{r.type}</Badge>
                  <span className="text-foreground truncate">{r.name}</span>
                  <span className="text-muted-foreground ml-auto shrink-0">
                    {new Date(r.time).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-xs">
              暂无最近更新
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">快速创建</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setAssetSubView('characters')} className="text-rose-400 border-rose-400/20 hover:bg-rose-400/10">
              <Users size={14} className="mr-1.5" />新建角色
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAssetSubView('plots')} className="text-amber-400 border-amber-400/20 hover:bg-amber-400/10">
              <GitBranch size={14} className="mr-1.5" />新建剧情
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAssetSubView('scenes')} className="text-orange-400 border-orange-400/20 hover:bg-orange-400/10">
              <Film size={14} className="mr-1.5" />新建场景
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAssetSubView('world')} className="text-teal-400 border-teal-400/20 hover:bg-teal-400/10">
              <Globe size={14} className="mr-1.5" />新建世界观
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
