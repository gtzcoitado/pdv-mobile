require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1) Conexão com Mongo
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Mongo conectado'))
  .catch(err => console.error('❌ Erro Mongo:', err));

// 2) Schemas e Models
const groupSchema = new mongoose.Schema({ name: String });
const employeeSchema = new mongoose.Schema({ name: String });
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  minStock: { type: Number, default: 0 },
  stock: { type: Number, default: 0 }
});
const saleSchema = new mongoose.Schema({
  items: [{
    product:  String,
    quantity: Number,
    total:    Number
  }],
  discount: { type: Number, default: 0 },
  total:    Number,
  payments: {
    debit:  { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    cash:   { type: Number, default: 0 },
    pix:    { type: Number, default: 0 }
  }
}, { timestamps: true });


const Group   = mongoose.model('Group', groupSchema);
const Employee= mongoose.model('Employee', employeeSchema);
const Product = mongoose.model('Product', productSchema);
const Sale    = mongoose.model('Sale', saleSchema);

// 3) Rotas CRUD

// Groups

app.get('/groups', async (_, res) => {
  const grupos = await Group.find();
  res.json(grupos);
});

app.post('/groups', async (req, res) => {
  const novo = await Group.create(req.body);
  res.status(201).json(novo);
});

// **Editar grupo**
app.put('/groups/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const grp = await Group.findByIdAndUpdate(id, { name }, { new: true });
  if (!grp) return res.status(404).json({ error: 'Grupo não encontrado' });
  res.json(grp);
});

// **Excluir grupo**
app.delete('/groups/:id', async (req, res) => {
  await Group.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Employees

app.get('/employees', async (_, res) => {
  const emps = await Employee.find();
  res.json(emps);
});
app.post('/employees', async (req, res) => {
  const novo = await Employee.create(req.body);
  res.status(201).json(novo);
});

// **Editar funcionário**

app.put('/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;
  const emp = await Employee.findByIdAndUpdate(
    id,
    { name, password },
    { new: true }
  );
  if (!emp) return res.status(404).json({ error: 'Funcionário não encontrado' });
  res.json(emp);
});

// **Excluir funcionário**

app.delete('/employees/:id', async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Products
app.get('/products', async (_, res) => {
  const prods = await Product.find().populate('group');
  res.json(prods);
});
app.post('/products', async (req, res) => {
  let novo = await Product.create(req.body);
  await novo.populate('group');
  res.status(201).json(novo);
});
// atualizar produto
app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, group, minStock } = req.body;
  const prod = await Product.findByIdAndUpdate(
    id,
    { name, price, group, minStock },
    { new: true }
  ).populate('group');
  if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(prod);
});
// ajuste de estoque
app.patch('/products/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { adjustment } = req.body;
  const prod = await Product.findById(id);
  if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });
  prod.stock = (prod.stock || 0) + adjustment;
  await prod.save();
  await prod.populate('group');
  res.json(prod);
});
// excluir produto
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.json({ success: true });
});

// Sales
app.get('/sales', async (_, res) => {
  const vendas = await Sale.find();
  res.json(vendas);
});
app.post('/sales', async (req, res) => {
  const nova = await Sale.create(req.body);
  res.status(201).json(nova);
});

// 4) Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));
