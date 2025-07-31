import React, { useEffect, useRef } from 'react';

const TradingViewWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Limpia el contenido previo
    containerRef.current.innerHTML = '';
    
    // Agrega un pequeño delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return;
      
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
      script.innerHTML = `{
      "colorTheme": "dark",
      "dateRange": "1D",
      "showChart": true,
      "locale": "en",
      "largeChartUrl": "",
      "isTransparent": true,
      "showSymbolLogo": false,
      "showFloatingTooltip": false,
      "width": "400",
      "height": "550",
      "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
      "plotLineColorFalling": "rgba(41, 98, 255, 1)",
      "gridLineColor": "rgba(42, 46, 57, 0)",
      "scaleFontColor": "rgba(219, 219, 219, 1)",
      "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
      "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
      "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
      "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
      "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
      "tabs": [
        {
          "title": "Forex",
          "symbols": [
            { "s": "FX:EURUSD", "d": "EUR to USD" },
            { "s": "FX:GBPUSD", "d": "GBP to USD" },
            { "s": "FX:USDJPY", "d": "USD to JPY" },
            { "s": "FX:USDCHF", "d": "USD to CHF" },
            { "s": "FX:AUDUSD", "d": "AUD to USD" },
            { "s": "FX:USDCAD", "d": "USD to CAD" }
          ],
          "originalTitle": "Forex"
        },
        {
          "title": "Crypto",
          "symbols": [
            { "s": "BINANCE:BTCUSDT" },
            { "s": "COINBASE:ETHUSD" },
            { "s": "BINANCE:XRPUSDT" },
            { "s": "COINBASE:SOLUSD" },
            { "s": "BINANCE:BNBUSDT" }
          ]
        }
      ]
    }`;
      
      try {
        containerRef.current.appendChild(script);
      } catch (error) {
        console.warn('Error loading TradingView widget:', error);
      }
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="tradingview-widget-container" style={{ minWidth: 400, minHeight: 550 }}>
      <div ref={containerRef} className="tradingview-widget-container__widget" />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default TradingViewWidget; 