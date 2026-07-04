'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import { ReadingSession } from '../types';
import { BarChart3, Clock, Layers } from 'lucide-react';

interface AnalyticsData {
  totalPagesRead: number;
  totalDurationSeconds: number;
  totalSessions: number;
  currentStreak: number;
  history: string[];
}

export const Analytics: React.FC = () => {
  // Query sessions list
  const { data: sessions = [] } = useQuery<ReadingSession[]>({
    queryKey: ['sessions'],
    queryFn: () => apiRequest<ReadingSession[]>('/sessions'),
  });

  const { data: analytics = { totalPagesRead: 0, totalDurationSeconds: 0, totalSessions: 0, currentStreak: 0, history: [] } } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: () => apiRequest<AnalyticsData>('/sessions/analytics'),
  });

  // Calculate Average Reading Speed (Pages per minute)
  const totalMinutes = analytics.totalDurationSeconds / 60;
  const avgPagesPerMinute = totalMinutes > 0 
    ? (analytics.totalPagesRead / totalMinutes).toFixed(2) 
    : '0.00';

  // SVG Chart Coordinates mapping (sessions over time)
  const renderSvgChart = () => {
    if (sessions.length < 2) {
      return (
        <div className="flex h-48 w-full items-center justify-center text-xs text-text-tertiary">
          Log at least 2 reading sessions to populate charts.
        </div>
      );
    }

    const chartSessions = [...sessions].reverse().slice(-7); // Last 7 sessions
    const maxPages = Math.max(...chartSessions.map(s => s.pagesRead), 10);
    
    const width = 500;
    const height = 150;
    const padding = 20;

    const points = chartSessions.map((s, index) => {
      const x = padding + (index * (width - padding * 2)) / (chartSessions.length - 1);
      const y = height - padding - (s.pagesRead * (height - padding * 2)) / maxPages;
      return { x, y };
    });

    const pathData = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 text-brand-primary">
        {/* Helper grids */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255, 255, 255, 0.05)" strokeWidth={1} />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255, 255, 255, 0.03)" strokeWidth={1} />

        {/* Gradient fill */}
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path
          d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
          fill="url(#chartGradient)"
        />

        {/* Line path */}
        <path
          d={pathData}
          fill="none"
          stroke="var(--color-brand-primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Coordinates data dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3.5}
            className="fill-bg-secondary stroke-brand-primary"
            strokeWidth={1.5}
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4 px-2 md:px-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Analytics</h2>
        <p className="text-xs text-text-secondary mt-0.5">Statistical insights into your reading velocity and logs</p>
      </header>

      {/* Metrics Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-primary" />
            Total Duration
          </span>
          <p className="text-2xl font-extrabold text-text-primary mt-1">
            {Math.round(analytics.totalDurationSeconds / 3600)} <span className="text-sm font-semibold text-text-secondary">hours</span>
          </p>
          <p className="text-[10px] text-text-tertiary">Logged over {analytics.totalSessions} sessions</p>
        </div>

        <div className="p-5 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-success" />
            Total Pages Read
          </span>
          <p className="text-2xl font-extrabold text-text-primary mt-1">
            {analytics.totalPagesRead} <span className="text-sm font-semibold text-text-secondary">pages</span>
          </p>
          <p className="text-[10px] text-text-tertiary">Accumulated book progress</p>
        </div>

        <div className="p-5 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-brand-warning" />
            Velocity Speed
          </span>
          <p className="text-2xl font-extrabold text-text-primary mt-1">
            {avgPagesPerMinute} <span className="text-sm font-semibold text-text-secondary">ppm</span>
          </p>
          <p className="text-[10px] text-text-tertiary">Average pages read per minute</p>
        </div>
      </div>

      {/* SVG chart section */}
      <section className="p-6 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col gap-4">
        <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary">Velocity Curve (Recent Sessions)</h3>
        {renderSvgChart()}
      </section>

      {/* Historical Sessions Log Table */}
      <section className="p-6 rounded-lg bg-bg-secondary border border-border-neutral flex flex-col gap-4">
        <h3 className="text-xs uppercase tracking-wider font-bold text-text-secondary">Sessions Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-secondary border-collapse">
            <thead>
              <tr className="border-b border-border-neutral text-[10px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Book</th>
                <th className="py-3.5 px-4 text-center">Pages Read</th>
                <th className="py-3.5 px-4 text-center">Duration</th>
                <th className="py-3.5 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-white/2 hover:bg-white/1">
                  <td className="py-3.5 px-4 font-bold text-text-primary line-clamp-1">{s.book?.title || 'Unknown Title'}</td>
                  <td className="py-3.5 px-4 text-center">{s.pagesRead} pages</td>
                  <td className="py-3.5 px-4 text-center">{Math.round(s.durationSeconds / 60)} mins</td>
                  <td className="py-3.5 px-4 text-right text-text-tertiary">
                    {new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-tertiary">No sessions logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
