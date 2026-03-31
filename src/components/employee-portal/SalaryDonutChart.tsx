import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SalaryDonutChartProps {
  earnings: number;
  deductions: number;
  centerLabel?: string;
  size?: number;
}

const COLORS = ['#10B981', '#EF4444'];

export function SalaryDonutChart({ earnings, deductions, centerLabel, size = 180 }: SalaryDonutChartProps) {
  const data = [
    { name: 'Take Home', value: earnings - deductions },
    { name: 'Deductions', value: deductions },
  ];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.32}
            outerRadius={size * 0.45}
            dataKey="value"
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-slate-700">{centerLabel}</span>
        </div>
      )}
    </div>
  );
}
