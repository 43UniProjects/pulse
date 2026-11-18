import { Metadata } from 'next';
import { validateRoleAccess } from '@/lib/auth/guard';
import PostRequestClient from './post-request-client';

export const metadata: Metadata = {
  title: 'Post Blood Request | Pulse',
  description: 'Broadcast an emergency request to eligible nearby donors.',
};

export default async function PostRequestPage() {
  await validateRoleAccess('hospital');

  return <PostRequestClient />;
}
