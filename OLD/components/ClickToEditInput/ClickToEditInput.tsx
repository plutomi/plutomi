import { useState } from 'react';

interface CustomEditableInputProps {
  initialValue: string | number;
  label: string;
  setParentValue?: (value: string) => void;
  placeholder: string;
}

export const ClickToEditInput = ({
  initialValue,
  label,
  setParentValue,
  placeholder,
}: CustomEditableInputProps) => {
  const [value, setValue] = useState(initialValue);

  // TODO TYPES
  const handleChange = (e) => {
    setValue(e.target.value);
    setParentValue(e.target.value);
  };
  return (
    <div className="relative border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600">
      <label
        htmlFor="name"
        className="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-dark"
      >
        {label}
      </label>
      <input
        type="text"
        name="name"
        value={value}
        onChange={(e) => handleChange(e)}
        id="name"
        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
        placeholder={placeholder}
      />
    </div>
  );
};
