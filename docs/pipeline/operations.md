- the idea is that at every step of the pipeline, we can reason about the domains without looking at the actual data tables
- at every step of the pipeline, we are dealing with a _Dataset_

Context for each step:

For dry-run:

- path
- environment (server / browser)

For run:

- path
- environment
- current shard

### Datasets

Type:

- raw
- web

Storage:

- local-input
- local-public
- github-pages

Examples:

- raw dataset is only present on the modeller's computer inside the `input` folder (data files are gitignored) - this cannot be accessed if the environment is `browser`
- web dataset is saved in the server pipeline to the `public` folder, and then is uploaded to GitHub Pages together with the other website files

### Pipeline operations:

In this initial prototype version, all operation names should be prefixed with `p0:`, for future extensibility.

- `load`

  - MUST be first (cannot get input)
  - must specify sharding

- `save`
  - MUST be last (produces no output)
  -
- `save-temp` - cannot save two times to the same variable
- `load-temp` - MUST be first
- `filter`
- `aggregate`
- `new-column`
- `union`

### Filtering

```json
{
  "$": "filter",
  "column": ":TECHNOLOGY:Sector",
  "op": "in",
  "args": ["TRA", "HPROD"]
}
```

Operators:

- `in`
- `eq`
- `notempty`

## Temporary datasets

- prefixed with `#` e.g. `#VariableCost`
- created using `save-temp`
- loaded using `load-temp` - available only in the same file, in the steps after it is created

## Sharding

Data is sharded primarily to limit the size of data that needs to be loaded into memory, and downloaded over the network - both on the server as well as in the browser.

The sharding currently is done by Scenario.

Sharding means that at a single step in the pipeline, only data for one scenario will be present at a time.

After the dry-run, when the pipeline conducts the actual run, there are three phases:

1. start - the pipeline will go over each step and send it a _start_ signal. The step can initialise any state needed for logic that goes outside the bounds of a single shard
2. shards - the whole pipeline will run once for each shard
3. end - the pipeline will go over each step and send it an _end_ signal. This allows to wrap up global processing. For example, the steps that are saving new datasets, might also save some metadata including stats for measure columns that are calculated across all shards
