"use strict";

import { ResourceRow, TaskRow } from "./types";

function rangesOverlap(a: TaskRow, b: TaskRow): boolean {
    return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();
}

/**
 * Greedy lane assignment: sort by start, place each task in the first lane
 * whose last end does not overlap. Swimlanes stack inside one resource row.
 */
export function assignLanes(tasks: TaskRow[]): number {
    const sorted = [...tasks].sort((a, b) => {
        const startDiff = a.start.getTime() - b.start.getTime();
        if (startDiff !== 0) {
            return startDiff;
        }
        return a.end.getTime() - b.end.getTime();
    });

    const laneEnds: number[] = [];

    sorted.forEach((task) => {
        let placed = false;
        for (let lane = 0; lane < laneEnds.length; lane++) {
            if (laneEnds[lane] <= task.start.getTime()) {
                task.lane = lane;
                laneEnds[lane] = task.end.getTime();
                placed = true;
                break;
            }
        }
        if (!placed) {
            task.lane = laneEnds.length;
            laneEnds.push(task.end.getTime());
        }
    });

    return Math.max(1, laneEnds.length);
}

/**
 * Sweep-line max concurrent count for a set of assignments.
 * Optionally clamp to a visible window [windowStart, windowEnd].
 */
export function maxConcurrent(
    tasks: TaskRow[],
    windowStart?: Date | null,
    windowEnd?: Date | null
): number {
    if (tasks.length === 0) {
        return 0;
    }

    type Edge = { t: number; delta: number };
    const edges: Edge[] = [];

    tasks.forEach((task) => {
        let start = task.start.getTime();
        let end = task.end.getTime();
        if (windowStart && windowEnd) {
            const ws = windowStart.getTime();
            const we = windowEnd.getTime();
            if (end <= ws || start >= we) {
                return;
            }
            start = Math.max(start, ws);
            end = Math.min(end, we);
        }
        // Zero-length still counts as present for that instant.
        if (end <= start) {
            end = start + 1;
        }
        edges.push({ t: start, delta: 1 });
        edges.push({ t: end, delta: -1 });
    });

    if (edges.length === 0) {
        return 0;
    }

    edges.sort((a, b) => a.t - b.t || a.delta - b.delta);

    let current = 0;
    let peak = 0;
    edges.forEach((edge) => {
        current += edge.delta;
        if (current > peak) {
            peak = current;
        }
    });
    return peak;
}

/**
 * Per-task concurrency = how many tasks (including self) overlap this one.
 */
export function annotateConcurrency(tasks: TaskRow[]): void {
    tasks.forEach((task) => {
        task.concurrency = Math.max(
            1,
            tasks.filter((other) => task.id === other.id || rangesOverlap(task, other)).length
        );
    });
}

/**
 * Group assignments by resource, assign swimlanes, compute load badges.
 */
export function buildResourceRows(tasks: TaskRow[]): ResourceRow[] {
    const byResource = new Map<string, TaskRow[]>();

    tasks.forEach((task) => {
        const key = task.resource;
        const list = byResource.get(key);
        if (list) {
            list.push(task);
        } else {
            byResource.set(key, [task]);
        }
    });

    const resources: ResourceRow[] = [];
    const names = [...byResource.keys()].sort((a, b) => a.localeCompare(b));

    names.forEach((name) => {
        const resourceTasks = byResource.get(name) ?? [];
        annotateConcurrency(resourceTasks);
        const laneCount = assignLanes(resourceTasks);
        const peak = maxConcurrent(resourceTasks);

        resources.push({
            id: `resource::${name}`,
            resource: name,
            tasks: resourceTasks,
            laneCount,
            maxConcurrent: peak,
            visibleLoad: peak,
            y: 0,
            height: 0
        });
    });

    return resources;
}

/**
 * Lay out resource rows with heights based on lane count × bar size.
 * Updates visibleLoad for the optional time window.
 */
export function layoutResourceRows(
    resources: ResourceRow[],
    barHeight: number,
    rowGap: number,
    plotTop: number,
    windowStart?: Date | null,
    windowEnd?: Date | null
): number {
    const laneGap = Math.max(2, Math.round(barHeight * 0.12));
    let y = plotTop;

    resources.forEach((row) => {
        row.visibleLoad = maxConcurrent(row.tasks, windowStart, windowEnd);
        const lanes = Math.max(1, row.laneCount);
        const inner = lanes * barHeight + (lanes - 1) * laneGap;
        row.height = Math.max(barHeight + rowGap, inner + rowGap);
        row.y = y;
        y += row.height;
    });

    return y;
}

export function laneY(
    resource: ResourceRow,
    lane: number,
    barHeight: number
): number {
    const laneGap = Math.max(2, Math.round(barHeight * 0.12));
    const lanes = Math.max(1, resource.laneCount);
    const inner = lanes * barHeight + (lanes - 1) * laneGap;
    const offset = (resource.height - inner) / 2;
    return resource.y + offset + lane * (barHeight + laneGap);
}
