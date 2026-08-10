"use strict";

export interface ChartLayout {
    /** Full visual viewport width */
    viewportWidth: number;
    /** Full visual viewport height */
    viewportHeight: number;
    labelWidth: number;
    /** Visible width of the plot/axis viewport (right of labels) */
    plotViewportWidth: number;
    /** Visible height of the body (above axis) */
    bodyViewportHeight: number;
    /** Rendered plot content width (may exceed plotViewportWidth → horizontal scroll) */
    contentWidth: number;
    /** Rendered body content height (may exceed bodyViewportHeight → vertical scroll) */
    contentHeight: number;
    plotTop: number;
    axisHeight: number;
    needsVerticalScroll: boolean;
    needsHorizontalScroll: boolean;
}

export const AXIS_HEIGHT = 36;
export const TOP_PADDING = 8;
export const RIGHT_PADDING = 16;
export const DEFAULT_LABEL_WIDTH = 200;
/** Keep bars readable: at least this many pixels per day on the time axis. */
export const MIN_PIXELS_PER_DAY = 12;
export const MIN_PLOT_WIDTH = 320;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daySpan(start: Date, end: Date): number {
    return Math.max(1, (end.getTime() - start.getTime()) / MS_PER_DAY);
}

export function computeLayout(
    viewportWidth: number,
    viewportHeight: number,
    contentRowsHeight: number,
    domainStart: Date,
    domainEnd: Date,
    labelWidth: number = DEFAULT_LABEL_WIDTH
): ChartLayout {
    const width = Math.max(1, viewportWidth);
    const height = Math.max(1, viewportHeight);
    const clampedLabel = Math.max(80, Math.min(labelWidth, Math.floor(width * 0.4)));
    const axisHeight = AXIS_HEIGHT;
    const plotTop = TOP_PADDING;

    const plotViewportWidth = Math.max(1, width - clampedLabel);
    const bodyViewportHeight = Math.max(1, height - axisHeight);

    const days = daySpan(domainStart, domainEnd);
    const contentWidth = Math.max(
        MIN_PLOT_WIDTH,
        plotViewportWidth,
        Math.ceil(days * MIN_PIXELS_PER_DAY) + RIGHT_PADDING
    );
    const contentHeight = Math.max(
        bodyViewportHeight,
        contentRowsHeight + 8
    );

    return {
        viewportWidth: width,
        viewportHeight: height,
        labelWidth: clampedLabel,
        plotViewportWidth,
        bodyViewportHeight,
        contentWidth,
        contentHeight,
        plotTop,
        axisHeight,
        needsVerticalScroll: contentHeight > bodyViewportHeight + 1,
        needsHorizontalScroll: contentWidth > plotViewportWidth + 1
    };
}
