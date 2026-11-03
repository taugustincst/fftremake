// node test.js: the endpoint's gate and its answer to the browser's cross-origin check,
// with the Play Developer API replaced by a stub. No network, no credentials.
'use strict';
const Module = require('module');
const realLoad = Module._load;
let registered = null;
Module._load = function (name, ...rest) {
  if (name === '@google-cloud/functions-framework') return { http: (n, fn) => { registered = fn; } };
  if (name === 'googleapis') return { google: {} };
  return realLoad.apply(this, [name, ...rest]);
};
delete process.env.ALLOWED_PRODUCTS; delete process.env.EXPECTED_PACKAGE_NAME; delete process.env.ALLOWED_ORIGINS;
const ep = require('./index.js');
let failures = 0; const check = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  ' + extra : '')); if (!ok) failures++; };

const acked = [];
ep._setPublisher({ purchases: { products: {
  get: async ({ token }) => ({ data: { purchaseState: token === 'pending' ? 2 : 0, acknowledgementState: token === 'old' ? 1 : 0 } }),
  acknowledge: async (a) => { acked.push(a); },
} } });
function call({ method = 'POST', origin = 'https://taugustincst.github.io', body } = {}) {
  return new Promise(resolve => {
    const headers = {}; let code = 200;
    const res = { set: (k, v) => { headers[k] = v; return res; }, status: c => { code = c; return res; },
      json: b => resolve({ code, headers, body: b }), send: b => resolve({ code, headers, body: b }) };
    ep.acknowledgePurchase({ method, body, get: h => (h === 'Origin' ? origin : undefined) }, res);
  });
}
(async () => {
  check('registered with the functions framework', registered === ep.acknowledgePurchase);
  let r = await call({ method: 'OPTIONS' });
  check('the preflight from the games\' site is allowed', r.code === 204 && r.headers['Access-Control-Allow-Origin'] === 'https://taugustincst.github.io' && /Content-Type/.test(r.headers['Access-Control-Allow-Headers']));
  r = await call({ method: 'OPTIONS', origin: 'https://evil.example' });
  check('another site gets no allow-origin header', !r.headers['Access-Control-Allow-Origin']);
  for (const pkg of ['com.taugustincst.elderon', 'com.taugustincst.openstall', 'com.taugustincst.apothecary', 'com.taugustincst.mended', 'com.taugustincst.keepthelight', 'com.taugustincst.nightshift', 'com.taugustincst.cartographer']) {
    r = await call({ body: { packageName: pkg, productId: 'full_unlock', purchaseToken: 'tok-' + pkg } });
    check(`${pkg} full_unlock is acknowledged`, r.code === 200 && r.body.status === 'acknowledged' && r.headers['Access-Control-Allow-Origin'] === 'https://taugustincst.github.io');
  }
  r = await call({ body: { packageName: 'com.taugustincst.elderon', productId: 'hollow_sky', purchaseToken: 'x' } });
  check('Elderon\'s expansion is still allowed', r.code === 200);
  r = await call({ body: { packageName: 'com.taugustincst.mended', productId: 'hollow_sky', purchaseToken: 'x' } });
  check('a product another game sells is refused for this one', r.code === 403);
  r = await call({ body: { packageName: 'com.example.other', productId: 'full_unlock', purchaseToken: 'x' } });
  check('an unlisted package is refused', r.code === 403);
  r = await call({ body: { packageName: 'com.taugustincst.mended', productId: 'full_unlock', purchaseToken: 'pending' } });
  check('a pending purchase is not acknowledged', r.code === 422);
  r = await call({ body: { packageName: 'com.taugustincst.mended', productId: 'full_unlock', purchaseToken: 'old' } });
  check('an acknowledged purchase answers already_acknowledged', r.code === 200 && r.body.status === 'already_acknowledged');
  const m = ep.parseAllowedProducts({ ALLOWED_PRODUCTS: 'a.b:x|y, c.d:z' });
  check('ALLOWED_PRODUCTS is read as package:product|product', JSON.stringify([...m]) === JSON.stringify([['a.b', ['x', 'y']], ['c.d', ['z']]]));
  const legacy = ep.parseAllowedProducts({ EXPECTED_PACKAGE_NAME: 'com.taugustincst.elderon', EXPECTED_PRODUCT_ID: 'full_unlock' });
  check('the older single-app settings still work', JSON.stringify([...legacy]) === JSON.stringify([['com.taugustincst.elderon', ['full_unlock']]]));
  console.log(failures ? `${failures} FAILED` : 'ALL PASSED'); process.exit(failures ? 1 : 0);
})();
