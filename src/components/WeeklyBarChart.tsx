'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  TooltipProps
} from 'recharts';

interface ChartDataPoint {
  subject: string;
  hours: number;
  fill: string;
}

interface WeeklyBarChartProps {
  data: ChartDataPoint[];
}

// Custom Tooltip for premium look
const CustomTooltip = (props: TooltipProps<number, string>) => {
  const { active, payload } = props;

  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;

    return (
      <div className="bg-[#16181a] border border-gray-800 p-3 rounded-xl shadow-xl">
        <p className="text-xs font-bold text-white mb-1 uppercase tracking-wider">
          {data.subject}
        </p>
        <p className="text-sm font-semibold text-[#C9A15A]">
          {data.hours} {data.hours === 1 ? "hour" : "hours"} studied
        </p>
      </div>
    );
  }

  return null;
};

export default function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col justify-center items-center text-gray-500 text-sm">
        <span className="font-semibold">No study logs logged this week yet.</span>
        <span>Start studying to see your chart populate!</span>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3135" vertical={false} />
          <XAxis
            dataKey="subject"
            stroke="#9ca3af"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={8}
            tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dx={-8}
            tickFormatter={(value) => `${value}h`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar
            dataKey="hours"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
