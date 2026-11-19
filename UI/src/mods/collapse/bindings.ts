import { bindValue, trigger } from "cs2/api";
import { AreaId } from "./areas";

// Everything the screen side says to the game side, in one place.
// GROUP and the names must match Systems/CollapseUISystem.cs.
const GROUP = "topLeftCollapse";

// Is each corner collapsed? Saved by the game side, so it's the same next time.
// (The top-left one keeps its first name, "collapsed", so old settings still work.)
export const collapsed$ = {
    topLeft: bindValue<boolean>(GROUP, "collapsed", false),
    topRight: bindValue<boolean>(GROUP, "collapsedTopRight", false),
};

// Options > Stash Bar: which corners get an arrow at all.
export const enabled$ = {
    topLeft: bindValue<boolean>(GROUP, "tidyTopLeft", true),
    topRight: bindValue<boolean>(GROUP, "tidyTopRight", false),
};

// Options > Stash Bar > Slide animation.
export const animate$ = bindValue<boolean>(GROUP, "animate", true);
// Options > Stash Bar > Slide speed, in milliseconds (250, 500 or 1000).
export const slideMs$ = bindValue<number>(GROUP, "slideMs", 500);

export const setCollapsed = (area: AreaId, value: boolean) => trigger(GROUP, "setAreaCollapsed", area, value);
