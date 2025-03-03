# Pathways Calculator

**How can Laos meet growing transport demand until 2050 while achieving its emission targets?**

**What investments are required in the transport, electricity, and hydrogen sectors, and how much would they cost?**

**How do these requirements change when strategies are leveraged to make the transport sector more efficient?**

**PathCalc** (Pathways Calculator) Laos is an interactive tool for exploring a wide range of transport pathways for Laos. It illustrates how various strategies affect emissions, costs, and energy.

## How does PathCalc work?

In PathCalc, a user can change pathways by moving levers, following the [2050 Calculator](https://www.imperial.ac.uk/2050-calculator/) concept.

Levers represent strategies for reducing emissions. Each lever has four ambition levels, ranging from “no effort” (Level 1) to “transformational effort” (Level 4).

PathCalc Laos’ five levers are described below. The first three represent the Avoid-Shift-Improve approach for sustainable transport.

**"Avoid"** reduces travel demand. In practice, this can be achieved through compact city planning and transport demand management.

**"Shift"** moves the modal profile of transport demand from high-energy transport modes like cars to more efficient options like public transport, walking, and cycling. This lever also increases vehicle utilisation rate and average vehicle occupancy, meaning that less vehicles can meet the same demand.

**"Improve"** imposes a vehicle emissions limit, creating investment in electric and hydrogen vehicles. The share of different motor types is determined on a least-cost basis.

**"Transform"** reduces vehicle’s indirect emissions by decarbonising the electricity sector and increasing the share of biofuels.

**"Costs"** increases cost reductions for developing technologies, reflecting a higher degree of technology learning. This lever represents uncertainties rather than intervention points.

**Go to** [Overview](/overview) **to start exploring the data.**

## How are pathways modelled?

Laos’ electricity, hydrogen, and transport systems are modelled using [OSeMOSYS](http://www.osemosys.org/) (Open Source Energy Modelling System). OSeMOSYS is a bottom-up energy system optimisation model, meaning that it represents the physical energy system and cost-optimises its development.

The model’s inputs include:

- Annual transport demand for each transport mode until 2050
- Technologies options for meeting demand, and their techno-economic data:
  - Capital, fixed and variable costs
  - Usage data (capacity factors for power technologies; average vehicle occupancies and utilisation rates for transport vehicles)
  - Energy efficiencies
  - Greenhouse gas and pollutant emission intensities
  - Maximum roll-out rates
- Environmental, policy, and technical constraints such as:
  - Resource potentials
  - Emissions targets

The model outputs the least-cost technology pathway for meeting future demand using the available technologies while adhering to the imposed constraints.

The model’s outputs are annual technology data, including:

- Capacity investments
- Fuel consumption and energy production
- Emissions
- Technology capital, fixed and variable costs

Therefore, each model run answers the question: what is the least-cost pathway for meeting future demand with the technology options provided, while obeying constraints?

Note that while OSeMOSYS quantifies the least-cost investments required for meeting demand and policy targets, it does not provide insights on how to achieve those investments.

## Partners

This PathCalc has been developed by [Climate Compatible Growth](https://climatecompatiblegrowth.com/) in collaboration with the [Asian Development Bank](https://www.adb.org/).
