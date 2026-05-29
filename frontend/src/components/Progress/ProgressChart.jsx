import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 border border-gray-700/50 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-display font-bold text-ghost-400">
        {payload[0].value}<span className="text-xs text-gray-500">/10</span>
      </p>
    </div>
  );
}

export default function ProgressChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-gray-500">No session data yet. Upload your first stance photo to start tracking progress.</p>
      </div>
    );
  }

  const chartData = data.map((item, idx) => ({
    name: new Date(item.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.overallScore,
    session: idx + 1,
  }));

  return (
    <div className="glass-card p-6">
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8455ea" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8455ea" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#374151' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#8455ea"
            strokeWidth={3}
            fill="url(#scoreGradient)"
            dot={{ fill: '#8455ea', stroke: '#1a1a2e', strokeWidth: 3, r: 5 }}
            activeDot={{ fill: '#a07ef2', stroke: '#8455ea', strokeWidth: 2, r: 7 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
