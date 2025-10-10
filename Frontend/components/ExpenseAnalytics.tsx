import React, { useState, useEffect } from 'react';
import { TimePeriodSummary } from '../types';
import { api } from '../api';

interface ExpenseAnalyticsProps {
  onError: (message: string) => void;
}

const ExpenseAnalytics: React.FC<ExpenseAnalyticsProps> = ({ onError }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [timeSummary, setTimeSummary] = useState<TimePeriodSummary[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    if (timeRange === 'week') {
      start.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      start.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'year') {
      start.setFullYear(now.getFullYear() - 1);
    }
    
    return {
      start: start.toISOString(),
      end: now.toISOString(),
    };
  };

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange();
      
      // Determine time period granularity based on selected range
      const timePeriod = timeRange === 'week' ? 'daily' : timeRange === 'month' ? 'daily' : 'monthly';
      
      const timeData = await api.getTimePeriodSummary(timePeriod as any, dateRange);
      setTimeSummary(timeData);
      
      // Calculate total spent from time data
      const total = timeData.reduce((sum, item) => sum + item.total, 0);
      setTotalSpent(total);
      
      // Calculate transactions count from time data
      const transactions = timeData.reduce((sum, item) => sum + item.count, 0);
      setCategorySummary([{ category: "All Expenses", total, count: transactions }]);
    } catch (error: any) {
      onError(error?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatPeriodLabel = (period: string) => {
    if (period.includes('-W')) {
      // Weekly format (2023-W01)
      const [year, week] = period.split('-W');
      return `Week ${week}, ${year}`;
    } else if (period.includes('-')) {
      if (period.length === 10) {
        // Daily format (YYYY-MM-DD)
        return new Date(period).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      } else {
        // Monthly format (YYYY-MM)
        const [year, month] = period.split('-');
        const date = new Date();
        date.setFullYear(parseInt(year, 10));
        date.setMonth(parseInt(month, 10) - 1);
        return date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        });
      }
    }
    return period;
  };

  // Removed category chart generation function

  const generateTimeChart = () => {
    if (timeSummary.length === 0) return null;
    
    // Sort chronologically
    const sortedData = [...timeSummary].sort((a, b) => {
      if (a.period < b.period) return -1;
      if (a.period > b.period) return 1;
      return 0;
    });
    
    const maxAmount = Math.max(...sortedData.map(item => item.total));
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
        {sortedData.map(item => {
          const barHeight = `${Math.max((item.total / maxAmount) * 100, 5)}%`;
          
          return (
            <div key={item.period} className="flex items-center gap-4">
              <div className="w-1/3 text-right text-sm text-slate-300">
                {formatPeriodLabel(item.period)}
              </div>
              <div className="w-2/3">
                <div className="relative h-8 bg-slate-700/50 rounded-lg overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-accent-600 to-accent-400"
                    style={{ width: barHeight }}
                  ></div>
                  <div className="absolute left-2 top-0 h-full flex items-center text-xs font-medium text-white">
                    ₹{item.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Expense Analytics
        </h3>
        
        <div className="flex bg-slate-800 rounded-lg p-1 self-start">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              timeRange === 'week'
                ? 'bg-primary-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              timeRange === 'month'
                ? 'bg-primary-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              timeRange === 'year'
                ? 'bg-primary-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Last Year
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin"></div>
            <span className="text-slate-400">Loading analytics...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 flex flex-col items-center">
              <h4 className="text-slate-400 mb-2 text-sm">Total Spent</h4>
              <p className="text-white text-2xl font-bold">₹{totalSpent.toFixed(2)}</p>
              <p className="text-xs text-slate-400 mt-1">in the last {timeRange}</p>
            </div>
          </div>

          {totalSpent === 0 ? (
            <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-400">No expense data available for this period</p>
            </div>
          ) : (
            <>
              {/* Time trend section */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white">
                  {timeRange === 'week' ? 'Daily' : timeRange === 'month' ? 'Daily' : 'Monthly'} Spending Trend
                </h3>
                {generateTimeChart()}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ExpenseAnalytics;