# Building ArcMotion

## Day-to-day development (unchanged)

Keep using **Expo Go** — nothing here changes that:

```bash
npx expo start -c
```

Scan the QR with Expo Go. This is how you develop and test.

## Making a real installable app (EAS Build)

EAS Build compiles the app **in Expo's cloud** into a real `.apk` / `.aab` / `.ipa`
(no Android Studio or Mac needed). This is the only way to see your own app icon /
splash on the home screen.

### One-time setup

1. Create a free Expo account at https://expo.dev (if you don't have one).
2. Install the CLI:
   ```bash
   npm install -g eas-cli
   ```
3. Log in:
   ```bash
   eas login
   ```
4. Link the project (creates the project on expo.dev and writes an
   `extra.eas.projectId` into app.json automatically):
   ```bash
   eas init
   ```

### Build an installable Android APK (recommended first build)

```bash
eas build --profile preview --platform android
```

- Runs in the cloud (~10–20 min). When done, EAS gives you a link + QR code to
  **download and install the `.apk`** directly on your phone — with your real icon.

### Other profiles (defined in `eas.json`)

| Profile | What it produces | Use it for |
|---|---|---|
| `preview` | Android `.apk` (internal) | Quick install on your own phone |
| `production` | Android `.aab` | Uploading to the Play Store |
| `development` | Dev client `.apk` | Advanced: like Expo Go but with custom native code (needs `expo-dev-client`) |

```bash
eas build --profile production --platform android   # Play Store bundle
eas build --profile preview   --platform ios        # iOS (needs Apple account)
```

### Submit to the stores (later)

```bash
eas submit --platform android   # uploads the .aab to Play Console
```

## Over-the-air updates (EAS Update) — push changes without rebuilding

Once you've installed a **preview build** on your phone (above), you no longer
need a rebuild or `npx expo start` for JS/asset changes. Push them straight to
the installed app:

```bash
eas update --branch preview --message "what changed"
```

The app pulls the new bundle **on its next cold start** (it's already wired to
check `https://u.expo.dev/<projectId>` — see `updates` in `app.json`). No
Metro server, no laptop, no store review.

### How it's wired

- `app.json` → `updates.url` points at this project's update server, and
  `runtimeVersion.policy: "appVersion"` ties each update to the app version
  (`1.0.0`). An update only lands on builds with the **same** runtime version.
- `eas.json` → each build profile has a `channel` (`development` / `preview` /
  `production`). `eas update --branch <name>` publishes to the branch that its
  channel maps to (by default the channel and branch share a name).

### The everyday loop

```bash
# 1. once: put a build on your phone
eas build --profile preview --platform android

# 2. thereafter: ship any JS/asset change instantly
eas update --branch preview --message "tweak calendar colors"
# → reopen the app to get it
```

### When a plain update is NOT enough → you must rebuild

OTA ships JavaScript + assets only. Rebuild (`eas build …`) when you:
- add/remove a **native module** or change native config (new `expo-*` package,
  permissions, app icon/splash),
- **bump the app version** (`expo.version`) — that changes the runtime version,
  so old installs stop receiving updates until they get the new build.

### Push OTA to a store build

Same command, `--branch production`. Users of the installed store app get the
JS change on next launch — as long as the native runtime version matches. (Note:
Apple/Google rules — OTA is for fixes/tweaks, not for shipping entirely new
functionality that bypasses review.)

## Versioning

`eas.json` uses `appVersionSource: "local"`, so the version comes from `app.json`:
- bump `expo.version` (e.g. `1.0.1`)
- bump `expo.android.versionCode` and `expo.ios.buildNumber` for each store upload.
- **Heads-up:** with `runtimeVersion.policy: "appVersion"`, bumping
  `expo.version` starts a fresh OTA lineage — you must ship a new build for that
  version before `eas update` reaches those users again.
