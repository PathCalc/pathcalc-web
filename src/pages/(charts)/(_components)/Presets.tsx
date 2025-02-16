import { useState } from 'react';

import { SimpleSelect } from '@/components/SimpleSelect';

const presetOptions = [
  { value: '11111', label: 'Scenario 1' },
  { value: '11112', label: 'Scenario 2' },
  { value: '11113', label: 'Scenario 3' },
];

export function Presets() {
  const [value, onChange] = useState(presetOptions[0].value);
  return <SimpleSelect options={presetOptions} value={value} onChange={onChange} />;
}
