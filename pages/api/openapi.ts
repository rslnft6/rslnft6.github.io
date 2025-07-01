// مثال على نقطة نهاية API مفتوحة
// pages/api/openapi.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllProperties } from '../../data/properties';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(getAllProperties());
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}