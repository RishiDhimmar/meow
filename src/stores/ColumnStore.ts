import { makeAutoObservable, runInAction, reaction } from "mobx";
import { v4 as uuidv4 } from "uuid";
import baseplateStore from "./BasePlateStore";
import wallStore from "./WallStore";

export interface Column {
  id: string;
  width: number;
  length: number;
  points: number[][];
}

export class ColumnStore {
  cornerWidth: number;
  cornerLength: number;
  horizontalWidth: number;
  horizontalLength: number;
  verticalWidth: number;
  verticalLength: number;
  columns: Column[] = [];

  constructor(
    cornerWidth: number = 0,
    cornerLength: number = 0,
    horizontalWidth: number = 0,
    horizontalLength: number = 0,
    verticalWidth: number = 0,
    verticalLength: number = 0
  ) {
    this.cornerLength = cornerLength;
    this.cornerWidth = cornerWidth;
    this.horizontalWidth = horizontalWidth;
    this.horizontalLength = horizontalLength;
    this.verticalWidth = verticalWidth;
    this.verticalLength = verticalLength;

    makeAutoObservable(this, {}, { autoBind: true });

    // Watch for changes in baseplates or wall points
    reaction(
      () => [
        baseplateStore.basePlates.slice(),
        wallStore.externalWallPoints.slice(),
      ],
      () => this.generateColumns()
    );
  }

  // Setters
  setCornerWidth(newWidth: number) {
    runInAction(() => {
      this.cornerWidth = newWidth;
    });
    this.generateColumns();
  }

  setCornerLength(newLength: number) {
    runInAction(() => {
      this.cornerLength = newLength;
    });
    this.generateColumns();
  }

  setHorizontalWidth(newWidth: number) {
    runInAction(() => {
      this.horizontalWidth = newWidth;
    });
    this.generateColumns();
  }

  setHorizontalLength(newLength: number) {
    runInAction(() => {
      this.horizontalLength = newLength;
    });
    this.generateColumns();
  }

  setVerticalWidth(newWidth: number) {
    runInAction(() => {
      this.verticalWidth = newWidth;
    });
    this.generateColumns();
  }

  setVerticalLength(newLength: number) {
    runInAction(() => {
      this.verticalLength = newLength;
    });
    this.generateColumns();
  }

