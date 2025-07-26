// Biblioteca de indicadores técnicos para análisis avanzado

export interface PriceData {
  price: number;
  timestamp: number;
  volume?: number;
}

export interface IndicatorResult {
  value: number;
  timestamp: number;
}

export interface RSIResult extends IndicatorResult {
  signal: 'oversold' | 'overbought' | 'neutral';
}

export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
  timestamp: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
  timestamp: number;
  position: 'above' | 'below' | 'inside';
}

export interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  strength: 'weak' | 'moderate' | 'strong';
  reason: string;
  timestamp: number;
  confidence: number;
}

// Simple Moving Average
export const calculateSMA = (data: PriceData[], period: number): IndicatorResult[] => {
  const results: IndicatorResult[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const average = slice.reduce((sum, item) => sum + item.price, 0) / period;
    
    results.push({
      value: average,
      timestamp: data[i].timestamp
    });
  }
  
  return results;
};

// Exponential Moving Average
export const calculateEMA = (data: PriceData[], period: number): IndicatorResult[] => {
  const results: IndicatorResult[] = [];
  const multiplier = 2 / (period + 1);
  
  let ema = data[0].price;
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema = data[i].price;
    } else {
      ema = (data[i].price * multiplier) + (ema * (1 - multiplier));
    }
    
    results.push({
      value: ema,
      timestamp: data[i].timestamp
    });
  }
  
  return results;
};

// RSI Calculation
export const calculateRSI = (data: PriceData[], period: number = 14): RSIResult[] => {
  const results: RSIResult[] = [];
  
  if (data.length < period + 1) return results;
  
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].price - data[i - 1].price;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Calculate RSI
  for (let i = period - 1; i < gains.length; i++) {
    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    
    const rs = avgGain / (avgLoss || 0.01);
    const rsi = 100 - (100 / (1 + rs));
    
    let signal: 'oversold' | 'overbought' | 'neutral' = 'neutral';
    if (rsi < 30) signal = 'oversold';
    else if (rsi > 70) signal = 'overbought';
    
    results.push({
      value: rsi,
      timestamp: data[i + 1].timestamp,
      signal
    });
  }
  
  return results;
};

// MACD Calculation
export const calculateMACD = (
  data: PriceData[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): MACDResult[] => {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  const results: MACDResult[] = [];
  
  // Calculate MACD line
  const macdLine: IndicatorResult[] = [];
  for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
    macdLine.push({
      value: fastEMA[i].value - slowEMA[i].value,
      timestamp: fastEMA[i].timestamp
    });
  }
  
  // Calculate signal line (EMA of MACD)
  const macdData: PriceData[] = macdLine.map(m => ({ price: m.value, timestamp: m.timestamp }));
  const signalLine = calculateEMA(macdData, signalPeriod);
  
  // Calculate histogram and trend
  for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
    const histogram = macdLine[i].value - signalLine[i].value;
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    
    if (macdLine[i].value > signalLine[i].value && histogram > 0) {
      trend = 'bullish';
    } else if (macdLine[i].value < signalLine[i].value && histogram < 0) {
      trend = 'bearish';
    }
    
    results.push({
      macd: macdLine[i].value,
      signal: signalLine[i].value,
      histogram,
      timestamp: macdLine[i].timestamp,
      trend
    });
  }
  
  return results;
};

