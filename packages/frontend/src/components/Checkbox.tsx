import Checkbox from "@mui/material/Checkbox";
import React from "react";

interface ControlledCheckboxProps {
  id: string;
  onChange(checked: boolean): void;
  checked: boolean;
}

const ControlledCheckbox: React.FC<ControlledCheckboxProps> = ({
  id,
  onChange,
  checked,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Checkbox value changed...");
    onChange(event.target.checked);
  };

  return <Checkbox id={id} onChange={handleChange} checked={checked} />;
};

export default ControlledCheckbox;
