# HANDOFF.md — Chronicles of Elderon (fftremake)

Coordination file between Taylor, Folder (Muse) and Claude. Newest entry
first. Reply under an entry's **Replies** heading, or add a new entry above
it. Keep entries short: what is true now, what is next, who does it.

Rules for every entry:

- One ordered list of next steps, each with an **owner** (Taylor, Folder or
  Claude) and a **done when** line that says how to tell it is finished.
- Facts carry where they came from (a commit, a PR, a mail, a console page).
- Never write a password, key file, token or recovery code in this file or
  anywhere in the repo.
- If a step is blocked, say what it waits on and who can unblock it.

---

## 2026-11-04 (Claude → Folder) — Question for Folder: can Elderon be set to Paid?

**Folder, please answer this under Replies below.** Taylor asked for you to
do it (3 and 4 Nov). Claude couldn't do it because Taylor's Chrome wouldn't
take clicks.

1. Open Play Console and choose the **SteveMo** developer account. Taylor
   confirmed it is his.
2. Open **Chronicles of Elderon** (`com.taugustincst.elderon`).
3. Go to **Monetize → App pricing**. Some layouts call it **Monetize with
   Play → Products → App pricing**.
4. Report which one you see:
   - **Paid is offered**: you can choose a price.
   - **Locked to Free**: the page says the app is free and can't be
     changed.

Add the page title or the exact wording you saw. **Change nothing.** Don't
set a price, create products, upload or publish; those are Taylor's.

Why: Elderon is now a paid app ($8.99) on main (#40). Google Play never lets
an app that was published free become paid. If Elderon is locked to Free, it
needs a new package name and listing. This question replaces step 1 of the
two 3 Nov entries below.

Also since 3 Nov: #38 and #39 were closed on Taylor's word (4 Nov).

### Replies

---

## 2026-11-03 evening (Claude → Folder, Taylor) — Every game is now a paid Play app; what's left

Taylor's rules (3 Nov): no game is free, on Play or on the web, and The
Hollow Sky stays a separate paid add-on. Taylor said "merge all unmerged
changes" at 22:49, so the game and website pull requests below were merged
that evening. Nothing has been uploaded to Play Console yet.

### Where it stands

**Merged 3 Nov** (CI green on each before merge):

| Game | Repo, PR | Play package | Price |
|---|---|---|---|
| Chronicles of Elderon | fftremake #40 | `com.taugustincst.elderon` | $8.99, plus `hollow_sky` $5.99 |
| Ironhold | ironhold #3 (app 1.1.0), #4 (site) | `com.taugustincst.ironhold` | $2.99 |
| Bubble Pop | bubblepop #4 (Android 7 to 10 crash fix), #5 (site) | `com.taugustincst.bubblepop` | $1.99 |
| Open Stall | project-shell-01 #1 | `com.taugustincst.openstall` | $4.99 |
| The Night Apothecary | project-shell-02 #1 | `com.taugustincst.apothecary` | $3.99 |
| Mended | project-shell-03 #1 | `com.taugustincst.mended` | $4.99 |
| Keep the Light | project-shell-04 #1 | `com.taugustincst.keepthelight` | $4.99 |
| Lost Property Office | project-shell-05 #1 | `com.taugustincst.lostproperty` | $2.99 |
| The 9:15 to Blackpool | project-shell-06 #1 | `com.taugustincst.blackpool` | $3.99 |
| Night Shift: Laundromat | project-shell-07 #1 | `com.taugustincst.nightshift` | $4.99 |
| Cartographer's Apprentice | project-shell-08 #1 | `com.taugustincst.cartographer` | $2.99 |

Also merged: taugustincst.github.io #2 (Ironhold upload key in
`assetlinks.json`) and #3 (home page says the games are paid Google Play
apps).

- Every app now carries its whole game inside the APK (a WebView that loads
  bundled files) and asks for no internet permission. No demo, no free
  chapters, no unlock purchase. Elderon is the one exception with an
  in-app product: The Hollow Sky, bought through Play Billing and
  acknowledged on the phone, so no server is needed.
- Every website now deploys a store page and privacy policy only; the
  playable web copies are gone. All Pages deploys finished green on 3 Nov.
  The store pages' Google Play buttons lead nowhere until each app is live.
- Each repo has a `PLAY.md` (Elderon: `android/PLAY_STORE.md`) with the
  Console checklist, data safety answers and listing text.
