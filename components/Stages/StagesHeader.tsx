import useSelf from "../../SWR/useSelf";
import { CogIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import ClickToCopy from "../ClickToCopy";
import Link from "next/dist/client/link";
import OpeningsDropdown from "../Openings/DropDown";
import useOpeningById from "../../SWR/useOpeningById";
import { useRouter } from "next/router";
import useOpenings from "../../SWR/useOpenings";
export default function StagesHeader() {
  const router = useRouter();
  const { opening_id } = router.query as CustomQuery;

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } =
    useOpeningById(opening_id);

  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings();

  return (
    <div className="md:flex md:items-center md:justify-between  ">
      <div className=" min-w-0 w-2/3 inline-flex justify-between items-center ">
        {openings ? (
          <OpeningsDropdown
            openings={openings}
            index={openings?.indexOf(
              openings?.find((opening) => opening.opening_id === opening_id)
            )}
          />
        ) : (
          <h1>Loading...</h1>
        )}
      </div>
      <p className="mt-2 text-md text-normal sm:mt-0 ">
        <ClickToCopy
          showText={"Application Link"}
          copyText={`${process.env.WEBSITE_URL}/${user?.org_id}/${opening?.opening_id}/apply`}
        />
      </p>
      <div className=" flex justify-center">
        <Link
          href={`${process.env.WEBSITE_URL}/openings/${opening_id}/settings`}
        >
          <CogIcon className="w-10 h-10  hover:text-dark text-light cursor-pointer transition duration-300 ease-in-out" />
        </Link>
      </div>
    </div>
  );
}
