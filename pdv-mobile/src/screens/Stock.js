// src/screens/Stock.js
import React, { useContext, useState, useMemo } from 'react'
import { DataContext } from '../contexts/DataContext'

export default function Stock() {
  const { products = [], groups = [], adjustStock } = useContext(DataContext)

  const [filterName,  setFilterName]  = useState('')
  const [filterGroup, setFilterGroup] = useState('all')
  const [belowMin,    setBelowMin]    = useState(false)
  const [editingId,   setEditingId]   = useState(null)
  const [deltaType,   setDeltaType]   = useState('entry')
  const [deltaVal,    setDeltaVal]    = useState('')

  // notification state
  const [notif, setNotif] = useState(null)
  const showNotif = msg => {
    setNotif(msg)
    setTimeout(() => setNotif(null), 2000)
  }

  // filter + sort alphabetically
  const visible = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(filterName.toLowerCase()))
      .filter(p => filterGroup === 'all' || p.group?._id === filterGroup)
      .filter(p => !belowMin || p.stock < p.minStock)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [products, filterName, filterGroup, belowMin])

  const saveAdjustment = async p => {
    const amount = Number(deltaVal) || 0
    const adjustment = deltaType === 'exit' ? -amount : amount
    await adjustStock({ productId: p._id, adjustment })
    showNotif('Estoque ajustado!')
    setEditingId(null)
    setDeltaVal('')
  }

  return (
    <div className="p-4 relative">
      <h2 className="text-2xl font-bold mb-4">Estoque</h2>

      {/* filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Filtrar por nome..."
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          className="mb-2 sm:mb-0 flex-1 px-3 py-2 border rounded"
        />
        <select
          value={filterGroup}
          onChange={e => setFilterGroup(e.target.value)}
          className="mb-2 sm:mb-0 px-3 py-2 border rounded"
        >
          <option value="all">Todos os grupos</option>
          {groups.map(g => (
            <option key={g._id} value={g._id}>{g.name}</option>
          ))}
        </select>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={belowMin}
            onChange={e => setBelowMin(e.target.checked)}
            className="form-checkbox"
          />
          <span>Abaixo do mínimo</span>
        </label>
      </div>

      {/* list */}
      <ul className="space-y-4">
        {visible.map(p => (
          <li key={p._id} className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p>Atual: {p.stock} — Mín: {p.minStock}</p>
              </div>
              {p.stock < p.minStock && (
                <span className="text-yellow-500 text-xl">⚠️</span>
              )}
            </div>

            <button
              onClick={() => {
                setEditingId(editingId === p._id ? null : p._id)
                setDeltaType('entry')
                setDeltaVal('')
              }}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Ajustar
            </button>

            {editingId === p._id && (
              <div className="mt-3 space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDeltaType('entry')}
                    className={`flex-1 px-4 py-2 rounded ${
                      deltaType === 'entry'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200'
                    }`}
                  >Entrada</button>
                  <button
                    onClick={() => setDeltaType('exit')}
                    className={`flex-1 px-4 py-2 rounded ${
                      deltaType === 'exit'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200'
                    }`}
                  >Saída</button>
                </div>
                <input
                  type="number"
                  placeholder="Quantidade"
                  value={deltaVal}
                  onChange={e => setDeltaVal(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
                <button
                  onClick={() => saveAdjustment(p)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded"
                >
                  Confirmar Ajuste
                </button>
              </div>
            )}
          </li>
        ))}

        {visible.length === 0 && (
          <li className="text-center text-gray-500">Nenhum item encontrado.</li>
        )}
      </ul>

      {/* centered toast notification */}
      {notif && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-green-600 text-white px-6 py-3 rounded shadow-lg">
            {notif}
          </div>
        </div>
      )}
    </div>
  )
}
