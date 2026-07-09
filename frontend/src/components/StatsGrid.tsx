import React from 'react';

interface StatItem {
  label: string;

  value: number;

  color: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

const StatsGrid: React.FC<
  StatsGridProps
> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
      {stats.map(
        (
          stat,
          index
        ) => (
          <div
            key={index}
            className={`bg-gradient-to-r ${stat.color} text-white rounded-2xl p-5 shadow-lg`}
          >
            <p className="text-sm opacity-90">
              {
                stat.label
              }
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {
                stat.value
              }
            </h3>
          </div>
        )
      )}
    </div>
  );
};

export default StatsGrid;