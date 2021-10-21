import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import { CogIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import ClickToCopy from "../ClickToCopy";
import Link from "next/dist/client/link";
import { AdjustmentsIcon } from "@heroicons/react/outline";
import OpeningsDropdown from "../Openings/DropDown";
import useOpeningById from "../../SWR/useOpeningById";
import { useRouter } from "next/router";
import useOpenings from "../../SWR/useOpenings";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
export default function StagesHeader() {
  const router = useRouter();
  const { opening_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );

  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );

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
          copyText={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/${user?.org_id}/${opening?.opening_id}/apply`}
        />
      </p>
      <div className=" flex justify-center">
        <Link
          href={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/settings`}
        >
          <CogIcon className="w-10 h-10  hover:text-dark text-light cursor-pointer transition duration-300 ease-in-out" />
        </Link>
      </div>
    </div>
  );
}
