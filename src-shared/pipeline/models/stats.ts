import { sameItems } from '~shared/lib/collections';

/**
 * Definition of parameters for statistics calculation in pipeline,
 * used to determine chart min/max values for an axis.
 */
export interface ChartStatDefinition {
  /** What shape is the cross-section of each chart shape.
   * Line chart has a point-like cross section,
   * bar/area chart have a line-line cross section
   **/
  crossSectionType: 'line' | 'point';
  /** Is the chart stacked */
  stacked: boolean;
  /** The list of columns that the data should be grouped by, to calculate the stats.
   * Usually the grouping will contain the X axis column and the sharding columns.
   */
  grouping: string[];
}

export function isChartStatDefinitionEqual(sd1: ChartStatDefinition, sd2: ChartStatDefinition) {
  return (
    sd1.crossSectionType === sd2.crossSectionType &&
    sd1.stacked === sd2.stacked &&
    sameItems(sd1.grouping, sd2.grouping)
  );
}

export type ChartStatResult = {
  lower: number;
  upper: number;
};
