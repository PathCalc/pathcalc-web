import { from } from 'arquero';
import { expect, test } from 'vitest';

import { Dataset, DatasetShard, ReadonlyDataset } from '~shared/pipeline/models/dataset/types';
import { PipelineEnvironment } from '~shared/pipeline/models/pipeline/pipeline-environment';
import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

import { AggregateStep } from './aggregate-step';

const dataset: Dataset = {
  columns: [
    {
      name: 'YEAR',
      type: 'dimension',
      domainType: 'linked',
      domain: {
        id: 'YEAR',
        label: 'Year',
        content: {
          table: [
            { id: '2019', Period: '2010-2030' },
            { id: '2020', Period: '2010-2030' },
            { id: '2021', Period: '2010-2030' },
          ],
          columns: [
            { name: 'id', type: 'metadata' },
            { name: 'Period', type: 'dimension', domainType: 'local', domain: [{ id: '2010-2030' }] },
          ],
        },
      },
    },
    {
      name: 'TECHNOLOGY',
      type: 'dimension',
      domainType: 'linked',
      domain: {
        id: 'TECHNOLOGY',
        label: 'Technology',
        content: {
          table: [
            {
              id: 'BLDDSLBIO',
              label: 'Blending Technology for Diesel and Biodiesel',
              Sector: 'BLD',
              Type: 'DSLBIO',
            },
            {
              id: 'BLDDSLBIO2',
              label: 'Blending Technology for Diesel and Biodiesel 2',
              Sector: 'BLD',
              Type: 'DSLBIO',
            },
          ],
          columns: [
            { name: 'id', type: 'metadata' },
            { name: 'label', type: 'metadata' },
            {
              name: 'Sector',
              type: 'dimension',
              domainType: 'linked',
              domain: {
                id: 'Sector',
                label: 'Sector',
                content: {
                  table: [{ id: 'BLD', label: 'Blending', color: '#ff0000', Random: 'Foo' }],
                  columns: [
                    { name: 'id', type: 'metadata' },
                    { name: 'label', type: 'metadata' },
                    { name: 'color', type: 'metadata' },
                    {
                      name: 'Random',
                      type: 'dimension',
                      domainType: 'local',
                      domain: [{ id: 'Foo' }],
                    },
                  ],
                },
              },
            },
            {
              name: 'Type',
              type: 'dimension',
              domainType: 'linked',
              domain: {
                id: 'Type',
                label: 'Type',
                content: {
                  table: [{ id: 'DSLBIO', label: 'Diesel and Biodiesel', color: '#00ff00' }],
                  columns: [
                    { name: 'id', type: 'metadata' },
                    { name: 'label', type: 'metadata' },
                    { name: 'color', type: 'metadata' },
                  ],
                },
              },
            },
          ],
        },
      },
    },
    {
      name: 'COMMODITY',
      type: 'dimension',
      domainType: 'linked',
      domain: {
        id: 'COMMODITY',
        label: 'Commodity',
        content: {
          table: [{ id: 'DSLBIO', label: 'Blended Dioesel and Bio Diesel', color: '#ff0000', Type: 'DSLBIO' }, {}],
          columns: [
            { name: 'id', type: 'metadata' },
            { name: 'label', type: 'metadata' },
            { name: 'color', type: 'metadata' },
            {
              name: 'Type',
              type: 'dimension',
              domainType: 'linked',
              domain: {
                id: 'Type',
                label: 'Type',
                content: {
                  table: [{ id: 'DSLBIO', label: 'Diesel and Biodiesel', color: '#00ff00' }],
                  columns: [
                    { name: 'id', type: 'metadata' },
                    { name: 'label', type: 'metadata' },
                    { name: 'color', type: 'metadata' },
                  ],
                },
              },
            },
          ],
        },
      },
    },
    {
      name: 'VALUE',
      type: 'measure',
      label: 'Sales',
    },
  ],
  sharding: ['Scenario'],
};

const datasetAfter: Dataset = {
  columns: [
    {
      name: 'YEAR',
      type: 'dimension',
      domainType: 'linked',
      domain: {
        id: 'YEAR',
        label: 'Year',
        content: {
          table: [
            { id: '2019', Period: '2010-2030' },
            { id: '2020', Period: '2010-2030' },
            { id: '2021', Period: '2010-2030' },
          ],
          columns: [
            { name: 'id', type: 'metadata' },
            { name: 'Period', type: 'dimension', domainType: 'local', domain: [{ id: '2010-2030' }] },
          ],
        },
      },
    },
    {
      name: 'VALUE',
      type: 'measure',
      label: 'Sales',
    },
    {
      name: 'TECHNOLOGY:Sector:Random',
      label: 'Random',
      type: 'dimension',
      domainType: 'local',
      domain: [{ id: 'Foo' }],
    },
  ],

  sharding: ['Scenario'],
};

test('aggregate double-nested column: dryRun', async () => {
  const aggStep = new AggregateStep({
    $: 'aggregate',
    groupby: ['YEAR', 'TECHNOLOGY:Sector:Random'],
  });

  const ctx = new ProcessingContext();
  const env = new PipelineEnvironment('server', new Map(), new Map());
  const tempVars = new Map<string, ReadonlyDataset>();

  const newDataset = aggStep.dryRun(ctx, dataset, env, tempVars);

  await expect(newDataset).resolves.toEqual(datasetAfter);
});

