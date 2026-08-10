"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

export const ROLE_TASK = "task";
export const ROLE_START = "startDate";
export const ROLE_END = "endDate";
export const ROLE_DURATION = "duration";
export const ROLE_PROGRESS = "progress";
export const ROLE_GROUP = "group";
export const ROLE_RESOURCE = "resource";
export const ROLE_TOOLTIPS = "tooltipFields";

export interface TooltipField {
    displayName: string;
    value: string | number | Date | null;
}

export interface TaskRow {
    id: string;
    task: string;
    resource: string;
    start: Date;
    end: Date;
    durationDays: number;
    progress: number | null;
    group: string | null;
    flaggedInvalidRange: boolean;
    tooltipFields: TooltipField[];
    selectionId: ISelectionId | null;
    /** Lane index within the resource row (0-based). Set by load.ts. */
    lane: number;
    /** Peak concurrent count overlapping this assignment in the resource. */
    concurrency: number;
}

export interface ResourceRow {
    id: string;
    resource: string;
    tasks: TaskRow[];
    laneCount: number;
    /** Max concurrent assignments in the full data domain. */
    maxConcurrent: number;
    /** Max concurrent in the visible time window (set during layout). */
    visibleLoad: number;
    y: number;
    height: number;
}

export type AxisGranularity = "day" | "week" | "month" | "quarter";
export type AxisGranularityOption = "auto" | AxisGranularity;
export type AxisLabelFormat = "date" | "week" | "both";
/** Format → General → Color by (`colorBy`). Values: single · task · concurrency. */
export type ColorBy = "single" | "task" | "concurrency";

export interface ViewModel {
    tasks: TaskRow[];
    resources: ResourceRow[];
    domainStart: Date | null;
    domainEnd: Date | null;
    granularity: AxisGranularity;
    errorMessage: string | null;
}

export interface RoleColumnIndex {
    task: number | null;
    startDate: number | null;
    endDate: number | null;
    duration: number | null;
    progress: number | null;
    group: number | null;
    resource: number | null;
    tooltips: number[];
}
