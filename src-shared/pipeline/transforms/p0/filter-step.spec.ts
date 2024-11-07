import { expect, test } from 'vitest';

import { Dataset } from '~shared/pipeline/models/dataset/types';
import { PipelineEnvironment } from '~shared/pipeline/models/pipeline/pipeline-environment';
import { ProcessingContext } from '~shared/pipeline/utils/processing-context';

import { FilterStep } from './filter-step';

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
              id: 'PWRSOL001NOR',
              label: 'Solar PV plant in NOR',
              Sector: 'PWR',
              Type: 'SOL',
            },
            //PWRTRNCEN,Transmission technology in  CEN,PWR,INF,TRN,,
            {
              id: 'PWRTRNCEN',
              label: 'Transmission technology in CEN',
              Sector: 'PWR',
              Type: 'INF',
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
                  table: [
                    { id: 'BLD', label: 'Blending', color: '#ff0000', Random: 'Foo', Random2: 'Foo2' },
                    {
                      id: 'PWR',
                      label: 'Power',
                      color: '#00ff00',
                      Random: 'Bar',
                      Random2: 'Bar2',
                    },
                  ],
                  columns: [
                    { name: 'id', type: 'metadata' },
                    { name: 'label', type: 'metadata' },
                    { name: 'color', type: 'metadata' },
                    {
                      name: 'Random',
                      type: 'dimension',
                      domainType: 'local',
                      domain: [{ id: 'Foo' }, { id: 'Bar' }],
                    },
                    {
                      name: 'Random2',
                      type: 'dimension',
                      domainType: 'local',
                      domain: [{ id: 'Foo2' }, { id: 'Bar2' }],
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
                  table: [
                    { id: 'DSLBIO', label: 'Diesel and Biodiesel', color: '#00ff00' },
                    { id: 'SOL', label: 'Solar', color: '#ff0000' },
                    { id: 'INF', label: 'Infrastructure', color: '#0000ff' },
                  ],
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

const datasetAfterFilter: Dataset = {
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
              id: 'PWRTRNCEN',
              label: 'Transmission technology in CEN',
              Sector: 'PWR',
              Type: 'INF',
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
                  table: [
                    {
                      id: 'PWR',
                      label: 'Power',
                      color: '#00ff00',
                      Random: 'Bar',
                      Random2: 'Bar2',
                    },
                  ],
                  columns: [
                    { name: 'id', type: 'metadata' },
                    { name: 'label', type: 'metadata' },
                    { name: 'color', type: 'metadata' },
                    {
                      name: 'Random',
                      type: 'dimension',
                      domainType: 'local',
                      domain: [{ id: 'Bar' }],
                    },
                    {
                      name: 'Random2',
                      type: 'dimension',
                      domainType: 'local',
                      domain: [{ id: 'Bar2' }],
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
                  table: [{ id: 'INF', label: 'Infrastructure', color: '#0000ff' }],
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

test('filter by a root dimension column', async () => {
  const filterStep = new FilterStep({
    $: 'filter',
    column: 'TECHNOLOGY',
    in: ['PWRTRNCEN'],
  });

  const ctx = new ProcessingContext();
  const env = new PipelineEnvironment('server', new Map(), new Map());

  const result = filterStep.dryRun(ctx, dataset, env, new Map());

  await expect(result).resolves.toEqual(datasetAfterFilter);
  // const result =
});
