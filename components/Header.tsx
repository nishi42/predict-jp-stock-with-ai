
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <i className="fas fa-chart-line text-xl"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Market<span className="text-indigo-600">Oracle</span>
          </h1>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-500">
          <span className="hidden md:block">Gemini-Powered Index Predictions</span>
          <div className="h-4 w-px bg-slate-200 mx-2 hidden md:block"></div>
          <span className="text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">
            v1.0 Preview
          </span>
        </nav>
      </div>
    </header>
  );
};

export default Header;
