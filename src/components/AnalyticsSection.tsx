import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Users, Tag, BarChart2, Calendar, PackageCheck, CheckCircle, Clock, Award, Filter, Sparkles } from 'lucide-react';
import { Task, TeamMember, TagCategory, AnalyticsTab, FunnelStage } from '../types';

interface AnalyticsSectionProps {
  tasks: Task[];
  allTasks: Task[];
  members: TeamMember[];
  tags: TagCategory[];
  selectedMonth: string;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  tasks,
  allTasks,
  members,
  tags,
  selectedMonth,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('daily');

  const notStartedCount = tasks.filter((t) => t.status === 'not_started').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const inReviewCount = tasks.filter((t) => t.status === 'in_review').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  // Format month title
  const monthDisplay =
    selectedMonth === 'all'
      ? 'All Time'
      : (() => {
          try {
            const [year, month] = selectedMonth.split('-');
            const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
            return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          } catch {
            return selectedMonth;
          }
        })();

  // Calculate past 7 days for the Daily chart
  const getDailyStats = () => {
    const days: { label: string; dateStr: string; count: number; colorClass: string }[] = [];

    const now = new Date(2026, 7, 25); // Reference Aug 25, 2026
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const isToday = i === 0;
      const dayName = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      const isoPrefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      // Count tasks completed or created on this day
      const dayTasks = allTasks.filter((t) => {
        const createdDate = t.createdAt?.split('T')[0];
        const completedDate = t.completedAt?.split('T')[0];
        return createdDate === isoPrefix || completedDate === isoPrefix;
      });

      days.push({
        label: dayName,
        dateStr: isoPrefix,
        count: dayTasks.length,
        colorClass: 'bg-blue-500',
      });
    }
    return days;
  };

  const dailyDays = getDailyStats();

  // Completed in last 7 days by team members
  const memberCompletions = members
    .map((m) => {
      const completedTasks = allTasks.filter((t) => t.status === 'done' && t.assigneeId === m.id);
      return {
        member: m,
        count: completedTasks.length,
      };
    })
    .filter((item) => item.count > 0);

  const totalDoneLast7Days = memberCompletions.reduce((acc, c) => acc + c.count, 0);

  // Funnel counts
  const funnelStages: { id: FunnelStage; label: string; count: number; color: string; bar: string }[] = [
    { id: 'TOF', label: 'Top of Funnel (TOF - Awareness)', count: allTasks.filter((t) => t.funnel === 'TOF').length, color: 'text-blue-700 bg-blue-50 border-blue-200', bar: 'bg-blue-600' },
    { id: 'MOF', label: 'Middle of Funnel (MOF - Consideration)', count: allTasks.filter((t) => t.funnel === 'MOF').length, color: 'text-purple-700 bg-purple-50 border-purple-200', bar: 'bg-purple-600' },
    { id: 'BOF', label: 'Bottom of Funnel (BOF - Conversion)', count: allTasks.filter((t) => t.funnel === 'BOF').length, color: 'text-amber-700 bg-amber-50 border-amber-200', bar: 'bg-amber-600' },
    { id: 'Retention', label: 'Retention & Loyalty', count: allTasks.filter((t) => t.funnel === 'Retention').length, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', bar: 'bg-emerald-600' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-[1520px] mx-auto mb-6">
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm transition-all overflow-hidden">
        
        {/* Header Toggle */}
        <button
          id="btn-toggle-analytics"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
        >
          <div className="flex items-center gap-2 flex-wrap text-sm text-slate-800">
            {isOpen ? <ChevronDown className="w-4 h-4 text-blue-600" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
            <span className="font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Performance & Creative Velocity Dashboard
            </span>
            <span className="text-slate-500 text-xs font-mono">
              · {monthDisplay} · {tasks.length} Active Briefs
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Feed
            </span>
          </div>
        </button>

        {/* Content */}
        {isOpen && (
          <div className="p-5 space-y-5">
            
            {/* Top Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Active Assignments */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Active Assignments</span>
                  <span className="text-blue-600 text-[10px] font-mono">Month: {monthDisplay}</span>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{tasks.length}</span>
                  <span className="text-emerald-600 text-xs font-bold">↑ {doneCount} completed</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-500"
                    style={{ width: `${tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Status Breakdown */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deliverable Pipeline</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" /> Queued
                    </span>
                    <span className="font-bold text-slate-900">{notStartedCount}</span>
                  </div>
                  <div className="bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 flex items-center justify-between">
                    <span className="text-blue-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> In Progress
                    </span>
                    <span className="font-bold text-blue-800">{inProgressCount}</span>
                  </div>
                  <div className="bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 flex items-center justify-between">
                    <span className="text-amber-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> In Review
                    </span>
                    <span className="font-bold text-amber-800">{inReviewCount}</span>
                  </div>
                  <div className="bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Approved
                    </span>
                    <span className="font-bold text-emerald-800">{doneCount}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Team Bandwidth Progress */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  <span>Team Bandwidth</span>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">Video Editors ({members.filter((m) => m.role === 'video_editor').length})</span>
                      <span className="text-purple-700 font-bold">
                        {allTasks.filter((t) => t.status !== 'done' && members.find((m) => m.id === t.assigneeId)?.role === 'video_editor').length} active
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full w-[68%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">Graphic Designers ({members.filter((m) => m.role === 'graphic_designer').length})</span>
                      <span className="text-blue-700 font-bold">
                        {allTasks.filter((t) => t.status !== 'done' && members.find((m) => m.id === t.assigneeId)?.role === 'graphic_designer').length} active
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full w-[82%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Performance Insight Card */}
              <div className="bg-slate-900 rounded-xl p-4 text-white flex flex-col justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-400">Marketing Velocity</p>
                  <p className="text-xs font-semibold leading-relaxed mt-1 text-slate-200">
                    TOF Reels & BOF comparison UGC show highest turnaround this week.
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold opacity-90 border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Avg Cycle Time</span>
                  <span className="text-emerald-400 font-mono font-bold">1.4 days</span>
                </div>
              </div>

            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto">
              {(['daily', 'funnel', 'people', 'tags', 'products', 'months'] as AnalyticsTab[]).map((tab) => {
                const tabNames: Record<AnalyticsTab, string> = {
                  daily: 'Efficiency & Daily Trends',
                  funnel: 'Funnel Breakdown (TOF/MOF/BOF)',
                  people: 'Team Velocity & Workload',
                  tags: 'Deliverable Tag Distribution',
                  products: 'Campaigns & Products',
                  months: 'Monthly Throughput',
                };
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    id={`btn-analytics-tab-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    {tabNames[tab]}
                  </button>
                );
              })}
            </div>

            {/* Tab: Daily View */}
            {activeTab === 'daily' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Left: Day Bar Chart */}
                <div className="md:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">7-Day Completion Velocity</span>
                    <span className="text-[10px] font-mono text-blue-700 font-bold">Total: {totalDoneLast7Days} items finished</span>
                  </div>
                  <div className="flex items-end gap-3 sm:gap-4 h-32 pb-2 border-b border-slate-200">
                    {dailyDays.map((day, idx) => {
                      const maxCount = Math.max(...dailyDays.map((d) => d.count), 1);
                      const heightPercent = day.count > 0 ? Math.max((day.count / maxCount) * 80, 20) : 6;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                          {day.count > 0 ? (
                            <span className="text-xs font-bold text-blue-700 mb-1.5 group-hover:scale-110 transition-transform">
                              {day.count}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 mb-1 font-mono">0</span>
                          )}
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full max-w-[32px] rounded-t-md transition-all duration-300 ${
                              day.count > 0 ? 'bg-blue-600' : 'bg-slate-200'
                            }`}
                          />
                          <span className={`text-[10px] mt-2 font-mono whitespace-nowrap ${day.label === 'Today' ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                            {day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Completed in last 7 days team roster */}
                <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Designer Completions</span>
                    <span className="text-emerald-700 text-xs font-bold font-mono">Last 7 Days</span>
                  </div>
                  <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                    {memberCompletions.length > 0 ? (
                      memberCompletions.map(({ member, count }) => (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${member.avatarBg} ${member.avatarText}`}>
                              {member.initials}
                            </div>
                            <span className="text-xs font-medium text-slate-800">
                              {member.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({member.roleTitle})
                            </span>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 font-mono px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                            {count} done
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">No tasks marked as Done in the past 7 days.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Tab: Funnel Breakdown */}
            {activeTab === 'funnel' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {funnelStages.map((stg) => {
                  const stageTasks = allTasks.filter((t) => t.funnel === stg.id);
                  const stageDone = stageTasks.filter((t) => t.status === 'done').length;
                  return (
                    <div key={stg.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${stg.color}`}>
                          {stg.id}
                        </span>
                        <span className="text-xl font-extrabold text-slate-900 font-mono">{stageTasks.length}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{stg.label}</p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`${stg.bar} h-full`}
                          style={{ width: `${stageTasks.length > 0 ? (stageDone / stageTasks.length) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>{stageDone} completed</span>
                        <span>{stageTasks.length - stageDone} in progress</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: People View */}
            {activeTab === 'people' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((member) => {
                  const memberTasks = allTasks.filter((t) => t.assigneeId === member.id);
                  const memberDone = memberTasks.filter((t) => t.status === 'done').length;
                  const memberInProgress = memberTasks.filter((t) => t.status === 'in_progress').length;
                  const memberInReview = memberTasks.filter((t) => t.status === 'in_review').length;

                  return (
                    <div key={member.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${member.avatarBg} ${member.avatarText}`}>
                          {member.initials}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{member.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{member.roleTitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200" title="In Progress">{memberInProgress} prog</span>
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200" title="In Review">{memberInReview} rev</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold" title="Done">{memberDone} done</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Tags View */}
            {activeTab === 'tags' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {tags.map((tag) => {
                  const count = allTasks.filter((t) => t.tagIds.includes(tag.id)).length;
                  return (
                    <div key={tag.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-800">{tag.name}</span>
                      <span className="text-xl font-extrabold text-blue-600 mt-2 font-mono">{count} <span className="text-[10px] font-normal text-slate-500">cards</span></span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Products View */}
            {activeTab === 'products' && (
              <div className="space-y-2">
                {Array.from(new Set(allTasks.map((t) => t.product).filter(Boolean))).map((prod) => {
                  const prodTasks = allTasks.filter((t) => t.product === prod);
                  const prodDone = prodTasks.filter((t) => t.status === 'done').length;
                  return (
                    <div key={prod} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <span className="font-semibold text-slate-900">{prod}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-500">{prodTasks.length} total briefs</span>
                        <span className="font-bold text-emerald-700">{prodDone} finished</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Months View */}
            {activeTab === 'months' && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {['2026-06', '2026-07', '2026-08', '2026-09'].map((mKey) => {
                  const mTasks = allTasks.filter((t) => t.monthKey === mKey);
                  const mDone = mTasks.filter((t) => t.status === 'done').length;
                  const [yr, mo] = mKey.split('-');
                  const d = new Date(parseInt(yr, 10), parseInt(mo, 10) - 1, 1);
                  const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  return (
                    <div key={mKey} className={`p-3.5 rounded-xl border min-w-[150px] ${mKey === selectedMonth ? 'bg-blue-50 border-blue-300 shadow-xs' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="text-xs font-bold text-slate-900">{label}</div>
                      <div className="text-base font-extrabold text-blue-600 mt-1 font-mono">{mTasks.length} creatives</div>
                      <div className="text-[11px] text-emerald-700 font-medium font-mono">{mDone} finished</div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
