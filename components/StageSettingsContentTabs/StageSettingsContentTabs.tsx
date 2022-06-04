import combineClassNames from '../../utils/combineClassNames';

interface StageSettingsContentTabsProps {
  currentTab: string;
  setCurrentTab: (name: string) => void;
}
// TODO tabs
const tabs = [{ name: 'Questions' }];

export const StageSettingsContentTabs = ({
  currentTab,
  setCurrentTab,
}: StageSettingsContentTabsProps) => (
  <div>
    <div className="sm:hidden">
      <label htmlFor="tabs" className="sr-only">
        Select a tab
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
      </label>
      <select
        id="tabs"
        name="tabs"
        className="block w-full focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
        defaultValue={tabs.find((tab) => tab.name === currentTab).name}
      >
        {tabs.map((tab) => (
          <option key={tab.name}>{tab.name}</option>
        ))}
      </select>
    </div>
    <div className="hidden sm:block">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.name}
              onClick={() => setCurrentTab(tab.name)}
              className={combineClassNames(
                tab.name === currentTab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'w-1/2 py-4 px-1 text-center border-b-2 font-medium text-lg',
              )}
              aria-current={tab.name === currentTab ? 'page' : undefined}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  </div>
);
