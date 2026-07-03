# ArcMotion — UX Walkthrough Report

**Method:** Every major user path was driven end-to-end in a phone-sized (390×844)
Chromium instance against the Expo web build, using Playwright. 32 screenshots
were captured across onboarding, workout logging, the library, history,
progress, settings/themes, routine building, and exercise creation. Web behaves
close enough to native for flow/UX evaluation; platform-specific caveats are
marked.

**Paths covered:**
onboarding → home → empty workout → exercise picker (search/filter/create) →
set logging (steppers, warm-up toggle, ✓, add set) → finish → library
(filter/save/start program) → leave a running workout → history → progress →
exercise detail (metric switching) → settings (name, all 10 themes, units,
increments) → new routine (multi-select picker) → custom exercise creation.

---

## Fixed immediately (shipped with this report)

| # | Finding | Fix |
|---|---------|-----|
| 1 | **Filter chips clipped in half** in the exercise picker, Library, and exercise-detail metric row — the horizontal chip rows rendered ~50% cut off (same class of bug reported earlier on device). | Chip ScrollViews now have an explicit height with vertically centered content. |
| 2 | **Multi-select picker confirms via "Cancel"** — when building a routine, the only way to keep your selection and go back is a button labeled *Cancel*, which reads like "discard". | Labeled **Done** (bold) in multi-select mode; stays *Cancel* in single-pick mode. |
| 3 | **"1 sets"** grammar on Home ("Last Workout") and History cards. | Pluralized. |
| 4 | *(Enabler, earlier this session)* `Alert.alert` is a silent no-op on web, so Finish/Delete/Guards did nothing in a browser. | Cross-platform `showDialog` (native Alert / web confirm). |

---

## Findings & recommendations (not yet implemented)

### High impact

**F1. No sign of a running workout outside the Workout tab.**
Start a program from the Library, tap back — you land on the Library with zero
indication a workout is still running (the "Workout in progress" banner lives
only on the Workout home). Users *will* forget sessions and be surprised hours
later by the replace-dialog.
→ *Recommendation:* a slim persistent "resume bar" above the tab bar on every
tab while a session is active (title + live timer + tap to resume), like
Spotify's mini-player.

**F2. No feedback after finishing a workout.**
After Finish you're silently dropped on Home; the summary ("Last Workout") is
below three routine cards, off-screen. The moment of accomplishment — the
emotional payoff of a tracker — is skipped.
→ *Recommendation:* a completion screen or dialog: duration, volume, sets, any
new PRs ("🏆 New record: Bench 105 kg"), then return Home. Even a simple toast
would help.

**F3. Warm-up/delete gestures are invisible.**
Tapping the set number toggles warm-up; long-press deletes. Nothing on screen
suggests the number is tappable (it looks like a static label), and the only
hint is one faint tip line + a buried Settings card. First-time users will
never discover this. The tap target is also small (~30 px).
→ *Recommendation:* make the set-number cell look interactive (subtle chip
background), and/or move set actions into a small menu (tap row → "Warm-up /
Delete"), and/or use swipe-to-delete, which is the category convention.

**F4. Marking the only set as warm-up silently zeroes the stats.**
The header's Sets/Volume drop to 0 (warm-ups don't count — correct!), but
nothing explains it, and Finish then refuses with "Nothing logged" — confusing
chain if you toggled by accident (see F3).
→ *Recommendation:* show warm-up sets distinctly (e.g. dimmed row + "W" badge
styling already exists — add a one-time hint the first time a user creates one).

### Medium impact

**F5. Three identical lime CTAs compete on Home.**
"Start Empty Workout" + every routine's "Start Routine" are all full-width
primary buttons. Nothing establishes hierarchy; the screen shouts.
→ *Recommendation:* keep one primary CTA ("Start Empty Workout"), demote
routine buttons to compact/ghost style, or make the whole routine card tappable
with a small play affordance.

**F6. Silent disabled states.**
- Onboarding: "Get Started" with an empty name does nothing (button is at 50%
  opacity but still looks tappable).
- New Routine: "Save" is grey and inert with no hint *why* (needs name +
  ≥1 exercise).
→ *Recommendation:* on tap-while-invalid, shake the field / show helper text
("Add a name and at least one exercise").

**F7. Single-data-point Progress chart renders a misleading wedge.**
With one workout, "Weekly Volume" draws a flat line with a triangular area fill
and 5 gridline labels — looks broken.
→ *Recommendation:* below 2 data points show a friendly placeholder ("Log
another workout to see your trend") instead of the chart.

**F8. Library "Beginner" duplication.**
Beginner programs show the goal tag `BEGINNER` *and* a `Beginner` level badge
side by side.
→ *Recommendation:* hide the level badge when it equals the goal, or replace
the goal tag with the active filter context.

**F9. Discard is one confirm away from losing a whole session, while its
tap target sits directly under "Add Exercise".** Not wrong, but risky placement.
→ *Recommendation:* move "Discard Workout" behind the header (e.g. an
overflow/… menu) or add more spacing.

### Low impact / polish

**F10. Workout title editing is undiscoverable** — the header title is an
invisible TextInput; nothing indicates it's editable. Add a subtle pencil icon.

**F11. Exercise picker "Create" flow naming** — header "Create" opens the form
(good), but next to "Add Exercise" it can read as "confirm adding". Consider a
"+ New" label.

**F12. Web-only: tab-bar indicator ghost.** After navigating tabs → detail
screen → back, a stale indicator-colored patch can linger on the first tab
while the ring sits on the active tab (seen in web screenshots; not reproduced
on device). Likely an Animated/remount timing issue in `BottomNav` on
react-native-web. Worth re-checking on Android; if it appears there, re-snap
`indicatorX` whenever layouts remount (`measured.current` reset).

**F13. Empty-state guidance is good** (History/Progress explain where data
comes from) — keep it. The logging tip line however is very low-contrast
(`textFaint`) on dark themes; consider `textMuted`.

---

## What already works well

- Onboarding is one field, one tap — excellent.
- The set table (prefill from last session, steppers + direct input, live
  Time/Volume/Sets) matches category leaders.
- Create-exercise form is complete and prefills from the search query;
  bodyweight equipment auto-sets the type.
- Guard dialogs prevent accidental session overwrites and deletions everywhere.
- Theme switching is instant, previews are honest, and all 10 themes keep text
  readable (spot-checked Volt, Matcha, Blue Lock in screenshots).
- Navigation pill + press animations give real premium feel at 60 fps.

## Suggested priority order

1. F1 resume bar (prevents real data-loss confusion)
2. F2 finish summary (retention payoff)
3. F3/F4 set-gesture discoverability
4. F6 silent disabled states
5. F5 home CTA hierarchy
6. F7 chart placeholder
7. Rest as polish backlog
