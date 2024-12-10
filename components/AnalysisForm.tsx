import { useState } from 'react';

const AnalysisForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      ticker: formData.get('ticker'),
      endDate: formData.get('endDate') || undefined,
      lookbackDays: parseInt(formData.get('lookbackDays') as string) || 365,
      crossoverDays: parseInt(formData.get('crossoverDays') as string) || 180,
    };

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.text();
      
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(result);
        newWindow.document.close();
      }
    } catch (err) {
      setError('Failed to analyze stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-[800px] bg-white p-12 rounded-xl shadow-2xl m-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
          Stock Technical Analysis
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="ticker" className="block text-xl font-medium text-gray-700 mb-2">
              Stock Ticker Symbol
            </label>
            <input
              type="text"
              id="ticker"
              name="ticker"
              required
              className="w-full h-14 text-lg px-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="e.g., AAPL, GOOGL, MSFT"
            />
            <p className="mt-2 text-base text-gray-500">Enter the stock symbol (e.g., AAPL for Apple Inc.)</p>
          </div>

          <div>
            <label htmlFor="endDate" className="block text-xl font-medium text-gray-700 mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="w-full h-14 text-lg px-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <p className="mt-2 text-base text-gray-500">Leave empty for current date</p>
          </div>

          <div>
            <label htmlFor="lookbackDays" className="block text-xl font-medium text-gray-700 mb-2">
              Lookback Days
            </label>
            <input
              type="number"
              id="lookbackDays"
              name="lookbackDays"
              defaultValue="365"
              min="1"
              className="w-full h-14 text-lg px-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <p className="mt-2 text-base text-gray-500">Number of days to analyze (default: 365)</p>
          </div>

          <div>
            <label htmlFor="crossoverDays" className="block text-xl font-medium text-gray-700 mb-2">
              Crossover Days
            </label>
            <input
              type="number"
              id="crossoverDays"
              name="crossoverDays"
              defaultValue="180"
              min="1"
              className="w-full h-14 text-lg px-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <p className="mt-2 text-base text-gray-500">Number of days for crossover calculation (default: 180)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 mt-8 text-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Analyze Stock'
            )}
          </button>

          {error && (
            <div className="mt-6 p-4 text-lg text-red-600 text-center bg-red-50 rounded-lg">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AnalysisForm;