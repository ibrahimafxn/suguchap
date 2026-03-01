import 'dotenv/config';
import mongoose from 'mongoose';
import { MarketSchema } from '../markets/market.schema';
import { ProductSchema } from '../products/product.schema';

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  // eslint-disable-next-line no-console
  console.error('MONGO_URI is not set');
  process.exit(1);
}

const Market = mongoose.model('Market', MarketSchema);
const Product = mongoose.model('Product', ProductSchema);

const markets = [
  {
    key: 'cocody',
    name: 'Marche Cocody',
    city: 'Abidjan',
    location_lat: 5.3532,
    location_lng: -3.9874,
  },
  {
    key: 'treichville',
    name: 'Marche Treichville',
    city: 'Abidjan',
    location_lat: 5.3019,
    location_lng: -4.0035,
  },
];

const products = [
  {
    marketKey: 'cocody',
    name: 'Tomate',
    category: 'Legumes',
    unit: 'kg',
    price_estimated: 1200,
  },
  {
    marketKey: 'cocody',
    name: 'Oignon',
    category: 'Legumes',
    unit: 'kg',
    price_estimated: 900,
  },
  {
    marketKey: 'cocody',
    name: 'Poulet',
    category: 'Viande',
    unit: 'piece',
    price_estimated: 3500,
  },
  {
    marketKey: 'treichville',
    name: 'Banane plantain',
    category: 'Fruits',
    unit: 'kg',
    price_estimated: 1000,
  },
  {
    marketKey: 'treichville',
    name: 'Igname',
    category: 'Tubercules',
    unit: 'kg',
    price_estimated: 1400,
  },
];

async function seed() {
  await mongoose.connect(mongoUri!);

  const marketIdByKey = new Map<string, mongoose.Types.ObjectId>();

  for (const market of markets) {
    const doc = await Market.findOneAndUpdate(
      { name: market.name, city: market.city },
      {
        $set: {
          name: market.name,
          city: market.city,
          location_lat: market.location_lat,
          location_lng: market.location_lng,
          is_active: true,
        },
      },
      { upsert: true, new: true },
    );
    marketIdByKey.set(market.key, doc._id as mongoose.Types.ObjectId);
  }

  for (const product of products) {
    const marketId = marketIdByKey.get(product.marketKey);
    if (!marketId) {
      continue;
    }

    await Product.findOneAndUpdate(
      { name: product.name, market_id: marketId },
      {
        $set: {
          market_id: marketId,
          name: product.name,
          category: product.category,
          unit: product.unit,
          price_estimated: product.price_estimated,
          is_active: true,
        },
      },
      { upsert: true, new: true },
    );
  }

  // eslint-disable-next-line no-console
  console.log('Seed completed');
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
