# Third-Party Assets

## Wargaming

Files stored under:

```text
public/assets/wargaming/
```

are Wargaming-owned artwork used by these unofficial World of Warships fan applications.

These files are **not licensed under this repository's MIT license**. World of Warships, related trademarks, and Wargaming-owned artwork remain the property of Wargaming.

This project is unofficial and is not affiliated with, endorsed by, or supported by Wargaming.

The static artwork in this directory is maintained manually. It is not refreshed by the nightly Wargaming API data job.

### Nation Flags

Nation flag icons are stored using the normalized nation ID:

```text
public/assets/wargaming/nations/<nation-id>.png
```

and are published by GitHub Pages at:

```text
https://heykrystal.github.io/wows-shared-data/assets/wargaming/nations/<nation-id>.png
```

The normalized `ships.json` dataset references these shared URLs so consuming applications do not need their own copies or asset-path logic.

For the terms governing Wargaming fan content, see Wargaming's Player Content Policy:

https://legal.wargaming.net/en/user-documents/content-policies/player-content-policy/view