import SvgIcon from "@mui/material/SvgIcon";

export default function Matrix(props: any) {
  return (
    <SvgIcon {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="480"
        height="480"
        viewBox="0 0 480 480"
      >
        <title>matrix</title>
        <path
          fill={props.color}
          d="M320 160l80 0 0-80-80 0 0 80z m-240 240l80 0 0-80-80 0 0 80z m0-120l80 0 0-80-80 0 0 80z m0-120l80 0 0-80-80 0 0 80z m120 240l80 0 0-80-80 0 0 80z m0-120l80 0 0-80-80 0 0 80z m0-120l80 0 0-80-80 0 0 80z m120 240l80 0 0-80-80 0 0 80z m0-120l80 0 0-80-80 0 0 80z"
        />
      </svg>
    </SvgIcon>
  );
}
