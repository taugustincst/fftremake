# Privacy Policy — Chronicles of Elderon

*Last updated: 2 November 2026*

Chronicles of Elderon is a single-player game. This policy exists because
Google Play asks every app to have one, and it is short because there is
almost nothing to say.

## What the game collects

The game has no accounts, no analytics, no advertising and no crash
reporting.

The Android app from the project's GitHub releases declares no permissions
at all, including the permission to use the internet, so it cannot send
anything anywhere.

The Google Play edition is different in one way. It opens the game's
website in Chrome, so the game's files are fetched from that site, and it
sells the full game and the expansion through Google Play. After a
purchase, the game sends the purchase's details from Google Play (the
app's package name, which item was bought and Google Play's purchase
token) over an encrypted connection to a small service of ours on Google
Cloud. That service asks Google Play to confirm and acknowledge the
purchase, which Google Play requires, and keeps nothing afterwards. Until that check succeeds, the
token waits in the game's own storage on your device. The
game never sees your card or Google account details; Google Play handles
the payment.

## What the game stores

Your saved games, up to three, and your settings: the sound and music
levels, the battle speed, the language, which page of the camp you were on,
and whether the first chapter's guide has been shown. They are kept in the
app's private storage on your own device, and only there. The Android app
opts out of Android's automatic backup entirely, so a saved game never
leaves the device this way either, including when the device itself is
backed up or replaced.

A save code is the one way a game leaves the device, and only by your hand:
Load Game → Export turns a slot into a block of text that you can copy,
share or save as a file yourself, and Import a save code reads one in. The
game never sends a code anywhere.

Uninstalling the app deletes the saved games. Inside the game, Delete in
Load Game deletes one slot.

## Children

The game does not knowingly collect any information from anyone, children
included. The purchase details above are the only thing that leaves the
device, and only when a purchase is made.

## Third parties

No third-party code runs inside the game. In the Google Play edition,
Google Play handles payments under Google's own privacy policy, the game's
website is served by GitHub Pages, and the purchase check runs on Google
Cloud.

## Changes

If any of the above ever changes, this document will change first, and the
date at the top with it.

## Contact

Questions about this policy can be raised on the project's issue tracker at
https://github.com/taugustincst/is/issues.
