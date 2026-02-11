
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Prediction } from '../types';

interface AnalyticsProps {
  predictions: Prediction[];
}

const Analytics: React.FC<AnalyticsProps> = ({ predictions }) => {
  const closedPredictions = useMemo(() => 
    predictions
      .filter(p => p.status === 'CLOSED' && p.actual)
      .sort((a, b) => a.date.localeCompare(b.date)),
  [predictions]);

  // Chart data format
  const chartData = useMemo(() => {
    return closedPredictions.map(p => ({
      date: p.date.substring(5), // MM-DD
      predicted: p.predicted.close,
      actual: p.actual?.close,
    }));
  }, [closedPredictions]);

  const accuracy = useMemo(() => {
    if (closedPredictions.length === 0) return 0;
    const totalError = closedPredictions.reduce((acc, p) => {
      if (!p.actual) return acc;
      return acc + (Math.abs(p.actual.close - p.predicted.close) / p.actual.close);
    }, 0);
    return (100 - (totalError / closedPredictions.length * 100)).toFixed(2);
  }, [closedPredictions]);

  if (closedPredictions.length < 2) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
          <i className="fas fa-chart-line text-slate-300"></i>
        </div>
        <h3 className="text-sm font-bold text-slate-700">分析データ蓄積中</h3>
        <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
          精度推移を表示するには<br/>2件以上の検証完了データが必要です。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-bold text-slate-800 text-sm">終値予測トレンド</h2>
          <p className="text-[10px] text-slate-400 mt-1">AI予測 vs 市場実績</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-indigo-600">{accuracy}%</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase">Avg. Accuracy</div>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" fontSize={9} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line type="monotone" dataKey="predicted" name="予測" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{r: 4}} />
            <Line type="monotone" dataKey="actual" name="実績" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
