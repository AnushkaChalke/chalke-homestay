import { cookies } from 'next/headers';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import BookingAdminDashboard from '@/components/admin/BookingAdminDashboard';
import { ADMIN_SESSION_COOKIE, getAdminPassword, isAdminSessionToken } from '@/lib/admin-auth';

export default async function AdminBookingsPage() {
  const sessionCookie = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const authenticated = isAdminSessionToken(sessionCookie);
  const configured = Boolean(getAdminPassword());

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 py-16">
      <div className="container mx-auto px-6">
        {configured ? (
          authenticated ? (
            <BookingAdminDashboard />
          ) : (
            <AdminLoginForm />
          )
        ) : (
          <div className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center">
            <div className="w-full rounded-[2rem] border bg-white p-8 shadow-xl">
              <h1 className="text-3xl font-headline font-bold text-primary">Admin password not configured</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Set ADMIN_BOOKINGS_PASSWORD in the environment to enable booking admin access.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}