import React from 'react';

interface StatsDisplayProps {
  stats: any;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  return (
    <div className="stats-display">
      {/* This component can be used for additional stats displays if needed */}
      <div>Stats: {stats?.usedSlots || 0} photos uploaded</div>
    </div>
  );
};

export default StatsDisplay;