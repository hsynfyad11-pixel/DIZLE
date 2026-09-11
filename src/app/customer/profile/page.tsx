import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function CustomerProfilePage() {
  redirect('/my-orders');
}
