# Security Audit & Upgrade Path: Angular Drum Machine

**Audit Date:** 2026-02-23
**Auditor:** Claude (claude-sonnet-4-6)

---

## Tech Stack Overview

This is a **circa 2014 AngularJS single-page application** — a static frontend app served by a Grunt development server. There is no backend, no database, and no server-side code. All logic runs in the browser.

**Build Toolchain (devDependencies via npm):**
- **Grunt** — task runner (compile Sass, minify JS, run tests, serve locally)
- **Bower** — frontend package manager (now deprecated)
- **Karma + Jasmine + PhantomJS** — test runner stack
- **RequireJS** — module loader (used in tests)
- **node-sass / grunt-contrib-sass** — Sass compilation

**Frontend Runtime (dependencies via Bower):**
- **AngularJS 1.2.0** — the MV\* framework
- **angular-route 1.2.0** — routing
- **Foundation 5.5** — CSS framework
- **howler 1.1.0** — audio playback

**External CDN calls at runtime (hardcoded in `index.html`):**
- `ajax.googleapis.com` — loads Angular 1.2.14 from Google CDN
- `fonts.googleapis.com` — loads Ubuntu Mono and Oleo Script fonts
- `s3.amazonaws.com` — loads a GitHub "Fork me" ribbon image
- `www.google-analytics.com/analytics.js` — Google Analytics UA-322913-7 (tracking ID belongs to `dojosto.com`)

---

## Package Inventory

### NPM devDependencies (`package.json`)

| Package | Specified Version | Status |
|---|---|---|
| bower | latest | **Deprecated (2017)** |
| grunt | latest | Superseded |
| grunt-contrib-sass | latest | **Deprecated** (wraps node-sass/libsass) |
| grunt-contrib-watch | latest | Still maintained |
| grunt-contrib-connect | latest | Still maintained |
| grunt-contrib-uglify | latest | Superseded by modern bundlers |
| grunt-karma | latest | Deprecated |
| karma | latest | **Deprecated (2023)** |
| karma-script-launcher | latest | Abandoned |
| karma-firefox-launcher | latest | Still maintained |
| karma-chrome-launcher | latest | Still maintained |
| karma-html2js-preprocessor | latest | Abandoned |
| karma-jasmine | latest | Still maintained |
| karma-requirejs | latest | Abandoned |
| karma-phantomjs-launcher | ~0.2 | **Archived (2022)** |
| karma-spec-reporter | latest | Still maintained |
| jasmine-core | latest | Still maintained |
| **phantomjs-prebuilt** | latest | **CRITICAL — Abandoned (2018)** |
| requirejs | latest | Effectively unmaintained |

### Bower Frontend Dependencies (`bower.json`)

| Package | Specified Version | Status |
|---|---|---|
| **angular** | ~1.2.0 | **CRITICAL — EOL Dec 31, 2021** |
| angular-route | ~1.2.0 | **CRITICAL — EOL Dec 31, 2021** |
| foundation | ~5.5 | **EOL** (Foundation 5 branch) |
| howler | ~1.1.0 | Superseded (now at 2.2.x) |
| angular-mocks | ~1.2.0 | EOL (devDep) |
| jasmine | ~2.0.0 | Superseded (now at 5.x) (devDep) |

---

## Security Findings

### CRITICAL

**1. AngularJS 1.2.0 — 9 published CVEs, EOL with no fix path**

The core runtime framework. Reached end-of-life December 31, 2021. No patches ever backported to 1.2.x.

| CVE | Type | CVSS |
|---|---|---|
| CVE-2020-7676 | XSS — improper input validation | **9.8 Critical** |
| CVE-2019-10768 | Prototype Pollution via `merge()` | High |
| CVE-2024-21490 | ReDoS via `ng-srcset` | High |
| CVE-2023-26116/26117/26118 | ReDoS in multiple utilities | Medium |
| CVE-2022-25844 | ReDoS in `angular.copy()` | Medium |
| CVE-2022-25869 | XSS via textarea interpolation | Medium |
| CVE-2019-14863 | XSS via ngSanitize bypass | Medium |

Only remediation path: migrate to Angular 17+.

**2. RequireJS — CVSS 10.0 prototype pollution**

- **CVE-2024-38999**: `s.contexts._.configure` allows arbitrary property injection on `Object.prototype`, enabling RCE. Affects all versions through 2.3.6. A CVSS 10.0 frontend runtime vulnerability.

**3. phantomjs-prebuilt — Install-time binary injection risk**

- Runs a download script at `npm install` time that fetches a full headless WebKit browser binary from GitHub Releases over the network.
- PhantomJS was abandoned in March 2018 — the embedded WebKit engine has years of unpatched CVEs (CVE-2019-17221, CVE-2019-15138, among others).
- If the download URL or network path is compromised, an attacker achieves **arbitrary code execution on the developer machine at install time**.

