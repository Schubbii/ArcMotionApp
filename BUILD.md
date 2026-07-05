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

## Versioning

`eas.json` uses `appVersionSource: "local"`, so the version comes from `app.json`:
- bump `expo.version` (e.g. `1.0.1`)
- bump `expo.android.versionCode` and `expo.ios.buildNumber` for each store upload.
