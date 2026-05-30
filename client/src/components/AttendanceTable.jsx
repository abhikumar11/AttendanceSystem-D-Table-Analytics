import { Fragment, useState, useMemo } from 'react';
import { useValidateAttendanceMutation } from '../features/apiSlice';
import OvertimeRequestForm from './OvertimeRequestForm';
import StatusBadge from './StatusBadge';

const PAGE_SIZE = 10;

const formatDate = (value, dateOnly = false) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (dateOnly && typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, , day] = match;
      return `${day} ${date.toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' })} ${year}`;
    }
  }

  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: dateOnly ? 'UTC' : undefined,
      });
};

const formatTime = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
};

const formatHours = (rec) => {
  if (!rec.punchOutTime) {
    return '-';
  }

  const storedHours = rec.totalHours == null ? NaN : Number(rec.totalHours);
  if (Number.isFinite(storedHours)) {
    return `${storedHours.toFixed(2)}h`;
  }

  if (!rec.punchInTime) {
    return '-';
  }

  const punchIn = new Date(rec.punchInTime);
  const punchOut = new Date(rec.punchOutTime);
  const calculatedHours = (punchOut - punchIn) / (1000 * 60 * 60);

  return Number.isFinite(calculatedHours) ? `${calculatedHours.toFixed(2)}h` : '-';
};

const formatOvertimeHours = (rec) => {
  const overtimeHours = rec.overtimeHours == null ? NaN : Number(rec.overtimeHours);
  return Number.isFinite(overtimeHours) && overtimeHours > 0
    ? `${overtimeHours.toFixed(2)}h`
    : '-';
};

const getOvertimeDisabledReason = (rec, hasPendingOvertime) => {
  if (!rec.punchOutTime) {
    return 'Punch out before requesting overtime.';
  }

  if (Number(rec.overtimeHours || 0) <= 0) {
    return 'Overtime is available only after the daily total exceeds 8 hours.';
  }

  if (rec.overtimeStatus === 'approved') {
    return 'Overtime is already approved for this attendance.';
  }

  if (rec.overtimeStatus === 'pending' || hasPendingOvertime) {
    return 'You already have a pending overtime request.';
  }

  return '';
};

const getEmployeeId = (rec) => rec.employeeId?._id || rec.employeeId || 'me';
const getEmployeeName = (rec) => rec.employeeId?.name || 'Me';
const getDateKey = (rec) => {
  if (rec.punchInDate) {
    return new Date(rec.punchInDate).toISOString().slice(0, 10);
  }

  return new Date(rec.punchInTime).toLocaleDateString('en-CA');
};

const getSummaryStatus = (sessions) => {
  if (sessions.some((rec) => rec.status === 'pending')) {
    return 'pending';
  }
  if (sessions.some((rec) => rec.status === 'invalid')) {
    return 'invalid';
  }
  return 'valid';
};

