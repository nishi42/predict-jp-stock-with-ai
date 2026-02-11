
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MarketCard from './components/MarketCard';
import HistoryTable from './components/HistoryTable';
import Analytics from './components/Analytics';
import { MarketSummary, Prediction, MarketIndex } from './types';
import { fetchMarketData, generateDailyPrediction, fetchActualPrices } from './geminiService';

const App: React.FC = () => {
  const [marketData, setMarketData] = useState<Record<MarketIndex, MarketSummary | null>>({
    NIKKEI225: null,
    TOPIX: null,
  });
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<string | null>(null);
  const [autoStatus, setAutoStatus] = useState<string>('待機中');
  
  const hasCheckedAutoRef = useRef(false);

  // 初回読み込みと自動予測チェック
  useEffect(() => {
    const saved = localStorage.getItem('market_predictions_v3');
    let currentPredictions: Prediction[] = [];
    if (saved) {
      currentPredictions = JSON.parse(saved);
      setPredictions(currentPredictions);
    }
    
    refreshMarkets();
    
    // 自動予測の実行
    if (!hasCheckedAutoRef.current) {
      checkAndRunAutoPrediction(currentPredictions);
      hasCheckedAutoRef.current = true;
    }
  }, []);

  // 予測データが更新されたら保存
  useEffect(() => {
    localStorage.setItem('market_predictions_v3', JSON.stringify(predictions));
  }, [predictions]);

  const refreshMarkets = async () => {
    setIsLoading(true);
    try {
      const [n225, topix] = await Promise.all([
        fetchMarketData('NIKKEI225'),
        fetchMarketData('TOPIX')
      ]);
      setMarketData({ NIKKEI225: n225, TOPIX: topix });
    } catch (error) {
      console.error('Market data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTargetDate = () => {
    const now = new Date();
    const hour = now.getHours();
    const target = new Date();
    
    // 16時以降は翌営業日をターゲットにする
    if (hour >= 16) {
      target.setDate(target.getDate() + 1);
    }
    
    // 土日をスキップ
    while (target.getDay() === 0 || target.getDay() === 6) {
      target.setDate(target.getDate() + 1);
    }
    
    return target.toISOString().split('T')[0];
  };

  const checkAndRunAutoPrediction = async (currentPredictions: Prediction[]) => {
    const targetDate = getTargetDate();
    const indices: MarketIndex[] = ['NIKKEI225', 'TOPIX'];
    
    const missingIndices = indices.filter(idx => 
      !currentPredictions.some(p => p.date === targetDate && p.index === idx)
    );

    if (missingIndices.length === 0) {
      setAutoStatus(`${targetDate} の予測は作成済みです`);
      return;
    }

    setIsProcessing(true);
    setAutoStatus(`${targetDate} の市場分析と予測を自動実行中...`);

    try {
      const newEntries: Prediction[] = [];
      for (const index of missingIndices) {
        const result = await generateDailyPrediction(index, targetDate);
        newEntries.push({
          id: crypto.randomUUID(),
          date: targetDate,
          index,
          predicted: { high: result.high, low: result.low, close: result.close },
          reasoning: result.reasoning,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        });
      }
      setPredictions(prev => [...newEntries, ...prev]);
      setAutoStatus(`${targetDate} の予測が完了しました`);
    } catch (error) {
      console.error('Auto prediction error:', error);
      setAutoStatus('予測の自動実行中にエラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckActual = async (predictionId: string) => {
    const p = predictions.find(pred => pred.id === predictionId);
    if (!p) return;

    setIsChecking(predictionId);
    try {
      const actual = await fetchActualPrices(p.index, p.date);
      if (actual) {
        setPredictions(prev => prev.map(pred => 
          pred.id === predictionId 
            ? { ...pred, actual, status: 'CLOSED' } 
            : pred
        ));
      } else {
        alert(`${p.date} の確定データ（四本値）がまだ検索で見つかりません。大引けから少し時間をおいて再試行してください。`);
      }
    } catch (error) {
      console.error(error);
      alert('実績値の取得に失敗しました。');
    } finally {
      setIsChecking(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Market Status Ticker */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MarketCard data={marketData.NIKKEI225 || { index: 'NIKKEI225', currentPrice: 0, change: 0, changePercent: 0, lastUpdated: '---' }} isLoading={isLoading} />
            <MarketCard data={marketData.TOPIX || { index: 'TOPIX', currentPrice: 0, change: 0, changePercent: 0, lastUpdated: '---' }} isLoading={isLoading} />
          </div>
        </section>

        {/* System Status Banner (Replacing manual button) */}
        <section className="mb-10">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isProcessing ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                <i className={`fas ${isProcessing ? 'fa-robot' : 'fa-check-circle'} text-xl`}></i>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">システムステータス</h2>
                <p className={`text-sm font-medium ${isProcessing ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {autoStatus}
                </p>
              </div>
            </div>
            
            <div className="hidden md:block text-right relative z-10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Target Date</span>
              <span className="text-sm font-mono font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                {getTargetDate()}
              </span>
            </div>

            {/* Subtle background animation for processing */}
            {isProcessing && (
              <div className="absolute inset-0 bg-indigo-50/30 animate-pulse pointer-events-none"></div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <HistoryTable predictions={predictions} onCheckActual={handleCheckActual} isChecking={isChecking} />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Analytics predictions={predictions} />
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fas fa-microchip text-indigo-500"></i>
                AI分析ロジック
              </h4>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="text-indigo-600 mt-0.5"><i className="fas fa-clock"></i></div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>8:00 AM 予測:</strong> 米国市場の終値、ドル円、夜間先物をGeminiが収集し、当日のレンジ（高値・安値）と着地（終値）を予測します。
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="text-emerald-600 mt-0.5"><i className="fas fa-clipboard-check"></i></div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>16:00 PM 検証:</strong> 市場終了後、実績値を取得して誤差を計算。0.5%以内の誤差は非常に高い精度として判定されます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center">
        <p className="text-slate-400 text-[11px] font-medium uppercase tracking-widest">
          Nikkei & TOPIX Prediction Oracle v3.0 - Automated Insights
        </p>
      </footer>
    </div>
  );
};

export default App;
