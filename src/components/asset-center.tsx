'use client';

import { useAppStore, AssetSubView } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Film,
  Globe,
  Archive,
} from 'lucide-react';
import { AssetOverview } from '@/components/asset-overview';
import { CharacterAssets } from '@/components/character-assets';
import { PlotAssets } from '@/components/plot-assets';
import { SceneAssets } from '@/components/scene-assets';
import { WorldAssets } from '@/components/world-assets';
import { AssetLibrary } from '@/components/asset-library';

interface AssetCenterProps {
  projectId: string;
}

const SUB_NAV_ITEMS: { id: AssetSubView; label: string; icon: React.ReactNode; accent: string }[] = [
  { id: 'overview', label: '总览', icon: <LayoutDashboard size={16} />, accent: 'text-amber-400' },
  { id: 'characters', label: '角色', icon: <Users size={16} />, accent: 'text-rose-400' },
  { id: 'plots', label: '剧情', icon: <GitBranch size={16} />, accent: 'text-amber-400' },
  { id: 'scenes', label: '场景', icon: <Film size={16} />, accent: 'text-orange-400' },
  { id: 'world', label: '世界观', icon: <Globe size={16} />, accent: 'text-teal-400' },
  { id: 'library', label: '资产库', icon: <Archive size={16} />, accent: 'text-blue-400' },
];

export function AssetCenter({ projectId }: AssetCenterProps) {
  const { assetSubView, setAssetSubView } = useAppStore();

  const renderContent = () => {
    switch (assetSubView) {
      case 'overview':
        return <AssetOverview projectId={projectId} />;
      case 'characters':
        return <CharacterAssets projectId={projectId} />;
      case 'plots':
        return <PlotAssets projectId={projectId} />;
      case 'scenes':
        return <SceneAssets projectId={projectId} />;
      case 'world':
        return <WorldAssets projectId={projectId} />;
      case 'library':
        return <AssetLibrary projectId={projectId} />;
      default:
        return <AssetOverview projectId={projectId} />;
    }
  };

  return (
    <div className="flex h-full gap-0">
      {/* Left sub-navigation */}
      <nav className="w-44 shrink-0 border-r border-border/50 pr-2">
        <div className="space-y-0.5 pt-1">
          {SUB_NAV_ITEMS.map(item => {
            const isActive = assetSubView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAssetSubView(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? `bg-primary/10 ${item.accent} font-medium`
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <span className={isActive ? item.accent : ''}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pl-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={assetSubView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
