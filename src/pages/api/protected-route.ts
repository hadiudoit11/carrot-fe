//pages/api/protected-route.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  res.status(200).json({ message: 'Authorized' });
};
