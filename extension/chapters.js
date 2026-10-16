"use strict";
var DGChapters = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // shared/chapters.ts
  var chapters_exports = {};
  __export(chapters_exports, {
    chapter: () => chapter,
    defaultChapters: () => defaultChapters,
    evaluateChapterCollection: () => evaluateChapterCollection,
    evaluateCommitmentRules: () => evaluateCommitmentRules
  });

  // shared/commitment-rules.ts
  function parseClock(value) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
    if (!m) return null;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h > 23 || min > 59) return null;
    return h * 60 + min;
  }
  var WEEKDAYS = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };
  function zonedParts(now, timezone) {
    let parts;
    try {
      parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).formatToParts(now);
    } catch {
      return { day: -1, minutes: -1 };
    }
    const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
    const hour = Number(get("hour")) % 24;
    const minute = Number(get("minute"));
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return { day: -1, minutes: -1 };
    }
    return {
      day: WEEKDAYS[get("weekday")] ?? -1,
      minutes: hour * 60 + minute
    };
  }
  function windowCovers(window, day, minutes) {
    const start = parseClock(window.start);
    const end = parseClock(window.end);
    if (start === null || end === null) return false;
    if (start <= end) {
      return window.days.includes(day) && minutes >= start && minutes < end;
    }
    if (window.days.includes(day) && minutes >= start) return true;
    const prevDay = (day + 6) % 7;
    return window.days.includes(prevDay) && minutes < end;
  }
  function hostMatches(rule, hostname) {
    const clean = rule.trim().toLowerCase().replace(/^www\./, "");
    const host = hostname.toLowerCase().replace(/^www\./, "");
    if (!clean) return false;
    return host === clean || host.endsWith(`.${clean}`);
  }
  function evaluateCommitmentRules(commitments, input) {
    for (const commitment of commitments) {
      const rules = commitment.rules;
      if (!rules?.entries?.length) continue;
      if (!rules.timezone) continue;
      const { day, minutes } = zonedParts(input.now, rules.timezone);
      if (day < 0) continue;
      for (const entry of rules.entries) {
        if (!entry.domains.some((d) => hostMatches(d, input.hostname))) continue;
        if (entry.appliesTo.length > 0) {
          if (!input.member) continue;
          const names = entry.appliesTo.map((n) => n.trim().toLowerCase());
          if (!names.includes(input.member.trim().toLowerCase())) continue;
        }
        if (!entry.windows.some((w) => windowCovers(w, day, minutes))) continue;
        return {
          blocked: true,
          commitmentId: commitment.id,
          title: commitment.title,
          terms: commitment.terms,
          agreedBy: commitment.members
        };
      }
    }
    return { blocked: false };
  }

  // shared/chapters.ts
  function chapter(id, title, summary, memberIds, rules = null) {
    return { id, title, summary, memberIds, rules: rules ?? null };
  }
  function evaluateChapterCollection(collection, hostname, now) {
    const verdicts = [];
    for (const chapter2 of collection.chapters) {
      if (!chapter2.rules) continue;
      const commitments = [
        {
          id: 0,
          title: chapter2.title,
          terms: chapter2.summary,
          members: chapter2.memberIds.join(","),
          rules: chapter2.rules
        }
      ];
      const result = evaluateCommitmentRules(commitments, {
        hostname: String(hostname ?? "").toLowerCase(),
        member: null,
        now
      });
      if (result.blocked) {
        verdicts.push({ ...result, chapterId: chapter2.id });
      }
    }
    return verdicts;
  }
  function defaultChapters() {
    return [
      chapter(
        "no-phone-after-8",
        "No phones after 8",
        "We keep our phones off after 8pm so everyone can rest.",
        ["member-1"],
        {
          timezone: "Asia/Dubai",
          entries: [
            {
              domains: ["instagram.com", "m.instagram.com"],
              windows: [{ days: [0, 1, 2, 3, 4], start: "20:00", end: "07:00" }],
              appliesTo: [],
              action: "block"
            }
          ]
        }
      ),
      chapter(
        "weekend-stream-stop",
        "Stop the stream at 6pm",
        "When the weekend stream ends, the family does something else together.",
        ["member-1", "member-2"],
        {
          timezone: "Asia/Dubai",
          entries: [
            {
              domains: ["youtube.com", "tiktok.com"],
              windows: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "18:00", end: "00:00" }],
              appliesTo: [],
              action: "block"
            }
          ]
        }
      )
    ];
  }
  return __toCommonJS(chapters_exports);
})();
