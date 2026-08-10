"use strict";

import * as d3 from "d3";
import { ResourceRow, TaskRow } from "../data/types";
import { laneY } from "../data/load";

export interface BarRenderOptions {
    xScale: d3.ScaleTime<number, number>;
    resources: ResourceRow[];
    barHeight: number;
    getBarColor: (task: TaskRow) => string;
    getProgressColor: (task: TaskRow) => string;
    cornerRadius: number;
    flaggedStroke: string;
    hasSelection: boolean;
    isSelected: (task: TaskRow) => boolean;
    onClick: (event: MouseEvent, task: TaskRow) => void;
    onContextMenu: (event: MouseEvent, task: TaskRow) => void;
    onMouseMove: (event: MouseEvent, task: TaskRow) => void;
    onMouseOut: (event: MouseEvent, task: TaskRow) => void;
}

export function withAlpha(hex: string, alpha: number): string {
    const c = d3.color(hex);
    if (!c) {
        return hex;
    }
    c.opacity = alpha;
    return c.formatRgb();
}

/**
 * Assignment bars in per-resource swimlanes.
 */
export function renderBars(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    tasks: TaskRow[],
    options: BarRenderOptions
): void {
    const {
        xScale,
        resources,
        barHeight,
        getBarColor,
        getProgressColor,
        cornerRadius,
        flaggedStroke,
        hasSelection,
        isSelected,
        onClick,
        onContextMenu,
        onMouseMove,
        onMouseOut
    } = options;

    const resourceByName = new Map(resources.map((r) => [r.resource, r]));

    const join = container
        .selectAll<SVGGElement, TaskRow>("g.assignment")
        .data(tasks, (d) => d.id);

    join.exit().remove();

    const enter = join.enter()
        .append("g")
        .attr("class", "assignment");

    enter.append("rect").attr("class", "task-track");
    enter.append("rect").attr("class", "task-progress");

    const merged = enter.merge(join);

    merged
        .style("cursor", "pointer")
        .style("opacity", (d) => {
            if (!hasSelection) {
                return "1";
            }
            return isSelected(d) ? "1" : "0.28";
        });

    merged.select<SVGRectElement>("rect.task-track")
        .attr("x", (d) => xScale(d.start))
        .attr("y", (d) => {
            const resource = resourceByName.get(d.resource);
            if (!resource) {
                return 0;
            }
            return laneY(resource, d.lane, barHeight);
        })
        .attr("rx", cornerRadius)
        .attr("ry", cornerRadius)
        .attr("height", barHeight)
        .attr("width", (d) => Math.max(1, xScale(d.end) - xScale(d.start)))
        .attr("fill", (d) => {
            if (d.progress == null) {
                return getBarColor(d);
            }
            return withAlpha(getBarColor(d), 0.22);
        })
        .attr("stroke", (d) => {
            if (d.flaggedInvalidRange) {
                return flaggedStroke;
            }
            if (d.progress == null) {
                return "none";
            }
            return withAlpha(getBarColor(d), 0.55);
        })
        .attr("stroke-width", (d) => {
            if (d.flaggedInvalidRange) {
                return 1.5;
            }
            return d.progress == null ? 0 : 1;
        });

    merged.select<SVGRectElement>("rect.task-progress")
        .attr("display", (d) => {
            if (d.progress == null || d.progress <= 0) {
                return "none";
            }
            return null;
        })
        .attr("x", (d) => xScale(d.start))
        .attr("y", (d) => {
            const resource = resourceByName.get(d.resource);
            if (!resource) {
                return 0;
            }
            return laneY(resource, d.lane, barHeight);
        })
        .attr("rx", Math.max(0, cornerRadius - 1))
        .attr("ry", Math.max(0, cornerRadius - 1))
        .attr("height", barHeight)
        .attr("width", (d) => {
            const barWidth = Math.max(1, xScale(d.end) - xScale(d.start));
            const p = Math.max(0, Math.min(1, d.progress ?? 0));
            return Math.min(barWidth, barWidth * p);
        })
        .attr("fill", (d) => getProgressColor(d))
        .attr("pointer-events", "none");

    merged
        .on("click", (event: MouseEvent, d: TaskRow) => {
            event.preventDefault();
            event.stopPropagation();
            onClick(event, d);
        })
        .on("contextmenu", (event: MouseEvent, d: TaskRow) => {
            event.preventDefault();
            event.stopPropagation();
            onContextMenu(event, d);
        })
        .on("mousemove", (event: MouseEvent, d: TaskRow) => {
            onMouseMove(event, d);
        })
        .on("mouseout", (event: MouseEvent, d: TaskRow) => {
            onMouseOut(event, d);
        });
}

