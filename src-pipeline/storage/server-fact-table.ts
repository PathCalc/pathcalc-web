import { ColumnTable, from } from 'arquero';
import { inferSchema, initParser } from 'udsv';

import { Dataset } from '~shared/pipeline/models/dataset/types';
import { SourceFactTable, WebFactTable } from '~shared/pipeline/models/fact-table/fact-table';
import {
  FactTableConfigColumn,
  FactTableStorageType,
} from '~shared/pipeline/models/fact-table/fact-table-config-schema';
import { UnexpectedError } from '~shared/pipeline/utils/errors';

export class ServerSourceFactTable extends SourceFactTable {
  constructor(
    id: string,
    type: 'raw',
    sharding: string[],
    storage: { type: FactTableStorageType; pattern: string },
    columns: FactTableConfigColumn[],
  ) {
    super(id, type, sharding, storage, columns);
  }
  async dryRunLoad(): Promise<void> {
    if (this.storage.type === 'local-public') {
      throw new Error('Server-side pipeline should not load datasets intended for the web');
    }
  }
  async dryRunSave(): Promise<void> {
    if (this.storage.type === 'local-input') {
      throw new Error('Server-side pipeline should not save datasets back to the input directory');
    }
  }

  async load(shard: Record<string, string>): Promise<ColumnTable> {
    if (this.storage.type === 'local-public') {
      throw new Error('Server-side pipeline should not load datasets intended for the web');
    } else if (this.storage.type === 'local-input') {
      const basePath = `input/data/fact-tables/${this.id}/`;

      const shardPath = interpolateShardPath(this.storage.pattern, shard);

      const csvText = await Bun.file(`${basePath}${shardPath}`).text();
      const schema = inferSchema(csvText);

      schema.cols.forEach((c) => {
        const colDef = this.columns.find((cc) => cc.name === c.name);
        if (colDef == null) {
          throw new Error(`Column ${c.name} present in data file, not found in definition of fact table ${this.id}`);
        }
        if (colDef.type === 'measure') {
          c.type = 'n';
        } else {
          c.type = 's';
        }
      });

      const parser = initParser(schema);

      const csvObjects = parser.typedObjs(csvText);

      return from(csvObjects);
    } else {
      throw new Error('Unknown storage type.');
    }
  }

  async save(shard: Record<string, string>, data: ColumnTable): Promise<void> {
    if (this.storage.type === 'local-input') {
      throw new Error('Server-side pipeline should not save datasets back to the input directory');
    } else if (this.storage.type === 'local-public') {
      const basePath = `public/data/fact-tables/${this.id}/`;
      const shardPath = interpolateShardPath(this.storage.pattern, shard);

      const csvText = data.toCSV();

      await Bun.write(`${basePath}${shardPath}`, csvText);

      return;
    } else {
      throw new Error('Unknown storage type.');
    }
  }
}

export class ServerWebFactTable extends WebFactTable {
  async dryRunLoad(): Promise<void> {
    if (this.storage.type === 'local-public') {
      throw new Error('Server-side pipeline should not load datasets intended for the web');
    }
  }
  async dryRunSave(): Promise<void> {
    if (this.storage.type === 'local-input') {
      throw new Error('Server-side pipeline should not save datasets back to the input directory');
    }
  }

  async load(shard: Record<string, string>): Promise<ColumnTable> {
    if (this.storage.type === 'local-public') {
      throw new Error('Server-side pipeline should not load datasets intended for the web');
    } else {
      throw new UnexpectedError('Encountered a fact table marked as web, but with local-input storage');
    }
  }
  async save(shard: Record<string, string>, data: ColumnTable): Promise<void> {
    const basePath = `public/data/fact-tables/${this.id}/`;
    const shardPath = interpolateShardPath(this.storage.pattern, shard);

    const csvText = data.toCSV();

    await Bun.write(`${basePath}${shardPath}`, csvText);

    return;
  }

  async saveDataset(dataset: Dataset): Promise<void> {
    const filePath = `public/data/fact-tables/${this.id}/_meta.json`;
    await Bun.write(filePath, JSON.stringify(dataset));
  }
}

function interpolateShardPath(pattern: string, shard: Record<string, string>) {
  return pattern.replace(/{([^}]+)}/g, (_, key) => shard[key]);
}
