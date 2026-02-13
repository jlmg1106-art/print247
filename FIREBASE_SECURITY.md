# Firebase Security Rules

This project includes recommended security rules for Firestore and Storage.
These files are **not deployed automatically** — you must copy them into the
Firebase Console (or use the Firebase CLI) manually.

## Files

| File | Purpose |
|------|---------|
| `firebase.rules.firestore.txt` | Firestore security rules for the `orders` collection |
| `firebase.rules.storage.txt` | Storage security rules for uploaded order files |

## How to deploy

### Option A — Firebase Console

1. Go to **Firebase Console → Firestore → Rules** and paste the contents of
   `firebase.rules.firestore.txt`. Click **Publish**.
2. Go to **Firebase Console → Storage → Rules** and paste the contents of
   `firebase.rules.storage.txt`. Click **Publish**.

### Option B — Firebase CLI

```bash
# Install if needed
npm i -g firebase-tools
firebase login

# Deploy rules (requires firebase.json pointing to the rule files)
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Setting admin custom claims

Admin access (read/update any order, read any file) requires a custom claim
`admin: true` on the Firebase Auth user. Set it with the Firebase Admin SDK
from a trusted server environment:

```js
const admin = require('firebase-admin');
admin.initializeApp();

async function setAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`User ${uid} is now an admin.`);
}

setAdmin('PASTE_THE_USER_UID_HERE');
```

After setting the claim, the user must sign out and sign back in (or refresh
their ID token) for the new claim to take effect.

## Important notes

- **Public reads are disabled.** No one can list or read all orders unless they
  have the `admin` claim.
- **Client self-read** requires `customerUid` to be stored on the order document
  at creation time. This is marked as a TODO in the codebase and in the rules.
- **Storage writes are open for MVP.** The storage rules currently allow
  unauthenticated writes so orders can be placed without sign-in. Before going
  to production, require `request.auth != null` and add a file size limit.
