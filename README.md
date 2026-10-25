# The Trail: New Testament

A free 315-day devotional app for iPhone and Android from Purpose Press. A new day opens each day the reader returns; days aren't tied to the calendar.

Each day has a centering prayer, a New Testament reading that opens on Bible Gateway (NRSV by default), commentary with the author's recording, small group questions, private notes, and a way to send a question to the author.

## What's here

| Folder | What it is |
| --- | --- |
| `app/` | The Expo app screens: title screen, Today, The Trail, Support, About |
| `components/`, `lib/` | Shared pieces: audio player, elevation map, progress and content store, Supabase client |
| `admin/` | The admin page, where you write and publish days, upload recordings, and read reader questions |
| `supabase/migrations/` | The database setup, already applied to the `the-trail-nt` Supabase project |
| `assets/images/` | App icon, splash image, Purpose Press logo |

## First-time setup on a Mac

You need Node.js 20 or newer.

```sh
npm run setup      # installs Expo and the app's libraries at matching versions
npx expo start     # starts the app; scan the QR code with the Expo Go app on your phone
```

## The admin page

1. In Supabase, open **Authentication → Users → Add user**, and create a login with your email and a password.
2. In the Supabase **SQL editor**, run this once, using your email:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
   ```
3. Open the admin page online at https://trail-admin-purposepress.netlify.app/. Netlify is connected to this GitHub repository and publishes the `admin` folder (see `netlify.toml`), so changes pushed to GitHub go live automatically.
   To run it on your Mac instead: `npm run admin`, then go to http://localhost:5050.

Content published there shows up in the app the next time a reader opens it. No app update is needed.

## Building for the stores

```sh
npm install -g eas-cli
eas login
eas init                                # links this folder to your Expo account
eas build --platform all --profile production
eas submit --platform ios               # needs your Apple Developer account
eas submit --platform android           # needs your Google Play Console account
```

## Still to fill in

- Supporter perks: `app/(tabs)/support.tsx`
- Author photo, bio, and Purpose Press description: `app/(tabs)/about.tsx`
- Days 1–3 hold sample content marked `[SAMPLE]`. Replace it in the admin page.
