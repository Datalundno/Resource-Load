"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import powerbi from "powerbi-visuals-api";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

const axisGranularityItems: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "Auto" },
    { value: "day", displayName: "Day" },
    { value: "week", displayName: "Week" },
    { value: "month", displayName: "Month" },
    { value: "quarter", displayName: "Quarter" }
];

const axisLabelFormatItems: powerbi.IEnumMember[] = [
    { value: "date", displayName: "Date" },
    { value: "week", displayName: "Week number" },
    { value: "both", displayName: "Week + date" }
];

const densityItems: powerbi.IEnumMember[] = [
    { value: "compact", displayName: "Compact" },
    { value: "comfortable", displayName: "Comfortable" },
    { value: "large", displayName: "Large" },
    { value: "custom", displayName: "Custom" }
];

const colorByItems: powerbi.IEnumMember[] = [
    { value: "single", displayName: "Single fill" },
    { value: "task", displayName: "By task" },
    { value: "concurrency", displayName: "By concurrency" }
];

/**
 * Formatting cards aligned with capabilities.json.
 */
class BarsCardSettings extends FormattingSettingsCard {
    barHeight = new formattingSettings.NumUpDown({
        name: "barHeight",
        displayName: "Bar height",
        displayNameKey: "Prop_BarHeight",
        value: 28
    });

    cornerRadius = new formattingSettings.NumUpDown({
        name: "cornerRadius",
        displayName: "Corner radius",
        displayNameKey: "Prop_CornerRadius",
        value: 4
    });

    fill = new formattingSettings.ColorPicker({
        name: "fill",
        displayName: "Bar fill",
        displayNameKey: "Prop_BarFill",
        value: { value: "#0ea5e9" }
    });

    progressFill = new formattingSettings.ColorPicker({
        name: "progressFill",
        displayName: "Progress fill",
        displayNameKey: "Prop_ProgressFill",
        value: { value: "#0284c7" }
    });

    loadWarnFill = new formattingSettings.ColorPicker({
        name: "loadWarnFill",
        displayName: "Overlap warn fill",
        displayNameKey: "Prop_LoadWarnFill",
        value: { value: "#ea580c" }
    });

    name: string = "bars";
    displayName: string = "Bars";
    displayNameKey: string = "Objects_Bars";
    slices: Array<FormattingSettingsSlice> = [
        this.barHeight,
        this.cornerRadius,
        this.fill,
        this.progressFill,
        this.loadWarnFill
    ];
}

class LabelsCardSettings extends FormattingSettingsCard {
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Font size",
        displayNameKey: "Prop_FontSize",
        value: 12
    });

    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font family",
        displayNameKey: "Prop_FontFamily",
        value: "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif"
    });

    width = new formattingSettings.NumUpDown({
        name: "width",
        displayName: "Label pane width",
        displayNameKey: "Prop_LabelWidth",
        value: 200
    });

    name: string = "labels";
    displayName: string = "Resource labels";
    displayNameKey: string = "Objects_Labels";
    slices: Array<FormattingSettingsSlice> = [
        this.fontSize,
        this.fontFamily,
        this.width
    ];
}

class GeneralCardSettings extends FormattingSettingsCard {
    density = new formattingSettings.ItemDropdown({
        name: "density",
        displayName: "Density",
        displayNameKey: "Prop_Density",
        description: "Suite size preset. Custom uses Bars and Resource labels values.",
        items: densityItems,
        value: densityItems[1]
    });

    colorBy = new formattingSettings.ItemDropdown({
        name: "colorBy",
        displayName: "Color by",
        displayNameKey: "Prop_ColorBy",
        description: "Single fill, by task name, or warn when overlapping.",
        items: colorByItems,
        value: colorByItems[0]
    });

    showTodayLine = new formattingSettings.ToggleSwitch({
        name: "showTodayLine",
        displayName: "Show today line",
        displayNameKey: "Prop_ShowTodayLine",
        value: true
    });

    todayLineColor = new formattingSettings.ColorPicker({
        name: "todayLineColor",
        displayName: "Today line color",
        displayNameKey: "Prop_TodayLineColor",
        value: { value: "#e81123" }
    });

    axisGranularity = new formattingSettings.ItemDropdown({
        name: "axisGranularity",
        displayName: "Axis granularity",
        displayNameKey: "Prop_AxisGranularity",
        items: axisGranularityItems,
        value: axisGranularityItems[0]
    });

    axisLabelFormat = new formattingSettings.ItemDropdown({
        name: "axisLabelFormat",
        displayName: "Axis labels",
        displayNameKey: "Prop_AxisLabels",
        items: axisLabelFormatItems,
        value: axisLabelFormatItems[0]
    });

    weekendShading = new formattingSettings.ToggleSwitch({
        name: "weekendShading",
        displayName: "Weekend shading",
        displayNameKey: "Prop_WeekendShading",
        value: false
    });

    showTimeWindow = new formattingSettings.ToggleSwitch({
        name: "showTimeWindow",
        displayName: "Show time window",
        displayNameKey: "Prop_ShowTimeWindow",
        description: "Toolbar: 3 / 6 / 9 / 12 months from today, or All. Off by default.",
        value: false
    });

    name: string = "general";
    displayName: string = "General";
    displayNameKey: string = "Objects_General";
    slices: Array<FormattingSettingsSlice> = [
        this.density,
        this.colorBy,
        this.showTodayLine,
        this.todayLineColor,
        this.axisGranularity,
        this.axisLabelFormat,
        this.weekendShading,
        this.showTimeWindow
    ];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    barsCard = new BarsCardSettings();
    labelsCard = new LabelsCardSettings();
    generalCard = new GeneralCardSettings();

    cards = [this.barsCard, this.labelsCard, this.generalCard];
}
