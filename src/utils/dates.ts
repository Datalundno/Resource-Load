"use strict";

import { AxisGranularity } from "../data/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Parse Power BI cell values that may arrive as Date or string.
 */
export function parseDate(value: unknown): Date | null {
    if (value == null || value === "") {
        return null;
    }

    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : new Date(value.getTime());
    }

    if (typeof value === "number" && isFinite(value)) {
        // Power BI sometimes sends OLE Automation dates or epoch ms;
        // treat large numbers as epoch ms, small as days since 1899-12-30.
        if (value > 1e11) {
            const d = new Date(value);
            return isNaN(d.getTime()) ? null : d;
        }
        if (value > 20000 && value < 100000) {
            const oleEpoch = Date.UTC(1899, 11, 30);
            const d = new Date(oleEpoch + value * MS_PER_DAY);
            return isNaN(d.getTime()) ? null : d;
        }
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) {
            return null;
        }
        const parsed = new Date(trimmed);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
}

export function addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Calendar months forward/back from a date (clamps day-of-month). */
export function addMonths(date: Date, months: number): Date {
    const result = new Date(date.getTime());
    const day = result.getDate();
    result.setDate(1);
    result.setMonth(result.getMonth() + months);
    const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(day, lastDay));
    return result;
}

/** Local calendar day at 00:00:00. */
export function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function dayDiff(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / MS_PER_DAY;
}

/**
 * Normalize progress that may be 0–1 or 0–100. Returns 0–1 or null.
 */
export function normalizeProgress(value: unknown): number | null {
    if (value == null || value === "") {
        return null;
    }
    const n = typeof value === "number" ? value : Number(value);
    if (!isFinite(n)) {
        return null;
    }
    if (n < 0) {
        return 0;
    }
    if (n <= 1) {
        return n;
    }
    if (n <= 100) {
        return n / 100;
    }
    return 1;
}

export function chooseGranularity(start: Date, end: Date): AxisGranularity {
    const days = Math.max(1, dayDiff(start, end));
    if (days <= 21) {
        return "day";
    }
    if (days <= 90) {
        return "week";
    }
    if (days <= 540) {
        return "month";
    }
    return "quarter";
}

export function toDisplayString(value: string | number | Date | null): string {
    if (value == null) {
        return "";
    }
    if (value instanceof Date) {
        return value.toLocaleDateString();
    }
    return String(value);
}
