import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import type { Incident } from '../../types';
import { clsx } from 'clsx';
import { useAuth } from '../auth/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: incidents, isLoading } = useQuery<{ items: Incident[] }>({
    queryKey: ['incidents'],
    queryFn: async () => {
      const response = await api.get('/incidents?limit=100');
      return response.data;
    },
  });

  const stats = React.useMemo(() => {
    if (!incidents) return { open: 0, inProgress: 0, critical: 0, resolved: 0 };
    const items = incidents.items;
    return {
      open: items.filter(i => i.status === 'OPEN').length,
      inProgress: items.filter(i => i.status === 'IN_PROGRESS').length,
      critical: items.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length,
      resolved: items.filter(i => i.status === 'RESOLVED').length,
    };
  }, [incidents]);

  const cards = [
    { label: 'Open Incidents', value: stats.open, icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Critical Alerts', value: stats.critical, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Resolved Today', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-secondary/50 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-secondary/50 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground text-sm">Real-time monitoring of your organization's security posture.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 self-start">
          <span className="text-[10px] font-bold uppercase text-primary/70 tracking-widest">Active Role</span>
          <span className={clsx(
            "px-2 py-0.5 rounded-lg text-xs font-black tracking-wide border",
            user?.role === 'ADMIN' ? "bg-primary text-primary-foreground border-primary" :
            user?.role === 'MANAGER' ? "bg-blue-500/20 text-blue-500 border-blue-500/30" : 
            "bg-secondary text-muted-foreground border-border"
          )}>
            {user?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="glass p-6 rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-all cursor-default">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12", card.bg, card.color)}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> Recent Incidents</h2>
            <button 
              onClick={() => navigate('/incidents')}
              className="text-sm text-primary hover:underline font-medium"
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {incidents?.items.slice(0, 5).map((incident) => (
              <div 
                key={incident.id} 
                onClick={() => navigate(`/incidents/${incident.id}`)}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="space-y-1">
                  <p className="font-semibold truncate max-w-[200px] sm:max-w-md">{incident.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className={clsx(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                      incident.severity === 'CRITICAL' ? "status-critical" : 
                      incident.severity === 'HIGH' ? "status-high" :
                      incident.severity === 'MEDIUM' ? "status-medium" : "status-low"
                    )}>
                      {incident.severity}
                    </span>
                    • {new Date(incident.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={clsx(
                    "text-xs font-medium px-3 py-1 rounded-full",
                    incident.status === 'RESOLVED' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {incident.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {incidents?.items.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No recent incidents found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-lg font-bold">Safe & Secure</h3>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            Your system is operating within normal parameters. No major outages reported.
          </p>
          <button className="px-6 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-all">
            System Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
