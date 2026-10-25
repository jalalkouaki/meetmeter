import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { formatCurrency } from '../../lib/currency';
import { Star, CheckCircle2 } from 'lucide-react';

interface RoiPollProps {
  meetingId: string;
  totalCost: number;
  onRated?: () => void;
}

export const RoiPoll: React.FC<RoiPollProps> = ({ meetingId, totalCost, onRated }) => {
  const { submitRoiRating, settings, hideCostNumbers, recentCompletedMeeting } = useAppStore();
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submittedRating, setSubmittedRating] = useState<number | null>(
    recentCompletedMeeting?.roi_rating || null
  );

  const handleSelect = (rating: number) => {
    setSubmittedRating(rating);
    submitRoiRating(rating);
    if (onRated) onRated();
  };

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1:
        return 'Low leverage — High candidate for asynchronous memo';
      case 2:
        return 'Marginal value — Could have been streamlined';
      case 3:
        return 'Standard utility — Met planned objectives';
      case 4:
        return 'High leverage — Clear decisions & cross-team alignment';
      case 5:
        return 'Critical outcome — Major milestone or decision unlocked';
      default:
        return '';
    }
  };

  return (
    <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-3 text-center">
      <div>
        <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
          Session Value Assessment
        </span>
        <h4 className="text-sm font-semibold text-zinc-200 mt-1">
          Was this meeting worth{' '}
          <span className="font-mono text-zinc-100">
            {formatCurrency(totalCost, settings.display_currency, undefined, hideCostNumbers)}
          </span>{' '}
          in team labor?
        </h4>
      </div>

      {/* Star Selector */}
      <div className="flex items-center justify-center gap-2 py-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (hoverRating || submittedRating || 0) >= star;
          return (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => handleSelect(star)}
              className="p-1.5 transition text-zinc-600 hover:text-zinc-300 focus:outline-none"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  isFilled ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="h-4 text-xs font-medium">
        {(hoverRating || submittedRating) ? (
          <span className="text-zinc-300">
            {getRatingLabel(hoverRating || submittedRating || 0)}
          </span>
        ) : (
          <span className="text-zinc-500 text-[11px]">Select a score from 1 to 5</span>
        )}
      </div>

      {submittedRating && (
        <div className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5 pt-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Score saved to session audit record</span>
        </div>
      )}
    </div>
  );
};
