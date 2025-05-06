// src/screens/ProductForm.js
import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { DataContext } from '../contexts/DataContext';

export default function ProductForm() {
  const { groups, products, addProduct, updateProduct, deleteProduct } = useContext(DataContext);

  const [filterName, setFilterName]   = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // form fields for both create & edit
  const [name, setName]       = useState('');
  const [price, setPrice]     = useState('');
  const [groupId, setGroupId] = useState('');
  const [minStock, setMinStock] = useState('');
  // which product is being edited
  const [editingId, setEditingId] = useState(null);

  // for delete modal
  const [toDelete, setToDelete] = useState(null);

  // filtered + sorted
  const filtered = useMemo(() => {
    return products
      .filter(p =>
        p.name.toLowerCase().includes(filterName.toLowerCase()) &&
        (filterGroup === '' || p.group?._id === filterGroup)
      )
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, filterName, filterGroup]);

  // reset form fields
  const resetForm = () => {
    setName('');
    setPrice('');
    setGroupId('');
    setMinStock('');
    setEditingId(null);
  };

  // handle create or update
  const handleSubmit = async e => {
    e.preventDefault();
    if (!groupId) {
      alert('Selecione um grupo');
      return;
    }
    const payload = {
      id: editingId,
      name: name.trim(),
      price: parseFloat(price),
      group: groupId,
      minStock: parseInt(minStock, 10),
    };
    if (editingId) {
      await updateProduct(payload);
    } else {
      await addProduct(payload);
    }
    resetForm();
    setShowCreateForm(false);
  };

  // start editing a product: populate fields and open inline form
  const startEdit = p => {
    setEditingId(p._id);
    setName(p.name);
    setPrice(p.price);
    setGroupId(p.group?._id||'');
    setMinStock(p.minStock);
    // ensure create form is closed
    setShowCreateForm(false);
    // scroll into view
    setTimeout(() => {
      document.getElementById(`prod-card-${p._id}`).scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const confirmDelete = async () => {
    await deleteProduct(toDelete._id);
    setToDelete(null);
  };

  return (
    <div className="p-4 relative">
      <h2 className="text-2xl font-bold mb-4">Cadastro de Produtos</h2>

      {/* filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Filtrar por nome"
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          className="flex-1 min-w-0 border rounded px-2 py-1"
        />
        <select
          value={filterGroup}
          onChange={e => setFilterGroup(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Todos os grupos</option>
          {groups.map(g => (
            <option key={g._id} value={g._id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* toggle create form */}
      <button
        onClick={() => {
          resetForm();
          setShowCreateForm(v => !v);
        }}
        className="mb-4 px-4 py-2 bg-brand-blue text-white rounded"
      >
        {showCreateForm ? 'Cancelar' : '+ Criar produto'}
      </button>

      {/* create form at top */}
      {showCreateForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm">Nome</label>
              <input required value={name} onChange={e => setName(e.target.value)}
                className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm">Preço (R$)</label>
              <input required type="number" step="0.01" value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm">Grupo</label>
              <select required value={groupId} onChange={e => setGroupId(e.target.value)}
                className="w-full border rounded px-2 py-1">
                <option value="">Selecione</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm">Estoque mínimo</label>
              <input required type="number" value={minStock}
                onChange={e => setMinStock(e.target.value)}
                className="w-full border rounded px-2 py-1" />
            </div>
            <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded">
              Salvar
            </button>
          </div>
        </form>
      )}

      {/* product list: one card per row */}
      <div className="space-y-4">
        {filtered.map(p => (
          <div
            key={p._id}
            id={`prod-card-${p._id}`}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="font-semibold">{p.name}</div>
            <div className="text-brand-blue">R$ {p.price.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Grupo: {p.group?.name || '—'}</div>
            <div className="text-sm text-gray-500">Mín: {p.minStock}</div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => startEdit(p)}
                className="flex-1 px-2 py-1 bg-yellow-500 text-white rounded"
              >
                Editar
              </button>
              <button
                onClick={() => setToDelete(p)}
                className="flex-1 px-2 py-1 bg-red-600 text-white rounded"
              >
                Excluir
              </button>
            </div>

            {/* inline edit form */}
            {editingId === p._id && (
              <form
                onSubmit={handleSubmit}
                className="mt-4 bg-gray-50 border rounded-lg p-4 transition-all"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm">Nome</label>
                    <input required value={name} onChange={e => setName(e.target.value)}
                      className="w-full border rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-sm">Preço (R$)</label>
                    <input required type="number" step="0.01" value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full border rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-sm">Grupo</label>
                    <select required value={groupId} onChange={e => setGroupId(e.target.value)}
                      className="w-full border rounded px-2 py-1">
                      <option value="">Selecione</option>
                      {groups.map(g => (
                        <option key={g._id} value={g._id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm">Estoque mínimo</label>
                    <input required type="number" value={minStock}
                      onChange={e => setMinStock(e.target.value)}
                      className="w-full border rounded px-2 py-1" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-3 py-1 bg-brand-blue text-white rounded flex-1">
                      Atualizar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 border rounded flex-1"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>

      {/* delete confirmation modal */}
      {toDelete && (
        <>
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
              <p className="mb-4">
                Deseja mesmo excluir o produto<br/>
                <strong>{toDelete.name}</strong>?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setToDelete(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
