
import React from 'react';
import { MarketSummary } from '../types';

interface MarketCardProps {
  data: MarketSummary;
  isLoading: boolean;
}

const MarketCard: React.FC<MarketCardProps> = ({ data, isLoading }) => {
  const isUp = data.change >= 0;

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
        <div className="h-4 w-24 bg-slate-100 rounded mb-4"></div>
        <div className="h-8 w-40 bg-slate-100 rounded mb-2"></div>
        <div className="h-4 w-32 bg-slate-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {data.index === 'NIKKEI225' ? '日経平均株価' : 'TOPIX'}
        </h3>
        <i className={`fas ${isUp ? 'fa-arrow-trend-up text-emerald-500' : 'fa-arrow-trend-down text-rose-500'} text-lg`}></i>
      </div>
      
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold text-slate-900">
          {data.currentPrice.toLocaleString('ja-JP')}
          <span className="text-sm font-normal text-slate-400 ml-1">円</span>
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isUp ? '+' : ''}{data.change.toLocaleString('ja-JP')} ({data.changePercent}%)
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
        <span>最終更新: {data.lastUpdated}</span>
        <span className="bg-slate-50 px-2 py-0.5 rounded uppercase font-medium">Real-time Search</span>
      </div>
    </div>
  );
};

export default MarketCard;
