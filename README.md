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

## Installation

### Option A — ZIP upload (recommended)

1. Download the latest release ZIP from the [Releases](../../releases) page.
2. In Experience Builder, open your app and go to **Widgets → Custom**.
3. Click **+ Add custom widget** and upload the ZIP.
4. Drag the widget onto your page.

### Option B — Developer environment

1. Clone this repository into your Experience Builder `client/your-extensions/widgets/` directory:

```bash
cd /path/to/experience-builder/client/your-extensions/widgets/
git clone https://github.com/<your-username>/exb-custom-map-scale.git
```

2. Restart the Experience Builder dev server — the widget appears automatically.

---

## Configuration

Open the widget settings panel in Experience Builder:

| Setting | Description |
|--------|-------------|
| **Map Instance** | Link the widget to a map widget on the page |
| **Apostrophe** | Toggle Swiss-style thousands separator (`1:25'000` vs `1:25000`) |
| **Font size** | Dropdown text size in px (10–24 px) |
| **Predefined scales** | Check/uncheck standard CH scales; add custom values |

### Default scales

```
1:500  1:1'000  1:2'000  1:5'000  1:10'000
1:25'000  1:50'000  1:100'000  1:200'000
1:500'000  1:1'000'000
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

## Development

The widget is written in **TypeScript / React (TSX)** using the **Esri Jimu framework** (ArcGIS Experience Builder SDK 1.17).

All styling uses **Calcite Design System CSS variables** exclusively — no hardcoded colours or fonts — so the widget automatically adapts to light/dark themes.

### Key implementation notes

- `view.watch('scale', ...)` reacts to every zoom/pan — no polling.
- `view.goTo({ scale }, { animate: true })` for smooth zoom transitions.
- `view.scale` in WKID 2056 (metres) is used directly — no unit conversion needed.
- The "Custom scale…" option opens an inline input field; `Escape` cancels, `Enter` confirms.

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
