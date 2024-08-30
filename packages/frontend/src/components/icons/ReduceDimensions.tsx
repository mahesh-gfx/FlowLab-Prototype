import SvgIcon from "@mui/material/SvgIcon";

export default function ReduceDimension(props: any) {
  return (
    <SvgIcon {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-1.5 -4 24 24"
        width="24"
        height="24"
        preserveAspectRatio="xMinYMin"
      >
        <path
          fill={"props.color"}
          d="M10.638.786l8.85 3.551a1 1 0 0 1 .01 1.852l-8.85 3.664a1 1 0 0 1-.765 0L1.032 6.19a1 1 0 0 1 .01-1.852L9.892.786a1 1 0 0 1 .746 0zm5.759 8.31l3.091 1.241a1 1 0 0 1 .01 1.852l-8.85 3.664a1 1 0 0 1-.765 0L1.032 12.19a1 1 0 0 1 .01-1.852l3.091-1.24 5.176 2.142a2.5 2.5 0 0 0 1.912 0l5.176-2.142z"
        />
      </svg>
    </SvgIcon>
  );
}