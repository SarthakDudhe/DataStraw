import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <span className="text-5xl sm:text-6xl font-extrabold text-blue-500 font-mono tracking-tight">404</span>
      <h1 className="mt-4 text-xl sm:text-2xl font-bold text-zinc-100">Page not found</h1>
      <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-sm">
        The requested URL was not found on this server or may have been moved.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Tickets
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
