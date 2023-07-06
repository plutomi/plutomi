type ButtonProps = {
  // @default false
  isLoading?: boolean;
  // @default false
  isDisabled?: boolean;
  // @default medium
  size?: "small" | "medium" | "large";
  // @default primary
  variant?: "primary" | "secondary-outline" | "secondary-text" | "danger";
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
  const getSizeClasses = () => {
    if (size === "small") {
      return "py-4 px-1.5 text-sm";
    }

    if (size === "large") {
      return "py-8 px-4 text-lg";
    }

    // Default
    return "px-6 py-2.5 text-md";
  };

  const getVariantClasses = () => {
    if (variant === "secondary-outline") {
      return "bg-white  disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-300 hover:bg-slate-100  active:bg-slate-200  focus:ring-slate-100 focus-visible:outline-slate-300 border border-slate-400 text-slate-700 shadow-sm";
    }

    if (variant === "secondary-text") {
      return "bg-white disabled:text-slate-300 disabled:bg-white hover:bg-slate-100  active:bg-slate-200  focus:ring-slate-100 focus-visible:outline-slate-300 text-slate-700";
    }

    if (variant === "danger") {
      return "text-white bg-red-500 disabled:bg-red-100 hover:bg-red-600 active:bg-red-700  focus:ring-red-300 focus-visible:outline-red-600 shadow-sm";
    }

    // Default - Primary
    return "text-white bg-blue-500 disabled:bg-blue-100 hover:bg-blue-600 active:bg-blue-700  focus:ring-blue-300 focus-visible:outline-blue-600 shadow-sm";
  };

  const getCursorClasses = () => {
    if (isDisabled || isLoading) {
      return "cursor-not-allowed";
    }

    return "cursor-default hover:cursor-pointer";
  };

  const classes = [
    // common classes
    "rounded-md flex-none transition  ease-in-out duration-200 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:outline-none focus:ring",
    getCursorClasses(),
    getSizeClasses(),
    getVariantClasses(),
    className // Additional classes from parent
  ].join(" ");

  return (
    <button type="button" className={classes} disabled={isDisabled} {...props}>
      {children}
    </button>
  );
};
