import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';

import Navbar from './components/Navbar';
import Splash from './components/Splash';

import Cashier from './screens/Cashier';
import ProductForm from './screens/ProductForm';
import GroupForm   from './screens/GroupForm';
import Stock       from './screens/Stock';
import EmployeeForm from './screens/EmployeeForm';
import ReportsLanding  from './screens/ReportsLanding';
import ReportsSales    from './screens/ReportsSales';
import ReportsProducts from './screens/ReportsProducts';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2000); // 2s splash
    return () => clearTimeout(t);
  }, []);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <DataProvider>
      <BrowserRouter>
        <Navbar />
        <div className="pt-16"> 
          <Routes>
            <Route path="/" element={<Cashier />} />
            <Route path="/products" element={<ProductForm />} />
            <Route path="/groups"   element={<GroupForm />} />
            <Route path="/stock"    element={<Stock />} />
            <Route path="/employees" element={<EmployeeForm />} />
            <Route path="/reports"          element={<ReportsLanding />} />
            <Route path="/reports/sales"    element={<ReportsSales />} />
            <Route path="/reports/products" element={<ReportsProducts />} />
          </Routes>
        </div>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
