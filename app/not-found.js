import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-black text-cyan-500 mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        The anime or page you are looking for does not exist or has been moved.
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
      >
        Back to Home
      </Link>
    </div>
  );
}