export function renderTodayLine(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScale: d3.ScaleTime<number, number>,
    domainStart: Date,
    domainEnd: Date,
    contentHeight: number,
    visible: boolean,
    color: string
): void {
    const today = new Date();
    const inRange = today >= domainStart && today <= domainEnd;

    const join = container
        .selectAll<SVGLineElement, Date>("line.today-line")
        .data(visible && inRange ? [today] : []);

    join.exit().remove();

    join.enter()
        .append("line")
        .attr("class", "today-line")
        .merge(join)
        .attr("x1", (d) => xScale(d))
        .attr("x2", (d) => xScale(d))
        .attr("y1", 0)
        .attr("y2", contentHeight)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,4")
        .attr("pointer-events", "none");
}

export function renderRowBands(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    resources: ResourceRow[],
    plotWidth: number,
    bandFill: string
): void {
    const striped = resources.filter((_, index) => index % 2 === 1);

    const join = container
        .selectAll<SVGRectElement, ResourceRow>("rect.row-band")
        .data(striped, (d) => d.id);

    join.exit().remove();

    join.enter()
        .append("rect")
        .attr("class", "row-band")
        .merge(join)
        .attr("x", 0)
        .attr("y", (d) => d.y)
        .attr("width", plotWidth)
        .attr("height", (d) => d.height)
        .attr("fill", bandFill)
        .attr("pointer-events", "none");
}

export function renderLabelRows(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    resources: ResourceRow[],
    labelWidth: number,
    fontSize: number,
    fontFamily: string,
    textColor: string,
    badgeFill: string,
    badgeText: string,
    zebraFill: string,
    hasSelection: boolean,
    isResourceSelected: (row: ResourceRow) => boolean,
    onClickResource: (event: MouseEvent, row: ResourceRow) => void
): void {
    const join = container
        .selectAll<SVGGElement, ResourceRow>("g.label-row")
        .data(resources, (d) => d.id);

    join.exit().remove();

    const enter = join.enter()
        .append("g")
        .attr("class", "label-row");

    enter.append("rect").attr("class", "label-bg");
    enter.append("rect").attr("class", "label-hit");
    enter.append("text").attr("class", "label-text");
    enter.append("rect").attr("class", "load-badge-bg");
    enter.append("text").attr("class", "load-badge-text");

    const merged = enter.merge(join);
    const badgeSize = Math.max(16, fontSize + 4);

    merged
        .attr("transform", (d) => `translate(0,${d.y})`)
        .style("cursor", "pointer")
        .style("opacity", (d) => {
            if (!hasSelection) {
                return "1";
            }
            return isResourceSelected(d) ? "1" : "0.45";
        });

    merged.select<SVGRectElement>("rect.label-bg")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", labelWidth)
        .attr("height", (d) => d.height)
        .attr("fill", (_d, i) => (i % 2 === 1 ? zebraFill : "transparent"));

    merged.select<SVGRectElement>("rect.label-hit")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", labelWidth)
        .attr("height", (d) => d.height)
        .attr("fill", "transparent");

    merged.select<SVGTextElement>("text.label-text")
        .attr("x", labelWidth - badgeSize - 16)
        .attr("y", (d) => d.height / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("fill", textColor)
        .style("font-size", `${fontSize}px`)
        .style("font-family", fontFamily)
        .text((d) => d.resource);

    merged.select<SVGRectElement>("rect.load-badge-bg")
        .attr("x", labelWidth - badgeSize - 8)
        .attr("y", (d) => (d.height - badgeSize) / 2)
        .attr("width", badgeSize)
        .attr("height", badgeSize)
        .attr("rx", badgeSize / 2)
        .attr("ry", badgeSize / 2)
        .attr("fill", (d) => (d.visibleLoad > 1 ? badgeFill : withAlpha(badgeFill, 0.35)))
        .attr("pointer-events", "none");

    merged.select<SVGTextElement>("text.load-badge-text")
        .attr("x", labelWidth - badgeSize / 2 - 8)
        .attr("y", (d) => d.height / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", badgeText)
        .style("font-size", `${Math.max(9, fontSize - 2)}px`)
        .style("font-family", fontFamily)
        .style("font-weight", "600")
        .attr("pointer-events", "none")
        .text((d) => String(d.visibleLoad));

    merged.on("click", (event: MouseEvent, d: ResourceRow) => {
        event.preventDefault();
        event.stopPropagation();
        onClickResource(event, d);
    });
}
