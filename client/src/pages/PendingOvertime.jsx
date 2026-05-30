import {
  useGetPendingOvertimeQuery,
  useReviewOvertimeMutation,
} from '../features/apiSlice';
import Navbar from '../components/Navbar';
import OvertimeReviewTable from '../components/OvertimeReviewTable';

const PendingOvertime = () => {
  const {
    data: pendingOT,
    refetch: refetchOT,
    isLoading: loadingOT,
  } = useGetPendingOvertimeQuery();
  const [reviewOvertime] = useReviewOvertimeMutation();

  const handleReviewOT = async (id, status) => {
    try {
      await reviewOvertime({ id, status }).unwrap();
      refetchOT();
    } catch (err) {
      alert(err?.data?.message || 'Failed to review overtime request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Pending Overtime Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Approve or reject overtime after the standard shift is approved.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <OvertimeReviewTable
            requests={pendingOT || []}
            isLoading={loadingOT}
            onReview={handleReviewOT}
          />
        </div>
      </main>
    </div>
  );
};

export default PendingOvertime;
