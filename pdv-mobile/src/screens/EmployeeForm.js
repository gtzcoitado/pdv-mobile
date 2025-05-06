// src/screens/EmployeeForm.js
import React, { useContext, useState } from 'react';
import { DataContext } from '../contexts/DataContext';

export default function EmployeeForm() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useContext(DataContext);

  // form state
  const [name, setName]           = useState('');
  const [password, setPassword]   = useState('');
  const [editingId, setEditingId] = useState(null);

  // UI state
  const [showForm, setShowForm]       = useState(false);
  const [deletingId, setDeletingId]   = useState(null);
  const [toast, setToast]             = useState(null);

  const toastShow = (msg, type = 'bg-green-500') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2000);
  };

  function resetForm() {
    setName('');
    setPassword('');
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await updateEmployee({ id: editingId, name, password });
      toastShow('Funcionário atualizado!', 'bg-blue-600');
    } else {
      await addEmployee({ name, password });
      toastShow('Funcionário cadastrado!', 'bg-green-600');
    }
    resetForm();
    setShowForm(false);
  }

  async function confirmDelete() {
    await deleteEmployee(deletingId);
    toastShow('Funcionário excluído!', 'bg-red-600');
    setDeletingId(null);
  }

  function startEdit(emp) {
    setEditingId(emp._id);
    setName(emp.name);
    setPassword(emp.password || '');
    setShowForm(true);
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Funcionários</h2>

      {/* Toggleable form */}
      <button
        onClick={() => { setShowForm(s => !s); resetForm(); }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {showForm ? 'Fechar formulário' : (editingId ? 'Editar funcionário' : '+ Cadastrar funcionário')}
      </button>

      {showForm && (
        <div className="bg-white shadow rounded p-4 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nome</label>
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Senha</label>
              <input
                type="password"
                className="mt-1 block w-full border-gray-300 rounded"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className={`px-4 py-2 rounded text-white ${
                  editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                } transition`}
              >
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(false); }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Employee list */}
      <ul className="space-y-2">
        {employees
          .sort((a,b) => a.name.localeCompare(b.name))
          .map(emp => (
          <li
            key={emp._id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <span className="font-medium">{emp.name}</span>
            <div className="space-x-2">
              <button
                onClick={() => startEdit(emp)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
              >
                Editar
              </button>
              <button
                onClick={() => setDeletingId(emp._id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-bold mb-4">Confirmação</h3>
            <p className="mb-6">Deseja mesmo excluir este funcionário?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centered toast */}
      {toast && (
        <div className={`${toast.type} text-white px-6 py-3 rounded shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
