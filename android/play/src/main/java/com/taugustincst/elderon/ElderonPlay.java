package com.taugustincst.elderon;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * The Play Billing bridge for The Hollow Sky, the one thing sold inside the
 * game. The page (js/billing.js) calls {@code ElderonPlay.query(id)} and
 * {@code ElderonPlay.buy(id)}; every answer comes back through
 * {@code window.__elderonPlayReply(json)} as
 * {"id", "op": "query"|"buy"|"update", "status", "owned", "pending", "price", "title"}.
 *
 * Play refunds a purchase nobody acknowledges within three days. The
 * acknowledgement is done here, on the device, as soon as Play reports a
 * completed purchase (on the purchase itself, and again on every query, so
 * a purchase whose acknowledgement failed is picked up on the next launch).
 * No server is involved.
 */
final class ElderonPlay implements PurchasesUpdatedListener {
    static final String PRODUCT = "hollow_sky";
    private static final String TAG = "ElderonPlay";

    private final Activity activity;
    private final WebView web;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final BillingClient client;
    private boolean connecting;
    private ProductDetails details;
    private String buyId;

    ElderonPlay(Activity activity, WebView web) {
        this.activity = activity;
        this.web = web;
        this.client = BillingClient.newBuilder(activity)
                .setListener(this)
                .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                .build();
    }

    // ---- from the page --------------------------------------------------------

    @JavascriptInterface
    public void query(final String id) {
        main.post(() -> whenConnected(() -> refresh(id, "query"), () -> reply(id, "query", "unavailable", false, false)));
    }

    @JavascriptInterface
    public void buy(final String id) {
        main.post(() -> whenConnected(() -> withDetails(() -> {
            if (details == null) { reply(id, "buy", "unavailable", false, false); return; }
            buyId = id;
            BillingFlowParams params = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(Collections.singletonList(
                            BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(details).build()))
                    .build();
            BillingResult r = client.launchBillingFlow(activity, params);
            if (r.getResponseCode() == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
                buyId = null;
                refresh(id, "buy");
            } else if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                buyId = null;
                reply(id, "buy", statusFor(r.getResponseCode()), false, false);
            }
            // OK: the answer arrives in onPurchasesUpdated.
        }), () -> reply(id, "buy", "unavailable", false, false)));
    }

    // ---- from the activity ----------------------------------------------------

    /** Back in the foreground: a payment may have cleared while away. */
    void onResume() {
        if (client.isReady()) refresh(null, "update");
    }

    void destroy() {
        main.removeCallbacksAndMessages(null);
        client.endConnection();
    }

    // ---- from Play ------------------------------------------------------------

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        main.post(() -> {
            String id = buyId;
            buyId = null;
            int code = result.getResponseCode();
            if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
                boolean owned = false, pending = false;
                for (Purchase p : purchases) {
                    if (!p.getProducts().contains(PRODUCT)) continue;
                    if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) { owned = true; acknowledge(p); }
                    else if (p.getPurchaseState() == Purchase.PurchaseState.PENDING) pending = true;
                }
                if (id != null) reply(id, "buy", owned ? "owned" : pending ? "pending" : "error", owned, pending);
                else reply(null, "update", "ok", owned, pending);
            } else if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
                refresh(id, id != null ? "buy" : "update");
            } else if (id != null) {
                reply(id, "buy", statusFor(code), false, false);
            }
        });
    }

    // ---- inside ---------------------------------------------------------------

    private final List<Runnable> onConnected = new ArrayList<>();
    private final List<Runnable> onFailed = new ArrayList<>();

    private void whenConnected(Runnable then, Runnable failed) {
        if (client.isReady()) { then.run(); return; }
        onConnected.add(then);
        onFailed.add(failed);
        if (connecting) return;
        connecting = true;
        client.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                main.post(() -> {
                    connecting = false;
                    boolean ok = result.getResponseCode() == BillingClient.BillingResponseCode.OK;
                    List<Runnable> run = new ArrayList<>(ok ? onConnected : onFailed);
                    onConnected.clear();
                    onFailed.clear();
                    for (Runnable r : run) r.run();
                });
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Play's service went away; the next call reconnects.
                main.post(() -> connecting = false);
            }
        });
    }

    private void withDetails(Runnable then) {
        if (details != null) { then.run(); return; }
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(Collections.singletonList(QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(PRODUCT)
                        .setProductType(BillingClient.ProductType.INAPP)
                        .build()))
                .build();
        client.queryProductDetailsAsync(params, (result, found) -> main.post(() -> {
            if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && found != null) {
                for (ProductDetails d : found.getProductDetailsList()) {
                    if (PRODUCT.equals(d.getProductId())) details = d;
                }
            }
            then.run();
        }));
    }

    /** Asks Play what the player owns, acknowledges anything not yet acknowledged, and answers. */
    private void refresh(final String id, final String op) {
        withDetails(() -> client.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
                (result, purchases) -> main.post(() -> {
                    if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        reply(id, op, "buy".equals(op) ? statusFor(result.getResponseCode()) : "unavailable", false, false);
                        return;
                    }
                    boolean owned = false, pending = false;
                    for (Purchase p : purchases) {
                        if (!p.getProducts().contains(PRODUCT)) continue;
                        if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) { owned = true; acknowledge(p); }
                        else if (p.getPurchaseState() == Purchase.PurchaseState.PENDING) pending = true;
                    }
                    String status = "buy".equals(op) ? (owned ? "owned" : pending ? "pending" : "error") : "ok";
                    reply(id, op, status, owned, pending);
                })));
    }

    private void acknowledge(Purchase p) {
        if (p.isAcknowledged()) return;
        client.acknowledgePurchase(
                AcknowledgePurchaseParams.newBuilder().setPurchaseToken(p.getPurchaseToken()).build(),
                r -> {
                    // A failure is retried on the next query (every launch and
                    // every return to the app), well inside Play's three days.
                    if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        Log.w(TAG, "acknowledge failed: " + r.getResponseCode());
                    }
                });
    }

    private static String statusFor(int code) {
        switch (code) {
            case BillingClient.BillingResponseCode.USER_CANCELED:
                return "cancelled";
            case BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE:
            case BillingClient.BillingResponseCode.SERVICE_DISCONNECTED:
            case BillingClient.BillingResponseCode.BILLING_UNAVAILABLE:
            case BillingClient.BillingResponseCode.NETWORK_ERROR:
                return "unavailable";
            default:
                return "error";
        }
    }

    private void reply(String id, String op, String status, boolean owned, boolean pending) {
        JSONObject o = new JSONObject();
        try {
            o.put("id", id == null ? JSONObject.NULL : id);
            o.put("op", op);
            o.put("status", status);
            o.put("owned", owned);
            o.put("pending", pending);
            ProductDetails.OneTimePurchaseOfferDetails offer = details == null ? null : details.getOneTimePurchaseOfferDetails();
            o.put("price", offer == null ? JSONObject.NULL : offer.getFormattedPrice());
            o.put("title", details == null ? JSONObject.NULL : details.getName());
        } catch (JSONException e) {
            return;
        }
        // JSONObject.quote makes the whole reply one safe JS string literal.
        String js = "window.__elderonPlayReply && window.__elderonPlayReply(" + JSONObject.quote(o.toString()) + ")";
        main.post(() -> web.evaluateJavascript(js, null));
    }
}
