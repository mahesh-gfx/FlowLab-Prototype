import SvgIcon from "@mui/material/SvgIcon";

export default function FilterData(props: any) {
  return (
    <SvgIcon {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="21"
        viewBox="0 0 20 21"
        fill="none"
      >
        <path
          d="M1 4.99872H12C12 5.52915 12.2107 6.03786 12.5858 6.41293C12.9609 6.788 13.4696 6.99872 14 6.99872H16C16.5304 6.99872 17.0391 6.788 17.4142 6.41293C17.7893 6.03786 18 5.52915 18 4.99872H19C19.2652 4.99872 19.5196 4.89336 19.7071 4.70582C19.8946 4.51829 20 4.26393 20 3.99872C20 3.7335 19.8946 3.47915 19.7071 3.29161C19.5196 3.10408 19.2652 2.99872 19 2.99872H18C18 2.46829 17.7893 1.95958 17.4142 1.5845C17.0391 1.20943 16.5304 0.998718 16 0.998718H14C13.4696 0.998718 12.9609 1.20943 12.5858 1.5845C12.2107 1.95958 12 2.46829 12 2.99872H1C0.734784 2.99872 0.48043 3.10408 0.292893 3.29161C0.105357 3.47915 0 3.7335 0 3.99872C0 4.26393 0.105357 4.51829 0.292893 4.70582C0.48043 4.89336 0.734784 4.99872 1 4.99872ZM14 2.99872H16V3.99872V4.99872H14V2.99872ZM19 9.99872H10C10 9.46829 9.78929 8.95958 9.41421 8.58451C9.03914 8.20943 8.53043 7.99872 8 7.99872H6C5.46957 7.99872 4.96086 8.20943 4.58579 8.58451C4.21071 8.95958 4 9.46829 4 9.99872H1C0.734784 9.99872 0.48043 10.1041 0.292893 10.2916C0.105357 10.4791 0 10.7335 0 10.9987C0 11.2639 0.105357 11.5183 0.292893 11.7058C0.48043 11.8934 0.734784 11.9987 1 11.9987H4C4 12.5292 4.21071 13.0379 4.58579 13.4129C4.96086 13.788 5.46957 13.9987 6 13.9987H8C8.53043 13.9987 9.03914 13.788 9.41421 13.4129C9.78929 13.0379 10 12.5292 10 11.9987H19C19.2652 11.9987 19.5196 11.8934 19.7071 11.7058C19.8946 11.5183 20 11.2639 20 10.9987C20 10.7335 19.8946 10.4791 19.7071 10.2916C19.5196 10.1041 19.2652 9.99872 19 9.99872ZM6 11.9987V9.99872H8V10.9987V11.9987H6ZM19 16.9987H16C16 16.4683 15.7893 15.9596 15.4142 15.5845C15.0391 15.2094 14.5304 14.9987 14 14.9987H12C11.4696 14.9987 10.9609 15.2094 10.5858 15.5845C10.2107 15.9596 10 16.4683 10 16.9987H1C0.734784 16.9987 0.48043 17.1041 0.292893 17.2916C0.105357 17.4791 0 17.7335 0 17.9987C0 18.2639 0.105357 18.5183 0.292893 18.7058C0.48043 18.8934 0.734784 18.9987 1 18.9987H10C10 19.5292 10.2107 20.0379 10.5858 20.4129C10.9609 20.788 11.4696 20.9987 12 20.9987H14C14.5304 20.9987 15.0391 20.788 15.4142 20.4129C15.7893 20.0379 16 19.5292 16 18.9987H19C19.2652 18.9987 19.5196 18.8934 19.7071 18.7058C19.8946 18.5183 20 18.2639 20 17.9987C20 17.7335 19.8946 17.4791 19.7071 17.2916C19.5196 17.1041 19.2652 16.9987 19 16.9987ZM12 18.9987V16.9987H14V17.9987V18.9987H12Z"
          fill={props.color}
        />
      </svg>
    </SvgIcon>
  );
}
