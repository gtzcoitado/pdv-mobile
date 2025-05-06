// src/api.js
const BASE_URL =
  process.env.REACT_APP_API_URL ||  // em produção vai usar o valor que você definir no Railway
  "http://localhost:4000";          // em dev, cai aqui

export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) throw new Error("Erro ao buscar produtos");
  return res.json();
}

// exporte todas as suas chamadas de API aqui:
export async function fetchSales() {
  const res = await fetch(`${BASE_URL}/sales`);
  if (!res.ok) throw new Error("Erro ao buscar vendas");
  return res.json();
}
