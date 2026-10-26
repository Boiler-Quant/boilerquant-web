// Small shared helpers for pages.
// Note: dates written in Markdown frontmatter ("2026-09-15") are parsed as UTC
// midnight, so they must be formatted in UTC or they show the previous day.
export const formatDate = (d: Date) =>
	d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// Short form, e.g. "Sep 2"
export const formatShortDate = (d: Date) =>
	d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

export const byDateDesc = <T extends { data: { date: Date } }>(a: T, b: T) =>
	b.data.date.getTime() - a.data.date.getTime();

// "A", "A and B", "A, B, and C"
export const nameList = (names: string[]) =>
	new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(names);

// "Led by A and B", or undefined when there are no leads
export const leadsLine = (leads: string[]) => (leads.length ? `Led by ${nameList(leads)}` : undefined);
