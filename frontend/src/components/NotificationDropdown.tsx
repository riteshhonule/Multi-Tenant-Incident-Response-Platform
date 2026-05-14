import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Bell, Check, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Alert } from '../types';
import { clsx } from 'clsx';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await api.get('/alerts');
      return response.data;
    },
    // Poll for new alerts every 30 seconds
    refetchInterval: 30000,
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.post(`/alerts/${id}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-secondary rounded-full relative transition-all active:scale-95"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {alerts && alerts.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            {alerts && alerts.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                {alerts.length} New
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="w-8 h-8 animate-spin mx-auto mb-2 opacity-20" />
                <p className="text-sm">Loading alerts...</p>
              </div>
            ) : !alerts || alerts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm italic">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className="p-4 hover:bg-slate-50 transition-colors group relative"
                  >
                    <div className="flex gap-3">
                      <div className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        alert.incident?.severity === 'CRITICAL' ? "bg-red-500/20 text-red-500" :
                        alert.incident?.severity === 'HIGH' ? "bg-orange-500/20 text-orange-500" :
                        "bg-blue-500/20 text-blue-500"
                      )}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 leading-tight">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            {alert.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[10px] text-slate-500 italic">
                            {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => window.location.href = `/incidents/${alert.incidentId}`}
                        className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Details
                      </button>
                      <button 
                        onClick={() => resolveMutation.mutate(alert.id)}
                        disabled={resolveMutation.isPending}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                        title="Dismiss"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
            <button className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
              View All Activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
