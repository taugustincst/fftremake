# Publishing on Google Play

The steps that only a person with the developer account can take, in order.
Everything the console asks for that can be prepared ahead of time is in
`store/` and `store/LISTING.md`; this file is the path through the console.

Chronicles of Elderon is sold on Google Play as a **paid app at $8.99**, with
every chapter of the main campaign included. The one thing sold inside the
game is **The Hollow Sky**, the expansion campaign, as the in-app product
`hollow_sky` at $5.99. Nothing is free to play: the website is only the
game's store page.

`play/` is the only app in this directory. It is a full-screen WebView under
the listing's package name, `com.taugustincst.elderon`, with the whole game
packed inside the APK and served by AndroidX WebViewAssetLoader. It asks for
no permissions, not even internet (the manifest removes it), and plays fully
offline. Play Billing Library 8 sells The Hollow Sky through a small bridge,
`ElderonPlay.java`, that `js/billing.js` calls, and acknowledges each
purchase on the device, so no server is involved.

## 0. What Play requires, and where this project meets it

| Requirement | Where |
|---|---|
| The package name the listing was created under, `com.taugustincst.elderon`, on every upload; Play never lets it change | `play/build.gradle`: `applicationId` |
| Target Android 16 (API 36) for new apps and updates, since 31 Aug 2026 | `play/build.gradle`: `targetSdk 36`, `compileSdk 36` |
| Upload as an Android App Bundle, not an APK | `./gradlew :play:bundleRelease`, or the Release workflow's artifact (step 3) |
| An app that loads: every class the manifest names is in the bundle, and the game is in its assets | `tools/check-apk.js`, run on every CI and release build (section 9) |
| Signed with an upload key, enrolled in Play App Signing | `keystore.properties`, step 2 |
| Purchases acknowledged within three days, or Play refunds them | `ElderonPlay.java`, on the device, on every purchase and every launch |
| A privacy policy URL | `PRIVACY.md` / `privacy.html` at the repository root |
| Data safety declaration | no data collected: `store/LISTING.md` |
| Content rating questionnaire | answers in `store/LISTING.md` |
| Store listing graphics | `store/` |
| 16 KB page-size support on Android 15+ | no native code, nothing to do |
| Edge-to-edge on Android 15+ | `MainActivity` draws behind the bars and hands the cutout to the page |
| Predictive back | `enableOnBackInvokedCallback` in the manifest; the page decides what back means |

## 1. A developer account

https://play.google.com/console — a one-time registration fee, identity
verification, and for a personal account created after November 2023 a
closed-testing requirement before production: at least 12 testers opted in
for 14 continuous days. Plan for that fortnight.

## 2. An upload key

Generate one keystore, once, and keep it somewhere that survives losing the
laptop. Play App Signing holds the real app-signing key; this is only the
key you sign uploads with, and Play can reset it if it is lost, but that is a
support request, not a click.

```bash
keytool -genkeypair -v -keystore ~/elderon-upload.jks -alias upload \
        -keyalg RSA -keysize 2048 -validity 10000
```

Then create `android/keystore.properties` (ignored by git, never commit it):

```properties
storeFile=/home/you/elderon-upload.jks
storePassword=...
keyAlias=upload
keyPassword=...
```

`play/build.gradle` reads this file when it exists and signs release builds
with it. Without it, release builds are signed with the debug key so they
still install on your own device, but Play will refuse them.

**If the listing already exists, the upload key is whichever key signed its
first upload.** Play ties the listing to that key and refuses anything
else. If that first bundle came out of another tool, the key is in what
that tool gave you: PWABuilder, for one, puts `signing.keystore` next to a
`signing-key-info.txt` with the alias and both passwords in its download.
Use that keystore here; do not generate a second one. A lost upload key is
reset from the console (Setup → App signing → Request upload key reset),
which takes a support round-trip of a few days.

**Elderon's listing already has its upload key.** It was generated on
21 October 2026 during the first Play build, with the alias **`android`**
(not `upload`), RSA 2048, SHA-256
`47:61:6B:E9:F9:98:BE:D1:F1:C6:08:06:45:36:F3:9A:CE:FD:47:85:21:53:D1:85:C3:30:23:1B:E7:2F:04:16`,
the same fingerprint `assetlinks.json` already lists. Use that keystore,
and write `keyAlias=android` in `keystore.properties` and in the
`ANDROID_UPLOAD_KEY_ALIAS` secret. Before relying on it, confirm in the
console (Setup → App signing → "Upload key certificate") that Play shows
the same SHA-256. It was created with a temporary password: change both
passwords first (`keytool -storepasswd` and `keytool -keypasswd` with
`-alias android`), record the new one in a password manager, and only then
remove the temporary one from wherever it was written down.

