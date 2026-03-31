import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EarningsLineChartProps {
  data: { month: string; amount: number }[];
}

const formatAmount = (val: number) => {
  if (val >= 100000) return `${(val / 100000).toFixed(1)} L`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)} K`;
  return val.toString();
};

export function EarningsLineChart({ data }: EarningsLineChartProps) {
  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatAmount}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Net Pay']}
            contentStyle={{ borderRadius: 8, fontSize: 13 }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#2563EB"
            strokeWidth={2}
            dot={{ r: 4, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
