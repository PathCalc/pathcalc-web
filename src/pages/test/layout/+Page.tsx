import { FC, ReactNode } from 'react';

export const Page: FC = () => {
  return (
    <div className="w-full grow shrink h-full outline outline-red-500 flex flex-col">
      <div className="w-full flex flex-row flex-wrap">
        <ChartBox>
          <ChartTest />
        </ChartBox>
        <ChartBox>
          <ChartTest />
        </ChartBox>
        {/* <ChartBox>
          <ChartTest />
        </ChartBox> */}
      </div>
    </div>
  );
};

function ChartBox({ children }: { children: ReactNode }) {
  return (
    <div className="grow shrink w-[200px] min-h-[200px] max-h-[300px] outline-green-500 outline @container">
      {children}
    </div>
  );
}

function ChartTest() {
  return (
    <div className="w-full h-full flex flex-col @xs:flex-row">
      <div className="grow shrink bg-slate-200 h-[300px] @xs:h-[200px]"></div>
      <div className="grow shrink bg-slate-400 h-[300px] @xs:h-[200px]"></div>
    </div>
  );
}