const datasetAfter2: Dataset = {
  columns: [
    {
      name: 'YEAR',
      type: 'dimension',
      domainType: 'linked',
      domain: {
        id: 'YEAR',
        label: 'Year',
        content: {
          table: [
            { id: '2019', Period: '2010-2030' },
            { id: '2020', Period: '2010-2030' },
            { id: '2021', Period: '2010-2030' },
          ],
          columns: [
            { name: 'id', type: 'metadata' },
            { name: 'Period', type: 'dimension', domainType: 'local', domain: [{ id: '2010-2030' }] },
          ],
        },
      },
    },
    {
      name: 'VALUE',
      type: 'measure',
      label: 'Sales',
    },
    {
      name: 'TECHNOLOGY:Sector',
      label: 'Sector',
      type: 'dimension',
      domainType: 'linked',
      domain: {
        id: 'Sector',
        label: 'Sector',
        content: {
          table: [{ id: 'BLD', label: 'Blending', color: '#ff0000', Random: 'Foo' }],
          columns: [
            { name: 'id', type: 'metadata' },
            { name: 'label', type: 'metadata' },
            { name: 'color', type: 'metadata' },
            {
              name: 'Random',
              type: 'dimension',
              domainType: 'local',
              domain: [{ id: 'Foo' }],
            },
          ],
        },
      },
    },
  ],

  sharding: ['Scenario'],
};

test('aggregate single-nested column: dryRun', async () => {
  const aggStep = new AggregateStep({
    $: 'aggregate',
    groupby: ['YEAR', 'TECHNOLOGY:Sector'],
  });

  const ctx = new ProcessingContext();
  const env = new PipelineEnvironment('server', new Map(), new Map());
  const tempVars = new Map<string, ReadonlyDataset>();

  const newDataset = aggStep.dryRun(ctx, dataset, env, tempVars);

  await expect(newDataset).resolves.toEqual(datasetAfter2);
});

const datasetAfter3: Dataset = {
  columns: [
    {
      name: 'YEAR',
      type: 'dimension',
      domainType: 'linked',
      domain: {
        id: 'YEAR',
        label: 'Year',
        content: {
          table: [
            { id: '2019', Period: '2010-2030' },
            { id: '2020', Period: '2010-2030' },
            { id: '2021', Period: '2010-2030' },
          ],
          columns: [
            { name: 'id', type: 'metadata' },
            { name: 'Period', type: 'dimension', domainType: 'local', domain: [{ id: '2010-2030' }] },
          ],
        },
      },
    },
    {
      name: 'VALUE',
      type: 'measure',
      label: 'Sales',
    },
    {
      name: 'TECHNOLOGY:Sector',
      label: 'Sector',
      type: 'dimension',
      domainType: 'linked',
      domain: {
        id: 'Sector',
        label: 'Sector',
        content: {
          table: [{ id: 'BLD', label: 'Blending', color: '#ff0000', Random: 'Foo' }],
          columns: [
            { name: 'id', type: 'metadata' },
            { name: 'label', type: 'metadata' },
            { name: 'color', type: 'metadata' },
            {
              name: 'Random',
              type: 'dimension',
              domainType: 'local',
              domain: [{ id: 'Foo' }],
            },
          ],
        },
      },
    },
    {
      name: 'COMMODITY:Type',
      label: 'Type',
      type: 'dimension',
      domainType: 'linked',
      domain: {
        id: 'Type',
        label: 'Type',
        content: {
          table: [{ id: 'DSLBIO', label: 'Diesel and Biodiesel', color: '#00ff00' }],
          columns: [
            { name: 'id', type: 'metadata' },
            { name: 'label', type: 'metadata' },
            { name: 'color', type: 'metadata' },
          ],
        },
      },
    },
  ],
  sharding: ['Scenario'],
};

test('aggregate by two single-nested columns: dryRun', async () => {
  const aggStep = new AggregateStep({
    $: 'aggregate',
    groupby: ['YEAR', 'TECHNOLOGY:Sector', 'COMMODITY:Type'],
  });

  const ctx = new ProcessingContext();
  const env = new PipelineEnvironment('server', new Map(), new Map());
  const tempVars = new Map<string, ReadonlyDataset>();

  const newDataset = aggStep.dryRun(ctx, dataset, env, tempVars);

  await expect(newDataset).resolves.toEqual(datasetAfter3);
});

const datasetShard: DatasetShard = {
  shard: {
    Scenario: '11',
  },
  table: from([
    { YEAR: '2019', TECHNOLOGY: 'BLDDSLBIO', VALUE: 1000 },
    { YEAR: '2019', TECHNOLOGY: 'BLDDSLBIO2', VALUE: 1000 },
    { YEAR: '2020', TECHNOLOGY: 'BLDDSLBIO', VALUE: 2000 },
    { YEAR: '2020', TECHNOLOGY: 'BLDDSLBIO2', VALUE: 2000 },
    { YEAR: '2021', TECHNOLOGY: 'BLDDSLBIO', VALUE: 3000 },
    { YEAR: '2021', TECHNOLOGY: 'BLDDSLBIO2', VALUE: 3000 },
  ]),
};

test('aggregate single-nested column: processShard', async () => {
  const aggStep = new AggregateStep({
    $: 'aggregate',
    groupby: ['YEAR', 'TECHNOLOGY:Sector'],
  });

  const ctx = new ProcessingContext();
  const env = new PipelineEnvironment('server', new Map(), new Map());

  await aggStep.dryRun(ctx, dataset, env, new Map());

  const newDatasetShard = await aggStep.processShard(ctx, datasetShard, new Map());

  expect(newDatasetShard.table).toBeDefined();
  expect(newDatasetShard.table!.orderby('YEAR', 'TECHNOLOGY:Sector').objects()).toEqual([
    { YEAR: '2019', 'TECHNOLOGY:Sector': 'BLD', VALUE: 2000 },
    { YEAR: '2020', 'TECHNOLOGY:Sector': 'BLD', VALUE: 4000 },
    { YEAR: '2021', 'TECHNOLOGY:Sector': 'BLD', VALUE: 6000 },
  ]);
});
