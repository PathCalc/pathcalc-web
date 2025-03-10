# PathCalc

PathCalc (Pathways Calculator) is a data visualisation system for presenting modelling results from the OSeMOSYS model.

The primary goals of this software project are:

- Provide a way of setting up a web-based data visualisation of OSeMOSYS outputs that can be hosted free-of-charge on a static web hosting such as GitHub Pages
- Provide a data preparation pipeline that can be ran on outputs from OSeMOSYS in order to transform them into a form ready for hosting on the web
- Allow modellers to configure the data preparation and visualisation by editing a set of well-documented configuration files in common text formats

## Target audience

This document is targeted at modellers wishing to configure a new or existing PathCalc instance.

For instructions on how to develop the source code of the PathCalc system, see [DEVELOPMENT.md](/DEVELOPMENT.md)

## Requirements

The following tools/platforms are necessary to work with PathCalc:

- [Git](https://git-scm.com/) - a popular software version control system
  - For less experienced users, [GitHub Desktop](https://github.com/apps/desktop) is recommended as an interface to Git. Installing GH Desktop will install Git automatically.
- [Bun](https://bun.sh/) - a modern runtime for running code written in the TypeScript language
  - Bun is used to run the data preparation pipeline, and to run the web app locally during configuration
  - A recent version of [Node](https://nodejs.org/en/download) will have to be installed as well
- [GitHub](https://github.com/) - one of the most popular hosting solutions for Git repositories.

  - It is assumed that this repository, and any new instances created based on the original one, are hosted on github.com - the code is set up to automatically deploy a public web app on the GitHub Pages hosting based on the contents of the repository

- a terminal / command-line interface application for your operating system (e.g. Terminal on Windows or Mac) to run the necessary scripts
- [Visual Studio Code](https://code.visualstudio.com/) - a code editor application. While the configuration can be technically edited in any text editor, the project has been set up to provide useful hints for configuration editing when VSCode is used. Therefore, using VSCode is highly recommended.

After installing all the above tools, it is advisable to restart the system.

## File formats

The following file formats are used to define the configuration for PathCalc:

- [CSV](https://data.europa.eu/apps/data-visualisation-guide/csv-files) - for tabular data and config. It's recommended to edit CSV files with Excel or similar, but as text files they can also be opened directly in VSCode
- [JSON](https://data.europa.eu/apps/data-visualisation-guide/json-files) - for hierarchical / record-structured configuration data
- [Markdown](https://www.writethedocs.org/guide/writing/markdown/) - for editing text contents of the app

# Overview

## System Components

The system consists of two main software components:

- the data preparation pipeline
- the web application

![Diagram showing main components in the system](/docs/diagrams/components.svg)

The main purpose of the data preparation pipeline is to ensure that the results of OSeMOSYS model runs can be hosted as a visualisation app using a free hosting such as GitHub Pages. The raw data is too large for that, and therefore needs to undergo a series of transformations before being published to the web app.

![Diagram showing how the system components fit into the Git/GitHub infrastructure](/docs/diagrams/system.svg)

The preparation of data and setting up of the web application follow a process visualised on the above diagram (the elements in blue are the ones the modeller will be editing directly).

The steps are:

1. The modeller clones the repository to their own computer
2. The modeller edits data pipeline configuration files and adds original data outputs from OSeMOSYS
   - The **configuration files ARE tracked** by git and are therefore stored on GitHub. They are stored in the `input/` directory at the root of the project.
   - The **raw input data files ARE NOT tracked** by git - they only exist on the modeller's computer and are never uploaded to GitHub. This is because they are usually too large to be hosted on GitHub. These files will be placed inside the `input-raw/` directory at the root of the project.
     - While the `input-raw/` directory sits inside the project repository, the project is set up so that **Git will ignore any CSV files placed inside the `input-raw/` directory**, so that the raw files never end up in the version control system.
     - Because the raw data files are not shared through GitHub, multiple people collaborating on a single instance of the PathCalc system need to share the raw data through a file sharing solution suitable for sending large files.
3. After finishing the data pipeline configuration, the modeller can initiate a full run of the data pipeline that will transform all raw data files into a form suitable for web hosting
   - The **output data files ARE tracked** by git and form part of the repository. They will be stored in the `public/data/` directory, and should be committed after the pipeline creates or modifies them.
4. By editing the other files inside the `public/` directory, the researcher can configure the web app.
   - The **app configuration files ARE tracked** by git
5. The updated configuration files and the preprocessed data should all be committed to the Git repository, and pushed to GitHub. Any changes that end up on the `main` branch of the GitHub repo, will automatically be deployed to the public GitHub Pages website linked to this repository.

## Main Concepts

The following is a description of the key concepts appearing in the system.

### Concepts coming from OSeMOSYS

- **Sets** - categorical variables that can be used to partition the model results in a variety of ways. Example sets are: `YEAR`, `REGION`, `TECHNOLOGY`, `EMISSION` etc. The naming is arbitrary and defined by the modeller. An OSeMOSYS model configuration will define a list of sets. Each set will contain a list of possible values.
- **Variables** - input and output datasets. Each variable is essentially a data table with any number of _Set_ columns, and a numerical column.
- **Scenarios** - represent future scenarios, each corresponding to a single model run with different input parameter configurations.

### PathCalc-specific Concepts

- **Levers** - settings for ambition levels in various areas of development. Levers can be manipulated by the end user of PathCalc. Each combination of lever values will correspond to a single _Scenario_.

- **Dimensions** - a dimension represents a categorical variable/column that can be used to:

  - filter and aggregate data in the pipeline
  - partition and organise charts in the web app

  _Sets_ from OSeMOSYS are represented in PathCalc as dimensions. Additional dimensions can also be created based on the visualisation/data processing needs.

  There are two types of dimensions:

  - _Complex_ ones which define a list of values, as well as a series of metadata attributes for each value (e.g. label, color, related values from other dimensions etc)
  - _Simple_ ones which are only a list of values with no additional metadata - making them simpler to define, but more limited in their potential uses.

  Example dimensions could be:

  - `YEAR` - all years in the dataset
  - `EmissionSubType` - all sub-types of emissions

  Dimensions can link to any number of other dimensions, for example each entry in the `EMISSION` dimension can link to an entry in `EmissionType`, an entry in `EmissionSubType`, and more.

  Apart from dimensions that directly correspond to _Sets_ from OSeMOSYS, the creation and naming of new dimensions is fully up to the modeller.

- **Fact tables** - a fact table is a dataset containing some number of dimension and measure columns. There are two primary types of fact tables in the context of PathCalc:

  - _Input tables_ - these correspond to the output _Variables_ from OSeMOSYS. They are consumed by the data preparation pipeline.
    - The modeller needs to set up the configuration for these tables so that the naming matches the names in the input data folders, and that their content is described correctly so that the pipeline can know what to expect.
  - _Web tables_ - these are output tables from the PathCalc data preparation pipeline. They are hosted on the web and consumed by the charts in the PathCalc web app.
    - These tables need to be created and configured by the modeller so that both the pipeline and the web app can know that these datasets are expected to be output by the pipeline, and consumed by the web app. But the main task from the point of view of the modeller is just naming these tables, and referring to them by name in other parts of the configuration. The structure and contents of these tables is derived automatically from the input tables and the subsequent transformations.

- **Sharding** - the process of splitting a large dataset into smaller ones, based on some column in the data.

  Currently, all fact tables in the system are expected to be sharded based on `Scenario`. So, one fact table would be represented as a large number of CSV files, such as `11111.csv`, `11112.csv`, etc.

- **Pipeline** - a data preparation process which reads in some data, follows a set of steps to process it to the desired shape, then saves the output data.

# Configure PathCalc

This section assumes you are working on configuring the repository in which this Readme resides. To create a new instance of PathCalc, refer to [Set up a new instance](#set-up-a-new-instance).

## Git workflow

The basics of Git are out of scope for this documentation. There are many good [tutorials](https://docs.github.com/en/get-started/start-your-journey/hello-world) [online](https://product.hubspot.com/blog/git-and-github-tutorial-for-beginners).

There are two main options for working with Git to edit the project:

1. The recommended way is to follow the [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow): create a new branch, make changes, then create a Pull Request on GitHub and merge the changes into `main` after a review
   - This is best especially when collaborating on the changes with others.
2. When making small changes, and especially before the first version of a PathCalc instance is published, it is acceptable (though not recommended) to commit and push changes directly to the `main` branch.
   - Keep in mind that any changes pushed to `main` will automatically be published to the live app. This method is therefore more risky if you make changes and merge them in without reviewing.

## VSCode setup

1. Open the cloned repository in the editor.
2. VSCode should suggest to install the extensions recommended by the project. Specifically, `RainbowCSV` and `vscode-color-picker` are recommended for the editing of configuration files.
3. Later, when editing configuration JSON configuration files, the editor is set up to provide documentation and hints about the required configuration values.
   - Hover over a configuration field in a JSON file to see documentation for that field
   - Press Ctrl+Space (on Windows) when editing a JSON file, to get suggestions
   - When using an AI such as GitHub Copilot, the configuration schemas embedded in the project inform the AI completions.

## Project setup

After cloning the repository, open a terminal in the repo directory, and install the dependencies:

```bash
bun install
```

## Configuration workflow

Please note that while this section describes the configuration process in the order of the logical flow of data (data pipeline to web application), you might want to edit the configuration in a different order to better fit your mental model of the system, and your requirements.

The diagram below shows the logical structure of the configuration, as well as the locations in the project folder where the various bits of configuration and data are placed.

![Diagram presenting the potential configuration workflow](/docs/diagrams/workflow.svg)

As shown in the diagram, an example practical workflow could be:

1. Configure the raw fact tables available
2. Configure the dimensions that are used in those fact tables
3. Configure the charts that should be shown in the web app
4. Configure the output fact tables that are needed to show those charts
5. Configure the pipeline to transform from the raw fact tables to the output fact tables
   - Create more dimensions if needed to use in the transformations

## Data Pipeline

While configuring the data structure and the pipeline transformations, you can run the "dry-run" version of the pipeline which will continuously check for edits to the config and check that the configuration is valid:

```bash
bun pipeline:dev
```

The process will output any validation error messages into the terminal, which should help to correct the configuration errors.

### Dimensions

Directory: `/input/data/dimensions`

- Contains a list of dimension definitions
- Each dimension definition is one of the two formats:
  - a) a `[DIMENSION-NAME]/` directory, with:
    - a `meta.json` file containing dimension metadata (refer to hints in VScode)
    - a `[DIMENSION-NAME].csv` file defining the dimension's domain (possible values and their metadata) - see below
  - b) a single file `[DIMENSION-NAME].json` with a simplified domain definition (refer to hints in VSCode)
- The CSV files with domain definitions contain:

  - an `id` column (required) - each dimension value needs its own unique ID
  - a `label` column (optional) - a human-readable label for the dimension value
  - a `color` column (optional) - a color in HEX format - if a chart will be shown where the series depend on this dimension, the colors of the series will come from the `color` column
  - Any number of additional columns linking the values of this dimension with other dimensions:
    - If the column name is in the format `:SomeDimension` (prepended with a colon) - this describes a relationship to another dimension defined in the `input/data/dimensions` directory. The part of the column name after the colon needs to match the name/ID of another defined dimension (here - `SomeDimension`), and the values in the column need to match the `id` values
    - Any column other than `id`, `label`, and `color`, that is not prefixed by a colon, will be treated as a simple dimension definition embedded in the CSV definition of the complex dimension.
      - The values in that column will be treated as both the `id`s of that new dimension, as well as the `label`s (if the dimension is ever used to format charts).
      - As there is no way to define `color` for such a simple dimension, colors will be assigned from a standard color palette if the simple dimension is ever used to format charts.

- Dimensions must have unique names across the whole PathCalc instance
- `Scenario` is also a (required) dimension - the `id`s from that dimension will be used as the list of all scenarios to process in the pipeline, and display in the app

See example CSV config files for three dimensions (represented as tables for readability):

**`YEAR.csv`:**

| id   | Period    |
| ---- | --------- |
| 2030 | 2030-2040 |
| 2031 | 2030-2040 |
| 2032 | 2030-2040 |
| 2033 | 2030-2040 |
| 2034 | 2030-2040 |
| 2035 | 2030-2040 |
| 2036 | 2030-2040 |
| 2037 | 2030-2040 |
| 2038 | 2030-2040 |
| 2039 | 2030-2040 |

In this definition:

- `Period` is a simple dimension embedded into the definition of the `YEAR` dimension

**`EmissionSubType.csv`:**

| id  | label     | color   |
| --- | --------- | ------- |
| TRA | Transport | #ff0000 |
| PWR | Power     | #ffff00 |

In this definition:

- the `label` and `color` values will be used in the app for the `EmissionSubType` is referred to in the web app configuration for a chart's series

**`EMISSION.csv`:**

| id       | label         | EmissionType | :EmissionSubType |
| -------- | ------------- | ------------ | ---------------- |
| Co2e_TRA | CO2 Transport | CO2          | TRA              |
| Co2e_PWR | CO2 Power     | CO2          | PWR              |
| PM_25    | PM2.5         |              |                  |
| PM_10    | PM10          |              |                  |
| NOx      | NOx           |              |                  |
| SOx      | SOx           |              |                  |

In this definition:

- `EmissionType` is a simple dimension defined directly inside the `EMISSION` dimension
- `:EmissionSubType` references the `EmissionSubType` dimension defined in the other file. The values in this column: `TRA`, `PWR` - need to match the values in the `id` column in `EmissionSubType.csv`.

### Fact tables

Directory: `/input/data/fact-tables`

- Contains a list of fact table definitions
- Each fact table is defined as a `[FACT-TABLE-NAME].json` file
- Refer to editor hints for more details, but the basics are:
  1. each table needs to have `sharding` defined, but for now it's expected to always be a single-element array: `["Scenario"]` (this is to support other types of sharding in the future)
  1. for tables with `"type": "raw"`:
     - `storage.type` must be `"local-input"`
     - `storage.pattern` will determine where the raw data files are read from. For example, for a fact table named `_Use` and `pattern` set to `shards/{Scenario}.csv`, the data files will be loaded, per scenario, from paths such as `input-raw/fact-tables/_Use/shards/11111.csv`, `input-raw/fact-tables/_Use/shards/11112.csv` etc
     - `columns` array is required - each column should have a name matching the column in the raw data CSVs, and a type of either `dimension` (columns such as `YEAR`, `EMISSION` etc) or `measure` (usually the `VALUE` column)
  1. for tables with `"type": "web"`:
     - `storage.type` must be `"web"`
     - `storage.pattern` will be used to save the outputs from the pipeline. For an example fact table `Overview1` and `pattern` set to `{Scenario}.csv`, the outputs shards will be saved to `public/data/fact-tables/Overview1/11111.csv`, `public/data/fact-tables/Overview1/11112.csv` etc

### Dimension paths

A key mechanism used in the next sections - both in the pipeline and web app configurations - is **dimension paths**.

Let's take an example fact table such as `AnnualEmissionByTechnology`, which has dimension columns such as `YEAR`, `EMISSION`, `TECHNOLOGY`, and a measure column `VALUE`.

Using the example dimension configs from the Dimensions section above: `YEAR` dimension is related to a `Period` dimension, while `EMISSION` is related to two other dimensions: `EmissionType` and `EmissionSubType`. However, the fact table itself only contains direct references to `EMISSION` and `YEAR`. It does not reference the other dimensions, to which it has an indirect relationship.

When defining pipeline transformations on a dataset, we might want to refer to an indirectly related dimension. For example, we would like to filter down the `AnnualEmissionByTechnology` table to leave only rows for which the value of `EmissionType` dimension is `CO2`. In order to do that, we need to explicitly specify the **path** of relationships between dimensions that will define a series of "jumps" from the fact table to the dimension we want to use.

The path is formed by joining a series of names of related dimensions with a colon. In this example, the dimension path to use would be:

`EMISSION:EmissionType`

(`EMISSION` is directly referenced in `AnnualEmissionByTechnology`, and then `EMISSION` gives us a link to `EmissionType`)

Similarly, we might want to configure a chart to display series based on `EmissionSubType` (using colors and labels defined in that dimension). The dimension path for that would be `EMISSION:EmissionSubType`.

### Pipeline files

Directory: `/input/pipeline`

- Contains a list of pipeline definition files
- Each pipeline file is named as `[PIPELINE-NAME].json`
- Each file defines a sequence of transformation steps
- When running the full pipeline
  - the program will go through all the files in this directory, and execute each one of them, in sequence
  - for each file, the program will go through all _Scenarios_ in the dataset (one by one) and execute the series of processing steps for data from the current scenario
- Each steps in the pipeline defines an operation (indicated in the `$` field), and a set of parameters specific to this operation. The editor hints contain the full documentation of the operations and their parameters. The list of operations is:
  - `load` - load data from a `raw` (input) fact table. Needs to be the first step in the pipeline.
  - `filter` - filter data down based on a dimension. Supports dimension paths to indirectly related dimensions. The values to filter by need to reference the `id` values of the selected dimension.
  - `aggregate` - group data by a list of dimensions, and then for each group, aggregate all the measure columns based on their default aggregation method (specified in the fact table definition).
  - `save` - save the dataset to a `web` (output) fact table.
    - This step needs a parameter named `stats` (see editor hints for details) that needs to specify which dimension is expected be used as the X axis on the web app charts - this is because the pipeline needs to calculate some statistics to figure out what the min/max bounds for the Y axis should be, across all scenarios.
- More steps can be included after a `save` step - for example, to aggregate the data further and then save it again as a different fact table. This is useful e.g. for outputting data for an area chart which has Year on the X axis, and then aggregating it more for a bar chart that only has the full period (e.g. 2030-2050) on the X axis.
- After processing all scenarios for a single pipeline, an additional summary step will be run to calculate dataset-wide statistics and to output an internal metadata file accompanying the output fact table which is needed by the web app. This means that if a pipeline run is aborted / fails in the middle of going through the list of scenarios, the metadata file will not be updated/created, and therefore the resulting visualisation would be incorrect. You need to re-run the failed pipeline, or the full run, in order to correct that.

### Running

After the configuration of the pipeline is finished, make sure you have placed the raw data files inside the `input-raw/fact-tables` directory - in sub-directories matching the names of the `raw` fact tables, and matching the `storage.pattern` configuration for each fact table. So for example, putting raw files at paths like `input-raw/fact-tables/_CombinedCosts/shards/11111.csv` etc.

To trigger full processing of all the data, run:

```bash
bun pipeline:full
```

The full processing of an average dataset can take a longer while, depending on the hardware - from 15 minutes on a workstation up to perhaps a few hours on a very basic laptop.

In order to run the processing of only a few (or one) selected pipeline files, pass the pipeline file IDs (referencing the names of files in `input/pipeline`) as arguments to the command, after a `--` marker, separated by spaces:

```bash
bun pipeline:full -- overview1 costs1a costs1b
```

After the data is processed and placed in `public/data/`, it should be committed and pushed to GitHub - unless there are still app configuration changes to apply (see next section).

## Web Application

While editing the app configuration, you can run a local copy of the web app that will quickly indicate if there are any problems with the configuration.

```bash
bun dev
```

The command will output a URL to open the local app - usually it will be http://localhost:3000

In case of any issues, the local app malfunctioning or some local config / data updates not appearing - the first step would be to shut down the process in the terminal and start it again, followed by restarting your system if that doesn't help.

### App URL

When running locally, the app will have a local base URL such as http://localhost:3000/, with sub-pages under URLs such as http://localhost:3000/overview/ etc

When published to the web, a repository called `laos` in the `PathCalc` GitHub organisation, will have a base URL https://PathCalc.github.io/laos/ and the subpages will be under https://PathCalc.github.io/laos/overview/ etc.

In both cases, `/overview` is the _relative path_ to the Overview page - only the base URL changes (this will be important in the following section).

### Landing page content

Path: `public/config/info.md`

The contents of the landing page (currently same as the About tab in the navigation menu) in Markdown format.

This currently supports all standard Markdown text formatting, as well as the following Markdown features:

- images - using the `![Image alt text](image-url)` syntax
  - You can add images to use on the text page (such as partner logos, demo screenshots etc), into the `public/images/` folder (they need to be committed to Git)
  - When specifying the URL for the image, you can reference those images by constructing a relative path as if the `public` folder was the root path of the project. For example, if there is an image file at `public/images/demo.png` - the image URL in Markdown should be `/images/demo.png`
  - Images will take up the full width of the page body (same as text)
- hyperlinks - using the `[Link text](link-url)` syntax
  - if you create a hyperlink to an external website such as https://climatecompatiblegrowth.com/ - it will automatically open in a new tab when the user clicks on it
  - if you create a hyperlink pointing to a _relative path_ such as `/overview` (see notes in [App URL](#app-url) section), the new page will open in the same tab. This can be used to put links in the text that will serve for navigating around the website, rather than going to an external resource. Relative paths will keep working even if you rename the whole repository or fork it, because it's independent of the base URL where the public app is hosted.

### Markdown in other parts of the configuration

### General config

Path: `public/config/general.json`

General config for the app, with settings such as website title or default settings to apply to all charts.

See editor hints for detailed documentation.

### Scenarios config

Path: `public/config/scenarios.json`

Config for:

- the _Levers_ in the app
- the example scenario presets

See editor hints for detailed documentation.

### Chart pages list config

Path: `public/config/chart-pages.json`

A simple file that contains a list of chart pages, which will map directly to the navigation tabs in the app header.

Each entry needs to have a `slug` (which is essentially an ID but also is used in the page URL - e.g. slug: `overview` -> relative URL path: `/overview`)

- the slug needs to match one of the individual page config IDs (see next section)

Each entry needs a title that will be used in the navigation tabs, and in the browser tab title.

### Individual chart pages config

Path: `public/config/pages/*.json`

Each file defines one chart page in the app, named like `[CHART-PAGE-ID].json`.

The file defines the page layout and all the chart configuration in a hierarchical, nested structure built out of _Blocks_. There are several types of blocks available, each with its own settings. Each block is represented as a JSON object with a `type` property. For example:

```json
{
  "type": "row",
  "items": [
    // ... some nested block definitions here
  ]
}
```

Currently, the available blocks are:

- `container` - a container block for vertically laying out a series of blocks (defined in the `items` property of the block)
- `row` - a container block for horizontally laying out a series of blocks (defined in the `items` property of the block)
- `chart` - a block for displaying a chart that pulls data from one of the `web` fact tables and displays it in a configurable way. See editor hints and example config files for full documentation. Some notes:
  - The `dataset` property needs to match the name of one of the output fact tables
  - The data specification properties such as `x`, `y`, and `series` need to point to a dimension, and support _dimension paths_ of the form `EMISSION:EmissionSubType` etc
  - The `options` property is an object that supports a range of settings to customise the appearance and interactive behavior of the chart. Some more advanced/obscure ones:
    - `options.extraProps` is an escape hatch mechanism that provides extensive control over the charts, in case of very advanced needs. The charts implementation is based on the [Recharts](https://recharts.org/) library, and the options in `extraProps` are passed directly to that library. See editor hints for where to look for documentation of all the options. Some important examples:
      - `extraProps.chart.syncId` - all charts on the same page that have the same `syncId`, will have a synchronised tooltip. Only makes sense for charts using the same dimension on the X axis.
      - `extraProps.chart.stackOffset` - modifies the stacking method in case of stacked charts. For example, setting it to `expand` gives a 100% stacked area chart, and `sign` gives a stack chart where the negative values are stacked below the X axis and the positive ones - above.
- `text` - a block of text supporting Markdown syntax. Can be used to add a narrative aspect to a chart page, or add a bit of context to the charts.
- `placeholder` - an empty block that will nonetheless take up space in a horizontal row layout as if it was a chart - in case you have an odd number of charts arranged in a two-per-row layout, and you don't want the last chart to take up the whole width of the row, but rather be the same size as the other charts.

The top-level block (defined in the `content` field in the configuration file) must be of type `container`.

NOTE: for performance reasons, it is advisable not to put more than 4-6 charts on one page.

# Set up a new instance

The project is set up so that it should be fairly easy for a modeller to create a new copy of the repository, and - after configuring it with new data - publish it as a public website on GitHub Pages.

## Duplicate the repo

There are two options for duplicating the repository: forking and using the repo as a template.
At this early stage in the development of the PathCalc project, where the source code might still be updated and expanded in the near future, forking might be the better option, as it preserves the link to the original repo.

NOTE: In both options, remember that the repository and organisation names will form a part of the URL to the live website:

```
https://[GITHUB-ORG-NAME].github.io/[REPO-NAME]/
```

### Forking

GitHub allows you to fork a repository.

1. Go to the original repository and click on the "Fork" button
2. Pick the new organisation and name for the fork.
3. Set a short description for the repository.

### Using repo as template

NOTE: using the repo as a template does not preserve the commit history of the original repo. At this stage, this might not be desirable, but at the same time a simplified git history will both save disk space, and potentially cut out noise from historical choices to the original repo - when setting up new instances in the future.

This is a GitHub-specific functionality. The original repo has been set up as a template.

1. When going to https://github.com/PathCalc/pathcalc-web, you should see a green button to "Use this template"
2. Choose "Create a new repository" from the dropdown.
3. Pick the organisation and new repo name where you would like to set up the template
4. Set a short description for the repository

## Configure hosting

After setting up the repository carry out these steps to activate the GitHub Pages live website:

1. Go on GitHub to repository Settings > Pages
2. Select "GitHub Actions" in the "Source" dropdown
3. Once this is done, the contents of the `main` branch should start to be automatically deployed to the website. You should get a URL to the site on the settings page.

# Troubleshooting

If you encounter any issues with:

- understanding this documentation
- configuring an instance of PathCalc and processing data
- using a PathCalc website as an end user

please report them as issues in the [original pathcalc-web repository on GitHub](https://github.com/PathCalc/pathcalc-web/issues)
