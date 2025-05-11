function predictPrice({ type, length = 0, weight = 0 }) {
    if (type === 'simple') {
      return 20;
    }
  
    const basePrice = 30;
    const weightFactor = 2.5;
    const lengthFactor = 1.2;
  
    const price = basePrice + weight * weightFactor + length * lengthFactor;
    return Math.round(price);
  }
  
  module.exports = predictPrice;
  