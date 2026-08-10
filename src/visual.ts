"use strict";

import powerbi from "powerbi-visuals-api";
import * as d3 from "d3";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ITooltipService = powerbi.extensibility.ITooltipService;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import VisualUpdateType = powerbi.VisualUpdateType;
import ISelectionId = powerbi.visuals.ISelectionId;

import { VisualFormattingSettingsModel } from "./settings";
import { convertDataView } from "./data/converter";
import { layoutResourceRows } from "./data/load";
import {
    AxisGranularity,
    AxisGranularityOption,
    AxisLabelFormat,
    ColorBy,
    ResourceRow,
    TaskRow,
    ViewModel
} from "./data/types";
import { computeLayout, ChartLayout, RIGHT_PADDING, TOP_PADDING } from "./render/layout";
import { createTimeScale, renderBottomAxis, renderWeekendShading } from "./render/axis";
import {
    renderBars,
    renderLabelRows,
    renderRowBands,
    renderTodayLine
} from "./render/bars";
import { getContrastColors } from "./utils/contrast";
import { addMonths, chooseGranularity, startOfDay } from "./utils/dates";
import { buildTooltipDataItems, pointerCoordinates } from "./utils/tooltips";
import { resolveColorByFromDataView } from "./suite/colorBy";
import { parseDensityPreset, resolveDensitySizes } from "./suite/density";

type TimeWindowMonths = 3 | 6 | 9 | 12 | null;

export class Visual implements IVisual {
    private host: IVisualHost;
    private events: IVisualEventService;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private localization: ILocalizationManager;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    private root: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private message: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private landing: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private toolbar: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private chart: d3.Selection<HTMLDivElement, unknown, null, undefined>;

    private bodyRow: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private labelsCol: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private plotCol: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private axisRow: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private axisGutter: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private axisCol: d3.Selection<HTMLDivElement, unknown, null, undefined>;

    private labelsSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private plotSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private axisSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    private labelLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private weekendLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private rowBandLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private barsLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private todayLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private axisLayer: d3.Selection<SVGGElement, unknown, null, undefined>;

    private viewModel: ViewModel | null = null;
    private dataView: powerbi.DataView | undefined;
    private selectedKeys: Set<string> = new Set();
    private syncingScroll = false;
    private lastViewport: { width: number; height: number } | null = null;
    private isLandingPageOn = false;
    private timeWindowMonths: TimeWindowMonths = null;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.events = options.host.eventService;
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipService = options.host.tooltipService;
        this.localization = options.host.createLocalizationManager();
        this.formattingSettingsService = new FormattingSettingsService(this.localization);

        this.selectionManager.registerOnSelectCallback((ids: ISelectionId[]) => {
            this.selectedKeys = new Set((ids ?? []).map((id) => id.getKey()));
            this.renderFromState();
        });

        this.root = d3.select(options.element)
            .append("div")
            .classed("rl-root", true)
            .attr("tabindex", "0");

        this.message = this.root
            .append("div")
            .classed("rl-message", true)
            .style("display", "none");

        this.landing = this.root
            .append("div")
            .classed("rl-landing", true)
            .style("display", "none");

        this.buildLandingPage();

        this.chart = this.root
            .append("div")
            .classed("rl-chart", true);

        this.toolbar = this.chart
            .append("div")
            .classed("rl-toolbar", true)
            .style("display", "none");
        this.buildToolbar();

        this.bodyRow = this.chart
            .append("div")
            .classed("rl-body-row", true);

        this.labelsCol = this.bodyRow
            .append("div")
            .classed("rl-labels-col", true);

        this.labelsSvg = this.labelsCol
            .append("svg")
            .classed("rl-labels-svg", true);

        this.labelLayer = this.labelsSvg.append("g").classed("labels", true);

        this.plotCol = this.bodyRow
            .append("div")
            .classed("rl-plot-col", true);

        this.plotSvg = this.plotCol
            .append("svg")
            .classed("rl-plot-svg", true);

