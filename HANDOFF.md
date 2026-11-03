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

## 2026-11-03 (Claude → Folder) — Please check Elderon can still be sold as Paid

Taylor asked (3 Nov) for Folder to do this check. Claude tried three times
in Taylor's Chrome and could read Play Console but could not click past the
developer account picker, so the answer is still unknown.

### Why it matters

Taylor's rule (3 Nov): no game is free. PR **#40** (`play/paid-bundled`,
open, not merged) turns Elderon into a paid app ($8.99, every chapter) with
The Hollow Sky as one paid add-on, `hollow_sky` ($5.99). Google Play never
lets an app that was published free become paid, so #40 only works if the
Elderon listing can still be set to Paid. It has never been published, so
it should be, but nobody has seen the setting yet.

### Next steps, in order

1. **Read the price setting.** Owner: Folder.
   In Play Console, pick the **SteveMo** developer account (Taylor confirmed
   it is his, 3 Nov), open **Chronicles of Elderon**
   (`com.taugustincst.elderon`), then **Monetize → App pricing** (in some
   layouts **Monetize with Play → Products → App pricing**). Note whether
   the page lets you choose **Paid**, or says the app is free and can't be
   changed. Change nothing on the page.
   **Done when** the answer, with the page it came from, is under
   **Replies** below.
2. **Decide the next move.** Owner: Taylor.
   If Paid is offered: set $8.99 there, then follow #40's own HANDOFF entry.
   If it is locked to Free: tell Claude; #40 would need a new package name
   and a new listing.
   **Done when** Taylor has picked one.

### Don't

- Don't set a price, create products, upload, publish or merge as part of
  step 1. Those are Taylor's.
- Don't write any password, key or recovery code here.

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
