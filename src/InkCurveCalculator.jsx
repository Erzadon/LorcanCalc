import { useState } from "react";

export default function InkCurveCalculator() {
  const [cardCounts, setCardCounts] = useState(Array(11).fill(0)); // Cost 0 to 10
  const [deckSize, setDeckSize] = useState(60);
  const [targetAccuracy, setTargetAccuracy] = useState(75); // percent
  const [result, setResult] = useState(null);

  const handleCardCountChange = (cost, value) => {
    const newCounts = [...cardCounts];
    newCounts[cost] = Number(value);
    setCardCounts(newCounts);
  };

  function calculateCurve() {
    const totalCards = cardCounts.reduce((sum, count) => sum + count, 0);
    if (totalCards !== deckSize) {
      setResult({ error: `Deck must have exactly ${deckSize} cards. Currently has ${totalCards}.` });
      return;
    }

    const totalCost = cardCounts.reduce((sum, count, cost) => sum + cost * count, 0);
    const averageCost = totalCost / deckSize;

    const targetTurn = Math.ceil(averageCost);
    const openingHand = 7;
    const drawsByTurn = targetTurn - 1;
    const cardsSeen = openingHand + drawsByTurn;

    let inkablesNeeded = 0;
    let probability = 0;
    for (let inkables = 1; inkables <= deckSize; inkables++) {
      probability = 1 - cumulativeHypergeometric(targetTurn - 1, deckSize, inkables, cardsSeen);
      if (probability >= targetAccuracy / 100) {
        inkablesNeeded = inkables;
        break;
      }
    }

    const maxNonInkables = deckSize - inkablesNeeded;

    setResult({
      averageCost: averageCost.toFixed(2),
      targetTurn,
      cardsSeen,
      inkablesNeeded,
      maxNonInkables,
      probability: (probability * 100).toFixed(1),
    });
  }

  function cumulativeHypergeometric(k, N, K, n) {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
      sum += hypergeometricPMF(i, N, K, n);
    }
    return sum;
  }

  function hypergeometricPMF(k, N, K, n) {
    return (
      (combination(K, k) * combination(N - K, n - k)) / combination(N, n)
    );
  }

  function combination(n, k) {
    if (k > n || k < 0) return 0;
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result *= (n - i + 1) / i;
    }
    return result;
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-2xl font-bold text-center">Lorcana Ink Curve Calculator</h1>

      <div>
        <label className="block font-semibold">Deck Size</label>
        <input
          type="number"
          value={deckSize}
          onChange={(e) => setDeckSize(Number(e.target.value))}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={40}
          max={80}
        />
      </div>

      <div className="space-y-2">
        <p className="font-semibold">
          Enter Card Counts by Cost (0–10):<br />
          <span className="text-sm font-normal text-gray-600">(Enter the cost you actually play the card for — factoring in songs, shift, or reductions)</span>
        </p>
        {cardCounts.map((count, cost) => (
          <div key={cost} className="flex items-center space-x-2">
            <label className="w-12">{cost}:</label>
            <input
              type="number"
              value={count}
              min={0}
              onChange={(e) => handleCardCountChange(cost, e.target.value)}
              className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block font-semibold">Target Accuracy (%)</label>
        <input
          type="number"
          value={targetAccuracy}
          onChange={(e) => setTargetAccuracy(Number(e.target.value))}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={50}
          max={99}
        />
      </div>

      <button
        onClick={calculateCurve}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Calculate
      </button>

      {result && (
        <div className="border-t pt-4 space-y-2">
          {result.error ? (
            <p className="text-red-600 font-semibold">{result.error}</p>
          ) : (
            <>
              <p><strong>Average Card Cost:</strong> {result.averageCost}</p>
              <p><strong>Target Ink:</strong> {result.targetTurn}</p>
              <p><strong>Cards Seen by Turn {result.targetTurn}:</strong> {result.cardsSeen}</p>
              <p><strong>Inkables Needed for {targetAccuracy}% success:</strong> {result.inkablesNeeded}</p>
              <p><strong>Recommended Max Non-Inkables:</strong> {result.maxNonInkables}</p>
              <p><strong>Estimated Success Rate:</strong> {result.probability}%</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

