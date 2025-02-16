import { Link } from '@/components/Link';

export function Logo({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="p-2 md:p-5 mb-2 h-full flex flex-row justify-start items-center">
      <Link className="font-manrope text-2xl text-nowrap" href="/">
        <span className="font-bold">{title}</span> <span className="font-thin">{subtitle ?? ''}</span>
      </Link>
    </div>
  );
}