// Bollinger Bands
export const calculateBollingerBands = (
  data: PriceData[], 
  period: number = 20, 
  standardDeviations: number = 2
): BollingerBands[] => {
  const sma = calculateSMA(data, period);
  const results: BollingerBands[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((sum, item) => sum + item.price, 0) / period;
    const variance = slice.reduce((sum, item) => sum + Math.pow(item.price - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    const upper = mean + (standardDeviations * stdDev);
    const lower = mean - (standardDeviations * stdDev);
    const currentPrice = data[i].price;
    
    let position: 'above' | 'below' | 'inside' = 'inside';
    if (currentPrice > upper) position = 'above';
    else if (currentPrice < lower) position = 'below';
    
    results.push({
      upper,
      middle: mean,
      lower,
      timestamp: data[i].timestamp,
      position
    });
  }
  
  return results;
};

// Señales de Trading Automáticas
export const generateTradingSignals = (
  data: PriceData[],
  rsi: RSIResult[],
  macd: MACDResult[],
  bollinger: BollingerBands[]
): TradingSignal[] => {
  const signals: TradingSignal[] = [];
  
  if (data.length === 0 || rsi.length === 0 || macd.length === 0 || bollinger.length === 0) {
    return signals;
  }
  
  const latest = {
    price: data[data.length - 1],
    rsi: rsi[rsi.length - 1],
    macd: macd[macd.length - 1],
    bollinger: bollinger[bollinger.length - 1]
  };
  
  let signal: TradingSignal = {
    type: 'hold',
    strength: 'weak',
    reason: 'Análisis en curso',
    timestamp: latest.price.timestamp,
    confidence: 0
  };
  
  // Señal de Compra
  if (
    latest.rsi.signal === 'oversold' && 
    latest.macd.trend === 'bullish' && 
    latest.bollinger.position === 'below'
  ) {
    signal = {
      type: 'buy',
      strength: 'strong',
      reason: 'RSI sobreventa + MACD alcista + precio bajo Bollinger',
      timestamp: latest.price.timestamp,
      confidence: 85
    };
  } else if (
    latest.rsi.signal === 'oversold' && 
    latest.macd.trend === 'bullish'
  ) {
    signal = {
      type: 'buy',
      strength: 'moderate',
      reason: 'RSI sobreventa + MACD alcista',
      timestamp: latest.price.timestamp,
      confidence: 70
    };
  } else if (latest.rsi.signal === 'oversold') {
    signal = {
      type: 'buy',
      strength: 'weak',
      reason: 'RSI en zona de sobreventa',
      timestamp: latest.price.timestamp,
      confidence: 55
    };
  }
  
  // Señal de Venta
  else if (
    latest.rsi.signal === 'overbought' && 
    latest.macd.trend === 'bearish' && 
    latest.bollinger.position === 'above'
  ) {
    signal = {
      type: 'sell',
      strength: 'strong',
      reason: 'RSI sobrecompra + MACD bajista + precio sobre Bollinger',
      timestamp: latest.price.timestamp,
      confidence: 85
    };
  } else if (
    latest.rsi.signal === 'overbought' && 
    latest.macd.trend === 'bearish'
  ) {
    signal = {
      type: 'sell',
      strength: 'moderate',
      reason: 'RSI sobrecompra + MACD bajista',
      timestamp: latest.price.timestamp,
      confidence: 70
    };
  } else if (latest.rsi.signal === 'overbought') {
    signal = {
      type: 'sell',
      strength: 'weak',
      reason: 'RSI en zona de sobrecompra',
      timestamp: latest.price.timestamp,
      confidence: 55
    };
  }
  
  signals.push(signal);
  return signals;
};

// Análisis de Tendencia
export const analyzeTrend = (data: PriceData[], period: number = 20): {
  trend: 'uptrend' | 'downtrend' | 'sideways';
  strength: number;
  support: number;
  resistance: number;
} => {
  if (data.length < period) {
    return { trend: 'sideways', strength: 0, support: 0, resistance: 0 };
  }
  
  const recent = data.slice(-period);
  const prices = recent.map(d => d.price);
  const first = prices[0];
  const last = prices[prices.length - 1];
  const change = ((last - first) / first) * 100;
  
  const support = Math.min(...prices);
  const resistance = Math.max(...prices);
  
  let trend: 'uptrend' | 'downtrend' | 'sideways' = 'sideways';
  let strength = Math.abs(change);
  
  if (change > 2) trend = 'uptrend';
  else if (change < -2) trend = 'downtrend';
  
  return { trend, strength, support, resistance };
};