import React from 'react';
import { ChevronDown, Search, X, Users, Filter } from 'lucide-react';
import { FilterState, TagCategory, TeamMember, FunnelStage } from '../types';

interface ControlsBarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  tags: TagCategory[];
  members: TeamMember[];
  onOpenNewTask: () => void;
  availableMonths: string[];
}

const FUNNEL_FILTER_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Funnels' },
  { id: 'TOF', label: '⚡ TOF (Top of Funnel)' },
  { id: 'MOF', label: '🔍 MOF (Middle of Funnel)' },
  { id: 'BOF', label: '🎯 BOF (Bottom of Funnel)' },
  { id: 'Retention', label: '💎 Retention' },
];

export const ControlsBar: React.FC<ControlsBarProps> = ({
  filters,
  onFilterChange,
  tags,
  members,
  onOpenNewTask,
  availableMonths,
}) => {
  const formatMonthOption = (mStr: string) => {
    if (mStr === 'all') return 'All Time';
    try {
      const [year, month] = mStr.split('-');
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return mStr;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-[1520px] mx-auto mb-5">
      <div className="flex flex-wrap items-center gap-2.5">
        
        {/* Month Selector */}
        <div className="relative inline-block">
          <select
            id="select-month-filter"
            value={filters.monthKey}
            onChange={(e) => onFilterChange({ monthKey: e.target.value })}
            className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl pl-3.5 pr-8 py-2 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthOption(m)}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Assignee Filter Dropdown */}
        <div className="relative inline-block">
          <select
            id="select-assignee-filter"
            value={filters.assigneeId}
            onChange={(e) => onFilterChange({ assigneeId: e.target.value })}
            className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer min-w-[130px]"
          >
            <option value="everyone">Everyone</option>
            <optgroup label="Video Editors">
              {members
                .filter((m) => m.role === 'video_editor')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    🎬 {m.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Graphic Designers">
              {members
                .filter((m) => m.role === 'graphic_designer')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    🎨 {m.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Performance Marketing & Leads">
              {members
                .filter((m) => m.role === 'performance_marketer' || m.role === 'team_lead')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    📈 {m.name}
                  </option>
                ))}
            </optgroup>
            <option value="unassigned">Unassigned Only</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Funnel Stage Filter (TOF, MOF, BOF, Retention) */}
        <div className="relative inline-block">
          <select
            id="select-funnel-filter"
            value={filters.funnelFilter}
            onChange={(e) => onFilterChange({ funnelFilter: e.target.value })}
            className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium rounded-xl pl-3.5 pr-8 py-2 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer min-w-[130px]"
          >
            {FUNNEL_FILTER_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Cards Search Input */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-cards"
            type="text"
            placeholder="Filter cards, persona, hook..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full bg-white border border-slate-200 text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2 text-slate-800 placeholder-slate-400 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tag Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="btn-filter-tag-all"
            onClick={() => onFilterChange({ selectedTag: 'all' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              filters.selectedTag === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            All
          </button>

          {tags.map((tag) => {
            const isSelected = filters.selectedTag === tag.id || filters.selectedTag === tag.name;
            return (
              <button
                key={tag.id}
                id={`btn-filter-tag-${tag.id}`}
                onClick={() => onFilterChange({ selectedTag: isSelected ? 'all' : tag.id })}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                  isSelected
                    ? `${tag.bg} ${tag.text} ${tag.border || 'border-slate-300'} font-bold ring-2 ring-blue-500/20 shadow-2xs`
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
