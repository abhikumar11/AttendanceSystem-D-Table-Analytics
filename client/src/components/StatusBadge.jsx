const CONFIG = {
  valid:      { label: 'Valid',      classes: 'bg-green-100 text-green-800' },
  invalid:    { label: 'Invalid',    classes: 'bg-red-100 text-red-800' },
  pending:    { label: 'Pending',    classes: 'bg-yellow-100 text-yellow-800' },
  completed:  { label: 'Completed',  classes: 'bg-blue-100 text-blue-800' },
  incomplete: { label: 'Incomplete', classes: 'bg-orange-100 text-orange-800' },
  open:       { label: 'Active',     classes: 'bg-green-100 text-green-700' },
  approved:   { label: 'Approved',   classes: 'bg-green-100 text-green-800' },
  rejected:   { label: 'Rejected',   classes: 'bg-red-100 text-red-800' },
  none:       { label: 'No OT',      classes: 'bg-gray-100 text-gray-500' },
};

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const { label, classes } = CONFIG[status] ?? {
    label: status,
    classes: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