## 3. Build the bundle

Needs the Android SDK with platform 36 and a JDK 17 or newer (Android
Studio brings both). From this directory:

```bash
./gradlew :play:bundleRelease -PversionCode=30000 -PversionName=3.0.0
# play/build/outputs/bundle/release/play-release.aab
```

Every upload must carry a `versionCode` higher than the last one Play has
seen; pass the next number on the command line rather than editing the
build file. `versionName` is the text players see. The release workflow
derives the code from the version so it climbs with it: 3.0.0 is 30000,
above every code an earlier Elderon bundle used. If the console shows a
higher code from an earlier upload, go above it.

**Or let GitHub build it.** `.github/workflows/release.yml` (Release (Play
bundle)) builds the signed bundle when you run it from the Actions tab with
a version. It needs the upload key in the repository's Settings → Secrets
and variables → Actions, as four secrets:

| Secret | Value |
|---|---|
| `ANDROID_UPLOAD_KEYSTORE` | the keystore file, base64: `base64 -w0 ~/elderon-upload.jks` |
| `ANDROID_UPLOAD_STORE_PASSWORD` | its password |
| `ANDROID_UPLOAD_KEY_ALIAS` | the key alias: `android` for Elderon's existing key, `upload` for one generated as above |
| `ANDROID_UPLOAD_KEY_PASSWORD` | the key's password |

Without them the workflow stops before building, because a debug-signed
bundle is nothing Play would take. With them it builds, runs the check in
section 9, removes the key from the runner and keeps the `.aab` as a
workflow artifact for 14 days: download it from the run's summary page and
upload it in the console. It publishes nothing: no GitHub Release, no
APK, nothing anyone could download for free.

To try the build on a phone before uploading it, build an APK the same
way: `./gradlew :play:assembleRelease` and install
`play/build/outputs/apk/release/play-release.apk` with `adb install`. The
store answers only in a copy Play installed (internal testing or later),
so a sideloaded build shows The Hollow Sky as unavailable; everything else
plays.

**This build is verified, not just written.** CI's `android` job builds the
debug APK and the release bundle on every push, checks the APK the way a
phone does at launch (section 9), and opens it on an emulator, failing
unless the game's page loads with no script errors (`tools/launch-test.sh`).

## 4. Create the app in the console

**Paid or free is chosen once.** Play lets a paid app become free, but never
a free app become paid
(https://support.google.com/googleplay/android-developer/answer/6334373).
Elderon's listing was created before this change and has never been
published, so check Monetize → App pricing (or Store presence → Pricing)
first: if it still offers **Paid**, set it to $8.99. If it is locked to
Free, the listing cannot be sold, and the way out is a new listing under a
new package name; tell the developer of this repository before uploading
anything, because the package name is in `play/build.gradle` and in the
asset loader's paths.

For a new listing: Play Console → Create app → name `Chronicles of
Elderon`, Game, **Paid**, default language English. Then:

1. **Price**: $8.99, and let Play convert it for other countries (or set
   them yourself). Selling a paid app needs a payments profile, which the
   console asks for.
2. **In-app product**: Monetize → In-app products → Create, product ID
   `hollow_sky` (exactly that; the app asks for it by name), name "The
   Hollow Sky", price $5.99, then Activate. Until it is active the game
   shows the expansion as unavailable rather than open. There is no
   `full_unlock` product any more; if one exists from earlier work,
   deactivate it.
3. **License testing**: add testers under Settings → License testing so
   the closed test can buy The Hollow Sky without being charged. Paid apps
   are free to install for testers on the testing tracks.
4. **Set up your app** (the checklist under the Dashboard): every item's
   answer is in `store/LISTING.md`: privacy policy URL, app access, ads,
   content rating, target audience, news, data safety, government,
   financial features, health. Category: Game → Strategy.
5. **Store listing**: paste the name, short and full descriptions from
   `store/LISTING.md`; upload `store/icon-512.png`, the feature graphic and
   the phone screenshots (two minimum, all seven is better). Tablet
   screenshots are optional; the two in `store/` fit both tablet slots.
6. **Play App Signing**: accept it when the first release asks; upload the
   bundle from step 3.

## 5. Testing, then production

1. **Internal testing**: upload the bundle, add your own account as a
   tester, install from the link Play gives you. Confirm: launches
   fullscreen, sound plays after the first tap, back steps through menus
   and out of the app only from the title screen, a saved game survives
   closing and reopening, rotating mid-battle keeps the battle, and The
   Hollow Sky shows Play's price and can be bought (with a license tester
   the purchase is free). Close the app and reopen it with the phone
   offline: the expansion stays open.
