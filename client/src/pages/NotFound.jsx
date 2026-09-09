import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <span className="text-5xl font-extrabold text-blue-600 tracking-tight">404</span>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary">
            Return to Tickets
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
