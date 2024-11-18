// https://vike.dev/Head

import { makeFilePath } from '@/lib/href';

export default function HeadDefault() {
  return (
    <>
      <link rel="icon" href={makeFilePath('/icon.png')} />
    </>
  );
}