        this.weekendLayer = this.plotSvg.append("g").classed("weekends", true);
        this.rowBandLayer = this.plotSvg.append("g").classed("row-bands", true);
        this.todayLayer = this.plotSvg.append("g").classed("today", true);
        this.barsLayer = this.plotSvg.append("g").classed("bars", true);

        this.axisRow = this.chart
            .append("div")
            .classed("rl-axis-row", true);

        this.axisGutter = this.axisRow
            .append("div")
            .classed("rl-axis-gutter", true);

        this.axisCol = this.axisRow
            .append("div")
            .classed("rl-axis-col", true);

        this.axisSvg = this.axisCol
            .append("svg")
            .classed("rl-axis-svg", true);

        this.axisLayer = this.axisSvg.append("g").classed("x-axis", true);

        const plotNode = this.plotCol.node() as HTMLDivElement;
        const labelsNode = this.labelsCol.node() as HTMLDivElement;
        const axisNode = this.axisCol.node() as HTMLDivElement;

        plotNode.addEventListener("scroll", () => {
            if (this.syncingScroll) {
                return;
            }
            this.syncingScroll = true;
            labelsNode.scrollTop = plotNode.scrollTop;
            axisNode.scrollLeft = plotNode.scrollLeft;
            this.syncingScroll = false;
        });

        labelsNode.addEventListener("scroll", () => {
            if (this.syncingScroll) {
                return;
            }
            this.syncingScroll = true;
            plotNode.scrollTop = labelsNode.scrollTop;
            this.syncingScroll = false;
        });

        this.plotSvg.on("click", () => {
            this.clearSelection();
        });

