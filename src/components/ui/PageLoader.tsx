import { Spinner } from './Spinner';

export function PageLoader() {
  return (
    <div className="flex justify-center py-20 text-blue-600">
      <Spinner size="lg" />
    </div>
  );
}