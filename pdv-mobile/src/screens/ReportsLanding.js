// src/screens/ReportsLanding.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReportsLanding() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto mt-8 px-7">
      <h2 className="text-2xl font-bold mb-9">Relatórios</h2>

      <button
        onClick={() => navigate('/reports/sales')}
        className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg py-4 mb-4 text-lg text-gray-700 shadow-sm"
      >
        Relatório de Vendas
      </button>

      <button
        onClick={() => navigate('/reports/products')}
        className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg py-4 text-lg text-gray-700 shadow-sm"
      >
        Relatório de Produtos Vendidos
      </button>
    </div>
  );
}
