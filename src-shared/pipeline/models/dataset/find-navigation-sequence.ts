import type { DatasetColumn, DatasetDimensionColumn, DimensionColumnDomainLinked } from './types';

/** Takes a set of database columns and a searched column path of the form X:Y:Z:etc
 * and returns a string array representing the series of "navigations" through columns and their linked dimensions,
 * to reach a column or dimension column corresponding to the searched path.
 * Because a single column can have a name like X:Y if it's a result of a previous grouping / collapsing of linked dimensions,
 *
 * An important assumption is that at no point do we have multiple columns at one level where the name of one is a prefix of the other, even if they were both suffixed with a :.
 * So we cannot have TECHNOLOGY and TECHNOLOGY:Sector as columns of one table
 */
export function findNavigationSequence(columns: DatasetColumn[], pathName: string): string[] {
  const exactCandidate = columns.find((c) => c.name === pathName);
  if (exactCandidate != null) {
    return [pathName];
  }

  const hereCandidates = columns.map((c) => [c.name + ':', c] as [string, DatasetColumn]);

  const allDatasetColumnsMatched = hereCandidates.filter(([prefix]) => pathName.startsWith(prefix));
  if (allDatasetColumnsMatched.length === 0) {
    throw new Error(`No column found that matches "${pathName}"`);
  }
  if (allDatasetColumnsMatched.length > 1) {
    throw new Error(
      `Multiple columns found that match part of "${pathName}". This is unexpected - the data structure violates an important assumption.`,
    );
  }
  const [matchedPrefix, datasetColumnMatched] = allDatasetColumnsMatched[0];

  // initialise result sequence with matched prefix but without the trailing colon
  const resultSequence = [matchedPrefix.slice(0, -1)];

  if (datasetColumnMatched.type !== 'dimension' || datasetColumnMatched.domainType !== 'linked') {
    throw new Error(`Column "${resultSequence.join(':')}" is not a linked dimension.`);
  }

  let currentObject: DimensionColumnDomainLinked = datasetColumnMatched;
  const remainingSteps = pathName.slice(matchedPrefix.length).split(':');

  const lastIndex = remainingSteps.length - 1;
  // assume that after the first navigation step, the subsequent ones will all have steps through column names without a colon,
  // but check that the traversed columns are linked dimensions
  for (const [index, step] of remainingSteps.entries()) {
    // if (currentObject.type !== 'dimension' || currentObject.domainType !== 'linked') {
    //   throw new Error(`Column "${resultSequence.join(':')}" is not a linked dimension.`);
    // }

    const nextCandidate: DatasetDimensionColumn | undefined = currentObject.domain.content.columns.find(
      (c) => c.name === step,
    );
    if (nextCandidate == null) {
      throw new Error(`Column "${step}" not found in domain of "${resultSequence.join(':')}"`);
    }
    resultSequence.push(step);

    // if this is the last step, we don't need to check if the
    if (index === lastIndex) {
      break;
    }

    if (nextCandidate.type !== 'dimension' || nextCandidate.domainType !== 'linked') {
      throw new Error(`Column "${resultSequence.join(':')}" is not a linked dimension.`);
    }

    currentObject = nextCandidate;
  }

  return resultSequence;
}
