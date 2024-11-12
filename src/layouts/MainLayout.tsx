import React from 'react';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-gray-100">
    <header className="bg-blue-600 p-4 text-white text-center">
      <h1 className="text-lg font-bold">بازار کریپتو</h1>
    </header>
    <main className="container mx-auto p-4">{children}</main>
  </div>
);

export default MainLayout;
