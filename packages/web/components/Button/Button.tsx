import { Spinner, type SpinnerColors } from "../Spinner";

type ButtonProps = {
  // @default false
  isDisabled?: boolean;
  // @default false
  isLoading?: boolean;
  // @default medium
  size?: "small" | "medium" | "large";
  // @default primary
  variant?: "primary" | "secondary-outline" | "secondary-text" | "danger";
  className?: string;
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  isDisabled = false,
  isLoading = false,
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
      const defaultClasses =
        "bg-white border text-slate-700 border-slate-400 shadow-sm";

      const onlyWhenEnabledClasses =
        "enabled:hover:bg-slate-100 enabled:active:bg-slate-200  enabled:focus:ring-slate-100 enabled:focus-visible:outline-slate-300";

      const onlyWhenDisabledClasses =
        "disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-300";

      return [
        defaultClasses,
        onlyWhenEnabledClasses,
        onlyWhenDisabledClasses
      ].join(" ");
    }

    if (variant === "secondary-text") {
      const defaultClasses = "bg-white text-slate-700";
      const onlyWhenEnabledClasses =
        "enabled:hover:bg-slate-100 enabled:focus:ring-slate-100 enabled:focus-visible:outline-slate-300 enabled:active:bg-slate-200";
      const onlyWhenDisabledClasses = "disabled:text-slate-300";

      return [
        defaultClasses,
        onlyWhenEnabledClasses,
        onlyWhenDisabledClasses
      ].join(" ");
    }

    if (variant === "danger") {
      const defaultClasses = "bg-red-500 text-white shadow-sm";
      const onlyWhenEnabledClasses =
        "enabled:hover:bg-red-600 enabled:active:bg-red-700 enabled:focus:ring-red-300 enabled:focus-visible:outline-red-600";
      const onlyWhenDisabledClasses = "disabled:bg-red-100";
      return [
        defaultClasses,
        onlyWhenEnabledClasses,
        onlyWhenDisabledClasses
      ].join(" ");
    }

    // Default - Primary
    const defaultClasses = "text-white bg-blue-500 shadow-sm";
    const onlyWhenEnabledClasses =
      "enabled:hover:bg-blue-600 enabled:active:bg-blue-700 enabled:focus:ring-blue-300 enabled:focus-visible:outline-blue-600";
    const onlyWhenDisabledClasses = "disabled:bg-blue-100";

    return [
      defaultClasses,
      onlyWhenEnabledClasses,
      onlyWhenDisabledClasses
    ].join(" ");
  };

  const getCursorClasses = () => {
    if (isDisabled) {
      return "cursor-not-allowed";
    }

    if (isLoading) {
      return "cursor-wait";
    }

    return "cursor-default hover:cursor-pointer";
  };

  const classes = [
    // common classes
    "rounded-md flex items-center flex-none transition  ease-in-out duration-200 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:outline-none focus:ring",
    getCursorClasses(),
    getSizeClasses(),
    getVariantClasses(),
    className // Additional classes from parent
  ].join(" ");

  const getSpinnerColor = (): SpinnerColors => {
    if (variant === "danger") {
      return {
        fillColor: "fill-red-500",
        bgColor: "text-white"
      };
    }

    if (variant === "primary") {
      return {
        fillColor: "fill-blue-500",
        bgColor: "text-white"
      };
    }

    if (variant === "secondary-outline" || variant === "secondary-text") {
      return {
        fillColor: "fill-slate-500",
        bgColor: "text-white"
      };
    }

    return {
      fillColor: "fill-blue-500",
      bgColor: "text-white"
    };
  };

  const spinnerColor = getSpinnerColor();
  return (
    <button
      type="button"
      className={classes}
      disabled={isDisabled || isLoading}
      {...props}
      onClick={() => {
        console.log("Clicked");
      }}
    >
      {isLoading ? (
        <Spinner
          size="small"
          fillColor={spinnerColor.fillColor}
          bgColor={spinnerColor.bgColor}
        />
      ) : null}

      {children}
    </button>
  );
};
