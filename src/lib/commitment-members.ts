/** Split a Members field into trimmed, non-empty names for the `appliesTo` chips. */
export function parseMemberOptions(members: string): string[] {
  return members
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}