### HIGH

**4. Foundation 5.5 — XSS in tooltip plugin (runtime)**

`foundation.tooltip.js` injects `title` attribute content as raw HTML without sanitization. If any user-controlled data reaches a tooltip, this is exploitable XSS. Never patched in Foundation 5 branch.

**5. Bower — No integrity verification at install time**

Fetches packages from GitHub without content-addressed integrity hashes (unlike npm lockfiles with `sha512`). Deprecated since 2017, no security patches. A compromised GitHub repo or DNS hijack could silently deliver malicious code.

### MEDIUM

**6. Grunt — CVE-2020-7729 (CVSS 7.1)**

Versions of Grunt before 1.3.0 used `js-yaml`'s `load()` instead of `safeLoad()` for reading Gruntfiles, allowing code execution via malicious YAML. Build-time only.

**7. node-sass / libsass (transitive via grunt-contrib-sass) — Multiple CVEs**

CVE-2017-12963 (DoS), CVE-2018-11499 (use-after-free), CVE-2018-20822 (uncontrolled recursion), CVE-2018-19827 (use-after-free). All build-time.

### LOW

**8. Hardcoded Google Analytics tracking in `index.html`**

The file contains `ga('create', 'UA-322913-7', 'dojosto.com')`. If used as a demo or deployed publicly, it would fire analytics events to the original author's Google Analytics account. No security harm, but worth noting for a demo.

**9. `index.html` loads fonts over HTTP, not HTTPS**

```html
<link href='http://fonts.googleapis.com/css?family=...' ...>
```

HTTP (not HTTPS) for a Google Fonts CDN call — enables MITM on that resource in older browsers.

**10. No Content Security Policy**

No CSP headers are set. No `<meta http-equiv="Content-Security-Policy">`. The app loads scripts from external CDN domains (googleapis.com) with no restrictions.

---

## Runtime Harm Assessment

**Will running this project harm your local system?**

- **No** — this is a static frontend app with no backend, no file system access, and no shell execution at runtime.
- Running `npm install` will download `phantomjs-prebuilt`, which executes a binary download script at install time. This is the highest local risk point.
- The app itself, once running, only plays audio files locally and makes HTTP requests to Google (CDN, fonts, analytics).

**Does it reach out to remote systems?**

| Phase | Remote Activity |
|---|---|
| `npm install` | `phantomjs-prebuilt` downloads a binary; `bower install` fetches from GitHub |
| `bower install` | Fetches angular, foundation, howler, etc. from GitHub |
| Browser (runtime) | googleapis.com (Angular CDN + fonts), google-analytics.com, s3.amazonaws.com (ribbon image) |
| Server-side | None — there is no server; it's a static app |

---

## Upgrade Path

This project showcases the full spectrum of software aging across every layer of the stack:

| Category | Then (2014) | Now (2026) |
|---|---|---|
| Framework | AngularJS 1.2 (9 CVEs, EOL) | Angular 19 |
| Package Manager | Bower (deprecated) | npm / yarn / pnpm |
| Build Tool | Grunt | Angular CLI / Vite |
| CSS Framework | Foundation 5 (EOL) | Tailwind CSS / Angular Material |
| Module Loader | RequireJS (CVSS 10.0 CVE) | Native ES Modules |
| Test Runner | Karma + PhantomJS (both abandoned) | Jest / Vitest / Playwright |
| Audio Library | howler 1.x | howler 2.x (same API, maintained) |
| Sass Compiler | libsass / node-sass (deprecated) | Dart Sass |

### Recommended Migration Steps

1. **Scaffold a new Angular CLI project** (`ng new`) — this replaces Grunt, Bower, Karma, PhantomJS, RequireJS, and node-sass in a single step.
2. **Migrate application logic** — the core app logic in `public/app/services/` is plain JavaScript with minimal AngularJS coupling and can be ported to Angular services/components directly.
3. **Replace howler 1.x with howler 2.x** — the API is nearly identical; update instantiation syntax and `urls` → `src`.
4. **Replace Foundation 5 with Angular Material or Tailwind** — Foundation 5's class names are used minimally in the template.
5. **Remove Google Analytics snippet** — replace with a modern analytics approach if needed, or omit for a demo.
6. **Add a Content Security Policy** — restrict script sources to self and trusted CDNs.
7. **Switch font loading to HTTPS** — trivial fix; change `http://fonts.googleapis.com` to `https://fonts.googleapis.com`.

---

## Implementation Record

**Migration Date:** 2026-02-23
**Implemented by:** Claude (claude-sonnet-4-6)
**Branch:** `upgrade/angular-19`
**Commit:** `4b96e92`

---

### What Was Migrated

