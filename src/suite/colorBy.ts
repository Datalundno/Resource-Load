"use strict";

import powerbi from "powerbi-visuals-api";

import { ColorBy } from "../data/types";

export function parseColorBy(raw: unknown): ColorBy {
    if (raw === "task" || raw === "concurrency" || raw === "single") {
        return raw;
    }
    return "single";
}

/**
 * Read Color by from formatting settings, falling back to legacy `general.colorMode`
 * so existing reports do not reset when the property was renamed to `colorBy`.
 */
export function resolveColorByFromDataView(
    dataView: powerbi.DataView | undefined,
    formattedValue: unknown
): ColorBy {
    const fromFormat = parseColorBy(formattedValue);
    if (!dataView?.metadata?.objects) {
        return fromFormat;
    }

    const general = dataView.metadata.objects["general"];
    if (!general) {
        return fromFormat;
    }

    const current = readObjectEnumValue(general["colorBy"]);
    if (current != null) {
        return parseColorBy(current);
    }

    const legacy = readObjectEnumValue(general["colorMode"]);
    if (legacy != null) {
        return parseColorBy(legacy);
    }

    return fromFormat;
}

function readObjectEnumValue(prop: unknown): unknown {
    if (prop == null) {
        return null;
    }
    if (typeof prop === "object" && prop !== null && "value" in prop) {
        return (prop as { value: unknown }).value;
    }
    return prop;
}
