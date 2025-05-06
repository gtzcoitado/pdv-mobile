// src/screens/ReportsProducts.js
import React, { useContext, useState, useMemo } from 'react'
import { DataContext } from '../contexts/DataContext'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon } from '@heroicons/react/24/solid'

export default function ReportsProducts() {
  const { sales = [], products = [], groups = [] } = useContext(DataContext)

  const [from, setFrom]             = useState('')
  const [to,   setTo]               = useState('')
  const [filterGroupId, setFilterGroupId] = useState('')

  // helper para converter YYYY‑MM‑DD → Date
  const toYMD = s => s ? new Date(...s.split('-').map((v,i)=> i===1? v-1: v)) : null
  const dateOnly = d => new Date(d.getFullYear(), d.getMonth(), d.getDate())

  // 1) filtrar vendas por data
  const filteredSales = useMemo(() => {
    const start = toYMD(from), end = toYMD(to)
    return sales.filter(s => {
      const d = dateOnly(new Date(s.createdAt))
      if (start && d < start) return false
      if (end   && d > end)   return false
      return true
    })
  }, [sales, from, to])

  // 2) resumir por produto, e atribuir groupId e groupName
  const summary = useMemo(() => {
    const m = {}
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const name = item.product
        if (!m[name]) {
          // lookup product in master list
          const prod = products.find(p=>p.name===name)
          const grpId = prod?.group?._id || ''
          const grpName = prod?.group?.name || '—'
          m[name] = { qty: 0, revenue: 0, groupId: grpId, groupName: grpName }
        }
        m[name].qty     += Number(item.quantity)||0
        m[name].revenue += Number(item.total)||0
      })
    })
    return Object.entries(m)
      .map(([product,data])=> ({ product, ...data }))
      .filter(x=> x.qty>0)
      .sort((a,b)=> a.product.localeCompare(b.product))
  }, [filteredSales, products])

  // 3) apply group filter
  const finalList = filterGroupId
    ? summary.filter(x=> x.groupId === filterGroupId)
    : summary

  // build select options
  const groupOptions = [{ _id:'', name:'Todos os grupos' }, ...groups]

  return (
    <div className="max-w-md mx-0 p-4">
      {/* back link */}
      <div className="mb-4">
        <Link to="/reports" className="inline-flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeftIcon className="h-5 w-5 mr-1"/> 
        </Link>
      </div>

      <h2 className="text-2xl font-bold text-brand-blue mb-6">
        Relatório de Produtos Vendidos
      </h2>

      {/* filters */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm">De</label>
            <input
              type="date"
              value={from}
              onChange={e=>setFrom(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm">Até</label>
            <input
              type="date"
              value={to}
              onChange={e=>setTo(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm">Grupo</label>
          <select
            value={filterGroupId}
            onChange={e=>setFilterGroupId(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded"
          >
            {groupOptions.map(g=>(
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-brand-light">
            <tr>
              <th className="px-3 py-2 text-left">Produto</th>
              <th className="px-3 py-2 text-center">Qtd</th>
              <th className="px-3 py-2 text-right">Receita (R$)</th>
            </tr>
          </thead>
          <tbody>
            {finalList.length > 0 ? finalList.map(p=>(
              <tr key={p.product} className="border-b">
                <td className="px-3 py-2">{p.product}</td>
                <td className="px-3 py-2 text-center">{p.qty}</td>
                <td className="px-3 py-2 text-right">{p.revenue.toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="py-6 text-center text-gray-500">
                  Nenhum produto vendido neste período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
