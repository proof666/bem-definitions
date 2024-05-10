import { Position } from "./position";

export interface Location {
  file: string;
  start: Position;
  end: Position;
}
