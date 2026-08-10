"use strict";

/**
 * Suite-wide density presets.
 * Keep in sync with Website ECOSYSTEM.md §3 / Gantt — same names/numbers.
 */

export type DensityPreset = "compact" | "comfortable" | "large" | "custom";

export interface DensitySizes {
    barHeight: number;
    rowGap: number;
    fontSize: number;
    labelWidth: number;
    cornerRadius: number;
}

export const DENSITY_PRESETS: Record<Exclude<DensityPreset, "custom">, DensitySizes> = {
    compact: {
        barHeight: 16,
        rowGap: 8,
        fontSize: 10,
        labelWidth: 140,
        cornerRadius: 2
    },
    comfortable: {
        barHeight: 28,
        rowGap: 12,
        fontSize: 12,
        labelWidth: 200,
        cornerRadius: 4
    },
    large: {
        barHeight: 36,
        rowGap: 16,
        fontSize: 14,
        labelWidth: 240,
        cornerRadius: 6
    }
};

export function parseDensityPreset(raw: unknown): DensityPreset {
    if (raw === "compact" || raw === "comfortable" || raw === "large" || raw === "custom") {
        return raw;
    }
    return "comfortable";
}

export function resolveDensitySizes(
    preset: DensityPreset,
    custom: DensitySizes
): DensitySizes {
    if (preset === "custom") {
        return custom;
    }
    return DENSITY_PRESETS[preset];
}
