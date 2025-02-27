// https://vike.dev/Head

import { makeFilePath } from '@/lib/href';

const ICON_URL = makeFilePath('/icon.png');

export default function HeadDefault() {
  return (
    <>
      <link rel="icon" href={ICON_URL} />
    </>
  );
}
