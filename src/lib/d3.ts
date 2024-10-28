import * as d3Array from 'd3-array';
import * as d3Format from 'd3-format';
import * as d3Interpolate from 'd3-interpolate';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

export const d3 = {
  ...d3Scale,
  ...d3ScaleChromatic,
  ...d3Array,
  ...d3Interpolate,
  ...d3Format,
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace D3 {
  export import scale = d3Scale;
  export import scaleChromatic = d3ScaleChromatic;
  export import array = d3Array;
  export import interpolate = d3Interpolate;
  export import format = d3Format;
}
