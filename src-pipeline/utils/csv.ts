import { inferSchema, initParser, SchemaColumnType } from 'udsv';

export function csvParseToStringObjs(csvText: string) {
  const csvSchema = inferSchema(csvText);
  csvSchema.cols.forEach((c) => {
    c.type = 's' as SchemaColumnType;
  });

  const parser = initParser(csvSchema);

  return parser.typedObjs(csvText);
}