  generateColumns() {
    // Filter plates by type
    const cornerPlates = baseplateStore.basePlates.filter(
      (plate) => plate.type === "corner"
    );

    const horizontalPlates = baseplateStore.basePlates.filter(
      (plate) => plate.type === "horizontal"
    );

    const verticalPlates = baseplateStore.basePlates.filter(
      (plate) => plate.type === "vertical"
    );

    // Check prerequisites
    const hasRequiredPlates =
      cornerPlates.length > 0 ||
      horizontalPlates.length > 0 ||
      verticalPlates.length > 0;
    const hasWallPoints = wallStore.externalWallPoints.length >= 4;

    if (!hasRequiredPlates || !hasWallPoints) {
      runInAction(() => {
        this.columns = [];
      });
      return;
    }

    const newColumns: Column[] = [];
    const { wallThickness } = wallStore;

    // Generate columns for corner plates - using original logic to maintain calculations
    if (cornerPlates.length > 0) {
      const plateConfig = baseplateStore.config[cornerPlates[0].type];
      const wallPoints = wallStore.externalWallPoints;

      // Use the original calculation logic
      const columnWidth =
        Math.abs(plateConfig.width) +
        (plateConfig.offsetY || 0) +
        wallThickness +
        this.cornerLength;
      // CORNER_ADDITION.length;

      const columnLength =
        Math.abs(plateConfig.length) +
        (plateConfig.offsetX || 0) +
        wallThickness +
        this.cornerWidth;
      // CORNER_ADDITION.width;


      // Generate corner columns exactly as in the original code
      newColumns.push(
        // Top-left
        {
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [wallPoints[0][0], wallPoints[0][1], 0],
            [wallPoints[0][0] + columnLength, wallPoints[0][1], 0],
            [
              wallPoints[0][0] + columnLength,
              wallPoints[0][1] + columnWidth,
              0,
            ],
            [wallPoints[0][0], wallPoints[0][1] + columnWidth, 0],
          ],
        },
        // Top-right
        {
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [wallPoints[1][0], wallPoints[1][1], 0],
            [wallPoints[1][0] - columnLength, wallPoints[1][1], 0],
            [
              wallPoints[1][0] - columnLength,
              wallPoints[1][1] + columnWidth,
              0,
            ],
            [wallPoints[1][0], wallPoints[1][1] + columnWidth, 0],
          ],
        },
        // Bottom-right
        {
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [wallPoints[2][0], wallPoints[2][1], 0],
            [wallPoints[2][0] - columnLength, wallPoints[2][1], 0],
            [
              wallPoints[2][0] - columnLength,
              wallPoints[2][1] - columnWidth,
              0,
            ],
            [wallPoints[2][0], wallPoints[2][1] - columnWidth, 0],
          ],
        },
        // Bottom-left
        {
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [wallPoints[3][0], wallPoints[3][1], 0],
            [wallPoints[3][0] + columnLength, wallPoints[3][1], 0],
            [
              wallPoints[3][0] + columnLength,
              wallPoints[3][1] - columnWidth,
              0,
            ],
            [wallPoints[3][0], wallPoints[3][1] - columnWidth, 0],
          ],
        }
      );
    }


    // Generate columns for horizontal plates
    horizontalPlates.forEach((plate) => {
      const { x, y } = plate;
      const plateConfig = baseplateStore.config[plate.type];

      // Use the original calculation logic
      const columnWidth =
        Math.abs(plateConfig.width) +
        (plateConfig.offsetY || 0) +
        wallThickness +
        this.horizontalWidth;

      const columnLength =
        Math.abs(plateConfig.length) +
        (plateConfig.offsetX || 0) +
        wallThickness +
        this.horizontalWidth;

      console.log(columnLength, columnWidth);

      if (plate.wall === "left") {
        newColumns.push({
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [
              x + plateConfig.length / 2 + this.horizontalLength,
              y -
                wallThickness / 2 -
                this.horizontalWidth / 2 -
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              0,
            ],
            [
              x -
                plateConfig.length / 2 -
                (plateConfig.offsetX ?? 0) -
                wallThickness,
              y -
                wallThickness / 2 -
                this.horizontalWidth / 2 -
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              0,
            ],
            [
              x -
                plateConfig.length / 2 -
                (plateConfig.offsetX ?? 0) -
                wallThickness,
              y +
                wallThickness / 2 +
                this.horizontalWidth / 2 +
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              0,
            ],
            [
              x + plateConfig.length / 2 + this.horizontalLength,
              y +
                wallThickness / 2 +
                this.horizontalWidth / 2 +
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              0,
            ],
          ],
        });
      } else {
        newColumns.push({
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [
              x +
                plateConfig.length / 2 +
                (plateConfig.offsetX ?? 0) +
                wallThickness,
              y -
                wallThickness / 2 -
                this.horizontalWidth / 2 -
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              0,
            ],
            [
              x - plateConfig.length / 2 - this.horizontalLength,
              y -
                wallThickness / 2 -
                this.horizontalWidth / 2 -
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              0,
            ],
            [
              x - plateConfig.length / 2 - this.horizontalLength,
              y +
                wallThickness / 2 +
                this.horizontalWidth / 2 +
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              0,
            ],
            [
              x +
                plateConfig.length / 2 +
                (plateConfig.offsetX ?? 0) +
                wallThickness,
              y +
                wallThickness / 2 +
                this.horizontalWidth / 2 +
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              0,
            ],
          ],
        });
      }
    });

    // Generate columns for vertical plates
    verticalPlates.forEach((plate) => {
      const { x, y } = plate;
      const plateConfig = baseplateStore.config[plate.type];

      // Use the original calculation logic
      const columnWidth =
        Math.abs(plateConfig.width) + (plateConfig.offsetY || 0);
      // wallThickness +
      // this.verticalWidth;

      const columnLength =
        Math.abs(plateConfig.length) +
        (plateConfig.offsetX || 0) +
        wallThickness +
        this.verticalWidth;

      if (plate.wall === "bottom") {
        newColumns.push({
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [
              x -
                wallThickness / 2 -
                columnWidth / 2 -
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              y -
                plateConfig.width / 2 -
                (plateConfig.offsetY ?? 0) -
                wallThickness,
              0,
            ],
            [
              x -
                wallThickness / 2 -
                columnWidth / 2 -
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              y +
                plateConfig.width / 2 +
                (plateConfig.offsetY ?? 0) +
                this.verticalLength,
              0,
            ],
            [
              x +
                wallThickness / 2 +
                columnWidth / 2 +
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              y +
                plateConfig.width / 2 +
                (plateConfig.offsetY ?? 0) +
                this.verticalLength,
              0,
            ],
            [
              x +
                wallThickness / 2 +
                columnWidth / 2 +
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              y -
                plateConfig.width / 2 -
                (plateConfig.offsetY ?? 0) -
                wallThickness,
              0,
            ],
          ],
        });
      } else {
        newColumns.push({
          id: uuidv4(),
          width: columnWidth,
          length: columnLength,
          points: [
            [
              x -
                wallThickness / 2 -
                columnWidth / 2 -
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              y +
                plateConfig.width / 2 +
                (plateConfig.offsetY ?? 0) +
                wallThickness,
              0,
            ],
            [
              x -
                wallThickness / 2 -
                columnWidth / 2 -
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              y - plateConfig.width / 2 - this.verticalLength,
              0,
            ],
            [
              x +
                wallThickness / 2 +
                columnWidth / 2 +
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              y - plateConfig.width / 2 - this.verticalLength,
              0,
            ],
            [
              x +
                wallThickness / 2 +
                columnWidth / 2 +
                (columnLength - wallThickness > 0
                  ? columnLength / 2 - wallThickness
                  : 0),
              y +
                plateConfig.width / 2 +
                (plateConfig.offsetY ?? 0) +
                wallThickness,
              0,
            ],
          ],
        });
      }
    });

    // Update the store with the new columns
    runInAction(() => {
      this.columns = newColumns;
    });
  }
}

// Create and export the singleton instance
const columnStore = new ColumnStore(0, 0, 0, 0, 0, 0);
export default columnStore;
