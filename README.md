# WoWS Shared Data

A small shared data layer for my World of Warships web tools.

The repository pulls selected data from the Wargaming Public API, normalizes it into stable JSON, and publishes the results through GitHub Pages. This keeps individual apps simple and avoids having each one make the same API requests independently.

> [!NOTE]
> This is primarily infrastructure for my own WoWS tools, but the published JSON endpoints are public and can be consumed directly.

## Quick Start

No API key is required to **read** the published normalized data.

### Collections

```text
https://heykrystal.github.io/wows-shared-data/v1/collections.json
```

Contains normalized collection information including collection size, duplicate exchange rate, and collection artwork.

### Ships

```text
https://heykrystal.github.io/wows-shared-data/v1/ships.json
```

Contains normalized ship information including:

- Name and description
- Tier and nation
- Ship type and class icons
- Premium / special status
- Ship artwork
- Ratings
- Common ship statistics
- Shared nation icon references

### Manifest

```text
https://heykrystal.github.io/wows-shared-data/v1/manifest.json
```

Provides metadata for the generated datasets, including record counts, update timestamps, and SHA-256 hashes.

## Why This Exists

Several of my projects use the same World of Warships data.

Instead of having every application independently call the Wargaming API, this repository acts as a shared normalization layer:

```text
Wargaming Public API
        │
        ▼
 wows-shared-data
        │
        ├── collections.json
        ├── ships.json
        └── shared static assets
        │
        ▼
  WoWS web applications
```

This gives the apps a smaller and more predictable data contract while reducing duplicate API traffic and update logic.

## Features

- [x] Normalized collection data
- [x] Normalized ship data
- [x] Shared static WoWS presentation assets
- [x] Versioned `/v1/` endpoints
- [x] Dataset validation before publishing
- [x] Change-aware JSON generation
- [x] Dataset manifest with hashes and timestamps
- [x] Automated nightly refresh
- [x] GitHub Pages hosting
- [x] Manual workflow execution when needed
- [ ] Makes you good at World of Warships

## Repository Structure

```text
.github/
└── workflows/          GitHub Actions for refreshes and Pages deployment

public/
├── assets/
│   └── wargaming/      Manually maintained Wargaming-owned artwork
└── v1/
    ├── collections.json
    ├── ships.json
    └── manifest.json

scripts/
└── update-data.js      Builds registered datasets

src/
├── assets/             Shared asset URL resolution
├── core/               API, normalization, and JSON utilities
├── datasets/           Individual dataset definitions
└── registry.js         Datasets included in the normal refresh

tests/                  Node test suite
```

## Automatic Updates

GitHub Actions refreshes the registered Wargaming datasets nightly.

The update process:

1. Runs the test suite.
2. Fetches current data from the Wargaming Public API.
3. Normalizes and validates each registered dataset.
4. Writes JSON only when meaningful data changed.
5. Updates the dataset manifest.
6. Commits changed generated data.
7. Publishes `public/` through GitHub Pages.

The refresh workflow can also be run manually from the repository's **Actions** tab.

> [!TIP]
> Static assets under `public/assets/` are intentionally maintained separately from the nightly data refresh. They are published through the same GitHub Pages site but are not reacquired automatically.

## Adding Another Dataset

Each generated dataset owns its own build and validation logic.

A dataset provides:

```text
id
outputPath
build()
validate()
count()
```

Add the dataset module under:

```text
src/datasets/
```

then register it in:

```text
src/registry.js
```

The normal update pipeline will handle generation, validation, change detection, manifest metadata, and publishing.

## Wargaming Assets

Some of the World of Warships artwork used by my applications is hosted from this repository under:

```text
public/assets/wargaming/
```

Those images, World of Warships, and related trademarks are the property of Wargaming. They are **not covered by this repository's MIT license**. The MIT license applies only to the original code and other material I own.

This is an unofficial fan project and is not affiliated with, endorsed by, or supported by Wargaming.

See [ASSETS.md](ASSETS.md) for additional asset provenance and usage information.

## Data Source

API-backed datasets are derived from the Wargaming Public API and normalized for use by these applications.

The generated JSON is intended to be a convenient application-facing representation of that data, not a replacement for Wargaming's official documentation or services.

## Issues

This repository primarily exists to support my own WoWS projects.

If there are obviously valid problems or issues with the calculations, feel free to open an issue and I will try my best to get to it. However, requests that border enhancements or conveniences will be a stretch for me. I just don't have a lot of time for that.

## Contributing

I'm not super familiar with GitHub's collaboration features. I'll try to be accomodating where it makes sense though. If you're wanting to make edits for your own personal use feel free to fork the project and do whatever you'd like to it. 😊

## License

Original code in this repository is available under the [MIT License](LICENSE).

Wargaming-owned artwork, trademarks, and other third-party assets are excluded from that license. See [ASSETS.md](ASSETS.md) for details.
