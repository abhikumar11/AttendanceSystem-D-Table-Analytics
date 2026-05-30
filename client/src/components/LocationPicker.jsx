import { useCallback, useState, useEffect } from 'react';

const LocationPicker = ({ onLocationChange }) => {
  const [status, setStatus] = useState('idle'); 
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const location = { lat, lng, accuracy };
        setCoords(location);
        onLocationChange(location);
        setStatus('success');

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          setAddress(
            data.display_name?.split(',').slice(0, 3).join(', ') || ''
          );
        } catch {
          setAddress('');
        }
      },
      (err) => {
        const msg =
          err.code === 1
            ? 'Location permission denied. Please enable location in browser settings.'
            : err.code === 2
            ? 'Location unavailable. Check your connection or GPS.'
            : 'Location request timed out. Please try again.';
        setErrorMsg(msg);
        setStatus('error');
        onLocationChange(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onLocationChange]);

  useEffect(() => {
    const timer = window.setTimeout(requestLocation, 0);
    return () => window.clearTimeout(timer);
  }, [requestLocation]);

  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
        <Spinner />
        Getting your location…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 space-y-2">
        <p className="text-sm text-red-700">{errorMsg}</p>
        <button
          onClick={requestLocation}
          className="text-sm font-medium text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 space-y-0.5">
      <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
        <LocationIcon className="w-4 h-4 shrink-0" />
        Location captured
      </div>
      {address && (
        <p className="text-xs text-green-600 pl-6 leading-tight">{address}</p>
      )}
      <p className="text-xs text-green-500 pl-6">
        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        {coords.accuracy ? ` · ±${Math.round(coords.accuracy)}m` : ''}
      </p>
    </div>
  );
};

const LocationIcon = ({ className }) => {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
};
const Spinner = () => {
  return (
    <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
};

export default LocationPicker;
