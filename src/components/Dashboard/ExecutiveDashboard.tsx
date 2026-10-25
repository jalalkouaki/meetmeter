import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../lib/store';
import { formatCurrency } from '../../lib/currency';
import { convertOpportunityCost } from '../../lib/metrics';
import { MeetingCategory } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  BarChart2,
  TrendingUp,
  DollarSign,
  Clock,
  AlertCircle,
  Download,
  Shield,
  Layers,
  Play,
  FileSpreadsheet,
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'Status Update': '#38BDF8',
  Decision: '#10B981',
  Brainstorm: '#F59E0B',
  '1-on-1': '#A855F7',
  Client: '#EC4899',
  Other: '#71717A',
};

export const ExecutiveDashboard: React.FC = () => {
  const { meetings, auditFlags, settings, hideCostNumbers, setCurrentView } = useAppStore();

  const totalSpend = useMemo(() => {
    return meetings.reduce((sum, m) => sum + (m.total_cost || 0), 0);
  }, [meetings]);

  const totalOvertimeSpend = useMemo(() => {
    return meetings.reduce((sum, m) => sum + (m.overtime_cost || 0), 0);
  }, [meetings]);

  const avgMeetingCost = useMemo(() => {
    return meetings.length > 0 ? totalSpend / meetings.length : 0;
  }, [meetings, totalSpend]);

  const totalFocusHoursBurned = useMemo(() => {
    return meetings.length > 0 ? totalSpend / (settings.focus_hour_rate || 75) : 0;
  }, [meetings, totalSpend, settings.focus_hour_rate]);

  const categoryData = useMemo(() => {
    if (meetings.length === 0) return [];
    const map: Record<string, { count: number; spend: number }> = {};
    meetings.forEach((m) => {
      if (!map[m.category]) {
        map[m.category] = { count: 0, spend: 0 };
      }
      map[m.category].count += 1;
      map[m.category].spend += m.total_cost || 0;
    });

    return Object.keys(map).map((cat) => ({
      name: cat,
      spend: Math.round(map[cat].spend),
      count: map[cat].count,
      color: CATEGORY_COLORS[cat] || '#71717A',
    }));
  }, [meetings]);

  const trendData = useMemo(() => {
    if (meetings.length === 0) return [];

    return meetings
      .slice()
      .reverse()
      .map((m) => ({
        date: new Date(m.started_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        title: m.title,
        spend: Math.round(m.total_cost),
      }));
  }, [meetings]);

  const handleExportCSV = () => {
    if (meetings.length === 0) return;

    const headers = ['ID', 'Title', 'Category', 'Planned_Mins', 'Started_At', 'Total_Cost_USD', 'Overtime_Cost_USD', 'ROI_Rating', 'Email_Score'];
    const rows = meetings.map((m) => [
      m.id,
      `"${m.title.replace(/"/g, '""')}"`,
      m.category,
      m.planned_minutes,
      m.started_at,
      m.total_cost.toFixed(2),
      (m.overtime_cost || 0).toFixed(2),
      m.roi_rating || 'N/A',
      `${m.email_score || 0}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `meetmeter_executive_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6 animate-fadeIn pb-16">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Executive Meeting Analytics</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Auditing organizational meeting expenditure, format allocations, and overtime patterns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {meetings.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-800 transition"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="text-xs font-medium text-zinc-400">Total Meeting Spend</div>
          <div className="text-2xl font-mono font-semibold text-zinc-100 tabular-nums">
            {formatCurrency(totalSpend, settings.display_currency, undefined, hideCostNumbers)}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            {meetings.length} recorded meeting{meetings.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="text-xs font-medium text-zinc-400">Average Session Cost</div>
          <div className="text-2xl font-mono font-semibold text-zinc-100 tabular-nums">
            {formatCurrency(avgMeetingCost, settings.display_currency, undefined, hideCostNumbers)}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">Per meeting average</p>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="text-xs font-medium text-zinc-400">Overtime Overrun</div>
          <div className="text-2xl font-mono font-semibold text-zinc-100 tabular-nums">
            {formatCurrency(totalOvertimeSpend, settings.display_currency, undefined, hideCostNumbers)}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            {totalSpend > 0 ? `${((totalOvertimeSpend / totalSpend) * 100).toFixed(1)}% of total expenditure` : '0% overrun'}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="text-xs font-medium text-zinc-400">Focus Capacity Equivalent</div>
          <div className="text-2xl font-mono font-semibold text-zinc-100 tabular-nums">
            {totalFocusHoursBurned.toFixed(1)} hrs
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            @ ${settings.focus_hour_rate}/hr focus rate
          </p>
        </div>
      </div>

      {/* Analytics Charts or Clean Empty State */}
      {meetings.length === 0 ? (
        <div className="p-8 rounded-lg bg-zinc-900/50 border border-dashed border-zinc-800 text-center space-y-3">
          <div className="w-10 h-10 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">No Historical Meetings</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-0.5">
              Complete your first session with MeetMeter to populate spend trends and category distributions.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('setup')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-zinc-200"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Meeting</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div className="lg:col-span-2 p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                  Session Expenditure Trend
                </h3>
                <p className="text-[11px] text-zinc-400">Per session meeting cost trajectory</p>
              </div>
              <span className="text-xs text-zinc-400 font-mono font-medium">USD ($)</span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181B',
                      borderColor: '#27272A',
                      borderRadius: '0.375rem',
                      color: '#F4F4F5',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`$${val}`, 'Spend']}
                  />
                  <Bar dataKey="spend" fill="#E4E4E7" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Spend by Format
              </h3>
              <p className="text-[11px] text-zinc-400">Distribution across meeting categories</p>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="spend"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181B',
                      borderColor: '#27272A',
                      borderRadius: '0.375rem',
                      color: '#F4F4F5',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`$${val}`, 'Spend']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-xs">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-zinc-300 text-[11px]">{c.name}</span>
                  </div>
                  <span className="font-mono text-zinc-200 text-[11px]">${c.spend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recurring Meeting Audit Alerts */}
      <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Audit & Optimization Flags ({auditFlags.length})
          </h3>
          <p className="text-[11px] text-zinc-400">
            System flags for persistent overtime overrun, high status update costs, or low ROI ratings.
          </p>
        </div>

        {auditFlags.length === 0 ? (
          <div className="p-3.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
            0 flags. Meetings operating within healthy parameters will not trigger audit notices.
          </div>
        ) : (
          <div className="space-y-2">
            {auditFlags.map((flag) => (
              <div
                key={flag.id}
                className="p-3.5 rounded-md bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                      {flag.flag_type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(flag.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-normal">{flag.detail}</p>
                </div>

                <span className="text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 whitespace-nowrap">
                  Candidate for Async Memo
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Meeting Archive Table */}
      {meetings.length > 0 && (
        <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Meeting Session Archive ({meetings.length})
            </h3>
            <span className="text-[11px] text-zinc-500">Local storage</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-850/80 text-zinc-400 uppercase font-medium text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Attendees</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Labor Cost</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3">Async Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {meetings.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-850/40 transition">
                    <td className="py-2.5 px-3 font-medium text-zinc-100">
                      <div>{m.title}</div>
                      {m.purpose && <div className="text-[10px] text-zinc-500 font-normal">{m.purpose}</div>}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-750 text-[10px]">
                        {m.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{m.attendee_ids.length}</td>
                    <td className="py-2.5 px-3 font-mono">{m.planned_minutes}m</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-zinc-100">
                      {formatCurrency(m.total_cost, settings.display_currency, undefined, hideCostNumbers)}
                    </td>
                    <td className="py-2.5 px-3">
                      {m.roi_rating ? (
                        <span className="text-amber-400 font-mono text-[11px]">
                          {'★'.repeat(m.roi_rating)}
                          <span className="text-zinc-700">{'★'.repeat(5 - m.roi_rating)}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {m.email_score || 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
