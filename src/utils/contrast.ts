"use strict";

import powerbi from "powerbi-visuals-api";
import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;

export interface ContrastColors {
    foreground: string;
    background: string;
    foregroundSelected: string;
    hyperlink: string;
    isHighContrast: boolean;
}

export function getContrastColors(palette: ISandboxExtendedColorPalette): ContrastColors {
    const isHighContrast = !!palette.isHighContrast;
    return {
        isHighContrast,
        foreground: isHighContrast ? palette.foreground.value : "#1b1b1b",
        background: isHighContrast ? palette.background.value : "#ffffff",
        foregroundSelected: isHighContrast ? palette.foregroundSelected.value : "#1b1b1b",
        hyperlink: isHighContrast ? palette.hyperlink.value : "#118dff"
    };
}
