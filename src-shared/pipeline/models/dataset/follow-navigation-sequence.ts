import { DatasetColumn, DimensionTypeColumn } from './types';

/**
 * Follows a sequence of navigation steps through columns and their linked dimensions.
 * Does basic checks on the validity of the sequence.
 * @param columns
 * @param pathSequence
 */
export function followDimensionNavigationSequence(columns: DatasetColumn[], pathSequence: string[]) {
  const all = resolveAllInDimensionNavigationSequence(columns, pathSequence);
  return all[all.length - 1];
}

export function resolveAllInDimensionNavigationSequence(
  columns: DatasetColumn[],
  pathSequence: string[],
): DimensionTypeColumn[] {
  const [firstStep, ...otherSteps] = pathSequence;
  let currentValue: DimensionTypeColumn = columns.find((c) => c.name === firstStep) as DimensionTypeColumn;
  if (currentValue == null || currentValue.type !== 'dimension') {
    throw new Error(`Column "${pathSequence[0]}" is not a dimension.`);
  }
  let navigatedSoFar = firstStep;
  const allDimensionSteps = [currentValue];

  // let currentContext: DatasetDimensionColumn[] = currentValue.domain.content.columns;

  // let otherStepslastIndex = otherSteps.length - 1;
  for (const [index, step] of otherSteps.entries()) {
    if (currentValue.domainType !== 'linked') {
      throw new Error(`Column "${currentValue.name}" is not a linked dimension.`);
    }
    const currentContext = currentValue.domain.content.columns;
    const newFoundValue = currentContext.find((c) => c.name === step);
    navigatedSoFar += `:${step}`;
    if (newFoundValue == null || newFoundValue.type !== 'dimension') {
      throw new Error(`Column "${navigatedSoFar}" is not a dimension.`);
    }

    currentValue = newFoundValue;
    allDimensionSteps.push(currentValue);

    // // let currentValue = currentContext.find((c) => c.id === step);
    // if(index !== lastIndex && currentValue?.type == 'dimension') {
    //   if(currentValue.domainType === 'linked') {
    //     currentContext = currentValue.domain.content.columns;
    //   }
    // }
  }

  return allDimensionSteps;
}
