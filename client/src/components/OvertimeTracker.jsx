import StatusBadge from './StatusBadge';

const OvertimeTracker = ({ requests = [], isLoading = false }) => {
  if (isLoading) {
    return <div className="text-center py-6 text-sm text-gray-400">Loading overtime requests...</div>;
  }

  if (!requests.length) {
    return <div className="text-center py-6 text-sm text-gray-400">No overtime requests yet.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Hours</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Reviewed By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.map((request) => (
            <tr key={request._id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {request.attendanceId?.punchInTime
                  ? new Date(request.attendanceId.punchInTime).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '-'}
              </td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {Number(request.requestedHours).toFixed(1)}h
              </td>
              <td className="px-4 py-3 text-gray-600 max-w-xs">
                <span className="line-clamp-2">{request.reason}</span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={request.status} />
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {request.reviewedBy?.name || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OvertimeTracker;
