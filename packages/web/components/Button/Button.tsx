type ButtonProps = {
  // @default false
  isLoading?: boolean;
  // @default false
  isDisabled?: boolean;
  // @default medium
  size?: "small" | "medium" | "large";
  // @default primary
  variant?:
    | "primary"
    | "secondary-outline"
    | "secondary-text"
    | "danger"
    | "success";
  className?: string;
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  isLoading = false,
  isDisabled = false,
  size,
  variant,
  children,
  className,
  ...props
}) => {
  let sizeClasses: string = "";
  switch (size) {
    case "small":
      sizeClasses = "py-4 px-1.5 text-sm";
      break;
    case "large":
      sizeClasses = "py-8 px-4 text-lg";
      break;
    default:
      sizeClasses = "px-6 py-2.5 text-md";
  }

  let typeClasses: string = "";

  switch (variant) {
    case "secondary-outline":
      typeClasses =
        // TODO: Change to slate
        "bg-white-500 hover:bg-slate-100 active:bg-slate-200 focus:ring focus:ring-slate-100 focus-visible:outline-slate-300 border border-slate-400 text-slate-700 shadow-sm";
      break;

    case "secondary-text":
      typeClasses =
        // TODO: Change to slate
        "bg-white-500 hover:bg-slate-100 active:bg-slate-200 focus:ring focus:ring-slate-100 focus-visible:outline-slate-300 text-slate-700";
      break;
    case "danger":
      typeClasses =
        "text-white bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring focus:ring-red-300 focus-visible:outline-red-600 shadow-sm";
      break;
    case "success":
      typeClasses =
        "text-white bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 focus:ring focus:ring-emerald-300 focus-visible:outline-emerald-600 shadow-sm";
      break;
    default:
      // Primary
      typeClasses =
        "text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:ring focus:ring-blue-300 focus-visible:outline-blue-500 shadow-sm";
  }

  const classes = [
    // common classes
    "rounded-md flex-none transition  ease-in-out duration-200 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:outline-none ",
    sizeClasses,
    typeClasses,
    className // Additional classes from parent
  ].join(" ");

  return (
    <button
      type="button"
      className={classes}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
};
