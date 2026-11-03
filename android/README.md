# Chronicles of Elderon — Android app

The Google Play edition, and the only way the game is published. The game
itself is the same code that runs in a browser during development:
`play/build.gradle` copies `index.html`, `privacy.html`, `css/`, `js/` and
`icons/` from the repository root into the APK's assets at build time, so the
app can never drift from the game in the repository.

It is sold as a paid app under the listing's package name,
`com.taugustincst.elderon`. The Hollow Sky, the expansion, is sold inside it
through Play Billing Library 8: `ElderonPlay.java` is a small bridge that
`js/billing.js` calls (`ElderonPlay.query(id)` and `ElderonPlay.buy(id)`,
answered through `window.__elderonPlayReply`), and it acknowledges every
completed purchase on the device, so there is no server.

## Building

The Android SDK is not reachable from every environment this project is
developed in, but CI builds the debug APK and the release bundle on every
push, on a runner that does have the SDK (see the `android` job in
`.github/workflows/ci.yml`), and opens the app on an emulator.

With Android Studio installed, or a command-line SDK with platform 36 and
build-tools, and a JDK 17 or newer:

```bash
cd android
./gradlew :play:assembleDebug    # play/build/outputs/apk/debug/play-debug.apk
./gradlew :play:installDebug     # build and install onto a connected device
./gradlew :play:bundleRelease    # play/build/outputs/bundle/release/play-release.aab, for Play
```

Release builds are signed with the upload key named in `keystore.properties`
when that file exists, and with the debug key otherwise so they still
install. [PLAY_STORE.md](PLAY_STORE.md) walks through the key, the bundle and
the console, step by step, and how to get the bundle built and signed on
GitHub's runners instead. A copy not installed by Play cannot buy anything,
so a sideloaded build shows The Hollow Sky as unavailable.

CI checks every APK with `node tools/check-apk.js` (every class the manifest
names is in the dex, the launcher activity among them, and the game's files
in the assets), because a build that compiles can still die at launch, and
one of this package once did on Play's test devices.

If Gradle cannot find the SDK, set its location:

```bash
echo "sdk.dir=$HOME/Android/Sdk" > local.properties
```

## How it works

`MainActivity` hosts a single `WebView` and serves the bundled files through
`WebViewAssetLoader`, which puts them on an `https://appassets.androidplatform.net`
origin. That detail matters: loading from `file://` gives the page an opaque
origin where saved games in `localStorage` are not durable.

- **No permissions at all.** The manifest removes `INTERNET`, which the
  billing library would otherwise add, so the app cannot reach the network
  even if something tried to. Play Billing still works: it talks to the Play
  Store app on the device, not to the network. That is also the whole of the
  Play data-safety declaration.
- **Immersive fullscreen**, re-applied whenever the window regains focus, and
  drawn edge to edge as Android 15 and later require. A WebView does not fill
  in the CSS safe-area insets by itself, so the activity hands the display
  cutout to the page as CSS variables the stylesheet falls back to.
- **Back button** calls the game's own `handleBack()`. It closes the help
  overlay, cancels a selection in battle, and walks the screens back to the
  title. Only when the game says it has nowhere left to go does the app close.
  Predictive back is enabled; the same callback drives it.
- **Rotation** is handled by the activity rather than by recreating it, so a
  battle in progress survives turning the phone.
- **Pause** stops the render loop and the music sequencer via `pauseTimers()`,
  and the page itself suspends its audio engine whenever it is hidden.
- **No service worker.** The files are already on the device, so `sw.js` is not
  bundled and the page skips registering it when it finds itself on the app's
  origin.
- **The screen is kept awake** while the app is in front.
- **Long presses** do nothing, rather than opening a text-selection toolbar.

## Icons

`node tools/make-icons.js` regenerates every icon in this project and in
`icons/` from the game's own sprite templates and palettes. It writes the
legacy square icons, the round variants, the adaptive-icon foreground layer
and the monochrome layer for themed icons, at all five densities. Run it after
changing the art.
