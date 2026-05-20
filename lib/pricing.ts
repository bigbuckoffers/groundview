export const packages = {
  // Single family base
  standard_lockbox:   { name: 'Interior/Exterior – Vacant with Lockbox',      price: 9500,  label: '$95' },
  standard_appt:      { name: 'Interior/Exterior – Requires Appointment',      price: 9500,  label: '$95' },
  // Speed upgrades (added to base)
  rush_addon:         { name: 'Priority 24-Hour Upgrade',                      price: 2500,  label: '+$25' },
  rocket_addon:       { name: '6-Hour Express Upgrade',                        price: 4500,  label: '+$45' },
  // Multi-unit addon (per additional unit)
  unit_addon:         { name: 'Additional Unit Surcharge',                     price: 2000,  label: '+$20/unit' },
};

export type PackageKey = keyof typeof packages;

export const BASE_PRICE = 9500; // cents

export const PROP_ADDON_CENTS: Record<string, number> = {
  single:   0,
  duplex:   2000,
  triplex:  4000,
  fourplex: 6000,
};

export const SPEED_ADDON_CENTS: Record<string, number> = {
  std:    0,
  rush:   2500,
  rocket: 4500,
};
