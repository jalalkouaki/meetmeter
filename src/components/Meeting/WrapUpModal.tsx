import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { CheckCircle2, X } from 'lucide-react';

interface WrapUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmStop?: () => void;
}

export const WrapUpModal: React.FC<WrapUpModalProps> = ({ isOpen, onClose, onConfirmStop }) => {
  const { activeMeeting, saveWrapUpNotes, stopMeeting } = useAppStore();

  const [takeaway1, setTakeaway1] = useState(activeMeeting?.wrapupNotes?.takeaways?.[0] || '');
  const [takeaway2, setTakeaway2] = useState(activeMeeting?.wrapupNotes?.takeaways?.[1] || '');
  const [takeaway3, setTakeaway3] = useState(activeMeeting?.wrapupNotes?.takeaways?.[2] || '');
  const [actionOwner, setActionOwner] = useState(activeMeeting?.wrapupNotes?.action_owner || '');

  if (!isOpen || !activeMeeting) return null;

  const handleSaveAndStop = (e: React.FormEvent) => {
    e.preventDefault();
    const takeaways = [takeaway1, takeaway2, takeaway3].filter((t) => t.trim().length > 0);
    saveWrapUpNotes(takeaways, actionOwner.trim());
    
    if (onConfirmStop) {
      onConfirmStop();
    } else {
      stopMeeting();
    }
    onClose();
  };

  const handleSaveOnly = () => {
    const takeaways = [takeaway1, takeaway2, takeaway3].filter((t) => t.trim().length > 0);
    saveWrapUpNotes(takeaways, actionOwner.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-5 shadow-2xl space-y-4 text-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Meeting Takeaways & Ownership</h3>
            <p className="text-[11px] text-zinc-500">Record outcomes before closing session.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSaveAndStop} className="space-y-3.5 text-xs">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-300">Key Outcomes / Consensus</label>
            <input
              type="text"
              placeholder="1. Primary consensus or milestone..."
              value={takeaway1}
              onChange={(e) => setTakeaway1(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-zinc-500 outline-none"
            />
            <input
              type="text"
              placeholder="2. Resolved blocker or technical decision..."
              value={takeaway2}
              onChange={(e) => setTakeaway2(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-zinc-500 outline-none"
            />
            <input
              type="text"
              placeholder="3. Next deliverable timeline..."
              value={takeaway3}
              onChange={(e) => setTakeaway3(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-zinc-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-300">Action Item Owner</label>
            <input
              type="text"
              placeholder="e.g. Lead Engineer (spec delivery by Friday)"
              value={actionOwner}
              onChange={(e) => setActionOwner(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-zinc-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleSaveOnly}
              className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              Save & Keep Clock Running
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-sm"
              >
                Save & Stop Session
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
