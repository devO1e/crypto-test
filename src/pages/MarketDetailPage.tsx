import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Tabs from '../components/Tabs';
import Decimal from 'decimal.js';

type Trade = {
  match_amount?: number;
  remain: number;
  amount?: number;
  price: number;
  time: string;
  value: number;
};

const mapActiveTabTitle: Record<string, string> = {
  buyOrders: 'سفارش های خرید',
  sellOrders: 'سفارش های فروش',
  trades: 'معاملات',
};

const MarketDetailPage: React.FC = () => {
  const { marketId } = useParams<{
    marketId: string;
  }>();
  const [activeTab, setActiveTab] = useState('buyOrders');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [percentInput, setPercentInput] = useState<number>(0);

  const handleTabChange = useCallback((tab: string) => setActiveTab(tab), []);

  useEffect(() => {
    if (!activeTab || !marketId) return;

    const fetchTabData = async () => {
      try {
        if (activeTab === 'sellOrders') {
          const response = await axios.get(
            `https://api.bitpin.org/v2/mth/actives/${marketId}/?type=sell`
          );
          setTrades(response.data?.orders.slice(0, 10));
        } else if (activeTab === 'buyOrders') {
          const response = await axios.get(
            `https://api.bitpin.org/v2/mth/actives/${marketId}/?type=buy`
          );
          setTrades(response.data?.orders.slice(0, 10));
        } else if (activeTab === 'trades') {
          const response = await axios.get(
            `https://api.bitpin.org/v1/mth/matches/${marketId}/`
          );
          setTrades(response.data.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching data for tab:', activeTab, error);
      }
    };

    fetchTabData();

    const interval = setInterval(fetchTabData, 3000);
    return () => clearInterval(interval);
  }, [activeTab, marketId]);

  const calculateTotals = useCallback((orders: Trade[], percent: number) => {
    const totalRemain = orders.reduce(
      (acc, order) => acc.plus(new Decimal(order.remain || 0)),
      new Decimal(0)
    );
    const totalValue = orders.reduce(
      (acc, order) => acc.plus(new Decimal(order.value || 0)),
      new Decimal(0)
    );
    const weightedAvgPrice = orders
      .reduce(
        (acc, order) =>
          acc.plus(new Decimal(order.price || 0).times(order.remain || 0)),
        new Decimal(0)
      )
      .dividedBy(totalRemain);

    const targetRemain = totalRemain.times(new Decimal(percent).dividedBy(100));
    const totalPayment = targetRemain.times(weightedAvgPrice);

    return {
      targetRemain: targetRemain.toFixed(4),
      weightedAvgPrice: weightedAvgPrice.toFixed(4),
      totalPayment: totalPayment.toFixed(4),
      totalRemain: totalRemain.toFixed(4),
      totalValue: totalValue.toFixed(4),
    };
  }, []);

  const totals = useMemo(
    () => calculateTotals(trades, percentInput),
    [trades, percentInput]
  );

  return (
    <div className="p-6" dir={'rtl'}>
      <div className="mb-6">
        {activeTab !== 'trades' && (
          <>
            <label className="block text-lg font-semibold mb-2 text-gray-700">
              درصد حجم مورد نظر:
            </label>
            <input
              type="number"
              value={percentInput}
              min={'0'}
              max={'100'}
              onChange={(e) =>
                setPercentInput(Math.min(Number(e.target.value), 100))
              }
              className="w-full p-3 border rounded-md text-gray-700 bg-white shadow-md focus:outline-none focus:border-blue-500"
              placeholder="Enter percent"
              dir={'ltr'}
            />
          </>
        )}
      </div>

      <div className="flex mb-4">
        <Tabs
          tabs={[
            { title: 'سفارش های خرید', value: 'buyOrders' },
            { title: 'سفارش های فروش', value: 'sellOrders' },
            { title: 'معاملات', value: 'trades' },
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-lg font-semibold mb-2 px-2 py-1">
          {mapActiveTabTitle[activeTab]}
        </h2>
        <table className="min-w-full text-center border-collapse">
          <thead className="bg-gray-200 text-gray-700 uppercase text-sm">
            <tr>
              <th className="py-2 px-4 border">قیمت</th>
              <th className="py-2 px-4 border">حجم</th>
              <th className="py-2 px-4 border">مقدار</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((order, index) => (
              <tr
                key={index}
                className="bg-white hover:bg-gray-100 transition-colors"
              >
                <td className="py-2 px-4 border text-gray-800">
                  {Number(order.price).toLocaleString()}
                </td>
                <td className="py-2 px-4 border text-gray-800">
                  {activeTab === 'trades'
                    ? Number(order.match_amount).toLocaleString()
                    : Number(order.remain).toLocaleString()}
                </td>
                <td className="py-2 px-4 border text-gray-800">
                  {Number(order.value).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>

          {activeTab !== 'trades' && (
            <tfoot>
              <tr className="font-semibold bg-gray-100 text-gray-700">
                <td className="py-2 px-4 border">
                  میانگین قیمت:{' '}
                  {Number(totals?.weightedAvgPrice).toLocaleString()}
                </td>
                <td className="py-2 px-4 border">
                  مجموع حجم: {Number(totals?.totalRemain).toLocaleString()}
                </td>
                <td className="py-2 px-4 border">
                  مجموع: {Number(totals?.totalValue).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>

        {activeTab !== 'trades' && (
          <div className="mt-6 bg-blue-100 p-4 rounded-lg shadow-lg">
            <p className="text-lg font-semibold text-blue-600 mb-2">
              محاسبه نتیجه برای {percentInput}% از حجم قابل معامله
            </p>
            <div className="text-gray-800">
              <p>مجموع حجم: {Number(totals?.targetRemain).toLocaleString()}</p>
              <p>
                میانگین قیمت:{' '}
                {Number(totals?.weightedAvgPrice).toLocaleString()}
              </p>
              <p>
                مجموع پرداختی: {Number(totals?.totalPayment).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketDetailPage;
