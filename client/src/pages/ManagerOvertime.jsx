import {
  useGetPendingOvertimeQuery,
  useGetTeamAttendanceQuery,
  useReviewOvertimeMutation,
} from '../features/apiSlice';
import Navbar from '../components/Navbar';
import OvertimeReviewTable from '../components/OvertimeReviewTable';

const ManagerOvertime = () => {
  const {
    data: pendingOT,
    refetch: refetchOT,
    isLoading,
  } = useGetPendingOvertimeQuery();
  const { refetch: refetchAttendance } = useGetTeamAttendanceQuery();
  const [reviewOvertime] = useReviewOvertimeMutation();

  const handleReviewOT = async (id, status) => {
    try {
      await reviewOvertime({ id, status }).unwrap();
      refetchOT();
      refetchAttendance();
    } catch (err) {
      alert(err?.data?.message || 'Failed to review overtime request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Team Overtime</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review pending overtime requests from your team.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <OvertimeReviewTable
            requests={pendingOT || []}
            isLoading={isLoading}
            onReview={handleReviewOT}
            emptyMessage="No pending overtime requests for your team."
          />
        </div>
      </main>
    </div>
  );
};

export default ManagerOvertime;
