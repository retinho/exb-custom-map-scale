# exb-custom-map-scale

A custom widget for **ArcGIS Experience Builder** (ArcGIS Enterprise 11.x) that displays the current map scale and lets users switch to any predefined or manually entered scale — directly from a compact dropdown.

Designed for **WKID 2056 (Swiss LV95 coordinates)**, but works with any projected coordinate system.

---

## Features

- **Live scale display** — always shows the current map scale (e.g. `1:25'000`)
- **Predefined scale dropdown** — click to zoom immediately
- **Custom scale input** — choose "Custom scale…" at the bottom of the dropdown to type any value
- **Swiss apostrophe formatting** — `1:25'000` (toggleable)
- **Configurable font size** — fits any widget size
- **Multilingual** — English, German, French

---

## Screenshot

```
┌──────────────────────────┐
│  1:25'000              ▼ │  ← Dropdown shows current scale
└──────────────────────────┘

When "Custom scale…" is selected:
┌──────────────────────────┐
│  Eigener Massstab…     ▼ │
│  1: [________] [↵] [✕]  │
└──────────────────────────┘
```

---

## Compatibility

| ArcGIS Experience Builder | ArcGIS Enterprise |
|--------------------------|-------------------|
| 1.17 (SDK 1.17.0)        | 11.x              |

---

## Deployment

This widget is written in TypeScript/TSX and must be **compiled** before it can be used in ArcGIS Enterprise. The following steps describe the complete process from source code to a running widget.

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (LTS recommended)
- [ArcGIS Experience Builder Developer Edition 1.17](https://developers.arcgis.com/experience-builder/guide/install-guide/) downloaded and installed locally
- A web server reachable from your ArcGIS Enterprise environment (IIS, Apache, nginx, or similar), accessible via **HTTPS**
- Administrator access to ArcGIS Enterprise

---

### Step 1 — Place the widget in the Developer Edition

1. Locate your Experience Builder Developer Edition installation folder.
2. Navigate to:
   ```
   client/your-extensions/widgets/
   ```
3. Copy the `exb-custom-map-scale` folder (the contents of this repository) into that directory:
   ```
   client/your-extensions/widgets/exb-custom-map-scale/
   ```
   The structure inside must look exactly like this:
   ```
   client/your-extensions/widgets/exb-custom-map-scale/
   ├── manifest.json
   ├── config.json
   ├── icon.svg
   └── src/
       ├── config.ts
       ├── runtime/
       │   ├── widget.tsx
       │   └── translations/
       └── setting/
           └── setting.tsx
   ```

---

### Step 2 — Install dependencies and compile

Open a terminal in the **root folder** of the Experience Builder Developer Edition (where `package.json` is located) and run:

```bash
npm install
```

Then compile the entire project including the custom widget:

```bash
npm run build
```

> This process can take several minutes. The TypeScript/TSX source files are compiled to JavaScript and placed in the `client/dist/` output folder.

After the build, verify that the compiled widget exists at:
```
client/dist/widgets/your-extensions/exb-custom-map-scale/
```
It should contain a `dist/` subfolder with `runtime/widget.js`, `setting/setting.js` and the translation files.

---

### Step 3 — Host the compiled widget on a web server

The compiled widget folder must be publicly accessible via HTTPS from your ArcGIS Enterprise environment.

1. Copy the compiled widget folder to your web server:
   ```
   client/dist/widgets/your-extensions/exb-custom-map-scale/
   ```
   Example target path on the web server:
   ```
   /var/www/html/exb-widgets/exb-custom-map-scale/
   ```

2. Make sure the folder is accessible via a URL, for example:
   ```
   https://your-webserver.example.com/exb-widgets/exb-custom-map-scale/
   ```

3. Verify that the `manifest.json` is reachable in a browser:
   ```
   https://your-webserver.example.com/exb-widgets/exb-custom-map-scale/manifest.json
   ```
   You should see the JSON content of the manifest file.

> **HTTPS is required.** ArcGIS Enterprise will refuse to load widgets served over plain HTTP.

> **CORS:** Make sure your web server sends the appropriate CORS headers so that ArcGIS Enterprise can load the widget files cross-origin. For nginx, add `add_header Access-Control-Allow-Origin "*";` to the location block; for IIS, configure the CORS headers in `web.config`.

---

### Step 4 — Register the widget in ArcGIS Enterprise

1. Sign in to your **ArcGIS Enterprise portal** as an administrator.
2. Go to **Content → New element → Application → Experience Builder Widget**.
3. Enter the full HTTPS URL to the widget's `manifest.json`:
   ```
   https://your-webserver.example.com/exb-widgets/exb-custom-map-scale/manifest.json
   ```
4. Click **Save**.

ArcGIS Enterprise will fetch and validate the manifest. Once registered, the widget is available to all Experience Builder users in your organisation.

---

### Step 5 — Use the widget in Experience Builder

1. Open ArcGIS Experience Builder and create or edit an application.
2. In the widget panel, scroll to the **Custom** section — the widget **exb-custom-map-scale** appears there.
3. Drag the widget onto your page.
4. Open the widget settings panel:
   - **Map Instance** — select the map widget to connect to
   - **Apostrophe** — toggle Swiss-style formatting (`1:25'000`)
   - **Font size** — adjust dropdown text size (10–24 px)
   - **Predefined scales** — check/uncheck standard scales or add custom values
5. Save and publish the application.

---

## Configuration reference

| Setting | Default | Description |
|---------|---------|-------------|
| **Map Instance** | — | The map widget this scale widget reads from and controls |
| **Apostrophe** | On | Swiss thousands separator: `1:25'000` vs `1:25000` |
| **Font size** | 14 px | Text size of the dropdown (10–24 px) |
| **Predefined scales** | see below | Which scales appear in the dropdown |

### Default predefined scales

```
1:500  ·  1:1'000  ·  1:2'000  ·  1:5'000  ·  1:10'000
1:25'000  ·  1:50'000  ·  1:100'000  ·  1:200'000
1:500'000  ·  1:1'000'000
```

---

## File structure

```
exb-custom-map-scale/
├── manifest.json                          # Widget metadata (EXB required)
├── config.json                            # Default configuration values
├── icon.svg                               # Widget icon
├── LICENSE                                # Apache 2.0
├── README.md
└── src/
    ├── config.ts                          # TypeScript config interface
    ├── runtime/
    │   ├── widget.tsx                     # Main widget component
    │   └── translations/
    │       ├── default.ts                 # English (fallback)
    │       ├── de.js                      # German
    │       └── fr.js                      # French
    └── setting/
        └── setting.tsx                    # Admin settings panel
```

---

## Technical notes

The widget is written in **TypeScript / React (TSX)** using the **Esri Jimu framework** (ArcGIS Experience Builder SDK 1.17). All styling uses **Calcite Design System CSS variables** exclusively — no hardcoded colours or font sizes — so the widget automatically adapts to light/dark themes and the portal's brand colours.

- `view.watch('scale', ...)` reacts to every zoom/pan — no polling required.
- `view.goTo({ scale }, { animate: true })` provides smooth zoom transitions.
- `view.scale` in WKID 2056 (metres) is used directly — no unit conversion needed.
- Choosing "Custom scale…" opens an inline input field; `Enter` confirms, `Escape` cancels.

---

## Contributing

Pull requests are welcome. Please open an issue first for larger changes.

---

## Author

**Reto Jau**  
[github.com/retojau](https://github.com/retojau) *(update with your actual username)*

---

## License

[Apache License 2.0](LICENSE) © 2025 Reto Jau
