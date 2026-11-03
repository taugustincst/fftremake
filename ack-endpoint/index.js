'use strict';

/**
 * Play purchase acknowledgement endpoint for Chronicles of Elderon and the
 * other taugustincst games that sell an unlock through Google Play.
 *
 * Why this exists: Google Play refunds and revokes any purchase that is not
 * acknowledged within 3 days of purchase. Acknowledgement must happen
 * server-side via the Google Play Developer API (androidpublisher v3) —
 * the TWA / Digital Goods API client cannot do it alone.
 *
 * Flow: the game, after a successful `full_unlock` purchase, POSTs the
 * purchase token here. We fetch the purchase from Google, verify it is
 * really ours and really paid, and acknowledge it if it isn't already.
 *
 * Expected request body (JSON):
 *   { "packageName": "com.taugustincst.elderon",
 *     "productId":   "full_unlock",
 *     "purchaseToken": "<token from Play>" }
 *
 * Responses (all JSON, `status` field is the machine-readable branch):
 *   200 { status: "acknowledged" }          verified + acknowledged by us
 *   200 { status: "already_acknowledged" }  verified, nothing left to do
 *   400 { status: "bad_request" }           body missing/incomplete
 *   403 { status: "rejected" }              packageName/productId mismatch
 *   422 { status: "invalid_state" }         purchase not in Purchased state
 *   405 { status: "method_not_allowed" }    non-POST request
 *   500 { status: "error" }                 Play API or server failure
 */

const functions = require('@google-cloud/functions-framework');
const { google } = require('googleapis');

// Which apps and products this endpoint may acknowledge. One service
// serves every game: ALLOWED_PRODUCTS lists them as
//   package:product|product,package:product
// e.g. "com.taugustincst.elderon:full_unlock|hollow_sky,com.taugustincst.mended:full_unlock".
// Without it, the older single-app settings still work (EXPECTED_PACKAGE_NAME
// with EXPECTED_PRODUCT_IDS or EXPECTED_PRODUCT_ID); without those either,
// the built-in list below applies: Elderon and the six free-to-try games.
// Anything not listed is refused with 403, so the service can never be used
// to touch another developer's purchases.
const DEFAULT_ALLOWED_PRODUCTS = [
  'com.taugustincst.elderon:full_unlock|hollow_sky',
  'com.taugustincst.openstall:full_unlock',
  'com.taugustincst.apothecary:full_unlock',
  'com.taugustincst.mended:full_unlock',
  'com.taugustincst.keepthelight:full_unlock',
  'com.taugustincst.nightshift:full_unlock',
  'com.taugustincst.cartographer:full_unlock',
].join(',');

function parseAllowedProducts(env) {
  const map = new Map();
  if (env.ALLOWED_PRODUCTS) {
    for (const entry of env.ALLOWED_PRODUCTS.split(',')) {
      const [pkg, products] = entry.split(':').map(s => (s || '').trim());
      if (!pkg || !products) continue;
      map.set(pkg, products.split('|').map(s => s.trim()).filter(Boolean));
    }
    return map;
  }
  if (env.EXPECTED_PACKAGE_NAME) {
    map.set(env.EXPECTED_PACKAGE_NAME, (env.EXPECTED_PRODUCT_IDS || env.EXPECTED_PRODUCT_ID || 'full_unlock,hollow_sky')
      .split(',').map(s => s.trim()).filter(Boolean));
    return map;
  }
  return parseAllowedProducts({ ALLOWED_PRODUCTS: DEFAULT_ALLOWED_PRODUCTS });
}
const ALLOWED_PRODUCTS = parseAllowedProducts(process.env);

// The games are web pages (GitHub Pages) inside a Trusted Web Activity, so
// their POST is a cross-origin request with a JSON body: the browser first
// sends an OPTIONS preflight and only sends the POST if the answer allows
// the page's origin. Without these headers every report from the game is
// blocked before it leaves the browser.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://taugustincst.github.io')
  .split(',').map(s => s.trim()).filter(Boolean);
