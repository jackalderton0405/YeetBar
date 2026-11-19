# Stash Bar

*Nothing to see here.* A Cities: Skylines II mod (internal ID `TopLeftCollapse`, first published as Yeet Bar). It puts one
arrow at the start of the top-left row of mod buttons, right after the game's own "i" button.

- Click the arrow and the other mod buttons slide away behind it. Click again and they come back.
- **Top-right too (optional):** switch on "Tidy top-right buttons" in Options and that corner gets
  its own arrow, just left of the game's lightbulb. The game's lightbulb and gear never hide.
- **Alt + C** collapses every switched-on corner (or opens them all). You can change the key in Options.
- **Slide speed:** 0.25, 0.5 or 1 second (0.5 to start with), or switch the animation off.
- The game remembers whether the bar was open or closed.
- **Photo mode:** works like the base game. The bar stays showing, and the photo mode
  "Hide UI" (eye) button hides it along with everything else.
- The game's own buttons ("i", lightbulb, gear) are never hidden. Hidden mods keep working,
  and their shortcuts still open them.

## Safety

- **Save games:** never read or written. The mod has no game-world systems at all.
- **What it stores:** one small settings file, `ModsSettings/TopLeftCollapse/TopLeftCollapse.coc`
  in the game's user folder, holding which corners are switched on and collapsed, "slide animation?", the slide speed and the shortcut key.
- **Uninstalling:** unsubscribe and restart. Every button looks exactly as before, because the
  mod only changes how buttons look while the game is running and never saves those changes.
  The settings file can be deleted by hand but does no harm if left.
- **Other mods:** their buttons are only moved and faded on screen. Their own styling is saved
  first and put back exactly when the row opens. If our arrow is ever removed, everything is put back.
- **Game updates:** if the game changes a corner, the worst case is that the arrow hides nothing.
  The game's own buttons are found by the start of their style name, so a changed code on the
  end of the name doesn't break it.

## Folder layout

| Path | What it is |
| --- | --- |
| `Mod.cs` | Starts the mod: Options page, text, the UI system. |
| `Setting.cs` | The Options page (corners, slide switch and speed, shortcut), and each corner's open/closed state. |
| `Localization/LocaleEN.cs` | English text (Options page and arrow tooltip). |
| `Systems/CollapseUISystem.cs` | Talks to the screen side (collapsed, slide), saves changes, listens for the shortcut. |
| `UI/src/index.tsx` | Puts an arrow in each corner's row. |
| `UI/src/mods/collapse/areas.ts` | The two corners: which game buttons share each row, where the arrow goes, which way things slide. |
| `UI/src/mods/collapse/collapse-toggle.tsx` | The arrow button (one per corner). |
| `UI/src/mods/collapse/row-slide.ts` | The slide: tucking buttons in under the arrow and putting them back. |
| `UI/src/mods/collapse/bindings.ts` | Everything the screen side says to the game side. |
| `UI/src/mods/collapse/text.ts` | Tooltip text, through the game's translation system. |
| `UI/dist/TopLeftCollapse.mjs` | The built screen side. Rebuild after changing anything in `UI/src`. |
| `Properties/` | Publishing settings for Paradox Mods. |

## Building

1. If you changed anything in `UI/src`: in the `UI` folder run `npm install` (first time only), then `npm run build`.
2. Open `TopLeftCollapse.slnx` in Visual Studio and press Build Solution. It copies the mod
   and `UI/dist/TopLeftCollapse.mjs` into the game's Mods folder.

## Publishing

Paradox Mods ID: **168095** (already in `Properties/PublishConfiguration.xml`). For updates, raise
`ModVersion` there, add a ChangeLog entry, and publish with **PublishNewVersion**. Never use PublishNewMod again,
it would make a second store page. The logo is `Properties/Thumbnail.png` (keep store images under
about 1.2 MB; `Thumbnail.svg` is its editable source).
