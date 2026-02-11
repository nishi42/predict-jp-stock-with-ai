
import React from 'react';
import { Prediction } from '../types';

interface HistoryTableProps {
  predictions: Prediction[];
  onCheckActual: (id: string) => void;
  isChecking: string | null;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ predictions, onCheckActual, isChecking }) => {
  const renderPriceCell = (pred: number, actual?: number) => {
    if (!actual) return <span className="text-sm font-mono text-slate-400">{pred.toLocaleString()}</span>;
    const diff = actual - pred;
    const error = (Math.abs(diff) / actual * 100).toFixed(2);
    const isClose = parseFloat(error) < 0.5;

    return (
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-mono font-bold text-slate-700">{actual.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400">予: {pred.toLocaleString()}</span>
        </div>
        <div className={`text-[10px] font-medium ${isClose ? 'text-emerald-500' : 'text-rose-400'}`}>
          {diff > 0 ? '+' : ''}{diff.toLocaleString()} ({error}%)
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-slate-800">予測履歴と精度検証</h2>
        <span className="text-xs text-slate-400">実績(実績値) / 予(AI予測値)</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            <tr>
              <th className="px-6 py-3 border-b">日付 / 指数</th>
              <th className="px-6 py-3 border-b">最高値 (High)</th>
              <th className="px-6 py-3 border-b">最安値 (Low)</th>
              <th className="px-6 py-3 border-b">終値 (Close)</th>
              <th className="px-6 py-3 border-b">状態</th>
              <th className="px-6 py-3 border-b">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {predictions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                  まだ予測データがありません。
                </td>
              </tr>
            ) : (
              predictions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">{p.date}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded self-start mt-1">
                        {p.index}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{renderPriceCell(p.predicted.high, p.actual?.high)}</td>
                  <td className="px-6 py-4">{renderPriceCell(p.predicted.low, p.actual?.low)}</td>
                  <td className="px-6 py-4">{renderPriceCell(p.predicted.close, p.actual?.close)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${
                      p.status === 'CLOSED' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {p.status === 'CLOSED' ? '検証済' : '待機中'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onCheckActual(p.id)}
                      disabled={p.status === 'CLOSED' || isChecking === p.id}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-30 flex items-center gap-1"
                    >
                      {isChecking === p.id ? (
                        <i className="fas fa-spinner animate-spin"></i>
                      ) : p.status === 'CLOSED' ? (
                        <i className="fas fa-check-double"></i>
                      ) : (
                        <i className="fas fa-sync-alt"></i>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
