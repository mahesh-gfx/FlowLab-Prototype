import Binning from "./Binning";
import ParallelCoordinates from "./ParallelCoordinates";
import ChartBar from "./ChartBar";
import CleanData from "./CleanData";
import FileCSV from "./FileCsv";
import FilterData from "./FilterData";
import Matrix from "./Matrix";
import Normalize from "./Normalize";
import PlayCircle from "./PlayCircle";
import ReduceDimension from "./ReduceDimensions";
import Sampling from "./Sampling";

export interface IconProps {
  color?: string;
  fontSize?: "inherit" | "large" | "medium" | "small" | string;
}

const icons: Record<string, React.FC> = {
  FileCsv: FileCSV,
  PlayCircle: PlayCircle,
  Sampling: Sampling,
  CleanData: CleanData,
  Filter: FilterData,
  Normalize: Normalize,
  ReduceDimensions: ReduceDimension,
  ChartBar: ChartBar,
  Bin: Binning,
  ScatterMatrix: Matrix,
  ParallelCoordinates: ParallelCoordinates,

  // Add more icons here...
};

export default icons;
