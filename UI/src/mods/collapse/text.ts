import { useLocalization } from "cs2/l10n";

// Text the player sees comes from the game's translation system, so it can be
// translated later. The keys must match Localization/LocaleEN.cs.
const KEYS = {
    hide: ["TopLeftCollapse.UI[HideButtons]", "Hide mod buttons"],
    show: ["TopLeftCollapse.UI[ShowButtons]", "Show mod buttons"],
} as const;

export type TextKey = keyof typeof KEYS;

export function useText() {
    const { translate } = useLocalization();
    return (key: TextKey) => translate(KEYS[key][0], KEYS[key][1]) ?? KEYS[key][1];
}
