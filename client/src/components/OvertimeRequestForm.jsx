import { useState } from 'react';
import { useRequestOvertimeMutation } from '../features/apiSlice';

const OvertimeRequestForm = ({ attendanceId, maxHours = 8, disabledReason, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(Math.min(1, maxHours));
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [requestOvertime, { isLoading }] = useRequestOvertimeMutation();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for overtime.');
      return;
    }
    if (hours < 0.5 || hours > maxHours) {
      alert(`Overtime hours must be between 0.5 and ${maxHours}.`);
      return;
    }
    try {
      await requestOvertime({ attendanceId, requestedHours: hours, reason }).unwrap();
      setSubmitted(true);
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      alert(err?.data?.message || 'Failed to submit overtime request.');
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
        <ClockIcon className="w-4 h-4 shrink-0" />
        Overtime request submitted
      </div>
    );
  }

  if (maxHours < 0.5) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
        <ClockIcon className="w-4 h-4 shrink-0" />
        No overtime hours available
      </div>
    );
  }

  if (disabledReason) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
        <ClockIcon className="w-4 h-4 shrink-0" />
        {disabledReason}
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold py-2 px-4 rounded-lg text-sm transition"
        >
          <ClockIcon className="w-4 h-4" />
          Request Overtime
        </button>
      ) : (
        <div className="border border-amber-200 rounded-xl p-4 space-y-3 bg-amber-50">
          <h3 className="text-sm font-semibold text-amber-800">Overtime Request</h3>

          <div className="space-y-1">
            <label className="text-xs text-amber-700 font-medium">
              Hours requested
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max={maxHours}
                step="0.5"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value))}
                className="flex-1 accent-amber-500"
              />
              <span className="text-sm font-semibold text-amber-800 w-10 text-right">
                {hours}h
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-amber-700 font-medium">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Briefly explain why overtime is needed…"
              className="w-full text-sm border border-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !reason.trim()}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
            >
              {isLoading ? 'Submitting…' : 'Submit Request'}
            </button>
            <button
              onClick={() => { setOpen(false); setReason(''); setHours(1); }}
              className="px-3 py-2 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-100 text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ClockIcon = ({ className }) => {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

export default OvertimeRequestForm;
