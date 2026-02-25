# Social Login Setup (Google, GitHub, Facebook)

Your app already supports OAuth in code. To make login work, configure provider apps and environment variables.

## 1) Frontend env (`frontend/.env.local`)

Set these keys:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-secret

BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

GOOGLE_CLIENT_ID=Y731718237957-av4u20lcr2mrh237v8d8380reeef1ngc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
```

Notes:
- Restart frontend after editing env vars.
- If a provider key is missing, that social button will not appear.

## 2) Google OAuth app

Create OAuth credentials in Google Cloud Console.

Use this callback URL exactly:

```text
http://localhost:3000/api/auth/callback/google
```

## 3) GitHub OAuth app

Create an OAuth app in GitHub settings.

Use:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## 4) Facebook app

Create an app in Meta for Developers and enable Facebook Login.

Use this Valid OAuth Redirect URI:

```text
http://localhost:3000/api/auth/callback/facebook
```

Also ensure:
- App is in Live mode, or your login account is added as a Test User/Developer.
- `email` permission is available for your app mode.

## 5) Backend

Run backend on:

```text
http://localhost:5001
```

Social login flow exchanges provider profile with backend endpoint:

```text
POST /api/auth/social-login
```

## 6) Test flow

1. Open `http://localhost:3000/login`
2. Click Google / GitHub / Facebook.
3. On success, app redirects through `/auth/social-success` and then to `/dashboard` or `/admin`.

If you get redirected back to login, check browser console + terminal logs for missing env keys or invalid callback URLs.
