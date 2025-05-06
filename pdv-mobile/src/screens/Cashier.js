// src/screens/Cashier.js
import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../contexts/DataContext';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function Cashier() {
  const { groups, products, addSale, adjustStock } = useContext(DataContext);

  const [step, setStep] = useState('cart');
  const [activeGroup, setActiveGroup] = useState(null);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);

  const paymentOptions = [
    { key: 'debit', label: 'Cartão Débito' },
    { key: 'credit', label: 'Cartão Crédito' },
    { key: 'cash', label: 'Dinheiro' },
    { key: 'pix', label: 'Pix' },
  ];
  const [selected, setSelected] = useState({});
  const [amounts, setAmounts] = useState({});

  const [notif, setNotif] = useState(null);
  const showNotif = (msg, type = 'info') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2000);
  };

  // totals
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const total = Math.max(subtotal - discount, 0);
  const paid = useMemo(
    () =>
      paymentOptions.reduce(
        (s, m) => s + (selected[m.key] ? Number(amounts[m.key] || 0) : 0),
        0
      ),
    [selected, amounts]
  );
  const diff = paid - total;

  // cart ops
  const addToCart = (p) => {
    const inCart = cart.find((x) => x._id === p._id);
    const have = inCart ? inCart.qty : 0;
    if (have >= p.stock) return showNotif(`Estoque insuficiente!`, 'error');
    if (inCart) {
      setCart((c) => c.map((x) => (x._id === p._id ? { ...x, qty: x.qty + 1 } : x)));
    } else {
      setCart((c) => [...c, { ...p, qty: 1 }]);
    }
  };
  const removeFromCart = (id) => {
    setCart((c) =>
      c.reduce((acc, i) => {
        if (i._id !== id) acc.push(i);
        else if (i.qty > 1) acc.push({ ...i, qty: i.qty - 1 });
        return acc;
      }, [])
    );
  };

  // finalize sale
  const finalize = async () => {
    if (!cart.length) return showNotif('Carrinho vazio', 'error');
    if (paid < total) return showNotif('Pagamento insuficiente', 'error');

    // adjust stock
    for (let i of cart) {
      await adjustStock({ productId: i._id, adjustment: -i.qty });
    }
    await addSale({
      items: cart.map((i) => ({ product: i.name, quantity: i.qty, total: i.price * i.qty })),
      discount,
      total,
      payments: paymentOptions.reduce((acc, m) => {
        acc[m.key] = selected[m.key] ? Number(amounts[m.key] || 0) : 0;
        return acc;
      }, {}),
    });

    showNotif('Venda concluída!', 'success');
    setCart([]);
    setDiscount(0);
    setSelected({});
    setAmounts({});
    setStep('cart');
    setActiveGroup(null);
  };

  return (
    <div className="relative p-4 font-sans">
      {/* notification overlay */}
      {notif && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-4 rounded shadow-lg text-white ${
              notif.type === 'error' ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            {notif.msg}
          </div>
        </>
      )}


      {step === 'cart' ? (
        <>
          {/* groups / products */}
          <div className="mb-6 overflow-x-auto">
            {!activeGroup ? (
              <div className="grid grid-rows-2 grid-flow-col auto-cols-[120px] gap-4">
                {groups.map((g) => (
                  <button
                    key={g._id}
                    onClick={() => setActiveGroup(g._id)}
                    className="w-full aspect-square border border-gray-300 rounded-lg flex items-center justify-center hover:shadow-md bg-white"
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setActiveGroup(null)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                  aria-label="Voltar aos grupos"
                >
                  <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
                <div className="grid grid-rows-2 grid-flow-col auto-cols-[120px] gap-4 overflow-x-auto">
                  {products
                    .filter((p) => p.group?._id === activeGroup)
                    .map((p) => (
                      <button
                        key={p._id}
                        onClick={() => addToCart(p)}
                        className="w-full aspect-square border border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center hover:shadow-md bg-white"
                      >
                        <span className="text-center">{p.name}</span>
                        <span className="font-semibold mt-1">R$ {p.price.toFixed(2)}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <hr />

          {/* cart box */}
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Carrinho</h3>
            {cart.length === 0 ? (
              <p className="italic text-gray-500">(vazio)</p>
            ) : (
              <ul className="mb-2 space-y-1">
                {cart.map((i) => (
                  <li key={i._id} className="flex justify-between">
                    <span>
                      {i.name} x{i.qty}
                    </span>
                    <div className="flex items-center">
                      <span className="mr-2">R$ {(i.price * i.qty).toFixed(2)}</span>
                      <button
                        onClick={() => removeFromCart(i._id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Remover item"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-between items-center mt-4">
              <span className="font-bold">Subtotal: R$ {subtotal.toFixed(2)}</span>
              <button
                onClick={() => setStep('payment')}
                disabled={!cart.length}
                className="px-3 py-2 bg-brand-blue text-white rounded disabled:bg-gray-300"
              >
                Ir para Pagamento
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* payment step */}
          <button
            onClick={() => setStep('cart')}
            className="mb-4 p-2 bg-white rounded-full hover:bg-gray-100"
            aria-label="Voltar ao carrinho"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <label>Desconto:</label>
              <input
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-24 border rounded px-2"
              />
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>

            <h3 className="mt-4 font-semibold">Formas de Pagamento</h3>
            <div className="flex flex-wrap gap-2">
              {paymentOptions.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelected((s) => ({ ...s, [m.key]: !s[m.key] }))}
                  className={`px-3 py-1 border rounded ${
                    selected[m.key] ? 'bg-brand-blue text-white' : 'bg-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paymentOptions.map(
              (m) =>
                selected[m.key] && (
                  <div key={m.key} className="flex justify-between items-center">
                    <label>{m.label}:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={amounts[m.key] || ''}
                      onChange={(e) =>
                        setAmounts((a) => ({ ...a, [m.key]: e.target.value }))
                      }
                      className="w-24 border rounded px-2"
                    />
                  </div>
                )
            )}

            {paid > 0 && (
              <div
                className={`p-2 rounded text-center ${
                  diff >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {diff >= 0
                  ? `Troco: R$ ${diff.toFixed(2)}`
                  : `Faltam: R$ ${(-diff).toFixed(2)}`}
              </div>
            )}

            <button
              onClick={finalize}
              className="w-full mt-2 px-3 py-2 bg-brand-blue text-white rounded"
            >
              Finalizar Venda
            </button>
          </div>
        </>
      )}
    </div>
  );
}
