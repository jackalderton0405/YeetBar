import { ModRegistrar } from "cs2/modding";
import { AREAS } from "mods/collapse/areas";
import { arrowFor } from "mods/collapse/collapse-toggle";

const register: ModRegistrar = (moduleRegistry) => {
    // One arrow per corner (top-left and top-right). Each shows only when switched on
    // in Options > Stash Bar. Nothing else on screen is touched.
    for (const area of AREAS) moduleRegistry.append(area.slot, arrowFor(area));
};

export default register;
