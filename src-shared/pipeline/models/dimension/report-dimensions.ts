import { Dimension } from './dimension';

export function reportDimensions(dimensions: Dimension[]) {
  console.table(
    dimensions.map((d) => ({
      id: d.id,
      label: d.label,
      valueCount: d.domainValuesSet.size,
      links: [...d.dimensionLinks.values()].map((x) => x.id).join(', '),
    })),
  );
}
