'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Map, List, Grid } from 'lucide-react';

export type ViewMode = 'map' | 'list';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  className = '',
}) => {
  const handleViewChange = (view: ViewMode) => {
    if (typeof onViewChange === 'function') {
      onViewChange(view);
    }
  };

  return (
    <div className={`flex items-center bg-gray-100 rounded-lg p-1 ${className}`}>
      <Button
        variant={currentView === 'map' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('map')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
          currentView === 'map'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Map className="h-4 w-4" />
        <span className="text-sm font-medium">지도</span>
      </Button>

      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('list')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
          currentView === 'list'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <List className="h-4 w-4" />
        <span className="text-sm font-medium">리스트</span>
      </Button>
    </div>
  );
};

export default ViewToggle;