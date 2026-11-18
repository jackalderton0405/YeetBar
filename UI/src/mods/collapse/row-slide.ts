// The slide itself: moving other mods' buttons in under one of our arrows and back out.
//
// Each tidied area is one row (or column) the game makes for mod buttons. Our arrow is
// one of those mod buttons, so the others are its siblings. The game's own buttons in
// the same row are recognised by the start of their style name and are never hidden.
//
// Collapsing slides every other mod button in under the arrow and fades it out, then
// takes it out of the row. Opening runs the same move backwards, so the buttons come
// out from under the arrow.
//
// Everything here only changes how buttons look on screen. Nothing is saved, and
// every change is undone when the row opens again, so other mods are left as they were.

// How long a slide takes, from Options > Yeet Bar > Slide speed (0.25, 0.5 or 1 second).
// Shared by every area. The arrows' swivel uses the same time (see collapse-toggle.tsx).
let slideMs = 500;
let transition = transitionFor(slideMs);

function transitionFor(ms: number) {
    const ease = `${ms}ms ease-in-out`;
    return `transform ${ease}, opacity ${ease}`;
}

/** Turns a slide time from the settings into one we use: 250, 500 or 1000 ms. */
export function safeSlideMs(ms: number): number {
    return ms === 250 || ms === 1000 ? ms : 500;
}

/** Sets how long the next slides take. */
export function setSlideMs(ms: number) {
    slideMs = safeSlideMs(ms);
    transition = transitionFor(slideMs);
}

/** Slides along the row ("x", left and right) or along a column ("y", up and down). */
export type Axis = "x" | "y";
/** Where the arrow sits: after the game's own buttons, before them, or at the end. */
export type Placement = "after" | "before" | "end";

// What each button's own inline style was before we changed it, to put back later.
type SavedStyle = Pick<CSSStyleDeclaration, "transform" | "opacity" | "pointerEvents" | "display" | "transition">;

const hasClassStarting = (el: Element, starts: readonly string[]) => {
    const names = typeof el.className === "string" ? el.className.split(" ") : [];
    return names.some((n) => starts.some((s) => n.indexOf(s) === 0));
};

// Waits two frames so the game has drawn the starting spot before a slide begins.
function afterTwoFrames(run: () => void) {
    window.requestAnimationFrame(() => window.requestAnimationFrame(run));
}

/** The slide for one area. One of these per arrow. */
export class RowSlider {
    private readonly saved = new Map<HTMLElement, SavedStyle>();
    // Where each button sits in the open row, measured when the row last collapsed.
    // Opening uses these instead of measuring again: a button that has only just been
    // put back in the row may not have its position worked out yet.
    private readonly openPos = new Map<HTMLElement, number>();
    private arrowPos = 0;
    private readonly timers = new Set<number>();
    // Goes up by one on every collapse or open, so a step left over from an earlier
    // click (waiting for the next frame) can tell it's out of date and do nothing.
    private generation = 0;

    /**
     * @param gameClasses the start of the style names of the game's own buttons in this row.
     * @param axis which way the buttons slide.
     */
    constructor(private readonly gameClasses: readonly string[], public axis: Axis) {}

    private isGameButton = (el: Element) => hasClassStarting(el, this.gameClasses);

    /** Every other mod's button in the row (not ours, not the game's own). */
    modButtons(arrow: HTMLElement): HTMLElement[] {
        const row = arrow.parentElement;
        if (!row) return [];
        return (Array.from(row.children) as HTMLElement[]).filter((c) => c !== arrow && !this.isGameButton(c));
    }

    /**
     * Gives the game's own buttons in this row an inline "order", so our arrow (whose
     * order is set where it's drawn) sits right next to them. Returns a function that
     * puts their order back.
     */
    orderGameButtons(arrow: HTMLElement, order: string): () => void {
        const row = arrow.parentElement;
        if (!row) return () => {};
        const game = (Array.from(row.children) as HTMLElement[]).filter(this.isGameButton);
        const before = game.map((el) => el.style.order);
        game.forEach((el) => { el.style.order = order; });
        return () => game.forEach((el, i) => { el.style.order = before[i]; });
    }

    /**
     * Moves our arrow to its spot in the row, whatever order the mods loaded in:
     * straight after the game's own buttons ("after"), straight before them ("before"),
     * or at the end of a row that has none ("end"). The game doesn't reliably honour
     * the CSS "order" value, so the arrow's place in the page itself is fixed up.
     * Only our own arrow is ever moved.
     */
    place(arrow: HTMLElement, where: Placement) {
        const row = arrow.parentElement;
        if (!row) return;
        const game = (Array.from(row.children) as HTMLElement[]).filter(this.isGameButton);
        if (where === "after" && game.length > 0) {
            const last = game[game.length - 1];
            if (last.nextElementSibling !== arrow) row.insertBefore(arrow, last.nextSibling);
        } else if (where === "before" && game.length > 0) {
            if (game[0].previousElementSibling !== arrow) row.insertBefore(arrow, game[0]);
        } else if (where === "end" || game.length === 0) {
            if (row.lastElementChild !== arrow) row.appendChild(arrow);
        }
    }

