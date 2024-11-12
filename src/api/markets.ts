import axios from 'axios';

export const fetchMarketData = async () => {
  const url = 'https://api.bitpin.ir/v1/mkt/markets/';

  const response = await axios.get(url);
  return response.data;
};
