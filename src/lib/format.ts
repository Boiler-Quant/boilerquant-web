// Small shared helpers for pages.
export const formatDate = (d: Date) =>
	d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const byDateDesc = <T extends { data: { date: Date } }>(a: T, b: T) =>
	b.data.date.getTime() - a.data.date.getTime();
