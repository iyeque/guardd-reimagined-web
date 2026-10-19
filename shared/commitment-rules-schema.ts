import { z } from "zod";

/**
 * Validator for a commitment's enforcement rules — the shape the Commitment
 * Extension actually enforces (see shared/commitment-rules.ts).
 *
 * Nullable so commitments created before rules existed stay valid, and null
 * must keep meaning "enforce nothing".
 *
 * The scope/domains invariants live here, not only in the authoring UI. The
 * extension reads an empty domain list as "every site", so a specific-scope
 * rule that names nothing would silently blanket-block the household, while an
 * all-sites rule carrying domains would silently narrow to just those sites.
 * Both are rejected rather than trusted from the client.
 */
export const commitmentRulesSchema = z
  .object({
    timezone: z.string().min(1),
    entries: z
      .array(
        z
          .object({
            scope: z.enum(["specific", "all", "all-except"]).optional(),
            domains: z.array(z.string().min(1)),
            exceptDomains: z.array(z.string().min(1)).optional(),
            windows: z.array(
              z.object({
                days: z.array(z.number().int().min(0).max(6)),
                start: z.string().regex(/^\d{1,2}:\d{2}$/),
                end: z.string().regex(/^\d{1,2}:\d{2}$/),
              }),
            ),
            appliesTo: z.array(z.string()),
            action: z.enum(["block", "remind"]),
          })
          .refine((entry) => entry.scope !== "specific" || entry.domains.length > 0, {
            message: "A specific-scope rule must name at least one site.",
            path: ["domains"],
          })
          .refine(
            (entry) =>
              entry.scope !== "all" ||
              (entry.domains.length === 0 && (entry.exceptDomains ?? []).length === 0),
            { message: "An all-sites rule must not name sites.", path: ["domains"] },
          )
          .refine(
            (entry) =>
              entry.scope !== "all-except" ||
              (entry.domains.length === 0 && (entry.exceptDomains ?? []).length > 0),
            {
              message: "An all-sites-except rule must list the sites to leave open.",
              path: ["exceptDomains"],
            },
          )
          // An exception list only means something on a rule that covers
          // everything; alongside named sites it would be silently ignored.
          .refine((entry) => (entry.exceptDomains ?? []).length === 0 || entry.domains.length === 0, {
            message: "An except list only applies to a rule that covers all sites.",
            path: ["exceptDomains"],
          }),
      )
      .min(1),
  })
  .nullable();