const SERVICE_ACCOUNT_KEY_PATH = process.env.SERVICE_ACCOUNT_KEY_PATH;

// Play purchase fields (androidpublisher v3 ProductPurchase):
//   purchaseState:       0 = Purchased, 1 = Canceled, 2 = Pending
//   acknowledgementState: 0 = yet to be acknowledged, 1 = acknowledged
const PURCHASE_STATE_PURCHASED = 0;
const ACK_STATE_PENDING = 0;

// Lazily built and cached across warm invocations.
let androidPublisher = null;

function getPublisher() {
  if (androidPublisher) return androidPublisher;
  // Two auth modes:
  //  - Deployed (preferred): SERVICE_ACCOUNT_KEY_PATH unset → Application
  //    Default Credentials. On Cloud Functions the function's attached
  //    service account (elderon-ack@) provides the identity — no key file
  //    exists anywhere.
  //  - Local dev: SERVICE_ACCOUNT_KEY_PATH points at a downloaded key.
  const authOptions = {
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  };
  if (SERVICE_ACCOUNT_KEY_PATH) {
    authOptions.keyFile = SERVICE_ACCOUNT_KEY_PATH;
  }
  const auth = new google.auth.GoogleAuth(authOptions);
  androidPublisher = google.androidpublisher({ version: 'v3', auth });
  return androidPublisher;
}

async function acknowledgePurchase(req, res) {
  const origin = req.get ? req.get('Origin') : (req.headers && req.headers.origin);
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  res.set('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'method_not_allowed' });
  }

  const { packageName, productId, purchaseToken } = req.body || {};

  if (
    typeof packageName !== 'string' ||
    typeof productId !== 'string' ||
    typeof purchaseToken !== 'string' ||
    purchaseToken.length === 0
  ) {
    return res.status(400).json({
      status: 'bad_request',
      message: 'Body must be JSON {packageName, productId, purchaseToken}.',
    });
  }

  // Hard gate: only the listed apps and products. Anything else is not an
  // error in Play — it is simply not ours to touch.
  const allowed = ALLOWED_PRODUCTS.get(packageName);
  if (!allowed || !allowed.includes(productId)) {
    return res.status(403).json({
      status: 'rejected',
      message: 'packageName/productId do not match this endpoint.',
    });
  }

  try {
    const publisher = getPublisher();

    // 1. Ask Google what this token actually is — never trust the client.
    const { data: purchase } = await publisher.purchases.products.get({
      packageName,
      productId,
      token: purchaseToken,
    });

    // 2. Only acknowledge money that actually settled. A Pending purchase
    //    (e.g. deferred payment) must NOT be acknowledged; the game should
    //    call again once the state flips to Purchased. A Canceled one never
    //    will be.
    if (purchase.purchaseState !== PURCHASE_STATE_PURCHASED) {
      return res.status(422).json({
        status: 'invalid_state',
        purchaseState: purchase.purchaseState,
        message: 'Purchase is not in Purchased state; not acknowledging.',
      });
    }

    // 3. Idempotent: if Play already shows it acknowledged, we are done.
    //    Safe for the game to call this endpoint more than once.
    if (purchase.acknowledgementState !== ACK_STATE_PENDING) {
      return res.status(200).json({ status: 'already_acknowledged' });
    }

    // 4. Acknowledge. This stops the 3-day auto-refund/revoke clock.
    await publisher.purchases.products.acknowledge({
      packageName,
      productId,
      token: purchaseToken,
    });

    return res.status(200).json({ status: 'acknowledged' });
  } catch (err) {
    // Log server-side for Cloud Logging; return a generic error to the
    // caller. The game should treat 5xx as "retry later" — the 3-day
    // deadline leaves room for retries, and step 3 makes them harmless.
    console.error('acknowledgePurchase failed:', err && err.message);
    return res.status(500).json({ status: 'error' });
  }
}

functions.http('acknowledgePurchase', acknowledgePurchase);

module.exports = { acknowledgePurchase, parseAllowedProducts, _setPublisher: p => { androidPublisher = p; } };
