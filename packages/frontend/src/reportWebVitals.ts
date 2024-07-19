import { onCLS, onLCP } from "web-vitals";

const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onLCP(onPerfEntry);
  }
};

export default reportWebVitals;
