import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ProgressChartProps {
  data: any[];
  type: 'line' | 'bar';
  dataKey: string;
  color?: string;
  title: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ 
  data, 
  type, 
  dataKey, 
  color = '#20C997',
  title 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-elevated border border-surface-raised rounded-xl p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-primary-500">
            {`${title}: ${payload[0].value}${dataKey.includes('percent') ? '%' : ''}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const chartProps = {
    width: '100%',
    height: 300,
    data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      {type === 'line' ? (
        <LineChart {...chartProps} height={250}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis 
            dataKey="date" 
            stroke="#666666"
            fontSize={10}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#666666"
            fontSize={10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      ) : (
        <BarChart {...chartProps} height={250}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis 
            dataKey="date" 
            stroke="#666666"
            fontSize={10}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#666666"
            fontSize={10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey={dataKey} 
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};

export default ProgressChart;