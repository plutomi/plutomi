import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner, type SpinnerColors } from "../Spinner";

type ButtonProps = {
  /**
   * @default false
   */
  isDisabled?: boolean;
  /**
   * @default false
   */
  isLoading?: boolean;
  /**
   * @default medium
   */
  size?: "small" | "medium" | "large";
  /**
   * @default primary
   */
  variant?: "primary" | "secondary-outline" | "secondary-text" | "danger";
  className?: string;
  children: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      isDisabled = false,
      isLoading = false,
      size,
      variant,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const getSizeClasses = () => {
      if (size === "small") {
        return "py-1 px-2 text-sm";
      }

      if (size === "large") {
        return "py-2.5 px-4 text-lg";
      }

      // Default - Medium
      return "py-2 px-3 text-md";
    };

    const getVariantClasses = () => {
      if (variant === "secondary-outline") {
        const defaultClasses =
          "bg-white border text-slate-700 border-slate-400 shadow";

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
        const defaultClasses = "bg-white text-slate-700 border-0";
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
        const defaultClasses = "bg-red-500 text-white shadow";
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
      const defaultClasses = "text-white bg-blue-500 shadow";
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
      if (isDisabled || isLoading) {
        // "cursor-wait" is too distracting with our custom spinner for loading states
        return "cursor-not-allowed";
      }

      return "cursor-default hover:cursor-pointer";
    };

    const classes = [
      // common classes
      "rounded flex flex-grow-0 items-center flex-none transition  ease-in-out duration-200 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:outline-none focus:ring",
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
        type="submit"
        ref={ref}
        className={classes}
        disabled={isDisabled || isLoading}
        {...props}
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
  }
);
