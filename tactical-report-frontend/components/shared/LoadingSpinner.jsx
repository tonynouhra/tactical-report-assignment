import { ClipLoader } from 'react-spinners';

export default function LoadingSpinner({ size = 40, color = '#2563eb', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="text-center">
          <ClipLoader color={color} size={size} />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <ClipLoader color={color} size={size} />
    </div>
  );
}