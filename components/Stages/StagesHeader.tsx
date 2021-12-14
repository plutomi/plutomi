import useSelf from "../../SWR/useSelf";
import { CogIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import ClickToCopy from "../ClickToCopy";
import Link from "next/dist/client/link";
import OpeningsDropdown from "../Openings/DropDown";
import useOpeningById from "../../SWR/useOpeningById";
import { useRouter } from "next/router";
import useOpenings from "../../SWR/useOpenings";
import { CUSTOM_QUERY } from "../../types/main";
export default function StagesHeader() {
  const router = useRouter();
  const { openingId } = router.query as Pick<CUSTOM_QUERY, "openingId">;

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(openingId);

  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings();

  return (
    <div className="md:flex md:items-center md:justify-between  ">
      <div className=" min-w-0 w-2/3 inline-flex justify-between items-center ">
        {openings ? (
          <OpeningsDropdown
            openings={openings}
            index={openings?.indexOf(
              openings?.find((opening) => opening.openingId === openingId)
            )}
          />
        ) : (
          <h1>Loading...</h1>
        )}
      </div>
      <p className="mt-2 text-md text-normal sm:mt-0 ">
        <ClickToCopy
          showText={"Application Link"}
          copyText={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/${user?.orgId}/${opening?.openingId}/apply`}
        />
      </p>
      <div className=" flex justify-center">
        <Link href={`/openings/${openingId}/settings`}>
          <CogIcon className="w-10 h-10  hover:text-dark text-light cursor-pointer transition duration-300 ease-in-out" />
        </Link>
      </div>
    </div>
  );
}
