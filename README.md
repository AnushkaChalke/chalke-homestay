# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Booking admin setup

This project includes a lightweight bookings backend (Firestore) and an admin dashboard at `/admin/bookings`.

Required environment variables (use `.env.local` locally or set in your hosting provider):

- `ADMIN_BOOKINGS_PASSWORD` — password to view the admin dashboard. Set to a secure string.
- Firebase Admin credentials — either provide a service account JSON file and set `GOOGLE_APPLICATION_CREDENTIALS` to its path, or set the following three env vars:
	- `FIREBASE_PROJECT_ID`
	- `FIREBASE_CLIENT_EMAIL`
	- `FIREBASE_PRIVATE_KEY` (escape newlines as `\n`)

Example file provided: `.env.example` — copy to `.env.local` and fill values.

How it works:
- Public booking forms post to `/api/bookings` and create documents in the `bookings` collection.
- The admin dashboard reads and updates bookings via the same API but requires an httpOnly session cookie created by signing in at `/admin/bookings` with `ADMIN_BOOKINGS_PASSWORD`.

Local dev:

1. Copy the example env file and edit:

```bash
cp .env.example .env.local
# edit .env.local and fill values
```

2. (Optional) If you prefer to use a service-account JSON file instead of individual vars, download the service account key from Firebase and set:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

3. Install deps and run the dev server:

```bash
npm install
npm run dev
```

4. Open `http://localhost:9002/admin/bookings`, sign in with the `ADMIN_BOOKINGS_PASSWORD` set in your env.

Client-side Firebase SDK (optional):

- If you want to initialize the Firebase Web SDK (for analytics, client Firestore, storage, etc.), create a `.env.local` with the `NEXT_PUBLIC_FIREBASE_*` vars and use the provided `src/lib/firebase-client.ts` initializer. An example `.env.local` with the client config is already included in the project for local testing (do not commit secrets to public repos).

Notes:
- The `bookings` API read/update endpoints are protected; the public contact and room forms still post booking requests.
- For production, set env vars in your hosting provider (Vercel, Firebase, etc.) and ensure `FIREBASE_*` or `GOOGLE_APPLICATION_CREDENTIALS` are configured.

If you want, I can deploy this for you or help connect a Firebase project and generate the correct service-account file.
