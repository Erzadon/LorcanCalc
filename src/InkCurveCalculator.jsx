<!DOCTYPE html>
<html lang="en">
  <head>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4675088988721722" crossorigin="anonymous"></script>
    <script>
      // Google Cookie Consent
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied'
      });
    </script>
  </head>
</html>

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function InkCurveCalculator() {
  const [cardCounts, setCardCounts] = useState(Array(11).fill(0));
  const [manualNonInkables, setManualNonInkables] = useState('');
  const [probabilityTarget, setProbabilityTarget] = useState(85);
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  const handleCardCountChange = (cost, value) => {
    const newCounts = [...cardCounts];
    newCounts[cost] = parseInt(value, 10) || 0;
    setCardCounts(newCounts);
  };

  const getTotalCardCount = () => {
    return cardCounts.reduce((sum, count) => sum + count, 0);
  };

  const calculateCurve = () => {
    const totalCards = getTotalCardCount();
    if (totalCards === 0) {
      setResult({ error: 'Please enter at least one card count.' });
      return;
    }

    const weightedSum = cardCounts.reduce((sum, count, cost) => sum + count * cost, 0);
    const averageCost = weightedSum / totalCards;
    const targetTurn = Math.round(averageCost);
    const cardsSeen = 7 + targetTurn;

    let nonInkables;
    if (manualNonInkables !== '') {
      nonInkables = parseInt(manualNonInkables, 10);
    } else {
      for (let possibleNonInkables = 0; possibleNonInkables <= totalCards; possibleNonInkables++) {
        const inkables = totalCards - possibleNonInkables;
        let probSuccess = 0;
        for (let k = targetTurn; k <= cardsSeen; k++) {
          probSuccess += binomialPMF(k, cardsSeen, inkables / totalCards);
        }
        if (probSuccess * 100 >= probabilityTarget) {
          nonInkables = possibleNonInkables;
        } else {
          break;
        }
      }
    }

    if (nonInkables < 0 || nonInkables > totalCards) {
      setResult({ error: 'Calculated non-inkables value is invalid.' });
      return;
    }

    const inkablesInDeck = totalCards - nonInkables;
    let successProb = 0;
    for (let k = targetTurn; k <= cardsSeen; k++) {
      successProb += binomialPMF(k, cardsSeen, inkablesInDeck / totalCards);
    }
    const successRate = successProb * 100;

    const newChartData = Array.from({ length: 10 }, (_, turn) => {
      const seen = 7 + turn;
      const requiredInk = turn + 1;
      let turnProb = 0;
      for (let k = requiredInk; k <= seen; k++) {
        turnProb += binomialPMF(k, seen, inkablesInDeck / totalCards);
      }
      return { turn: turn + 1, 'Odds of Playing on Curve': parseFloat((turnProb * 100).toFixed(1)) };
    });

    setResult({
      averageCost: averageCost.toFixed(2),
      targetTurn,
      cardsSeen,
      inkablesInDeck,
      nonInkablesInDeck: nonInkables,
      probability: successRate.toFixed(1),
      totalCards
    });
    setChartData(newChartData);
  };

  function binomialPMF(k, n, p) {
    const comb = factorial(n) / (factorial(k) * factorial(n - k));
    return comb * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }

  function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Perfect Ratio</h1>
      <p className="mb-4 text-sm text-gray-700">
        Enter cards for the cost you expect to play them at. This includes effects like shift or cost reduction.
        The goal is to find the maximum non-inkables you can safely play to hit curve.
      </p>

      <div className="mb-4">
        <label className="block font-semibold">Manual Non-Inkables Override</label>
        <input
          type="number"
          value={manualNonInkables}
          onChange={(e) => setManualNonInkables(e.target.value)}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Non-Inkable Count (optional)"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">Target Probability %</label>
        <input
          type="number"
          value={probabilityTarget}
          onChange={(e) => setProbabilityTarget(parseInt(e.target.value, 10))}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
          max="99"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">Enter Card Counts (Cost You Expect to Play Them)</label>
        <div className="grid grid-cols-2 gap-2">
          {cardCounts.map((count, cost) => (
            <div key={cost}>
              <label className="text-sm">Cost {cost}</label>
              <input
                type="number"
                value={count}
                onChange={(e) => handleCardCountChange(cost, e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <div className="text-right text-sm mt-2 text-gray-600">
          Total Cards: {getTotalCardCount()}
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={calculateCurve}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Calculate
        </button>
      </div>

      {result && (
        <div className="p-4 bg-gray-100 rounded mb-4">
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <>
              <p><strong>Weighted Average Cost:</strong> {result.averageCost}</p>
              <p><strong>Target Ink:</strong> {result.targetTurn}</p>
              <p><strong>Cards Seen by Turn {result.targetTurn}:</strong> {result.cardsSeen}</p>
              <p><strong>Inkables in Deck:</strong> {result.inkablesInDeck}</p>
              <p><strong>Max Non-Inkables:</strong> {result.nonInkablesInDeck}</p>
              <p><strong>Estimated Success Rate:</strong> {result.probability}%</p>
              <p><strong>Total Cards:</strong> {result.totalCards}</p>
            </>
          )}
        </div>
      )}

      {chartData.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turn" label={{ value: 'Turn', position: 'insideBottomRight', offset: -5 }} />
              <YAxis domain={[0, 100]} label={{ value: 'Chance (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Odds of Playing on Curve" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-8">
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-4675088988721722"
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
      </div>

      <footer className="text-xs text-gray-500 mt-8 text-center">
        This site uses cookies to personalize ads and to analyze traffic. Information about your use of this site is shared with Google.
      </footer>
    </div>
  );
}

export default InkCurveCalculator;
