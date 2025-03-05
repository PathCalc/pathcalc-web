# PathCalc

PathCalc (Pathways Calculator) is a data visualisation system for presenting modelling results from the OSeMOSYS model.

The primary goals of this software project are:

- provide a way of setting up a web-based data visualisation of OSeMOSYS outputs that can be hosted free of charge on a static web hosting such as GitHub Pages
- provide a data preparation pipeline that can be ran on outputs from OSeMOSYS in order to transform them into a form ready for hosting on the web
- allow modellers to configure the data preparation and visualisation by editing a set of well-documented configuration files in common text formats

## Requirements

The following tools are necessary to work with PathCalc:

- Git - a popular software version control system
- Bun - a modern runtime for running code written in the TypeScript language
  - Bun is used to run the data preparation pipeline, and to run the web app locally during configuration
- GitHub - one of the most popular hosting solutions for Git repositories.
  - It is assumed that this repository, and any new instances created based on the original one, are hosted on github.com - the code is set up to automatically deploy a public web app on the GitHub Pages static hosting solution based on the contents of the `main` branch of the repository
- a terminal / command-line interface application for your operating system (e.g. Terminal on Windows or Mac) to run the necessary scripts
- Visual Studio Code - a code editor application. While not absolutely necessary, the project has been set up to provide useful hints for configuration editing when VSCode is used.

## Main Concepts

### Concepts coming from OSeMOSYS

- **Levers**
- **Scenarios**
- **Sets**
- **Variables**

### PathCalc-specific Concepts

- **Dimensions** - a dimension represents a categorical variable/column that can be used to:

  - filter and aggregate data in the pipeline
  - partition and organise charts in the web app

  There are two types of dimensions:

  - _Complex_ ones which define a list of values, as well as a series of metadata attribute for each value (e.g. label, color, related values from other dimensions etc)
  - _Simple_ ones which are only a list of values with no additional metadata - their definition can be embedded in the definition of another complex dimension.

  Example dimensions could be:

  - `YEAR` - all years in the dataset
  - `EmissionSubType` - all sub-types of emissions

  Dimensions can link to other dimensions, for example each entry in the `EMISSION` can

- **Fact tables** - a fact table is a dataset containing some number of dimension and measure columns. There are two primary types of fact tables in the context of PathCalc:

  - _Input tables_ - these are output variables from OSeMOSYS are fact tables. They are consumed by the data preparation pipeline.
  - _Web tables_ - these are output tables from the data preparation pipeline. They are hosted on the web and consumed by the charts in the PathCalc web app.

- **Sharding** - the process of splitting a large dataset into smaller ones, based on some column in the data.

  Currently, all fact tables in the system are expected to be sharded based on `Scenario`.

## System Overview

The system consists of two main software components:

- the data preparation pipeline
- the web application

The preparation of data and setting up of the web application follow the process described below in a simplified way:

1. A researcher clones the repository to their own computer
2. Inside the `input` directory, the researcher edits data pipeline configuration files and adds original data outputs from OSeMOSYS to the `input-raw` directory
   - the researcher can initialise a "dry-run" version of the pipeline that will keep running during the configuration process and will keep checking the validity of the configuration upon any file changes
   - the configuration files _are_ tracked by the git version control system and are therefore available on GitHub
   - the raw input data files _are not_ tracked by git - they only exist on the researcher's computer and are never uploaded to GitHub. This is because they are usually too large to be hosted on GitHub.
3. After finishing the data pipeline configuration, the researcher can initiate a full run of the data pipeline that will transform all raw data files into a form suitable for web hosting, that are stored inside the `public` directory
   - the output data files for web hosting _are_ tracked by git and form part of the repository. Even though the data consists of numerous files (one per scenario per chart), the overall size of the data is much smaller than the raw data from OSeMOSYS, because the output files only contain data strictly necessary to display the charts in the web app.
4. [TODO]

## Git workflow

## Configuring

### Overview

Please note that while this section describes the configuration process in the order of the logical flow of data (data pipeline -> web application), you might actually want to edit the web app configuration first in order to identify what datasets are needed for the charts, and only then configure the data pipeline to produce the required data.

### Data Pipeline

### Web Application

## Setting up a new instance
