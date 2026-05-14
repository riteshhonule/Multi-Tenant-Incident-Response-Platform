import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import type { Incident, Severity, Status } from '../../types';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import IncidentCreateModal from './IncidentCreateModal';

const IncidentListPage: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<Status | ''>('');
  const [severityFilter, setSeverityFilter] = React.useState<Severity | ''>('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: incidents, isLoading } = useQuery<{ items: Incident[] }>({
    queryKey: ['incidents', search, statusFilter, severityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (severityFilter) params.append('severity', severityFilter);
      const response = await api.get(`/incidents?${params.toString()}`);
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">Manage and track all security events.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 shadow-lg shadow-primary/20 self-start transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Report Incident</span>
        </button>
      </div>

      <IncidentCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="flex flex-col lg:flex-row gap-4 p-4 glass rounded-2xl">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="px-4 py-2.5 rounded-xl bg-secondary/50 border border-border outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status)}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            className="px-4 py-2.5 rounded-xl bg-secondary/50 border border-border outline-none"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as Severity)}
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setSeverityFilter('');
            }}
            className="p-2.5 rounded-xl bg-secondary/50 border border-border hover:bg-secondary transition-all active:scale-95"
            title="Reset Filters"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Incident</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4">Reported</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="h-4 bg-secondary/50 rounded-full w-full" />
                    </td>
                  </tr>
                ))
              ) : incidents?.items.map((incident) => (
                <tr
                  key={incident.id}
                  className="hover:bg-secondary/20 transition-colors group cursor-pointer"
                  onClick={() => window.location.href = `/incidents/${incident.id}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">{incident.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-xs">{incident.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-xs font-bold border uppercase",
                      incident.severity === 'CRITICAL' ? "status-critical" :
                        incident.severity === 'HIGH' ? "status-high" :
                          incident.severity === 'MEDIUM' ? "status-medium" : "status-low"
                    )}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        incident.status === 'OPEN' ? "bg-blue-500" :
                          incident.status === 'IN_PROGRESS' ? "bg-yellow-500" :
                            incident.status === 'RESOLVED' ? "bg-emerald-500" : "bg-slate-500"
                      )} />
                      <span className="text-sm font-medium">{incident.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                        {incident.assignee?.email?.[0].toUpperCase() || '?'}
                      </div>
                      <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                        {incident.assignee?.email || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(incident.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-secondary rounded-lg">
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && incidents?.items.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-bold">No incidents found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
            <button className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentListPage;
