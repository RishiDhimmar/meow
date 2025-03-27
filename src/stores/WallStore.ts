import { makeAutoObservable } from "mobx";
import {
  getInternalWallPoints,
  getRectanglePoints,
} from "../utils/geometryUtils";

export class WallStore {
  width: number;
  height: number;
  wallThickness: number;
  externalWallPoints: number[][] = [];
  internalWallPoints: number[][] = [];

  constructor(width = 0, height = 0, wallThickness = 0) {
    this.width = width;
    this.height = height;
    this.wallThickness = wallThickness;
    makeAutoObservable(this);
    this.updateWallPoints();
  }

  setWidth(newWidth: number) {
    this.width = newWidth;
    this.updateWallPoints();
  }

  setHeight(newHeight: number) {
    this.height = newHeight;
    this.updateWallPoints();
  }

  setWallThickness(newWallThickness: number) {
    if (newWallThickness < 0) {
      newWallThickness = 0;
    }
    this.wallThickness = newWallThickness;
    this.updateWallPoints();
  }

  updateWallPoints() {
    this.externalWallPoints = getRectanglePoints(this.width, this.height, [0, 0]);
    this.internalWallPoints = getInternalWallPoints(
      this.width,
      this.height,
      this.wallThickness
    );
  }
}

// const wallStore = new WallStore(23350, 15126, 600);
const wallStore = new WallStore(16, 24, 0.325);
export default wallStore;
