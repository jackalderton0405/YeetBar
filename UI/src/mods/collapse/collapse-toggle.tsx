import React, { useEffect, useMemo, useRef, useState } from "react";
import { useValue } from "cs2/api";
import { Button, Tooltip } from "cs2/ui";
import { Area, layoutFor } from "./areas";
import { animate$, collapsed$, enabled$, setCollapsed, slideMs$ } from "./bindings";
import { RowSlider, safeSlideMs, setSlideMs } from "./row-slide";
import { useText } from "./text";
import styles from "./collapse-toggle.module.css";

// How often to look for buttons that were added or removed (mods that load late).
// Just counts a handful of buttons, so it costs next to nothing.
const WATCH_MS = 1000;

const Chevron = ({ angle, ms }: { angle: number; ms: number }) => (
    // Points at the buttons when open; swivels round when collapsed, as fast as the slide.
    <svg
        className={styles.chevron}
        style={{ transform: `rotate(${angle}deg)`, transitionDuration: `${ms}ms` }}
        viewBox="0 0 24 24"
        fill="none"
    >
        <path d="M9 5 L16 12 L9 19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// One arrow for one area. Only drawn while that area is switched on in Options;
// switching it off removes the arrow, and every button is put back.
const AreaArrow = ({ area }: { area: Area }) => {
    const ref = useRef<HTMLDivElement>(null);
    const collapsed = useValue(collapsed$[area.id]);
    const animate = useValue(animate$);
    const slideMs = safeSlideMs(useValue(slideMs$));
    setSlideMs(slideMs);
    const t = useText();
    const slider = useMemo(() => new RowSlider(area.gameClasses, area.axis), [area]);
    const [openAngle, setOpenAngle] = useState(area.openAngle);
    // An area with no mod buttons in it gets no arrow (nothing to tidy).
    const [hasButtons, setHasButtons] = useState(true);

    // The first time, put things straight into place without sliding.
    const firstRun = useRef(true);

    // Once: find our spot in the row, and keep an eye on which buttons are there.
    // Undo everything if the arrow is removed.
    useEffect(() => {
        const arrow = ref.current;
        if (!arrow) return;
        const row = arrow.parentElement;
        const layout = layoutFor(area, row);
        slider.axis = layout.axis;
        setOpenAngle(layout.openAngle);
        slider.place(arrow, area.place);
        const putGameButtonsBack = slider.orderGameButtons(arrow, area.gameOrder);
        const check = () => setHasButtons(slider.modButtons(arrow).length > 0);
        check();
        const watch = window.setInterval(check, WATCH_MS);
        return () => {
            window.clearInterval(watch);
            putGameButtonsBack();
            slider.restoreAll();
        };
    }, [slider]);

    // Collapse or open the row.
    useEffect(() => {
        const arrow = ref.current;
        if (!arrow) return;
        const slide = animate && !firstRun.current;
        firstRun.current = false;
        slider.place(arrow, area.place);

        if (!collapsed) {
            slider.expand(arrow, slide);
            return;
        }
        slider.collapse(arrow, slide);
        const watch = window.setInterval(() => {
            slider.place(arrow, area.place);
            slider.tidy(arrow);
        }, WATCH_MS);
        return () => window.clearInterval(watch);
    }, [collapsed, animate, slider]);

    return (
        <div
            ref={ref}
            className={`${styles.slot} ${hasButtons ? "" : styles.empty}`}
            style={{ order: area.arrowOrder }}
        >
            <Tooltip tooltip={t(collapsed ? "show" : "hide")}>
                <Button variant="floating" onSelect={() => setCollapsed(area.id, !collapsed)}>
                    <Chevron angle={collapsed ? openAngle + 180 : openAngle} ms={animate ? slideMs : 0} />
                </Button>
            </Tooltip>
        </div>
    );
};

/** What gets added to an area's slot: the arrow, if that area is switched on. */
export function arrowFor(area: Area) {
    const Toggle = () => (useValue(enabled$[area.id]) ? <AreaArrow area={area} /> : null);
    return Toggle;
}