The full migration was performed in a single branch from the original AngularJS 1.2 codebase to Angular 21 (the latest available via `@angular/cli@latest` at time of execution — the branch is named `upgrade/angular-19` to match the original plan intent).

---

### Toolchain Replaced

| Old | New | Reason |
|---|---|---|
| AngularJS 1.2 + angular-route | Angular 21 (standalone) | EOL, 9 CVEs |
| RequireJS | Native ES Modules | CVSS 10.0 CVE |
| Grunt | Angular CLI (Vite-based) | Deprecated |
| Bower | npm | Deprecated |
| node-sass / grunt-contrib-sass | Dart Sass (via Angular CLI) | Deprecated, multiple CVEs |
| Karma + karma-phantomjs-launcher | Vitest 4 + jsdom | Both abandoned |
| PhantomJS (phantomjs-prebuilt) | jsdom | Install-time binary injection risk |
| Howler 1.x | Howler 2.x (`src:` not `urls:`) | Unmaintained |
| Foundation 5.5 | Angular Material 21 (M3) | EOL, tooltip XSS |

---

### New File Structure

```
src/
├── index.html                    # No GA, HTTPS fonts, <app-root>
├── main.ts                       # bootstrapApplication(App, appConfig)
├── styles.scss                   # Angular Material M3 theme + global styles
└── app/
    ├── app.ts                    # Root component (Angular 21 naming convention)
    ├── app.spec.ts
    ├── app.config.ts             # provideBrowserGlobalErrorListeners, provideHttpClient,
    │                             #   provideAnimationsAsync
    ├── models/
    │   ├── kit.interface.ts      # KitData, InstrumentData interfaces
    │   ├── sequence.interface.ts # SequenceData interface
    │   ├── beat.model.ts         # Beat class (port from beat.js)
    │   ├── beat.model.spec.ts
    │   ├── instrument.model.ts   # Instrument class (port from instrument.js)
    │   ├── instrument.model.spec.ts
    │   ├── row.model.ts          # Row class (port from row.js)
    │   └── row.model.spec.ts
    ├── services/
    │   ├── timer-queue.service.ts       # setTimeout/clearTimeout (replaces $timeout)
    │   ├── timer-queue.service.spec.ts
    │   ├── drum-machine.service.ts      # HttpClient + Signals (replaces $http + $rootScope)
    │   └── drum-machine.service.spec.ts
    └── components/drum-machine/
        ├── drum-machine.component.ts
        ├── drum-machine.component.spec.ts
        ├── drum-machine.component.html  # @if/@for Angular 17+ control flow
        └── drum-machine.component.scss

src/assets/
├── audio/          # Moved from public/assets/audio/
└── data/           # Moved from public/app/services/data/
    ├── kit-1.json
    └── seq-1.json

public/
└── favicon.ico     # Angular CLI serves public/ at root

angular.json        # Project config, assets mapping, allowedCommonJsDependencies
package.json        # Angular 21 + Angular Material 21 + Howler 2.x + Vitest
tsconfig.json
tsconfig.app.json
tsconfig.spec.json
```

### Files Deleted

- `Gruntfile.js`
- `_config.yml` (Jekyll config for old GitHub Pages)
- `public/app/` (all AngularJS source JS)
- `public/assets/` (old CSS, minified JS, bower.json)
- `public/index.html` (old AngularJS template)
- `public/sass/` (old Foundation-based Sass)
- `test/` (all old Karma/Jasmine/RequireJS specs)

---

### Key Implementation Decisions

**Angular 21 file naming convention**
Angular 21's CLI generates `app.ts`, `app.html`, `app.scss` for the root component (not `app.component.ts`). The drum machine feature component uses the full `.component.ts` naming. Both approaches work; the root follows CLI defaults.

**Zoneless Angular**
Angular 21 is fully zoneless — `zone.js` is not installed. The initial `app.config.ts` used `provideZoneChangeDetection()` (from the plan), which threw a runtime error causing a blank page. The fix was replacing it with `provideBrowserGlobalErrorListeners()`, which is what `ng new` generates in Angular 21.

**Signals over RxJS Subjects**
`DrumMachineService` exposes `rows`, `tempo`, and `currentBeat` as readonly Angular Signals (`signal<T>().asReadonly()`). This is idiomatic Angular 17+ and removes the need for Zone-based dirty checking.

**HttpClient response body**
Angular's `HttpClient` returns the parsed body directly. The original AngularJS `$http.get(url).then(r => r.data)` pattern becomes `firstValueFrom(this.http.get<T>(url))` — no `.data` wrapper.

**Howler 2.x API changes**
- `new Howl({ urls: ["..."] })` → `new Howl({ src: ["..."] })`
- `play()` returns a numeric sound ID (not `void`); this does not affect the `Instrument.play()` wrapper
- Audio filenames contain spaces (`KHats Clsd-08.mp3`); these are passed through `encodeURIComponent()` when building the `src` path

