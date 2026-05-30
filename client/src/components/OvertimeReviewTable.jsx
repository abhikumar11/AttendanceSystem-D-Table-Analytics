const OvertimeReviewTable = ({
  requests = [],
  isLoading = false,
  onReview,
  emptyMessage = 'No pending overtime requests.',
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!requests.length) {
    return <div className="text-center py-8 text-sm text-gray-400">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Hours</th>
            <th className="px-4 py-3">Shift Status</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.map((req) => {
            const shiftApproved = req.attendanceId?.status === 'valid';

            return (
              <tr key={req._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{req.employeeId?.name || '-'}</p>
                  <p className="text-xs text-gray-400">{req.employeeId?.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {req.attendanceId?.punchInTime
                    ? new Date(req.attendanceId.punchInTime).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'}
                </td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {Number(req.requestedHours).toFixed(1)}h
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      shiftApproved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {shiftApproved ? 'Approved' : req.attendanceId?.status || 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-xs">
                  <span className="line-clamp-2">{req.reason}</span>
                </td>
                <td className="px-4 py-3">
                  {shiftApproved ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onReview(req._id, 'approved')}
                        className="px-3 py-1.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReview(req._id, 'rejected')}
                        className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600">Approve shift first</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OvertimeReviewTable;
