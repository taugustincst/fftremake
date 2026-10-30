# Elderon purchase-acknowledgement endpoint

A minimal Google Cloud Functions (2nd gen) HTTP endpoint that verifies and
acknowledges `full_unlock` purchases server-side, via the Google Play
Developer API (androidpublisher v3).

**Status: scaffold.** Nothing here is deployed, no service account or key
exists yet, and no real secret is (or should ever be) committed in this
folder. The owner wires it up following the steps below.

## Why this must exist before real sales

Google Play's rule: a purchase that is not **acknowledged within 3 days**
is automatically **refunded and revoked** — the player loses the unlock
and we lose the sale, every time, no exceptions. Acknowledgement is a
Play Developer API call that requires the developer account's
credentials, so the app cannot do it alone:

- The TWA's Digital Goods API can *make* the purchase but has no
  server-grade acknowledge path we control.
- Therefore: no endpoint → every `full_unlock` sale self-destructs on
  day three. This endpoint must be live **before** the first real sale,
  i.e. before production release (closed testing with license testers
  does not need it — those purchases are not real charges).

Product terms (from `../listing-pack.md` §2 and `../blockers.md` step 2):
package `com.taugustincst.elderon`, one-time in-app product
`full_unlock`, price $8.99, created and activated in Play Console.

## How it works

The game POSTs `{ packageName, productId, purchaseToken }` after a
successful purchase. The function:

1. Rejects any package/product other than
   `com.taugustincst.elderon` / `full_unlock` (403) and any malformed
   body (400).
2. Calls `purchases.products.get` to fetch the purchase from Google —
   the token is verified against Play, never trusted from the client.
3. If `purchaseState` is not Purchased (0) — e.g. Pending or Canceled —
   returns 422 and does **not** acknowledge.
4. If `acknowledgementState` is already Acknowledged (1), returns
   `200 {status: "already_acknowledged"}` — calls are idempotent and
   safe to retry.
5. Otherwise calls `purchases.products.acknowledge` and returns
   `200 {status: "acknowledged"}`.

On any Play API failure it returns `500 {status: "error"}`; the game
should retry later (the 3-day window makes retries safe, and step 4
makes them harmless).

## Wiring steps (owner, later)

### 1. Prerequisites

- Play Console app for `com.taugustincst.elderon` exists, and the
  in-app product `full_unlock` is created and **activated** (Console →
  Monetize → Products → In-app products).
- A Google Cloud project (can be the one Cloud Functions deploys to).

### 2. Enable the Google Play Developer API

In Google Cloud Console for that project: APIs & Services → Library →
enable **"Google Play Android Developer API"** (the androidpublisher
API).

### 3. Create a service account + key

- Cloud Console → IAM & Admin → Service Accounts → Create, e.g.
  `elderon-ack@<project>.iam.gserviceaccount.com`. It needs no GCP
  roles for this job — its power comes from the Play Console grant
  in step 4. (The function itself runs as it when deployed with the
  key; see the deploy note.)
- Keys tab → Add key → Create new key → JSON. Download the key file
  and store it **outside this repo**, in the owner's password manager /
  secure store. Point `SERVICE_ACCOUNT_KEY_PATH` at it (see
  `.env.example`). Never commit the key.

### 4. Grant the service account access in Play Console

- Play Console → Users and permissions → Invite new users → enter the
  service-account email. (Equivalently, Settings → API access links
  the Cloud project and lists the service account.)
- Grant **only** what acknowledgement needs, scoped to the Elderon app
  if offered: permissions covering viewing and managing orders /
  purchases (in current Console wording, the app-level "Manage orders"
  family). No financial, no release, no user-admin permissions.
- Until this grant exists, API calls return 403 — that is the most
  common wiring failure, so check here first when debugging.

### 5. Deploy (example)

```sh
cd ack-endpoint
npm install
gcloud functions deploy elderon-acknowledge \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=. \
  --entry-point=acknowledgePurchase \
  --trigger-http \
  --set-env-vars=EXPECTED_PACKAGE_NAME=com.taugustincst.elderon,EXPECTED_PRODUCT_ID=full_unlock,SERVICE_ACCOUNT_KEY_PATH=/path/inside/runtime/key.json
```

Notes:

- Auth model: the game is a web TWA and cannot present Google IAM
  credentials, so in practice this function is deployed reachable over
  HTTPS by the game (i.e. `--allow-unauthenticated`). The purchase
  token is the de-facto secret: it is unguessable, single-purchase,
  and the function re-verifies it against Play and refuses everything
  except one package/product pair, so an attacker gains nothing by
  calling it (worst case they acknowledge a real purchase early,
  which the buyer wants anyway). Prefer keeping the URL unlisted and,
  if abuse ever appears, adding a shared-secret header check in
  `index.js`.
- Key handling: better than bundling a key file, attach the service
  account to the function and grant via Secret Manager. The
  `SERVICE_ACCOUNT_KEY_PATH` approach in this scaffold is the simple
  path; either works, but the key must never live in this repo.

### 6. Point the game at it

After a successful purchase in the Play build:

1. The Digital Goods API purchase result gives the game the
   `purchaseToken` for `full_unlock`.
2. The game POSTs to the function URL:

   ```json
   POST https://<region>-<project>.cloudfunctions.net/elderon-acknowledge
   Content-Type: application/json

   { "packageName": "com.taugustincst.elderon",
     "productId": "full_unlock",
     "purchaseToken": "<token>" }
   ```

3. On `200` with `status` `acknowledged` or `already_acknowledged`,
   the purchase is final — the game can treat the unlock as permanent
   (it already grants it locally; acknowledgement only stops Play's
   refund clock).
4. On non-200 or network failure, the game should retry on next launch
   (and the endpoint is idempotent). Also call the endpoint on launch
   for any purchase token still flagged unacknowledged locally, so a
   player who bought and immediately closed the app is still covered
   inside the 3-day window.

## Local development

```sh
cp .env.example .env   # fill in a real key path locally; never commit
npm install
npm start              # serves acknowledgePurchase on :8080
curl -X POST localhost:8080/ \
  -H 'Content-Type: application/json' \
  -d '{"packageName":"com.taugustincst.elderon","productId":"full_unlock","purchaseToken":"<license-tester-token>"}'
```

Use a license-tester purchase token for end-to-end local testing; the
verifier branches (403/422/already-acknowledged) can be exercised
without any real charge.
