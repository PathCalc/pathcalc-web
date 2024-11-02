import { DimensionDomainConfig, IDimension } from './dimension-config-schema';

export class Dimension implements IDimension {
  public readonly dimensionLinks: Map<string, Dimension> = new Map();
  public readonly domainValuesSet: ReadonlySet<string>;

  constructor(
    public readonly id: string,
    public readonly domain: DimensionDomainConfig,
    public readonly label?: string,
  ) {
    this.domainValuesSet = new Set(domain.map((d) => d.id));
  }

  public log() {
    console.log(`${this.id}:`);
    console.table(this.domain);
  }
}
