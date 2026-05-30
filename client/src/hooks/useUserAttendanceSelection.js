import { useCallback, useMemo, useState } from 'react';

const getRecordDateKey = (record) => (
  record.punchInDate
    ? new Date(record.punchInDate).toISOString().slice(0, 10)
    : new Date(record.punchInTime).toLocaleDateString('en-CA')
);

const useUserAttendanceSelection = ({ users = [], attendance = [] }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const selectedUser = useMemo(
    () => users.find((user) => user._id === selectedUserId),
    [selectedUserId, users]
  );

  const selectedUserAttendance = useMemo(() => {
    if (!selectedUserId) {
      return [];
    }

    return attendance
      .filter((record) => {
        const employeeId = record.employeeId?._id || record.employeeId;
        return employeeId === selectedUserId;
      })
      .filter((record) => !dateFilter || getRecordDateKey(record) === dateFilter)
      .filter((record) => !statusFilter || record.status === statusFilter);
  }, [attendance, dateFilter, selectedUserId, statusFilter]);

  const selectUser = useCallback((userId) => {
    setSelectedUserId(userId);
    setDateFilter('');
    setStatusFilter('');
  }, []);

  const clearFilters = useCallback(() => {
    setDateFilter('');
    setStatusFilter('');
  }, []);

  return {
    clearFilters,
    dateFilter,
    selectedUser,
    selectedUserAttendance,
    selectedUserId,
    selectUser,
    setDateFilter,
    setStatusFilter,
    statusFilter,
  };
};

export default useUserAttendanceSelection;
