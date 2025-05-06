// src/screens/ReportsSales.js
import React, { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../contexts/DataContext';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

export default function ReportsSales() {
  const navigate = useNavigate();
  const { sales = [], products = [], groups = [] } = useContext(DataContext);

  // filtros de data, grupo e forma de pagamento
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [payFilter, setPayFilter] = useState({
    debit: false,
    credit: false,
    cash: false,
    pix: false,
  });

  const parseDate = (str, endOfDay = false) => {
    if (!str) return null;
    const [y, m, d] = str.includes('-') ? str.split('-') : str.split('/').reverse();
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    if (endOfDay) dt.setHours(23, 59, 59, 999);
    else dt.setHours(0, 0, 0, 0);
    return dt;
  };

  // vendas após todos os filtros
  const filtered = useMemo(() => {
    const start = parseDate(from);
    const end = parseDate(to, true);

    return sales.filter((sale) => {
      const dt = new Date(sale.createdAt);
      if (start && dt < start) return false;
      if (end && dt > end) return false;

      // forma de pagamento
      const pay = sale.payments || {
        debit: sale.debit || 0,
        credit: sale.credit || 0,
        cash: sale.cash || 0,
        pix: sale.pix || 0,
      };
      const anyPaySelected = Object.values(payFilter).some(Boolean);
      if (anyPaySelected) {
        // se selecionou filtros, ao menos um deve ter valor >0
        const ok = Object.entries(payFilter).some(
          ([key, on]) => on && pay[key] > 0
        );
        if (!ok) return false;
      }

      return true;
    });
  }, [sales, from, to, payFilter, products]);

  // resumo
  const summary = useMemo(() => {
    const acc = { transactions: 0, items: 0, revenue: 0 };
    filtered.forEach((sale) => {
      acc.transactions++;
      const items = Array.isArray(sale.items)
        ? sale.items
        : [{ product: sale.product, quantity: sale.quantity, total: sale.total }];
      items.forEach((i) => {
        acc.items += i.quantity;
        acc.revenue += i.total;
      });
    });
    return acc;
  }, [filtered]);

  return (
    <div className="max-w-lg mx-auto mt- px-4">
      {/* back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center p-2 rounded-full hover:bg-gray-200"
      >
        <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
      </button>

      <h2 className="text-2xl font-bold mb-4">Relatório de Vendas</h2>

      {/* filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <label className="block">
          De:
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded"
          />
        </label>
        <label className="block">
          Até:
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded"
          />
        </label>
      </div>

      {/* formas de pagamento */}
      <div className="flex gap-4 mb-6">
        {[
          ['debit', 'Débito'],
          ['credit', 'Crédito'],
          ['cash', 'Dinheiro'],
          ['pix', 'Pix'],
        ].map(([key, label]) => (
          <label key={key} className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={payFilter[key]}
              onChange={() =>
                setPayFilter((f) => ({ ...f, [key]: !f[key] }))
              }
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700">{label}</span>
          </label>
        ))}
      </div>

      {/* resumo */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <p className="flex justify-between">
          <span>Transações:</span>
          <span>{summary.transactions}</span>
        </p>
        <p className="flex justify-between">
          <span>Itens vendidos:</span>
          <span>{summary.items}</span>
        </p>
        <p className="flex justify-between">
          <span>Receita total:</span>
          <span>R$ {summary.revenue.toFixed(2)}</span>
        </p>
      </div>

      {/* tabela */}
      <div className="overflow-auto">
        <table className="w-full bg-white border-collapse">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 px-1">Data / Hora</th>
              <th className="py-2 px-1">Produto</th>
              <th className="py-2 px-1 text-center">Qtd</th>
              <th className="py-2 px-1 text-right">Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-4 text-center text-gray-500 italic"
                >
                  Nenhuma venda para este filtro.
                </td>
              </tr>
            )}

            {filtered.flatMap((sale) => {
              const dt = new Date(sale.createdAt).toLocaleString();
              const items = Array.isArray(sale.items)
                ? sale.items
                : [{ product: sale.product, quantity: sale.quantity, total: sale.total }];

              return items.map((item, idx) => (
                <tr key={`${sale._id}-${idx}`} className="border-b last:border-0">
                  <td className="py-2 px-1 align-top">{dt}</td>
                  <td className="py-2 px-1 align-top">{item.product}</td>
                  <td className="py-2 px-1 text-center align-top">{item.quantity}</td>
                  <td className="py-2 px-1 text-right align-top">{item.total.toFixed(2)}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
