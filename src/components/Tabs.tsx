import React from 'react';

type TabsProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{ title: string; value: string }>;
};

const TabSwitcher: React.FC<TabsProps> = React.memo(
  ({ activeTab, onTabChange, tabs }) => (
    <div className="flex justify-center gap-2 my-4" dir={'rtl'}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors duration-200 ${
            activeTab === tab.value
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.title}
        </button>
      ))}
    </div>
  )
);

export default TabSwitcher;
