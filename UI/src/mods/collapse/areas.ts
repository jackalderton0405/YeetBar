import { AppendHookTargets } from "cs2/modding";
import { Axis, Placement } from "./row-slide";

// The corners Yeet Bar can tidy. Each is a row the game makes for mod buttons.
// Checked in the game's own UI code (Cities2_Data/Content/Game/UI/index.js), 2026-11-18.
//
// "gameClasses" are the starts of the style names of the game's own buttons that share
// the row. They are never hidden. If a game update renames them, the worst case is
// that a game button also slides away, so the names are matched by their start only
// (the code on the end changes between builds).
export type AreaId = "topLeft" | "topRight";

export interface Area {
    id: AreaId;
    /** The game's spot for mod buttons that the arrow is added to. */
    slot: AppendHookTargets;
    gameClasses: readonly string[];
    place: Placement;
    /** CSS order for our arrow and for the game's own buttons. */
    arrowOrder: string;
    gameOrder: string;
    /** Which way buttons slide, and where they sit compared with the arrow. */
    axis: Axis;
    /** Arrow angle while open (pointing at the buttons). 0 = right, 180 = left, 90 = down. */
    openAngle: number;
}

export const AREAS: readonly Area[] = [
    // The row by the game's "i" (Infoviews) button. The arrow goes right after "i".
    {
        id: "topLeft", slot: "GameTopLeft", gameClasses: ["infoview-menu-toggle"],
        place: "after", arrowOrder: "-10000", gameOrder: "-10001", axis: "x", openAngle: 0,
    },
    // The row by the game's lightbulb (advisor) and gear (pause menu) buttons. Mods come
    // first, then the game's own. The arrow goes right before the lightbulb.
    {
        id: "topRight", slot: "GameTopRight", gameClasses: ["pause-menu-toggle"],
        place: "before", arrowOrder: "10000", gameOrder: "10001", axis: "x", openAngle: 180,
    },
];

/**
 * With a controller, the game stacks the top-right buttons in a column instead of a
 * row (its style name then contains "vertical"), with the mod buttons below the arrow.
 */
export function layoutFor(area: Area, row: HTMLElement | null): { axis: Axis; openAngle: number } {
    const vertical = !!row && typeof row.className === "string" && row.className.indexOf("vertical") >= 0;
    if (area.id === "topRight" && vertical) return { axis: "y", openAngle: 90 };
    return { axis: area.axis, openAngle: area.openAngle };
}