- Release bundles are not built yet. In each repo, the **Release** workflow
  builds the signed `.aab` once the upload key secrets are set (see the
  2026-11-02 entry below for Elderon's key).
- `ack-endpoint/` and the Cloud Run service `elderon-acknowledge` are no
  longer used by any game.
- Main's emulator launch test failed once on Keep the Light and Lost
  Property Office right after the merge, then passed on re-run. The cause is
  `tools/launch-test.sh` waiting a fixed 15 seconds on a cold emulator; it
  should poll for the READY line instead. Not fixed yet.

**Still open in fftremake:**

- **#38** (ja-JP locale fix, notes on the 2.0.2 bundle): the locale fix is
  still right, but the 2.0.2 notes are out of date now that 3.0.0 is the
  paid build.
- **#39** (purchase service for every game): no game uses that service any
  more. Close it.
- Dependabot PRs (#5, #23, #31, #32, #33): action and Android tooling
  bumps. #31 and #33 are major Android Gradle and Gradle upgrades that need
  a build check before merging.

### Next steps, in order

1. **Read Elderon's price setting.** Owner: Folder (Taylor asked, 3 Nov).
   Claude tried three times in Taylor's Chrome, but the browser wouldn't
   take clicks. In Play Console pick the **SteveMo** developer account
   (Taylor confirmed it is his), open **Chronicles of Elderon**, then
   **Monetize → App pricing** (or **Monetize with Play → Products → App
   pricing**). Note whether you can choose **Paid** or the app is locked to
   free. Change nothing.
   **Done when** the answer and the page it came from are under **Replies**.
2. **If Elderon is locked to free**, tell Claude. Owner: Taylor. A paid
   Elderon would need a new package name and a new listing.
   **Done when** decided.
3. **Create each paid listing.** Owner: Taylor (Folder can help draft).
   For every game in the table, follow that repo's `PLAY.md`: set the
   price, the content rating, data safety ("no data collected"), store
   text and graphics. For Elderon also create `hollow_sky` at $5.99 and
   deactivate `full_unlock` if it exists.
   **Done when** each listing shows its price and has no missing sections.
4. **Set the upload key secrets and run Release** in each repo, then
   upload the `.aab` to internal testing. Owner: Taylor.
   Elderon: version 3.0.0 (versionCode 30000).
   **Done when** a tester's install opens each game offline.
5. **Close fftremake #39; decide #38.** Owner: Taylor.
   **Done when** neither is open.
6. **Old free builds.** Owner: Taylor. GitHub Releases in fftremake
   (v1.9 to v2.0.2) and in `is` (v1.5 to v1.14.1) still offer free APK, HTML
   and desktop builds, and the itch.io page may too. The repos are public,
   so the source is free to read as well.
   **Done when** Taylor has decided what to delete or make private.
7. **Make the launch test wait for READY.** Owner: Claude, on Taylor's go.
   **Done when** `tools/launch-test.sh` polls in every game repo.

### Don't

- Don't upload, publish, set prices or merge as part of step 1. Those are
  Taylor's.
- Don't write any password, key or recovery code here.

### Replies

---

## 2026-11-03 (Claude → Taylor) — Elderon is paid, and the game leaves the web

Taylor's rule (3 Nov): no game is free, on Play or on the web, and The
Hollow Sky stays a separate add-on. This branch (`play/paid-bundled`) makes
that true for Elderon.

### What changed

- The Play app (`android/play`, `com.taugustincst.elderon`) is no longer a
  Trusted Web Activity. It bundles the whole game, asks for no permissions
  (no internet), and is sold as a paid app ($8.99) with every chapter.
- The Hollow Sky is the one in-app product, `hollow_sky` ($5.99), sold
  through Play Billing Library 8 via `ElderonPlay.java` and acknowledged on
  the device. The `full_unlock` product, the free demo chapters, the
  Digital Goods code and the acknowledgement server are gone; `ack-endpoint/`
  is no longer used.
- The website becomes the store page (`site/`), with a service worker that
  clears the game players installed from it earlier. The release workflow
  no longer publishes an APK, HTML, desktop or itch build; it only builds
  the signed `.aab` as a workflow artifact.

### Next steps, in order

1. **Taylor**: in Play Console, check the Elderon listing can still be set
   to Paid (it has never been published, so it should). **Done when** the
   price shows $8.99. If it is locked to Free, stop and say so: the listing
   would need a new package name.
2. **Taylor**: create and activate the in-app product `hollow_sky` at
   $5.99; deactivate `full_unlock` if it exists. **Done when** both show
   that state under Monetize → In-app products.
3. **Taylor**: merge this PR, run Release (Play bundle) with version 3.0.0,
   upload the `.aab` to internal testing. **Done when** a tester's install
   opens the game and shows The Hollow Sky at Play's price.
4. **Taylor**: decide whether to delete the old GitHub Releases (v1.9 to
   v2.0.2 carry free builds) and what to do with the itch.io page. **Done
   when** decided.

### Don't

- Don't merge before step 1 is checked: merging takes the free web copy
  down at once, and the store page's Play button only works once the app is
  live.

### Replies

---

## 2026-11-02 (Claude → Taylor, Folder) — Getting Elderon back onto Google Play

### Where it stands

- Play rejected **version code 2** on 1 Nov under Broken Functionality: the
  app crashed at launch with `ClassNotFoundException` for
  `com.taugustincst.elderon.Application` (Play Console mail, 1 Nov).
- **#34** (merged 1 Nov, tag `v2.0.1`) replaced the generated wrapper with
  the `android/play/` Trusted Web Activity module and a static launch check
  (`tools/check-apk.js`).
- **#36** (draft, not merged) fixes a second launch crash that #34 still
  had: `ManageDataLauncherActivity` was not declared in the manifest, found
  by opening the build on an Android 14 emulator. It also adds an emulator
  launch test to CI. **Do not upload 2.0.1; it would be rejected again.**
- **#35** (merged 2 Nov) set the upload key alias in `android/PLAY_STORE.md`
  to `android`, and brought the data safety answer (`store/LISTING.md`) and
  the privacy policy (`PRIVACY.md`, `privacy.html`) in line with the Play
  edition, which sends purchase tokens to the acknowledgement endpoint.
- The **upload key** is the keystore Folder generated on 21 Oct (alias
  `android`, SHA-256 ending `…2F:04:16`, the same one `assetlinks.json`
  lists). Its backup is in Taylor's Drive. It still has its **temporary
  password**, and that password is written in the README beside it.
- The **Google Cloud billing account** for project `elderon-ack` is past due
  (Cloud mails, 30 Oct). The purchase-acknowledgement service
  (`elderon-acknowledge`, Cloud Run) runs there. If it is suspended, Play
  refunds every sale after 3 days.
- The **developer account** ("SteveMo") is part-way through a change from
  personal to organization: it waits on linking the verified payments
  profile (Play Console mail, 28 Oct). While it stays personal, production
  may need a closed test first (12 testers for 14 days).

### Next steps, in order

1. **Merge #36.** Owner: Taylor (mark it ready, merge it).
   Done when #36 is merged and CI's "Play edition launch test" is green on `main`.
2. **Pay the overdue Cloud bill** for the `elderon-ack` billing account.
   Owner: Taylor (Cloud Console → Billing).
   Done when the console shows no past-due balance and the project is not
   flagged for suspension.
3. **Finish or cancel the account-type change.** Owner: Taylor (Play Console →
   Developer account → About you → link the verified payments profile).
   Done when the console shows the account type you want. That decides
   whether step 9's closed test is required.
4. **Secure the upload key.** Owner: Taylor, on his own machine.
   - In Play Console → Setup → App signing, check that the **upload key
     certificate** SHA-256 ends `…2F:04:16`. If it doesn't, stop and tell
     Claude or Folder before building anything.
   - Change both passwords (`keytool -storepasswd` and
     `keytool -keypasswd`, both with `-alias android`) and save the new one in
     a password manager.
   - **Only after that,** delete the temporary password from the Drive
     README. Deleting it first locks you out of the key.
   Done when the new password is in the password manager and the README no
   longer holds one.
5. **Give the Release workflow the key.** Owner: Taylor (repo Settings →
   Secrets and variables → Actions). Add `ANDROID_UPLOAD_KEYSTORE` (the
   keystore, base64), `ANDROID_UPLOAD_STORE_PASSWORD`,
   `ANDROID_UPLOAD_KEY_ALIAS` = `android`, `ANDROID_UPLOAD_KEY_PASSWORD`.
   Done when all four secrets are listed.
6. **Build 2.0.2.** Owner: Taylor, or Folder on Taylor's go. Run the
   **Release** workflow from the Actions tab with version `2.0.2` and leave
   `version_code` empty, which gives versionCode `20002`.
   Done when the `v2.0.2` release has `chronicles-of-elderon-2.0.2-play.aab`
   attached. If the `.aab` is missing, the secrets were not picked up.
7. **Set up the store items.** Owner: Taylor (Play Console → Monetize →
   In-app products). Create and activate `full_unlock` ($8.99) and
   `hollow_sky` ($5.99). Add license testers under Settings → License
   testing.
   Done when both products show Active.
8. **Answer App content.** Owner: Taylor (Play Console → Policy → App
   content). Use `store/LISTING.md`; data safety now declares Purchase history
   (collected, not shared, processed ephemerally, app functionality).
   Done when every App content item shows complete.
9. **Test, then release.** Owner: Taylor.
   - Upload the 2.0.2 `.aab` to **Internal testing**. Install it and check
     it opens fullscreen with no URL bar, and the unlock shows Play's price.
   - If the account is still personal, run the **closed test** (12 testers,
     14 days), then apply for production.
   - Promote to **Production** and send it for review from Publishing
     overview.
   Done when Play shows 2.0.2 as published.
10. **Appeal only if needed.** If the policy notice is still there after
    2.0.2 is approved, appeal from Policy status and name versionCode 20002.

### Folder's items

- Update the status line in `ack-endpoint/README.md`: it still says
  "nothing deployed", but commit `faf9944` says the service went live on
  29 Oct.
- After step 2, confirm the acknowledgement service answers. Report here.

### Don't

- Don't upload 2.0.1, or any build made before #36.
- Don't generate a new upload key; Play only accepts the one it already has.
- Don't build the Play bundle from the `is` repo from now on. Its version
  codes (1.14.1 = 11401) are lower than 20002, so Play would refuse them.
- Don't commit `keystore.properties`, the keystore or any password.

### Replies

_None yet._
