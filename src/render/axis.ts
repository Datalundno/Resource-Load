"use strict";

import * as d3 from "d3";
import { AxisGranularity, AxisLabelFormat } from "../data/types";

export function createTimeScale(
    domainStart: Date,
    domainEnd: Date,
    rangeStart: number,
    rangeEnd: number
): d3.ScaleTime<number, number> {
    return d3.scaleTime()
        .domain([domainStart, domainEnd])
        .range([rangeStart, rangeEnd]);
}

function tickInterval(granularity: AxisGranularity, labelFormat: AxisLabelFormat): d3.TimeInterval {
    switch (granularity) {
        case "day":
            if (labelFormat === "week" || labelFormat === "both") {
                return d3.timeMonday.every(1)!;
            }
            return d3.timeDay.every(1)!;
        case "week":
            return d3.timeMonday.every(1)!;
        case "quarter":
            return d3.timeMonth.every(3)!;
        case "month":
        default:
            return d3.timeMonth.every(1)!;
    }
}

function dateTickLabel(granularity: AxisGranularity, date: Date): string {
    switch (granularity) {
        case "day":
            return d3.timeFormat("%b %d")(date);
        case "week":
            return d3.timeFormat("%b %d")(date);
        case "quarter":
            return `Q${Math.floor(date.getMonth() / 3) + 1} ${d3.timeFormat("%Y")(date)}`;
        case "month":
        default:
            return d3.timeFormat("%b %Y")(date);
    }
}

/** ISO week number (01–53) and ISO week-year. */
function isoWeekParts(date: Date): { week: string; year: string } {
    return {
        week: d3.timeFormat("%V")(date),
        year: d3.timeFormat("%G")(date)
    };
}

export function formatAxisTick(
    date: Date,
    granularity: AxisGranularity,
    labelFormat: AxisLabelFormat
): string {
    const dateLabel = dateTickLabel(granularity, date);
    const { week, year } = isoWeekParts(date);

    switch (labelFormat) {
        case "week":
            if (granularity === "month" || granularity === "quarter") {
                return `${year}-W${week}`;
            }
            return `W${week}`;
        case "both":
            return `W${week} · ${dateLabel}`;
        case "date":
        default:
            return dateLabel;
    }
}

/**
 * Render a bottom axis with tick density capped by available pixel width.
 */
export function renderBottomAxis(
    selection: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScale: d3.ScaleTime<number, number>,
    granularity: AxisGranularity,
    labelFormat: AxisLabelFormat,
    color: string,
    chartWidth: number
): void {
    const labelBudget = labelFormat === "both" ? 110 : 90;
    const maxTicks = Math.max(2, Math.floor(chartWidth / labelBudget));
    const interval = tickInterval(granularity, labelFormat);
    const domain = xScale.domain();
    let ticks = interval.range(domain[0], d3.timeDay.offset(domain[1], 1));

    if (ticks.length > maxTicks) {
        const step = Math.ceil(ticks.length / maxTicks);
        ticks = ticks.filter((_, i) => i % step === 0);
    }

    const axis = d3.axisBottom(xScale)
        .tickValues(ticks)
        .tickSizeOuter(0)
        .tickPadding(8)
        .tickFormat((domainValue) => formatAxisTick(domainValue as Date, granularity, labelFormat));

    selection.call(axis);
    selection.selectAll("text")
        .attr("fill", color)
        .style("font-size", "11px");
    selection.selectAll("path, line")
        .attr("stroke", color)
        .attr("stroke-opacity", 0.55);
}

interface WeekendBand {
    start: Date;
    end: Date;
}

/**
 * Light vertical bands for Saturday and Sunday.
 */
export function renderWeekendShading(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScale: d3.ScaleTime<number, number>,
    domainStart: Date,
    domainEnd: Date,
    height: number,
    visible: boolean,
    fill: string
): void {
    const bands: WeekendBand[] = [];

    if (visible) {
        let day = d3.timeDay.floor(domainStart);
        const end = d3.timeDay.offset(d3.timeDay.floor(domainEnd), 1);
        while (day < end) {
            const weekday = day.getDay();
            if (weekday === 0 || weekday === 6) {
                bands.push({
                    start: day,
                    end: d3.timeDay.offset(day, 1)
                });
            }
            day = d3.timeDay.offset(day, 1);
        }
    }

    const join = container
        .selectAll<SVGRectElement, WeekendBand>("rect.weekend-band")
        .data(bands, (d) => `${d.start.getTime()}`);

    join.exit().remove();

    join.enter()
        .append("rect")
        .attr("class", "weekend-band")
        .merge(join)
        .attr("x", (d) => xScale(d.start))
        .attr("y", 0)
        .attr("width", (d) => Math.max(1, xScale(d.end) - xScale(d.start)))
        .attr("height", height)
        .attr("fill", fill)
        .attr("pointer-events", "none");
}
