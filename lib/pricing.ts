export const packages = {
  standard: { name: 'Standard Photo Package', price: 14900, label: '$149' },
  rush: { name: 'Rush 24-Hour Package', price: 24900, label: '$249' },
  premium: { name: 'Premium Photo + Condition Report', price: 34900, label: '$349' },
};

export type PackageKey = keyof typeof packages;
