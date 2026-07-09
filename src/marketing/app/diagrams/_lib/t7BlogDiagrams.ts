import type { FeatureDiagramSpec } from './featureDiagram'

export const t7DynamicBaseFeeRangeSpec: FeatureDiagramSpec = {
  kind: 'feeRange',
  title: 'DYNAMIC BASE FEE RANGE',
  subtitle: '50K GAS TIP-20 TRANSFER COST',
  markers: [
    {
      accent: 1,
      label: 'TODAY',
      value: '$0.001',
      detail: 'FIXED FEE',
      ratio: 1,
      muted: true,
    },
    {
      accent: 2,
      label: 'T7 CAP',
      value: '$0.0006',
      detail: '40% LOWER',
      ratio: 0.6,
    },
    {
      accent: 3,
      label: 'T7 FLOOR',
      value: '$0.00003',
      detail: '20X BELOW CAP',
      ratio: 0.03,
    },
  ],
  rangeAccent: 2,
  rangeLabel: 'BOUNDED RANGE',
  caption: 'THE CAP STAYS HARD. QUIET PERIODS CAN PRICE LOWER.',
}

export const t7DynamicBaseFeeResponseSpec: FeatureDiagramSpec = {
  kind: 'feeResponse',
  title: 'BASE FEE RESPONDS TO BLOCK USE',
  subtitle: 'THE LIVE FEE MOVES BETWEEN THE T7 CAP AND FLOOR',
  capLabel: 'CAP',
  floorLabel: 'FLOOR',
  targetLabel: 'TARGET',
  quietLabel: 'BELOW TARGET',
  busyLabel: 'USAGE RISES',
  accent: 2,
  steps: [
    {
      accent: 1,
      label: 'START',
      detail: 'AT CAP',
      feeRatio: 1,
      usageRatio: 0.74,
    },
    {
      accent: 2,
      label: 'LOW',
      detail: 'FALLS',
      feeRatio: 0.64,
      usageRatio: 0.24,
    },
    {
      accent: 3,
      label: 'QUIET',
      detail: 'NEAR FLOOR',
      feeRatio: 0.05,
      usageRatio: 0.12,
    },
    {
      accent: 2,
      label: 'BUSY',
      detail: 'RISES',
      feeRatio: 0.54,
      usageRatio: 0.7,
    },
    {
      accent: 1,
      label: 'FULL',
      detail: 'AT CAP',
      feeRatio: 1,
      usageRatio: 1,
    },
  ],
  caption: 'LOW BLOCK USAGE PULLS FEES DOWN. BUSIER BLOCKS MOVE FEES BACK UP.',
}