export default function AttendanceTable({
  records,
  isManagerOrAdmin = false,
  canRequestOvertime = false,
  hasPendingOvertime = false,
  onOvertimeSuccess,
}) {
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [remarksInput, setRemarksInput] = useState('');

  const [validateAttendance, { isLoading: validating }] = useValidateAttendanceMutation();

  const dailyRows = useMemo(() => {
    let rows = [...records].sort(
      (a, b) => new Date(b.punchInTime) - new Date(a.punchInTime)
    );
    if (dateFilter) {
      rows = rows.filter((r) => getDateKey(r) === dateFilter);
    }
    if (statusFilter) {
      rows = rows.filter((r) => r.status === statusFilter);
    }

    const groups = new Map();
    rows.forEach((rec) => {
      const dateKey = getDateKey(rec);
      const key = `${getEmployeeId(rec)}-${dateKey}`;
      const existing = groups.get(key) || {
        key,
        dateKey,
        employeeName: getEmployeeName(rec),
        sessions: [],
      };

      existing.sessions.push(rec);
      groups.set(key, existing);
    });

    return [...groups.values()].map((group) => {
      const sessions = group.sessions.sort(
        (a, b) => new Date(a.punchInTime) - new Date(b.punchInTime)
      );
      const closedSessions = sessions.filter((rec) => rec.punchOutTime);
      const totalHours = closedSessions.reduce((sum, rec) => sum + Number(rec.totalHours || 0), 0);
      const overtimeHours = closedSessions.reduce((sum, rec) => sum + Number(rec.overtimeHours || 0), 0);
      const firstSession = sessions[0];
      const lastClosedSession = closedSessions[closedSessions.length - 1];

      return {
        ...group,
        sessions,
        totalHours,
        overtimeHours,
        firstPunchIn: firstSession?.punchInTime,
        lastPunchOut: lastClosedSession?.punchOutTime,
        workStatus: totalHours >= 8 ? 'completed' : sessions.some((rec) => !rec.punchOutTime) ? 'open' : 'incomplete',
        status: getSummaryStatus(sessions),
        overtimeStatus: sessions.find((rec) => rec.overtimeStatus === 'pending')?.overtimeStatus ||
          sessions.find((rec) => rec.overtimeStatus === 'approved')?.overtimeStatus ||
          sessions.find((rec) => rec.overtimeStatus === 'rejected')?.overtimeStatus ||
          'none',
      };
    });
  }, [records, dateFilter, statusFilter]);

  const totalPages = Math.ceil(dailyRows.length / PAGE_SIZE);
  const paginated = dailyRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleValidate = async (id, status) => {
    try {
      await validateAttendance({
        id,
        data: { status, remarks: remarksInput || (status === 'valid' ? 'Approved' : 'Rejected') },
      }).unwrap();
      setExpandedId(null);
      setRemarksInput('');
    } catch (err) {
      alert(err?.data?.message || 'Validation failed');
    }
  };

  if (!records.length) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No attendance records yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="valid">Valid</option>
          <option value="invalid">Invalid</option>
        </select>
        {(dateFilter || statusFilter) && (
          <button
            onClick={() => { setDateFilter(''); setStatusFilter(''); setPage(1); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400 self-center">
          {dailyRows.length} day{dailyRows.length !== 1 ? 's' : ''}
        </span>
      </div>

      
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {isManagerOrAdmin && <th className="px-4 py-3">Employee</th>}
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Sessions</th>
              <th className="px-4 py-3">First In</th>
              <th className="px-4 py-3">Last Out</th>
              <th className="px-4 py-3">Total Hours</th>
              <th className="px-4 py-3">Work</th>
              <th className="px-4 py-3">Overtime</th>
              <th className="px-4 py-3">OT Status</th>
              <th className="px-4 py-3">Status</th>
              {isManagerOrAdmin && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((day) => (
              <Fragment key={day.key}>
                <tr
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setExpandedId(expandedId === day.key ? null : day.key)}
                >
                  {isManagerOrAdmin && (
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {day.employeeName}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {formatDate(day.dateKey, true)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {day.sessions.length}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {formatTime(day.firstPunchIn)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {day.lastPunchOut
                      ? formatTime(day.lastPunchOut)
                      : <span className="text-green-600 font-medium">Active</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {day.totalHours.toFixed(2)}h
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={day.workStatus} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {day.overtimeHours > 0 ? `${day.overtimeHours.toFixed(2)}h` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={day.overtimeStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={day.status} />
                  </td>
                  {isManagerOrAdmin && (
                    <td className="px-4 py-3">
                      {day.sessions.some((rec) => rec.status === 'pending' && rec.punchOutTime) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expandedId === day.key ? null : day.key);
                          }}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Review Sessions
                        </button>
                      )}
                    </td>
                  )}
                </tr>

                {expandedId === day.key && (
                  <tr className="bg-gray-50">
                    <td colSpan={isManagerOrAdmin ? 10 : 9} className="px-4 py-4">
                      <div className="space-y-4">
                        <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50 text-left font-semibold text-gray-500 uppercase">
                              <tr>
                                <th className="px-3 py-2">Punch In Date</th>
                                <th className="px-3 py-2">Punch In Time</th>
                                <th className="px-3 py-2">Punch Out Date</th>
                                <th className="px-3 py-2">Punch Out Time</th>
                                <th className="px-3 py-2">Hours</th>
                                <th className="px-3 py-2">Overtime</th>
                                <th className="px-3 py-2">OT Status</th>
                                <th className="px-3 py-2">Status</th>
                                {isManagerOrAdmin && <th className="px-3 py-2">Review</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {day.sessions.map((rec) => (
                                <tr key={rec._id}>
                                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(rec.punchInDate || rec.punchInTime, Boolean(rec.punchInDate))}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{formatTime(rec.punchInTime)}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{rec.punchOutTime ? formatDate(rec.punchOutDate || rec.punchOutTime, Boolean(rec.punchOutDate)) : '-'}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{rec.punchOutTime ? formatTime(rec.punchOutTime) : 'Active'}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{formatHours(rec)}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{formatOvertimeHours(rec)}</td>
                                  <td className="px-3 py-2"><StatusBadge status={rec.overtimeStatus || 'none'} /></td>
                                  <td className="px-3 py-2"><StatusBadge status={rec.status} /></td>
                                  {isManagerOrAdmin && (
                                    <td className="px-3 py-2">
                                      {rec.status === 'pending' && rec.punchOutTime && (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleValidate(rec._id, 'valid'); }}
                                            disabled={validating}
                                            className="text-xs font-semibold text-green-700 hover:text-green-900 disabled:opacity-50"
                                          >
                                            Approve
                                          </button>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleValidate(rec._id, 'invalid'); }}
                                            disabled={validating}
                                            className="text-xs font-semibold text-red-700 hover:text-red-900 disabled:opacity-50"
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex flex-wrap gap-6">
                          {day.sessions.map((rec) => (
                            <Fragment key={`${rec._id}-details`}>
                        {rec.selfie && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1 font-medium">Punch In Selfie</p>
                            <img
                              src={rec.selfie}
                              alt="Punch in selfie"
                              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}

                        {rec.punchOutSelfie && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1 font-medium">Punch Out Selfie</p>
                            <img
                              src={rec.punchOutSelfie}
                              alt="Punch out selfie"
                              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}

                        {rec.location && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1 font-medium">Location</p>
                            <a
                              href={`https://maps.google.com/?q=${rec.location.lat},${rec.location.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <LocationIcon className="w-3 h-3" />
                              {rec.location.lat.toFixed(4)}, {rec.location.lng.toFixed(4)}
                            </a>
                          </div>
                        )}

                        {(rec.overtimeHours > 0 || (canRequestOvertime && rec.punchOutTime && Number(rec.overtimeHours || 0) > 0)) && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1 font-medium">Overtime</p>
                            <p className="text-xs text-gray-700">
                              {rec.overtimeHours}h -{' '}
                              <StatusBadge status={rec.overtimeStatus} />
                            </p>
                          </div>
                        )}

                        {canRequestOvertime && rec.punchOutTime && Number(rec.overtimeHours || 0) > 0 && (
                          <div className="w-full max-w-sm">
                            <OvertimeRequestForm
                              attendanceId={rec._id}
                              maxHours={Number(rec.overtimeHours || 0)}
                              disabledReason={getOvertimeDisabledReason(rec, hasPendingOvertime)}
                              onSuccess={onOvertimeSuccess}
                            />
                          </div>
                        )}

                     
                        {rec.remarks && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1 font-medium">Remarks</p>
                            <p className="text-xs text-gray-700">{rec.remarks}</p>
                          </div>
                        )}

                     
                        {isManagerOrAdmin && rec.status === 'pending' && rec.punchOutTime && (
                          <div className="w-full space-y-2">
                            <textarea
                              value={remarksInput}
                              onChange={(e) => setRemarksInput(e.target.value)}
                              placeholder="Add remarks (optional)"
                              rows={2}
                              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleValidate(rec._id, 'valid'); }}
                                disabled={validating}
                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition"
                              >
                                {validating ? 'Saving…' : '✓ Approve'}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleValidate(rec._id, 'invalid'); }}
                                disabled={validating}
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition"
                              >
                                {validating ? 'Saving…' : '✗ Reject'}
                              </button>
                            </div>
                          </div>
                        )}
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function LocationIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
