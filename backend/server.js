require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const app = express();

// --- 1) CORS ---
// Em produção, vai ler a URL do frontend via env FRONTEND_URL.
// Em dev/local, use '*' pra facilitar.
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2) Conexão com MongoDB ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro ao conectar MongoDB:', err));

// --- 3) Schemas & Models ---
const groupSchema = new mongoose.Schema({ name: String });
const employeeSchema = new mongoose.Schema({ name: String });
const productSchema = new mongoose.Schema({
  name:     String,
  price:    Number,
  group:    { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  minStock: { type: Number, default: 0 },
  stock:    { type: Number, default: 0 }
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

const Group    = mongoose.model('Group', groupSchema);
const Employee = mongoose.model('Employee', employeeSchema);
const Product  = mongoose.model('Product', productSchema);
const Sale     = mongoose.model('Sale', saleSchema);

// --- 4) Rotas CRUD ---

// Groups
app.get('/groups',       async (_, res) => res.json(await Group.find()));
app.post('/groups',      async (req, res) => res.status(201).json(await Group.create(req.body)));
app.put('/groups/:id',   async (req, res) => {
  const grp = await Group.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
  if (!grp) return res.status(404).json({ error: 'Grupo não encontrado' });
  res.json(grp);
});
app.delete('/groups/:id', async (req, res) => {
  await Group.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Employees
app.get('/employees',       async (_, res) => res.json(await Employee.find()));
app.post('/employees',      async (req, res) => res.status(201).json(await Employee.create(req.body)));
app.put('/employees/:id',   async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, password: req.body.password },
    { new: true }
  );
  if (!emp) return res.status(404).json({ error: 'Funcionário não encontrado' });
  res.json(emp);
});
app.delete('/employees/:id', async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Products
app.get('/products',           async (_, res) => res.json(await Product.find().populate('group')));
app.post('/products',          async (req, res) => {
  const p = await Product.create(req.body);
  await p.populate('group');
  res.status(201).json(p);
});
app.put('/products/:id',       async (req, res) => {
  const prod = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name:     req.body.name,
      price:    req.body.price,
      group:    req.body.group,
      minStock: req.body.minStock
    },
    { new: true }
  ).populate('group');
  if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(prod);
});
app.patch('/products/:id/stock', async (req, res) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });
  prod.stock = (prod.stock || 0) + req.body.adjustment;
  await prod.save();
  await prod.populate('group');
  res.json(prod);
});
app.delete('/products/:id',    async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Sales
app.get('/sales',    async (_, res) => res.json(await Sale.find()));
app.post('/sales',   async (req, res) => res.status(201).json(await Sale.create(req.body)));

// --- 5) Start Server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
  console.log(`🌐 CORS liberado para: ${allowedOrigin}`);
});
