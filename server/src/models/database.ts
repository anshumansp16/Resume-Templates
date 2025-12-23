import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;
let client: MongoClient | null = null;
let db: Db | null = null;

export interface Order {
  _id?: ObjectId;
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

let ordersCollection: Collection<Order> | null = null;

export const initializeDatabase = async () => {
  try {
    // Check if we should use in-memory MongoDB or a real MongoDB connection
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      // Use real MongoDB connection
      console.log('[Database] Connecting to MongoDB...');
      client = new MongoClient(mongoUri);
      await client.connect();
      db = client.db(process.env.MONGODB_DB_NAME || 'resumepro');
      console.log('[Database] Connected to MongoDB');
    } else {
      // Use in-memory MongoDB for development
      console.log('[Database] Starting in-memory MongoDB server...');
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();

      client = new MongoClient(uri);
      await client.connect();
      db = client.db('resumepro');
      console.log('[Database] In-memory MongoDB server started');
    }

    ordersCollection = db.collection<Order>('orders');

    // Create indexes for better performance
    await ordersCollection.createIndex({ email: 1 });
    await ordersCollection.createIndex({ download_token: 1 }, { unique: true });
    await ordersCollection.createIndex({ razorpay_order_id: 1 }, { unique: true });
    await ordersCollection.createIndex({ payment_status: 1 });
    await ordersCollection.createIndex({ created_at: 1 });

    console.log('[Database] Indexes created successfully');
  } catch (error) {
    console.error('[Database] Failed to initialize:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  try {
    if (client) {
      await client.close();
      console.log('[Database] MongoDB connection closed');
    }
    if (mongoServer) {
      await mongoServer.stop();
      console.log('[Database] In-memory MongoDB server stopped');
    }
  } catch (error) {
    console.error('[Database] Error closing database:', error);
  }
};

const getOrdersCollection = (): Collection<Order> => {
  if (!ordersCollection) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return ordersCollection;
};

export const createOrder = async (orderData: Omit<Order, 'download_count' | '_id'>) => {
  const collection = getOrdersCollection();

  const order: Order = {
    ...orderData,
    download_count: 0,
  };

  const result = await collection.insertOne(order);
  return { insertedId: result.insertedId, changes: 1 };
};

export const getOrderByRazorpayOrderId = async (razorpayOrderId: string): Promise<Order | null> => {
  const collection = getOrdersCollection();
  return await collection.findOne({ razorpay_order_id: razorpayOrderId });
};

export const getOrderByDownloadToken = async (downloadToken: string): Promise<Order | null> => {
  const collection = getOrdersCollection();
  return await collection.findOne({ download_token: downloadToken });
};

export const getOrdersByEmail = async (email: string): Promise<Order[]> => {
  const collection = getOrdersCollection();
  return await collection.find({ email }).sort({ created_at: -1 }).toArray();
};

export const updateOrderPayment = async (
  razorpayOrderId: string,
  paymentId: string,
  signature: string,
  status: 'completed' | 'failed'
) => {
  const collection = getOrdersCollection();

  const result = await collection.updateOne(
    { razorpay_order_id: razorpayOrderId },
    {
      $set: {
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        payment_status: status,
      },
    }
  );

  return { changes: result.modifiedCount };
};

export const incrementDownloadCount = async (downloadToken: string) => {
  const collection = getOrdersCollection();

  const result = await collection.updateOne(
    { download_token: downloadToken },
    { $inc: { download_count: 1 } }
  );

  return { changes: result.modifiedCount };
};

export const getDatabase = (): Db => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

export default {
  initializeDatabase,
  closeDatabase,
  getDatabase,
};
