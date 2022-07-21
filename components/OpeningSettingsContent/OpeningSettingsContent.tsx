import { useRouter } from 'next/router';
import { useOpeningInfo } from '../../SWR/useOpeningInfo';
import { CustomQuery } from '../../types/main';
import { Loader } from '../Loader';
import { StageReorderColumn } from '../StageReorderColumn';
import { UpdateOpeningModal } from '../UpdateOpeningModal';

export const OpeningSettingsContent = () => {
  const router = useRouter();
  const { openingId } = router.query as Pick<CustomQuery, 'openingId'>;
  const { opening, isOpeningLoading, isOpeningError } = useOpeningInfo({ openingId });

  if (isOpeningError) return <h1>An error ocurred retrieving info for this opening</h1>;
  if (isOpeningLoading) return <Loader text="Loading opening settings..." />;

  return (
    <>
      <UpdateOpeningModal opening={opening} />
      {/* 3 column wrapper */}
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
        {/* Left sidebar & main wrapper */}
        <div className="flex-1 min-w-0 bg-white xl:flex">
          <div className="border-b border-gray-200 xl:border-b-0 xl:flex-shrink-0 xl:w-64 xl:border-r xl:border-gray-200 bg-white">
            <div className="h-full pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
              {/* Start left column area */}
              <StageReorderColumn />
              {/* End left column area */}
            </div>
          </div>

          <div className="bg-white lg:min-w-0 lg:flex-1">
            <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
              {/* Start main area */}
              <div className="relative h-full" style={{ minHeight: '36rem' }}>
                <div className=" inset-0  border-gray-200 rounded-lg">
                  <div className="flex flex-col justify-center items-center">Main area</div>
                </div>
              </div>
              {/* End main area */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
