import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetMyAttendanceQuery,
  useGetMyOvertimeQuery,
  usePunchInMutation,
  usePunchOutMutation,
} from '../features/apiSlice';
import CameraCapture from './CameraCapture';
import LocationPicker from './LocationPicker';
import AttendanceTable from './AttendanceTable';
import OvertimeTracker from './OvertimeTracker';

const getApiErrorMessage = (err, fallback) =>
  err?.data?.message ||
  err?.data?.error ||
  err?.error ||
  (err?.status ? `${fallback} (${err.status})` : fallback);

const getRecordHours = (record) => {
  if (!record?.punchOutTime) {
    return 0;
  }

  const storedHours = record.totalHours == null ? NaN : Number(record.totalHours);
  if (Number.isFinite(storedHours)) {
    return storedHours;
  }

  const punchIn = new Date(record.punchInTime);
  const punchOut = new Date(record.punchOutTime);
  const calculatedHours = (punchOut - punchIn) / (1000 * 60 * 60);

  return Number.isFinite(calculatedHours) && calculatedHours > 0
    ? Math.round(calculatedHours * 100) / 100
    : 0;
};

const MyAttendanceSection = ({ onAttendanceChange }) => {
  const userRole = useSelector((state) => state.auth.user?.role);
  const canUseOvertime = userRole === 'employee' || userRole === 'manager';
  const { data: attendance, isLoading, isError } = useGetMyAttendanceQuery();
  const {
    data: overtimeRequests = [],
    refetch: refetchOvertime,
    isLoading: loadingOvertime,
  } = useGetMyOvertimeQuery(undefined, { skip: !canUseOvertime });

  const [punchIn,  { isLoading: punchingIn  }] = usePunchInMutation();
  const [punchOut, { isLoading: punchingOut }] = usePunchOutMutation();

  const [selfie,     setSelfie]     = useState(null);
  const [punchOutSelfie, setPunchOutSelfie] = useState(null);
  const [location,   setLocation]   = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showPunchOutCamera, setShowPunchOutCamera] = useState(false);

  const openRecord = attendance?.find((rec) => !rec.punchOutTime) ?? null;

  const totalDays  = attendance?.length ?? 0;
  const validDays  = attendance?.filter((r) => r.status === 'valid').length ?? 0;
  const totalHours = attendance?.reduce((sum, r) => sum + getRecordHours(r), 0) ?? 0;
  const hasPendingOvertime = overtimeRequests.some((request) => request.status === 'pending');

  const handlePunchIn = async () => {
    if (!selfie || !location) {
      alert('Please capture a selfie and allow location access');
      return;
    }
    try {
      await punchIn({ selfie, location }).unwrap();
      setSelfie(null);
      setLocation(null);
      setShowCamera(false);
      onAttendanceChange?.();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to punch in'));
    }
  };

  const handlePunchOut = async () => {
    if (!punchOutSelfie) {
      alert('Please capture a punch out selfie');
      return;
    }

    try {
      await punchOut({ selfie: punchOutSelfie }).unwrap();
      setPunchOutSelfie(null);
      setShowPunchOutCamera(false);
  
      onAttendanceChange?.();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to punch out'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-gray-500">
          <Spinner />
          <span className="text-sm">Loading attendance…</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">Failed to load attendance data. Please refresh.</p>
      </div>
    );
  }

  return (
    <>
      {}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Days Logged',   value: totalDays },
          { label: 'Days Approved', value: validDays },
          { label: 'Total Hours',   value: `${totalHours.toFixed(1)}h` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Today's Status</h2>

            {openRecord ? (
              <PunchedInPanel
                record={openRecord}
                selfie={punchOutSelfie}
                showCamera={showPunchOutCamera}
                punchingOut={punchingOut}
                onShowCamera={() => setShowPunchOutCamera(true)}
                onCapture={setPunchOutSelfie}
                onPunchOut={handlePunchOut}
                onCancel={() => { setShowPunchOutCamera(false); setPunchOutSelfie(null); }}
              />
            ) : (
              <PunchInPanel
                showCamera={showCamera}
                selfie={selfie}
                location={location}
                punchingIn={punchingIn}
                onShowCamera={() => setShowCamera(true)}
                onCapture={setSelfie}
                onLocationChange={setLocation}
                onConfirm={handlePunchIn}
                onCancel={() => { setShowCamera(false); setSelfie(null); setLocation(null); }}
              />
            )}
          </div>
        </div>

        {}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">My Attendance History</h2>
            {}
            <AttendanceTable
              records={attendance ?? []}
              isManagerOrAdmin={false}
              canRequestOvertime={canUseOvertime}
              hasPendingOvertime={hasPendingOvertime}
              onOvertimeSuccess={() => {
                refetchOvertime();
                onAttendanceChange?.();
              }}
            />
          </div>
        </div>
      </div>

      {canUseOvertime && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">My Overtime Requests</h2>
          <OvertimeTracker requests={overtimeRequests} isLoading={loadingOvertime} />
        </div>
      )}
    </>
  );
};

const PunchInPanel = ({
  showCamera, selfie, location, punchingIn,
  onShowCamera, onCapture, onLocationChange, onConfirm, onCancel,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
        Not punched in yet
      </div>

      {!showCamera ? (
        <button
          onClick={onShowCamera}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition"
        >
          <LogInIcon />
          Punch In
        </button>
      ) : (
        <div className="space-y-3">
          <CameraCapture onCapture={onCapture} />

          {selfie && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
              <CheckIcon />
              Selfie captured
            </div>
          )}

          <LocationPicker onLocationChange={onLocationChange} />

          {location && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
              <CheckIcon />
              Location captured
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onConfirm}
              disabled={punchingIn || !selfie || !location}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition"
            >
              {punchingIn ? 'Confirming…' : 'Confirm Punch In'}
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PunchedInPanel = ({
  record,
  selfie,
  showCamera,
  punchingOut,
  onShowCamera,
  onCapture,
  onPunchOut,
  onCancel,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-green-700">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
        Punched in at{' '}
        {new Date(record.punchInTime).toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit',
        })}
      </div>

      {!showCamera ? (
        <button
          onClick={onShowCamera}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition"
        >
          <LogOutIcon />
          Punch Out
        </button>
      ) : (
        <div className="space-y-3">
          <CameraCapture onCapture={onCapture} />

          {selfie && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
              <CheckIcon />
              Punch out selfie captured
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onPunchOut}
              disabled={punchingOut || !selfie}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition"
            >
              {punchingOut ? 'Punching out…' : 'Confirm Punch Out'}
            </button>
            <button
              onClick={onCancel}
              disabled={punchingOut}
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckIcon = () => {
  return (
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
};
const LogInIcon = () => {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );
};
const LogOutIcon = () => {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
};
const Spinner = () => {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
};

export default MyAttendanceSection;
