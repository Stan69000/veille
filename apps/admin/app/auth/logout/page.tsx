import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';

export default async function LogoutPage() {
  const session = await auth();
  
  if (session) {
    await signOut({ redirect: false });
  }
  
  redirect('/auth/login');
}
