import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import type { Incident, Comment, ActivityLog, Status, User } from '../../types';
import { 
  ArrowLeft, 
  MessageSquare, 
  Activity,
  CheckCircle2,
  Send
} from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';

const IncidentDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
   const queryClient = useQueryClient();
  const { user } = useAuth();
  const [comment, setComment] = React.useState('');

  const { data: incident, isLoading } = useQuery<Incident>({
    queryKey: ['incident', id],
    queryFn: async () => {
      const response = await api.get(`/incidents/${id}`);
      return response.data;
    },
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ['comments', id],
    queryFn: async () => {
      const response = await api.get(`/incidents/${id}/comments`);
      return response.data;
    },
  });

  const { data: activity } = useQuery<ActivityLog[]>({
    queryKey: ['activity', id],
    queryFn: async () => {
      const response = await api.get(`/incidents/${id}/activity`);
      return response.data;
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
    enabled: user?.role === 'ADMIN' || user?.role === 'MANAGER',
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => api.post(`/incidents/${id}/comments`, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setComment('');
      toast.success('Comment added');
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: Status) => api.patch(`/incidents/${id}`, { 
      status, 
      version: incident?.version 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['activity', id] });
      toast.success('Status updated');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error('Incident was modified by another user. Refreshing...');
        queryClient.invalidateQueries({ queryKey: ['incident', id] });
      }
    }
  });

  const assignMutation = useMutation({
    mutationFn: (assigneeId: number) => api.post(`/incidents/${id}/assign`, { assigneeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['activity', id] });
      toast.success('Incident assigned');
    },
  });

  if (isLoading || !incident) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/incidents')}
          className="p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
            <span>INC-{incident.id.toString().padStart(4, '0')}</span>
            <span>•</span>
            <span>Reported {new Date(incident.createdAt).toLocaleString()}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{incident.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <>
              {incident.status !== 'RESOLVED' && (
                <button 
                  onClick={() => statusMutation.mutate('RESOLVED')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Resolve
                </button>
              )}
              <select 
                className="px-4 py-2.5 rounded-xl bg-secondary border border-border outline-none font-medium"
                value={incident.status}
                onChange={(e) => statusMutation.mutate(e.target.value as Status)}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Comments */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold">Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {incident.description}
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Comments
            </h2>
            
            <div className="space-y-4">
              {comments?.map((c) => (
                <div key={c.id} className="flex gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {c.author.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{c.author.email}</span>
                      <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.body}</p>
                  </div>
                </div>
              ))}
              
              <div className="relative mt-6">
                <textarea
                  className="w-full p-4 rounded-2xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary outline-none transition-all resize-none pr-14"
                  placeholder="Add a comment..."
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button 
                  onClick={() => comment && commentMutation.mutate(comment)}
                  disabled={!comment || commentMutation.isPending}
                  className="absolute right-4 bottom-4 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Activity */}
        <div className="space-y-8">
          <div className="glass p-6 rounded-3xl space-y-6">
            <h2 className="text-lg font-bold">Metadata</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Severity</span>
                <span className={clsx(
                  "px-3 py-1 rounded-full text-xs font-bold border uppercase",
                  incident.severity === 'CRITICAL' ? "status-critical" : 
                  incident.severity === 'HIGH' ? "status-high" :
                  incident.severity === 'MEDIUM' ? "status-medium" : "status-low"
                )}>{incident.severity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assignee</span>
                {user?.role === 'ADMIN' || user?.role === 'MANAGER' ? (
                  <select
                    className="bg-transparent text-sm font-medium outline-none text-right cursor-pointer hover:text-primary transition-colors"
                    value={incident.assigneeId || ''}
                    onChange={(e) => assignMutation.mutate(Number(e.target.value))}
                  >
                    <option value="">Unassigned</option>
                    {users?.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                      {incident.assignee?.email?.[0].toUpperCase() || '?'}
                    </div>
                    <span className="text-sm font-medium">{incident.assignee?.email || 'Unassigned'}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created By</span>
                <span className="text-sm font-medium">{incident.creator?.email}</span>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activity Log
            </h2>
            <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/50">
              {activity?.map((log) => (
                <div key={log.id} className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{log.action.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      by {log.actor.email} • {new Date(log.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailPage;
