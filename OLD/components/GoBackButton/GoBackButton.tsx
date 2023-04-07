import { ArrowLeftIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';

interface GoBackButtonProps {
  url: string;
}

export const GoBackButton = ({ url }: GoBackButtonProps) => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(url)}
      type="button"
      className="text-md my-2   text-light hover:text-dark  inline-flex items-center py-2  transition duration-300 ease-in-out font-medium rounded-md "
    >
      <ArrowLeftIcon className="mr-2 h-5 w-5" aria-hidden="true" />
      Go Back
    </button>
  );
};
