import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAllStagesInOpening } from '../../SWR/useAllStagesInOpening';
import { useOpeningInfo } from '../../SWR/useOpeningInfo';
import { CustomQuery } from '../../types/main';
import { Loader } from '../Loader';
import { StageReorderColumn } from '../StageReorderColumn';
import { StageSettingsContentTabs } from '../StageSettingsContentTabs';
import { StageSettingsQuestionList } from '../StageSettingsQuestionList';

export const StageSettingsContent = () => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('Questions');
  const { openingId, stageId } = router.query as Pick<CustomQuery, 'openingId' | 'stageId'>;

  const { opening, isOpeningLoading, isOpeningError } = useOpeningInfo({ openingId });
  const { stages, isStagesLoading, isStagesError } = useAllStagesInOpening({ openingId });

  if (isOpeningError || isStagesError) {
    return <h1>An error ocurred loading the stage settings content</h1>;
  }

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  if (isStagesLoading) {
    // TODO i think here we should render the column
    return <Loader text="Loading stages..." />;
  }

  const setNewTab = (value: string) => {
    if (value !== currentTab) {
      setCurrentTab(value);
    }
  };
  return (
    <>
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
              <StageSettingsContentTabs currentTab={currentTab} setCurrentTab={setNewTab} />
              <div className="relative h-full" style={{ minHeight: '36rem' }}>
                <div className=" inset-0  border-gray-200 rounded-lg">
                  {currentTab === 'Questions' && <StageSettingsQuestionList />}
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
