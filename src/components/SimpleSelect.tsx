import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const SimpleSelect = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  placeholder?: string;
}) => {
  return (
    <Select value={value ?? ''} onValueChange={onChange} required={false}>
      <SelectTrigger className="text-left">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