    // ── Small helpers ─────────────────────────────────────────────────────────

    private later(ms: number, run: () => void) {
        const t = window.setTimeout(() => { this.timers.delete(t); run(); }, ms);
        this.timers.add(t);
    }

    private clearTimers() {
        this.timers.forEach((t) => window.clearTimeout(t));
        this.timers.clear();
    }

    private pos(el: HTMLElement) {
        return this.axis === "x" ? el.offsetLeft : el.offsetTop;
    }

    private moveBy(d: number) {
        return this.axis === "x" ? `translateX(${d}px)` : `translateY(${d}px)`;
    }

    private remember(el: HTMLElement) {
        if (this.saved.has(el)) return; // keep the very first copy, even mid-slide
        const s = el.style;
        this.saved.set(el, {
            transform: s.transform, opacity: s.opacity, pointerEvents: s.pointerEvents,
            display: s.display, transition: s.transition,
        });
    }

    // Puts a button's own inline style back exactly as it was, and forgets it.
    private restore = (el: HTMLElement) => {
        const s = this.saved.get(el);
        if (s) {
            el.style.transform = s.transform;
            el.style.opacity = s.opacity;
            el.style.pointerEvents = s.pointerEvents;
            el.style.display = s.display;
            el.style.transition = s.transition;
        }
        this.saved.delete(el);
    };

    // Slides a button in under the arrow and fades it out. It leaves the row afterwards.
    private tuck(el: HTMLElement, from: number, animate: boolean) {
        this.remember(el);
        const s = el.style;
        s.pointerEvents = "none";
        s.transition = animate ? transition : "none";
        s.transform = this.moveBy(this.arrowPos - from);
        s.opacity = "0";
        if (!animate) s.display = "none";
    }

    // ── What the arrow asks for ───────────────────────────────────────────────

    /** Collapses the row: every other mod button slides in under the arrow. */
    collapse(arrow: HTMLElement, animate: boolean) {
        this.clearTimers();
        this.generation++;
        const buttons = this.modButtons(arrow);
        // Measure the open row. offsetLeft/offsetTop ignore slides in progress, so this
        // is right even if the row is still opening. A button that's already out of the
        // row (collapsed before) has no position, so it keeps the one measured last time.
        this.arrowPos = this.pos(arrow);
        for (const el of buttons) {
            if (el.style.display !== "none" || !this.openPos.has(el)) this.openPos.set(el, this.pos(el));
        }
        for (const el of Array.from(this.openPos.keys())) if (buttons.indexOf(el) < 0) this.openPos.delete(el);
        buttons.forEach((el) => this.tuck(el, this.openPos.get(el)!, animate));

        // Take tucked buttons out of the row. Otherwise the empty space where they were
        // would still catch clicks meant for the city.
        if (animate) {
            this.later(slideMs, () => buttons.forEach((el) => {
                if (this.saved.has(el)) el.style.display = "none";
            }));
        }
    }

    /** Opens the row again: every button slides back out from under the arrow. */
    expand(arrow: HTMLElement, animate: boolean) {
        this.clearTimers();
        const mine = ++this.generation;
        const buttons = this.modButtons(arrow);

        if (!animate) {
            buttons.forEach(this.restore);
            return;
        }

        // Put every button under the arrow, invisible, all at once.
        for (const el of buttons) {
            const at = this.openPos.get(el);
            const orig = this.saved.get(el);
            if (at === undefined || !orig) { this.restore(el); continue; } // arrived while collapsed: just show it
            const s = el.style;
            if (s.display === "none") {
                s.display = orig.display;
                s.transition = "none";
                s.transform = this.moveBy(this.arrowPos - at);
                s.opacity = "0";
            }
            // (A button still mid-slide just turns round from where it is.)
        }
        void arrow.offsetLeft; // makes the game take in the starting spots

        afterTwoFrames(() => {
            if (mine !== this.generation) return; // collapsed again in the meantime
            for (const el of buttons) {
                const orig = this.saved.get(el);
                if (!orig) continue;
                el.style.transition = transition;
                el.style.transform = orig.transform;
                el.style.opacity = orig.opacity;
            }
            this.later(slideMs + 50, () => buttons.forEach(this.restore));
        });
    }

    /**
     * While collapsed: hides buttons that turned up late (a mod that loaded late) and
     * forgets buttons that are gone. Called once a second.
     */
    tidy(arrow: HTMLElement) {
        const buttons = this.modButtons(arrow);
        const live = new Set(buttons);
        for (const el of Array.from(this.saved.keys())) if (!live.has(el)) this.restore(el);
        for (const el of buttons) if (!this.saved.has(el)) this.tuck(el, this.pos(el), false);
    }

    /** Puts every button back instantly. Used when the arrow is removed or switched off. */
    restoreAll() {
        this.clearTimers();
        this.generation++;
        Array.from(this.saved.keys()).forEach(this.restore);
        this.openPos.clear();
    }
}
