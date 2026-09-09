import React from 'react';

const PageContainer = ({ children, className = '' }) => {
  return (
    <main className={`max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 ${className}`}>
      {children}
    </main>
  );
};

export default PageContainer;
