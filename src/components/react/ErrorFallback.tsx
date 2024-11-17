import { CircleAlert } from 'lucide-react';

export function ErrorFallback({ message }: { message?: string }) {
  return (
    <div className="bg-muted/50 rounded-xl grow w-full flex flex-col justify-center items-center">
      <div className="flex flex-row justify-start items-center gap-5 py-5 px-16">
        <div>
          <CircleAlert />
        </div>
        <div>{message ?? 'Something went wrong while displaying this section.'}</div>
      </div>
    </div>
  );
}
