import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
const CameraCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [phase, setPhase] = useState('idle');
  const [imgSrc, setImgSrc] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const capture = useCallback(() => {
    const dataUrl = webcamRef.current?.getScreenshot();
    if (!dataUrl) return;
    setImgSrc(dataUrl);
    setPhase('preview');
    onCapture(dataUrl);
  }, [onCapture]);
  const retake = useCallback(() => {
    setImgSrc(null);
    onCapture(null);
    setPhase('live');
  }, [onCapture]);
  const flipCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);
  if (phase === 'idle') {
    return (
      <button
        onClick={() => setPhase('live')}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl py-6 text-sm text-gray-500 hover:text-indigo-600 transition"
      >
        <CameraIcon className="w-5 h-5" />
        Open Camera
      </button>
    );
  }
  if (phase === 'preview') {
    return (
      <div className="space-y-3">
        <div className="relative rounded-xl overflow-hidden border border-gray-200">
          <img
            src={imgSrc}
            alt="Captured selfie"
            className="w-full object-cover"
          />
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            ✓ Captured
          </span>
        </div>
        <button
          onClick={retake}
          className="w-full text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg py-2 transition hover:bg-gray-50"
        >
          Retake
        </button>
      </div>
    );
  }
  if (phase === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
        <p className="text-sm text-red-700">
          Camera access denied or unavailable. Please allow camera permissions and try again.
        </p>
        <button
          onClick={() => setPhase('live')}
          className="text-sm font-medium text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.85}
          videoConstraints={{
            facingMode,
            width: { ideal: 640 },
            height: { ideal: 480 },
          }}
          mirrored={facingMode === 'user'}
          className="w-full"
          onUserMediaError={() => setPhase('error')}
        />
        {}
        <button
          onClick={flipCamera}
          aria-label="Flip camera"
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition"
        >
          <FlipIcon className="w-4 h-4" />
        </button>
      </div>
      <button
        onClick={capture}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition"
      >
        <CameraIcon className="w-4 h-4" />
        Take Selfie
      </button>
    </div>
  );
};
const CameraIcon = ({ className }) => {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
};
const FlipIcon = ({ className }) => {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
};
export default CameraCapture;