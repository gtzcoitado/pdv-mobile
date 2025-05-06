// src/screens/GroupForm.js
import React, { useContext, useState } from 'react'
import { DataContext } from '../contexts/DataContext'
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/solid'

export default function GroupForm() {
  const { groups = [], addGroup, updateGroup, deleteGroup } = useContext(DataContext)

  const [openForm, setOpenForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const sorted = [...groups].sort((a, b) => a.name.localeCompare(b.name))

  const reset = () => {
    setName('')
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      await updateGroup({ id: editingId, name: name.trim() })
    } else {
      await addGroup({ name: name.trim() })
    }
    reset()
    setOpenForm(false)
  }

  function startEdit(g) {
    setEditingId(g._id)
    setName(g.name)
    setOpenForm(true)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-blue">Cadastro de Grupos</h2>

      {/* botão colapsar/exibir form */}
      <button
        onClick={() => { reset(); setOpenForm(v => !v) }}
        className="flex items-center px-4 py-2 bg-brand-blue text-white rounded hover:bg-blue-600"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        {openForm ? 'Fechar' : 'Criar grupo'}
      </button>

      {/* form colapsável */}
      {openForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-3">
          <div>
            <label className="block mb-1 font-medium">Nome do Grupo</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-brand-blue text-white rounded hover:bg-blue-600"
            >
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {/* lista de grupos */}
      <div className="space-y-4">
        {sorted.map(g => (
          <div
            key={g._id}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
          >
            <span className="font-medium break-words">{g.name}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => startEdit(g)}
                className="flex items-center px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
              >
                <PencilSquareIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setConfirmId(g._id)}
                className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            {/* modal de confirmação de exclusão */}
            {confirmId === g._id && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black/50" />
                <div className="bg-white p-6 rounded-lg shadow-lg w-80 space-y-4 z-10">
                  <div className="flex items-center space-x-2 text-red-600">
                    <h3 className="text-lg font-bold">Confirmar exclusão?</h3>
                  </div>
                  <p>Deseja mesmo excluir o grupo <strong>{g.name}</strong>?</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setConfirmId(null)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        await deleteGroup(g._id)
                        setConfirmId(null)
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