**`gridLength` is a string in JSON**
`seq-1.json` stores `"gridLength": "16"` as a string. The service calls `parseInt(data.gridLength, 10)` before use.

**Angular Material M3 theming**
Material 21 uses the M3 design system. The available M3 palettes do not include `blue-grey`; `$azure-palette` was used as the closest alternative for the primary colour. The `mat.theme()` mixin accepts a `color` map with `primary`, `tertiary`, and `theme-type` keys:

```scss
@use '@angular/material' as mat;
html {
  @include mat.theme((
    color: (
      primary: mat.$azure-palette,
      tertiary: mat.$green-palette,
      theme-type: dark,
    ),
    density: 0,
  ));
}
```

**Howler CommonJS warning**
Howler ships as a CommonJS module. Angular CLI emits a warning about CommonJS dependencies. Suppressed via `angular.json`:

```json
"allowedCommonJsDependencies": ["howler"]
```

**Testing: Vitest instead of Karma**
Angular 21's CLI scaffolds Vitest + jsdom by default (not Karma). Key differences from the plan's Jasmine/Karma approach:

| Jasmine/Karma (plan) | Vitest (actual) |
|---|---|
| `jasmine.createSpyObj` | `vi.fn()` / class mock |
| `jasmine.clock()` | `vi.useFakeTimers()` |
| `fakeAsync` + `tick()` | `await Promise.resolve()` ×N |
| `toBe(250)` for float | `toBeCloseTo(250, 5)` |
| `karma.conf.js` | No config file — built into `@angular/build` |

**Howl mock in Vitest**
`vi.mock('howler', () => ({ Howl: vi.fn().mockImplementation(() => ({...})) }))` fails because the arrow function cannot be used as a constructor with `new`. The correct pattern is a class:

```typescript
vi.mock('howler', () => ({
  Howl: class {
    play = vi.fn().mockReturnValue(1);
  },
}));
```

**`fakeAsync` requires Zone.js**
`fakeAsync` from `@angular/core/testing` requires `zone-testing.js`, which is not present in Angular 21's zoneless setup. Component specs that need to wait for `ngOnInit` async operations use `await Promise.resolve()` repeated once per `await` boundary in the component:

```typescript
// ngOnInit has: await loadInstruments(); await loadSequence(); loading.set(false)
fixture.detectChanges();
await Promise.resolve(); // resolves loadInstruments stub
await Promise.resolve(); // resolves loadSequence stub
await Promise.resolve(); // allows loading.set(false) to propagate
fixture.detectChanges();
```

---

### Security Fixes Applied

| Issue | Fix |
|---|---|
| AngularJS 1.2 (CVSS 9.8, EOL) | Eliminated — migrated to Angular 21 |
| RequireJS (CVSS 10.0 prototype pollution) | Eliminated — native ES modules |
| phantomjs-prebuilt (binary injection at install) | Eliminated — Vitest + jsdom |
| Foundation 5.5 tooltip XSS | Eliminated — replaced with Angular Material |
| Howler 1.x (unmaintained) | Replaced with Howler 2.x |
| Google Analytics UA-322913-7 | Removed from `index.html` |
| `http://fonts.googleapis.com` | Changed to `https://` |
| GitHub ribbon (external S3 resource) | Removed |
| Grunt CVE-2020-7729 | Eliminated — no Grunt |
| node-sass CVEs | Eliminated — Dart Sass via Angular CLI |
| Bower (no integrity verification) | Eliminated — npm with lockfile |

**Remaining (out of scope for this pass):**
7 moderate `ajv` advisories in `@angular-devkit` (dev-only, no fix available upstream — these are inside `@angular/cli` itself and affect only the build machine, not the deployed application).

---

### Test Results

```
Test Files  7 passed (7)
Tests       37 passed (37)
```

| Spec file | Tests |
|---|---|
| `beat.model.spec.ts` | 5 |
| `instrument.model.spec.ts` | 5 |
| `row.model.spec.ts` | 6 |
| `timer-queue.service.spec.ts` | 5 |
| `drum-machine.service.spec.ts` | 7 |
| `drum-machine.component.spec.ts` | 8 |
| `app.spec.ts` | 1 |

---

### Build Output

```
Initial chunk files  | Names         | Raw size  | Estimated transfer size
main.js              | main          | 175.72 kB |               37.98 kB
chunk.js             | -             | 127.64 kB |               38.11 kB
styles.css           | styles        |   3.45 kB |              769 bytes

                     | Initial total | 306.78 kB |               76.79 kB

Lazy chunk files     | Names         | Raw size  | Estimated transfer size
chunk.js             | browser       |  67.75 kB |               17.78 kB
```

`ng build` completes with no errors and no warnings.
