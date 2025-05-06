// src/contexts/DataContext.js
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const DataContext = createContext();

// usamos a var de ambiente em prod, ou cai em mesma origem em dev
const API = process.env.REACT_APP_API_URL || window.location.origin;

export function DataProvider({ children }) {
  const [groups,    setGroups]    = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products,  setProducts]  = useState([]);
  const [sales,     setSales]     = useState([]);

  // — fetchers —
  const fetchGroups    = async () => {
    try {
      const r = await axios.get(`${API}/groups`);
      setGroups(r.data);
    } catch (err) {
      console.error('❌ Error fetching groups:', err);
    }
  };
  const fetchEmployees = async () => {
    try {
      const r = await axios.get(`${API}/employees`);
      setEmployees(r.data);
    } catch (err) {
      console.error('❌ Error fetching employees:', err);
    }
  };
  const fetchProducts  = async () => {
    try {
      const r = await axios.get(`${API}/products`);
      setProducts(r.data);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
    }
  };
  const fetchSales     = async () => {
    try {
      const r = await axios.get(`${API}/sales`);
      setSales(r.data);
    } catch (err) {
      console.error('❌ Error fetching sales:', err);
    }
  };

  useEffect(() => {
    console.log('🔗 Fetching from API:', API);
    fetchGroups();
    fetchEmployees();
    fetchProducts();
    fetchSales();
  }, []);

  // — Groups CRUD —
  const addGroup    = async ({ name })       => { const r = await axios.post(`${API}/groups`, { name });    setGroups(g => [ ...g, r.data ]); };
  const updateGroup = async ({ id, name })   => { const r = await axios.put(`${API}/groups/${id}`, { name }); setGroups(g => g.map(x => x._id === id ? r.data : x)); };
  const deleteGroup = async id               => { await axios.delete(`${API}/groups/${id}`);                   setGroups(g => g.filter(x => x._id !== id)); };

  // — Employees CRUD —
  const addEmployee    = async ({ name, password })    => { const r = await axios.post(`${API}/employees`, { name, password }); setEmployees(e => [ ...e, r.data ]); };
  const updateEmployee = async ({ id, name, password })=> { const r = await axios.put(`${API}/employees/${id}`, { name, password }); setEmployees(e => e.map(x => x._id === id ? r.data : x)); };
  const deleteEmployee = async id                     => { await axios.delete(`${API}/employees/${id}`);                         setEmployees(e => e.filter(x => x._id !== id)); };

  // — Products CRUD + stock adjust —
  const addProduct    = async payload            => { await axios.post(`${API}/products`, payload);     await fetchProducts(); };
  const updateProduct = async ({ id, name, price, groupId, minStock }) => {
    await axios.put(`${API}/products/${id}`, {
      name,
      price,
      group: groupId,
      minStock
    });
    await fetchProducts();
  };
  const deleteProduct = async id                 => { await axios.delete(`${API}/products/${id}`);       await fetchProducts(); };
  const adjustStock   = async ({ productId, adjustment }) => {
    const r = await axios.patch(`${API}/products/${productId}/stock`, { adjustment });
    setProducts(p => p.map(x => x._id === r.data._id ? r.data : x));
  };

  // — Sales CRUD —
  const addSale = async payload => {
    await axios.post(`${API}/sales`, payload);
    await fetchSales();
  };

  return (
    <DataContext.Provider value={{
      groups,
      employees,
      products,
      sales,
      addGroup,    updateGroup,    deleteGroup,
      addEmployee, updateEmployee, deleteEmployee,
      addProduct,  updateProduct,  deleteProduct,  adjustStock,
      addSale
    }}>
      {children}
    </DataContext.Provider>
  );
}
