export type EstimateCategory = {
  icon: string;
  name: string;
  sub: string;
  low: number;
  high: number;
  items: { name: string; cost: string }[];
};

const repairMap: Record<string, EstimateCategory> = {
  HVAC: { icon:'🔧', name:'HVAC', sub:'Service, repair, or replacement allowance', low:5000, high:11000, items:[{name:'System diagnostic',cost:'$150–$350'},{name:'Condenser/air handler allowance',cost:'$4,500–$9,500'},{name:'Thermostat + startup',cost:'$250–$600'}] },
  Plumbing: { icon:'🚿', name:'Plumbing', sub:'Fixture and line repair allowance', low:3000, high:8500, items:[{name:'Fixture replacements',cost:'$800–$2,500'},{name:'Leak repairs / valves',cost:'$600–$2,000'},{name:'Water heater allowance',cost:'$1,200–$2,500'}] },
  Electrical: { icon:'⚡', name:'Electrical', sub:'Safety and fixture update allowance', low:3500, high:9000, items:[{name:'Panel inspection/upgrades',cost:'$1,500–$4,000'},{name:'GFCI/outlet updates',cost:'$500–$1,500'},{name:'Light fixtures + smoke detectors',cost:'$800–$2,000'}] },
  Windows: { icon:'🪟', name:'Windows', sub:'Window repair/replacement allowance', low:3000, high:12000, items:[{name:'Replace damaged windows',cost:'$450–$900 each'},{name:'Screens/locks/seals',cost:'$300–$1,200'}] },
  Roof: { icon:'🏠', name:'Roof', sub:'Roof repair or replacement allowance', low:8000, high:18000, items:[{name:'Tear-off and disposal',cost:'Included'},{name:'Architectural shingles',cost:'$7,000–$15,000'},{name:'Flashing, vents, ridge cap',cost:'$1,000–$3,000'}] },
  Paint: { icon:'🎨', name:'Paint', sub:'Interior repaint allowance', low:4500, high:9000, items:[{name:'Prep and patch walls',cost:'$750–$1,500'},{name:'Two-coat interior paint',cost:'$3,000–$6,500'},{name:'Trim/doors/ceilings',cost:'$750–$1,500'}] },
  Flooring: { icon:'🪵', name:'Flooring', sub:'LVP/carpet replacement allowance', low:7000, high:15000, items:[{name:'Remove existing flooring',cost:'$800–$1,600'},{name:'LVP material + install',cost:'$5,500–$12,000'},{name:'Transitions/baseboards allowance',cost:'$700–$1,400'}] },
  Doors: { icon:'🚪', name:'Doors', sub:'Interior/exterior door allowance', low:1200, high:4500, items:[{name:'Interior doors/hardware',cost:'$150–$350 each'},{name:'Exterior/security door allowance',cost:'$600–$1,800'}] },
  Foundation: { icon:'🧱', name:'Foundation', sub:'Engineer review and repair allowance', low:9000, high:30000, items:[{name:'Engineer report',cost:'$500–$1,200'},{name:'Pier/underpinning allowance',cost:'$8,000–$25,000'},{name:'Crack/settlement repairs',cost:'$500–$3,800'}] },
  'Kitchen/Bath': { icon:'🛁', name:'Kitchen/Bath', sub:'Investor-grade refresh allowance', low:12000, high:35000, items:[{name:'Kitchen cabinets/counters allowance',cost:'$7,000–$18,000'},{name:'Bath refreshes',cost:'$3,500–$10,000 each'},{name:'Fixtures, tile, punch list',cost:'$1,500–$5,000'}] },
};

export function buildDemoEstimate(address: string, repairTypes: string[], notes: string) {
  const normalized = repairTypes.map(t => t.replace(/[🔧🚿⚡🪟🏠🎨🪵🚪🧱🛁]/g, '').trim());
  const chosen = normalized.length ? normalized : ['Paint', 'Flooring', 'Plumbing', 'Electrical'];
  const categories = chosen.map(t => repairMap[t]).filter(Boolean);
  const totalLow = categories.reduce((sum, c) => sum + c.low, 0);
  const totalHigh = categories.reduce((sum, c) => sum + c.high, 0);
  return {
    total_low: totalLow,
    total_high: totalHigh,
    confidence: notes || address ? 78 : 62,
    market: address || 'Subject Market',
    categories,
  };
}
