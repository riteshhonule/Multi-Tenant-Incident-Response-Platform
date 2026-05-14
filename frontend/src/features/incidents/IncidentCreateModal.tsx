import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Severity } from '../../types';

interface IncidentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IncidentCreateModal: React.FC<IncidentCreateModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [severity, setSeverity] = React.useState<Severity>('MEDIUM');
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post('/incidents', { title, description, severity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident reported successfully');
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setSeverity('MEDIUM');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to report incident');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg glass rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Report Incident</h2>
              <p className="text-xs text-muted-foreground">Provide details about the security event.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form 
          className="p-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Title</label>
            <input 
              required
              type="text"
              placeholder="e.g. Unusual login attempt"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <textarea 
              required
              rows={4}
              placeholder="Describe what happened..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Severity</label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as Severity[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                    severity === s 
                      ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' 
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold hover:bg-white/5 transition-colors border border-white/10"
            >
              Cancel
            </button>
            <button
              disabled={mutation.isPending}
              type="submit"
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Report Incident'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentCreateModal;
