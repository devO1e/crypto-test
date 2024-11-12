import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Tabs from '../components/Tabs';
import { fetchMarketData } from '../api/markets';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 12;
const PAGE_DISPLAY_LIMIT = 5;

type TokenCardTypeResultsType = Array<{
  id: number;
  code: string;
  title: string;
  title_fa: string;
  tradable: boolean;
  currency2: {
    id: number;
    code: 'USDT' | 'IRT';
    color: string;
    image: string;
  };
  price_info: {
    change: number;
    price: string;
  };
}>;

type TokenCardType = {
  count: number;
  results: TokenCardTypeResultsType;
};

const Markets: React.FC = () => {
  const [activeTab, setActiveTab] = useState('IRT');
  const [marketData, setMarketData] = useState<TokenCardType>({
    count: 0,
    results: [],
  });
  const [loading, setLoading] = useState(false);
  const [pageIRT, setPageIRT] = useState(1);
  const [pageUSDT, setPageUSDT] = useState(1);
  const [filteredData, setFilteredData] = useState<TokenCardTypeResultsType>(
    []
  );

  const navigate = useNavigate();

  const handleTabChange = useCallback((tab: string) => setActiveTab(tab), []);

  const currentPage = useMemo(
    () => (activeTab === 'IRT' ? pageIRT : pageUSDT),
    [activeTab, pageIRT, pageUSDT]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (activeTab === 'IRT') {
        setPageIRT(page);
      } else {
        setPageUSDT(page);
      }
    },
    [activeTab, pageIRT, pageUSDT]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchMarketData();
        setMarketData(data);
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!marketData?.results.length) return;
    const filtered = marketData?.results.filter(
      (item) => item.currency2.code === activeTab && item.tradable
    );
    setFilteredData(filtered);
  }, [marketData, activeTab]);

  const startIndex = useMemo(
    () => (currentPage - 1) * ITEMS_PER_PAGE,
    [currentPage]
  );

  const currentItems = useMemo(
    () => filteredData?.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [filteredData, startIndex]
  );

  const totalPages = useMemo(
    () => Math.ceil(filteredData?.length / ITEMS_PER_PAGE),
    [filteredData]
  );

  const generatePageNumbers = useCallback(() => {
    const pageNumbers = [];
    let start = Math.max(currentPage - Math.floor(PAGE_DISPLAY_LIMIT / 2), 1);
    let end = Math.min(start + PAGE_DISPLAY_LIMIT - 1, totalPages);

    if (end - start < PAGE_DISPLAY_LIMIT - 1) {
      start = Math.max(end - PAGE_DISPLAY_LIMIT + 1, 1);
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  }, [currentPage, totalPages]);

  const handleClick = useCallback((marketId: number) => {
    navigate(`/market/${marketId}`);
  }, []);

  return (
    <div dir={'rtl'}>
      <Tabs
        tabs={[
          { title: 'تومان', value: 'IRT' },
          { title: 'USDT', value: 'USDT' },
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      {loading ? (
        <p className="text-center text-blue-500 font-semibold">
          در حال بارگذاری...
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems?.map((item, index: number) => (
              <div
                onClick={() => handleClick(item.id)}
                key={item.id}
                className="bg-white border rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              >
                <div className="flex p-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src={item.currency2.image}
                      alt={`${item.currency2.image} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="mr-4 flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">{item.title_fa}</p>

                    <p className="mt-2 text-lg font-bold text-gray-900">
                      {Number(item.price_info.price)?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="flex justify-center mt-6 gap-2 select-none"
            dir={'ltr'}
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className={`px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 ${
                currentPage > 1 ? '' : 'opacity-40 pointer-events-none'
              }`}
            >
              &laquo; قبلی
            </button>
            {generatePageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            {totalPages > PAGE_DISPLAY_LIMIT &&
              currentPage + Math.floor(PAGE_DISPLAY_LIMIT / 2) < totalPages && (
                <span className="px-4 py-2 text-gray-500">...</span>
              )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className={`px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 ${
                currentPage < totalPages ? '' : 'pointer-events-none opacity-40'
              }`}
            >
              بعدی &raquo;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Markets;
