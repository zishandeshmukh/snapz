// Run this every hour to track usage
export function getUsageStats() {
  return {
    geminiCalls: geminiCallsThisMinute.count,
    activeUsers: rateLimits.size,
    pendingBatches: pendingBatch.length,
    timestamp: new Date().toISOString()
  };
}

// Endpoint to check costs
app.get('/usage', (req, res) => {
  res.json(getUsageStats());
});