2. **Closed testing**: the 12-tester, 14-day track for a personal account.
   Recruit testers, wait, then apply for production access from the
   Dashboard.
3. **Production**: promote the same bundle. Review takes from hours to a
   few days for a first release. The pre-launch report runs the app on a
   rack of real devices; a crash there is worth reading before publishing.

## 6. Updating

Change the game, run `node tools/make-store.js` if a screenshot went stale,
then run the Release workflow with the next version and upload the `.aab`
to the production track with the release notes from `store/LISTING.md`.

## 7. Releases outside Play

There are none. Earlier versions of this repository published a free
sideloadable APK, desktop builds, the single-file web build and an itch.io
upload on every release; the release workflow no longer does any of that,
and the website no longer serves the game. Releases made before this
change are still on the repository's Releases page with those files
attached; whether to delete them, and what to do with the itch.io page, is
the owner's call.

## 8. The website

`https://taugustincst.github.io/fftremake/` is now the store page
(`site/index.html`), published with the privacy policy and the store
graphics by `.github/workflows/pages.yml`; the workflow fails if the game's
scripts ever end up on the site. Its `sw.js` clears the offline copy of the
game that earlier versions of the site installed. The app no longer opens
the website, so digital asset links are not needed for it; the entry in
`https://taugustincst.github.io/.well-known/assetlinks.json` is harmless
and can stay or go.

## 9. If Play says the app installs but does not load

Play once removed the app under the Broken Functionality policy with this
from its own test devices:

    java.lang.ClassNotFoundException: Didn't find class
    "com.taugustincst.elderon.Application" on path: DexPathList

That is a bundle whose manifest names an `Application` class that is not
in its dex, so the process dies before the launcher activity is created,
on every device, every time. The bundle was a Trusted Web Activity made by
a generator outside this project: Bubblewrap and PWABuilder write
`android:name="Application"` into the manifest and an `Application.java`
beside the activity, and that class did not make it into the build. The
`play/` module replaces that generated project, with no `Application`
class to go missing, and every build of it is checked. The way back onto Play:

1. **Build the bundle from this project** (step 3, either way). It carries
   the listing's package name, `com.taugustincst.elderon`, so Play takes
   it as an update to the same app, and it is signed with the listing's
   upload key (step 2, the note on an existing listing).
2. **Check it before uploading.** CI and the release workflow run
   `node tools/check-apk.js` on every APK they build: every class the
   manifest names must be defined in the dex, the launcher activity among
   them, the package must be the listing's, and the game's files must be
   in the assets. A red Android job is a
   build that would not load; it never reaches a release. To run it on a
   bundle by hand, build the APK of the same build
   (`./gradlew :play:assembleRelease` with the same flags) and check that.
3. **Upload it as a new release** on the production track, with a
   `versionCode` above the removed one (the workflow's 30000 for 3.0.0 is
   above anything uploaded before; pass `version_code` if the console
   shows more), and submit it for review. The enforcement lifts
   when the update passes review; it is the fix Play's notice asks for,
   and no appeal is needed for that.
4. **Appeal only if the notice stays** after the update is approved, from
   the Policy status page's "Submit an appeal", saying the crash was a
   missing `Application` class in the previous bundle's dex, that the new
   version (name its versionCode) declares no such class and was verified
   to load, and asking for the listing to be reinstated. Appeals take five
   to eight days; the update is the faster path and is not blocked by one.

Players who sideloaded an `.apk` from an old GitHub Release have another
app, `com.elderon.tactics`; the Play edition installs beside it as a
separate app with its own saved games.
