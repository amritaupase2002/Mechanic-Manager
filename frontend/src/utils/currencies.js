import currencyCodes from 'currency-codes';
import getSymbolFromCurrency from 'currency-symbol-map';

// Get all valid currencies
const allCurrencies = currencyCodes.codes()
  .map(code => {
    const data = currencyCodes.code(code);
    return {
      code: code,
      name: data?.currency || code,
      symbol: getSymbolFromCurrency(code) || code,
      countries: data?.countries || []
    };
  })
  .filter(currency => currency.symbol && currency.countries.length > 0);

// Add cryptocurrencies
const cryptoCurrencies = [
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', countries: ['Global'] },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', countries: ['Global'] }
];

export default [...allCurrencies, ...cryptoCurrencies];