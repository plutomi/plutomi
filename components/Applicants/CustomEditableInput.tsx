import { useState } from 'react';
export default function CustomEditableInput(props) {
  const [value, setValue] = useState(props.initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
    props.setParentValue(e.target.value);
  };
  return (
    <div className="relative border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600">
      <label
        htmlFor="name"
        className="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-dark"
      >
        {props.label}
      </label>
      <input
        type="text"
        name="name"
        value={value}
        onChange={(e) => handleChange(e)}
        id="name"
        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
        placeholder={props.placeholder}
      />
    </div>
  );
}
