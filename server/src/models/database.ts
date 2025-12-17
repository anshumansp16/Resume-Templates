import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite');
const db: Database.Database = new Database(dbPath);

db.pragma('journal_mode = WAL');

const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    razorpay_order_id TEXT UNIQUE NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    resume_data TEXT NOT NULL,
    template_id TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    download_token TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    download_count INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_email ON orders(email);
  CREATE INDEX IF NOT EXISTS idx_download_token ON orders(download_token);
  CREATE INDEX IF NOT EXISTS idx_razorpay_order_id ON orders(razorpay_order_id);
  CREATE INDEX IF NOT EXISTS idx_payment_status ON orders(payment_status);
`;

db.exec(createTablesSQL);

export interface Order {
  id: string;
  email: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  resume_data: string;
  template_id: string;
  payment_status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  download_token: string;
  created_at: number;
  expires_at: number;
  download_count: number;
}

export const createOrder = (orderData: Omit<Order, 'download_count'>) => {
  const stmt = db.prepare(`
    INSERT INTO orders (
      id, email, razorpay_order_id, resume_data, template_id,
      payment_status, amount, currency, download_token,
      created_at, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    orderData.id,
    orderData.email,
    orderData.razorpay_order_id,
    orderData.resume_data,
    orderData.template_id,
    orderData.payment_status,
    orderData.amount,
    orderData.currency,
    orderData.download_token,
    orderData.created_at,
    orderData.expires_at
  );
};

export const getOrderByRazorpayOrderId = (razorpayOrderId: string): Order | undefined => {
  const stmt = db.prepare('SELECT * FROM orders WHERE razorpay_order_id = ?');
  return stmt.get(razorpayOrderId) as Order | undefined;
};

export const getOrderByDownloadToken = (downloadToken: string): Order | undefined => {
  const stmt = db.prepare('SELECT * FROM orders WHERE download_token = ?');
  return stmt.get(downloadToken) as Order | undefined;
};

export const getOrdersByEmail = (email: string): Order[] => {
  const stmt = db.prepare('SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC');
  return stmt.all(email) as Order[];
};

export const updateOrderPayment = (
  razorpayOrderId: string,
  paymentId: string,
  signature: string,
  status: 'completed' | 'failed'
) => {
  const stmt = db.prepare(`
    UPDATE orders
    SET razorpay_payment_id = ?,
        razorpay_signature = ?,
        payment_status = ?
    WHERE razorpay_order_id = ?
  `);

  return stmt.run(paymentId, signature, status, razorpayOrderId);
};

export const incrementDownloadCount = (downloadToken: string) => {
  const stmt = db.prepare(`
    UPDATE orders
    SET download_count = download_count + 1
    WHERE download_token = ?
  `);

  return stmt.run(downloadToken);
};

export default db;