        this.root.on("contextmenu", (event: MouseEvent) => {
            this.showEmptyContextMenu(event);
        });
    }

    private buildToolbar(): void {
        const windows = this.toolbar.append("div")
            .classed("rl-toolbar-group", true)
            .classed("rl-toolbar-windows", true);
        const windowOptions: Array<{ label: string; value: TimeWindowMonths }> = [
            { label: "3M", value: 3 },
            { label: "6M", value: 6 },
            { label: "9M", value: 9 },
            { label: "12M", value: 12 },
            { label: "All", value: null }
        ];
        windowOptions.forEach((option) => {
            windows.append("button")
                .attr("type", "button")
                .classed("rl-tool-btn", true)
                .attr("data-window", option.value == null ? "all" : String(option.value))
                .text(option.label)
                .on("click", (event: MouseEvent) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!this.host.hostCapabilities?.allowInteractions) {
                        return;
                    }
                    this.timeWindowMonths = option.value;
                    this.syncToolbarActive();
                    this.renderFromState();
                });
        });

        this.syncToolbarActive();
    }

    private syncToolbarActive(): void {
        this.toolbar.selectAll<HTMLButtonElement, unknown>("button.rl-tool-btn[data-window]")
            .classed("is-active", (_d, _i, nodes) => {
                const node = nodes[_i] as HTMLButtonElement;
                const value = node.getAttribute("data-window");
                if (this.timeWindowMonths == null) {
                    return value === "all";
                }
                return value === String(this.timeWindowMonths);
            });
    }

    private syncToolbarVisibility(): boolean {
        const showTimeWindow = this.formattingSettings?.generalCard?.showTimeWindow?.value ?? false;
        this.toolbar.style("display", showTimeWindow ? "flex" : "none");
        return showTimeWindow;
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);

        try {
            const dataView = options.dataViews && options.dataViews[0];
            this.dataView = dataView;
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel,
                dataView
            );
            this.migrateLegacyColorBy(dataView);

            const hasBoundFields = (dataView?.metadata?.columns?.length ?? 0) > 0;
            if (!hasBoundFields) {
                this.showLandingPage();
                this.viewModel = null;
                this.lastViewport = {
                    width: options.viewport.width,
                    height: options.viewport.height
                };
                this.events.renderingFinished(options);
                return;
            }

            this.hideLandingPage();

            const isResizeOnly =
                options.type === VisualUpdateType.Resize ||
                options.type === VisualUpdateType.ResizeEnd ||
                (options.type & VisualUpdateType.Resize) === VisualUpdateType.Resize;

            if (!isResizeOnly || !this.viewModel) {
                this.viewModel = convertDataView(dataView, this.host);
                this.syncSelectionFromManager();
            }

            this.lastViewport = {
                width: options.viewport.width,
                height: options.viewport.height
            };
            this.renderFromState();
            this.updateWarningIcon();

            this.events.renderingFinished(options);
        } catch (error) {
            const prefix = this.t("Msg_RenderError", "Unable to render Resource Load");
            this.showMessage(`${prefix}: ${String(error)}`);
            this.events.renderingFailed(options, String(error));
        }
    }

    private t(key: string, fallback: string): string {
        try {
            const value = this.localization.getDisplayName(key);
            return value || fallback;
        } catch {
            return fallback;
        }
    }

    private buildLandingPage(): void {
        const node = this.landing.node();
        if (node) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
        }

        const card = this.landing.append("div").classed("rl-landing-card", true);

        card.append("div")
            .classed("rl-landing-mark", true)
            .attr("aria-hidden", "true");

        card.append("h2")
            .classed("rl-landing-title", true)
            .text(this.t("Landing_Title", "DataLund Resource Load"));

        card.append("p")
            .classed("rl-landing-subtitle", true)
            .text(this.t("Landing_Subtitle", "See who is busy when — people on tasks over time."));

        const steps = card.append("ul").classed("rl-landing-steps", true);
        const stepKeys: Array<[string, string]> = [
            ["Landing_Step1", "1. Drag a person/team into Resource"],
            ["Landing_Step2", "2. Drag Task / project into Task"],
            ["Landing_Step3", "3. Add Start Date and End Date"],
            ["Landing_Step4", "Optional: Progress, Group. Also supported later: Duration, Tooltips"]
        ];
        for (const [key, fallback] of stepKeys) {
            steps.append("li").text(this.t(key, fallback));
        }
    }

    private showLandingPage(): void {
        this.isLandingPageOn = true;
        this.chart.style("display", "none");
        this.message.style("display", "none").text("");
        this.landing.style("display", "flex");
    }

    private hideLandingPage(): void {
        if (!this.isLandingPageOn) {
            this.landing.style("display", "none");
            return;
        }
        this.isLandingPageOn = false;
        this.landing.style("display", "none");
    }

    private showEmptyContextMenu(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        this.selectionManager.showContextMenu({} as ISelectionId, {
            x: event.clientX,
            y: event.clientY
        });
    }

    private onBarContextMenu(event: MouseEvent, task: TaskRow): void {
        event.preventDefault();
        event.stopPropagation();
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        const selectionId = task.selectionId ?? ({} as ISelectionId);
        this.selectionManager.showContextMenu(selectionId, {
            x: event.clientX,
            y: event.clientY
        });
    }

    private updateWarningIcon(): void {
        if (!this.viewModel || !this.host.displayWarningIcon) {
            return;
        }
        const invalidCount = this.viewModel.tasks.filter((t) => t.flaggedInvalidRange).length;
        if (invalidCount > 0) {
            this.host.displayWarningIcon(
                "Invalid date ranges",
                `${invalidCount} assignment(s) have an end date before the start date. Those bars are outlined so you can fix the data.`
            );
        }
    }

    private syncSelectionFromManager(): void {
        const ids = this.selectionManager.getSelectionIds() as ISelectionId[];
        this.selectedKeys = new Set((ids ?? []).map((id) => id.getKey()));
    }

    private resolveGranularity(autoGranularity: AxisGranularity): AxisGranularity {
        const raw = this.formattingSettings?.generalCard?.axisGranularity?.value?.value as AxisGranularityOption | undefined;
        if (!raw || raw === "auto") {
            return autoGranularity;
        }
        return raw;
    }

    private resolveLabelFormat(): AxisLabelFormat {
        const raw = this.formattingSettings?.generalCard?.axisLabelFormat?.value?.value as AxisLabelFormat | undefined;
        if (raw === "week" || raw === "both" || raw === "date") {
            return raw;
        }
        return "date";
    }

    /**
     * Apply legacy `general.colorMode` into the Format model so Color by and render stay in sync.
     */
    private migrateLegacyColorBy(dataView: powerbi.DataView | undefined): void {
        const card = this.formattingSettings?.generalCard?.colorBy;
        if (!card) {
            return;
        }
        const resolved = resolveColorByFromDataView(dataView, card.value?.value);
        card.setValue(resolved);
    }

    private resolveColorBy(): ColorBy {
        return resolveColorByFromDataView(
            this.dataView,
            this.formattingSettings?.generalCard?.colorBy?.value?.value
        );
    }

    private resolveDomain(): { start: Date; end: Date; granularity: AxisGranularity } {
        const fullStart = this.viewModel?.domainStart ?? new Date();
        const fullEnd = this.viewModel?.domainEnd ?? new Date();
        const showTimeWindow = this.formattingSettings?.generalCard?.showTimeWindow?.value ?? false;
        if (!showTimeWindow || this.timeWindowMonths == null) {
            return {
                start: fullStart,
                end: fullEnd,
                granularity: chooseGranularity(fullStart, fullEnd)
            };
        }
        const start = startOfDay(new Date());
        const end = addMonths(start, this.timeWindowMonths);
        return {
            start,
            end,
            granularity: chooseGranularity(start, end)
        };
    }

    private isTaskSelected(task: TaskRow): boolean {
        if (!task.selectionId) {
            return false;
        }
        return this.selectedKeys.has(task.selectionId.getKey());
    }

    private isResourceSelected(row: ResourceRow): boolean {
        if (this.selectedKeys.size === 0) {
            return true;
        }
        return row.tasks.some((task) => this.isTaskSelected(task));
    }

    private onBarClick(event: MouseEvent, task: TaskRow): void {
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        if (!task.selectionId) {
            return;
        }
        const multi = event.ctrlKey || event.metaKey;
        this.selectionManager.select(task.selectionId, multi).then((ids: ISelectionId[]) => {
            this.selectedKeys = new Set((ids ?? []).map((id) => id.getKey()));
            this.renderFromState();
        });
    }

    private onResourceClick(event: MouseEvent, row: ResourceRow): void {
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        const ids = row.tasks
            .map((t) => t.selectionId)
            .filter((id): id is ISelectionId => id != null);
        if (ids.length === 0) {
            return;
        }
        const multi = event.ctrlKey || event.metaKey;
        this.selectionManager.select(ids, multi).then((selected: ISelectionId[]) => {
            this.selectedKeys = new Set((selected ?? []).map((id) => id.getKey()));
            this.renderFromState();
        });
    }

    private clearSelection(): void {
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        if (!this.selectionManager.hasSelection()) {
            return;
        }
        this.selectionManager.clear().then(() => {
            this.selectedKeys.clear();
            this.renderFromState();
        });
    }

    private onBarMouseMove(event: MouseEvent, task: TaskRow): void {
        if (!this.tooltipService.enabled()) {
            return;
        }
        const rootNode = this.root.node();
        if (!rootNode) {
            return;
        }
        const identities = task.selectionId ? [task.selectionId] : [];
        this.tooltipService.show({
            coordinates: pointerCoordinates(event, rootNode),
            isTouchEvent: false,
            dataItems: buildTooltipDataItems(task),
            identities
        });
    }

    private onBarMouseOut(_event: MouseEvent, _task: TaskRow): void {
        this.tooltipService.hide({
            isTouchEvent: false,
            immediately: true
        });
    }

    private renderFromState(): void {
        if (!this.lastViewport || !this.viewModel) {
            return;
        }

        const showToolbar = this.syncToolbarVisibility();
        const toolbarHeight = showToolbar ? 40 : 0;
        const density = parseDensityPreset(
            this.formattingSettings?.generalCard?.density?.value?.value
        );
        const sizes = resolveDensitySizes(density, {
            barHeight: this.formattingSettings?.barsCard?.barHeight?.value ?? 28,
            rowGap: 12,
            fontSize: this.formattingSettings?.labelsCard?.fontSize?.value ?? 12,
            labelWidth: this.formattingSettings?.labelsCard?.width?.value ?? 200,
            cornerRadius: this.formattingSettings?.barsCard?.cornerRadius?.value ?? 4
        });

        const domain = this.resolveDomain();
        const contentBottom = layoutResourceRows(
            this.viewModel.resources,
            sizes.barHeight,
            sizes.rowGap,
            TOP_PADDING,
            domain.start,
            domain.end
        );

        const layout = computeLayout(
            this.lastViewport.width,
            Math.max(1, this.lastViewport.height - toolbarHeight),
            contentBottom,
            domain.start,
            domain.end,
            sizes.labelWidth
        );
        this.render(layout, domain.start, domain.end, domain.granularity, sizes);
    }

    private render(
        layout: ChartLayout,
        domainStart: Date,
        domainEnd: Date,
        autoGranularity: AxisGranularity,
        sizes: { barHeight: number; fontSize: number; cornerRadius: number; labelWidth: number; rowGap: number }
    ): void {
        const viewModel = this.viewModel;
        if (!viewModel || viewModel.errorMessage || viewModel.tasks.length === 0) {
            this.showMessage(
                viewModel?.errorMessage
                    ?? this.t("Msg_AddFields", "Add Resource, Task, and Start Date fields to render Resource Load.")
            );
            return;
        }

        if (!viewModel.domainStart || !viewModel.domainEnd) {
            this.showMessage(this.t("Msg_InvalidRange", "Could not determine a valid date range."));
            return;
        }

        this.hideMessage();

        const contrast = getContrastColors(this.host.colorPalette);
        const defaultBarFill = contrast.isHighContrast
            ? contrast.foreground
            : (this.formattingSettings?.barsCard?.fill?.value?.value || "#0ea5e9");
        const defaultProgressFill = contrast.isHighContrast
            ? contrast.foregroundSelected
            : (this.formattingSettings?.barsCard?.progressFill?.value?.value || "#0284c7");
        const loadWarnFill = contrast.isHighContrast
            ? contrast.foreground
            : (this.formattingSettings?.barsCard?.loadWarnFill?.value?.value || "#ea580c");
        const colorBy = this.resolveColorBy();
        const todayColor = contrast.isHighContrast
            ? contrast.foreground
            : (this.formattingSettings?.generalCard?.todayLineColor?.value?.value || "#e81123");
        const showToday = this.formattingSettings?.generalCard?.showTodayLine?.value ?? true;
        const weekendShading = this.formattingSettings?.generalCard?.weekendShading?.value ?? false;
        const granularity = this.resolveGranularity(autoGranularity);
        const labelFormat = this.resolveLabelFormat();
        const textColor = contrast.foreground;
        const cornerRadius = sizes.cornerRadius;
        const fontSize = sizes.fontSize;
        const fontFamily = this.formattingSettings?.labelsCard?.fontFamily?.value
            ?? "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif";
        const zebraFill = contrast.isHighContrast
            ? contrast.background
            : "rgba(15, 23, 42, 0.035)";
        const hasSelection = this.selectedKeys.size > 0;
        const badgeFill = contrast.isHighContrast ? contrast.foreground : "#0f172a";
        const badgeText = contrast.isHighContrast ? contrast.background : "#f8fafc";

        const getBarColor = (task: TaskRow): string => {
            if (contrast.isHighContrast) {
                return contrast.foreground;
            }
            if (colorBy === "task") {
                return this.host.colorPalette.getColor(task.task).value;
            }
            if (colorBy === "concurrency") {
                return task.concurrency > 1 ? loadWarnFill : defaultBarFill;
            }
            return defaultBarFill;
        };

        const getProgressColor = (task: TaskRow): string => {
            if (contrast.isHighContrast) {
                return contrast.foregroundSelected;
            }
            if (colorBy === "task") {
                return this.host.colorPalette.getColor(task.task).value;
            }
            if (colorBy === "concurrency") {
                return task.concurrency > 1 ? loadWarnFill : defaultProgressFill;
            }
            return defaultProgressFill;
        };

        this.root.style("background", contrast.background);

        this.labelsCol
            .style("width", `${layout.labelWidth}px`)
            .style("height", `${layout.bodyViewportHeight}px`);

        this.plotCol
            .style("height", `${layout.bodyViewportHeight}px`)
            .style("overflow-x", layout.needsHorizontalScroll ? "auto" : "hidden")
            .style("overflow-y", layout.needsVerticalScroll ? "auto" : "hidden");

        this.axisGutter.style("width", `${layout.labelWidth}px`);
        this.axisRow.style("height", `${layout.axisHeight}px`);
        this.axisCol
            .style("height", `${layout.axisHeight}px`)
            .style("overflow-x", "hidden")
            .style("overflow-y", "hidden");

        const plotWidth = Math.max(1, layout.contentWidth - RIGHT_PADDING);
        const contentRowsHeight = Math.max(
            layout.bodyViewportHeight,
            ...viewModel.resources.map((r) => r.y + r.height),
            TOP_PADDING
        );

        this.labelsSvg
            .attr("width", layout.labelWidth)
            .attr("height", layout.contentHeight);

        this.plotSvg
            .attr("width", layout.contentWidth)
            .attr("height", layout.contentHeight);

        this.axisSvg
            .attr("width", layout.contentWidth)
            .attr("height", layout.axisHeight);

        this.labelLayer.attr("transform", "translate(0,0)");
        this.weekendLayer.attr("transform", "translate(0,0)");
        this.rowBandLayer.attr("transform", "translate(0,0)");
        this.todayLayer.attr("transform", "translate(0,0)");
        this.barsLayer.attr("transform", "translate(0,0)");
        this.axisLayer.attr("transform", "translate(0,0)");

        const xScale = createTimeScale(domainStart, domainEnd, 0, plotWidth);

        const weekendFill = contrast.isHighContrast
            ? contrast.foreground
            : "rgba(15, 23, 42, 0.06)";

        renderLabelRows(
            this.labelLayer,
            viewModel.resources,
            layout.labelWidth,
            fontSize,
            fontFamily,
            textColor,
            badgeFill,
            badgeText,
            zebraFill,
            hasSelection,
            (row) => this.isResourceSelected(row),
            (event, row) => this.onResourceClick(event, row)
        );

        renderWeekendShading(
            this.weekendLayer,
            xScale,
            domainStart,
            domainEnd,
            contentRowsHeight,
            weekendShading,
            weekendFill
        );

        renderRowBands(this.rowBandLayer, viewModel.resources, plotWidth, zebraFill);

        renderTodayLine(
            this.todayLayer,
            xScale,
            domainStart,
            domainEnd,
            contentRowsHeight,
            showToday,
            todayColor
        );

        renderBars(this.barsLayer, viewModel.tasks, {
            xScale,
            resources: viewModel.resources,
            barHeight: sizes.barHeight,
            getBarColor,
            getProgressColor,
            cornerRadius,
            flaggedStroke: contrast.isHighContrast ? contrast.foreground : "#a80000",
            hasSelection,
            isSelected: (task) => this.isTaskSelected(task),
            onClick: (event, task) => this.onBarClick(event, task),
            onContextMenu: (event, task) => this.onBarContextMenu(event, task),
            onMouseMove: (event, task) => this.onBarMouseMove(event, task),
            onMouseOut: (event, task) => this.onBarMouseOut(event, task)
        });

        renderBottomAxis(this.axisLayer, xScale, granularity, labelFormat, textColor, plotWidth);
    }

    private showMessage(text: string): void {
        this.hideLandingPage();
        this.chart.style("display", "none");
        this.message
            .style("display", "flex")
            .text(text);
    }

    private hideMessage(): void {
        this.message.style("display", "none").text("");
        this.chart.style("display", "flex");
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    public destroy(): void {
        this.root.remove();
        this.viewModel = null;
        this.selectedKeys.clear();
    }
}
