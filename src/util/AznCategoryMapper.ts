import { read, write, cwd, path, file } from 'fs-jetpack';
import { join } from 'path';

export class AznCategoryMapper {
  private static instance: AznCategoryMapper;
  private filePath: string = '';
  private map: Map<number, string> = new Map();

  constructor(filePath: string) {
    if (AznCategoryMapper.instance) {
      return AznCategoryMapper.instance;
    }

    this.filePath = join(__dirname, filePath);
    this.map = new Map();

    // Load the map from file if it exists
    this.loadFromFile();

    // Save this instance
    AznCategoryMapper.instance = this;
  }

  // Load the map from the file
  loadFromFile() {
    const fileData = read(this.filePath);

    if (fileData) {
      const parsedData = JSON.parse(fileData);
      this.map = new Map(parsedData);
    }
  }
  // Save the map to the file
  saveToFile() {
    const mapArray = Array.from(this.map.entries());
    write(this.filePath, JSON.stringify(mapArray));
  }

  // Set a value in the map and save to file
  set(key: number, value: string) {
    this.map.set(key, value);
    this.saveToFile();
  }

  // Get a value from the map
  get(key: number) {
    return this.map.get(key);
  }

  // Delete a value from the map and save to file
  delete(key: number) {
    const result = this.map.delete(key);
    this.saveToFile();
    return result;
  }

  // Check if the map has a key
  has(key: number) {
    return this.map.has(key);
  }

  // Get the size of the map
  size() {
    return this.map.size;
  }

  // Clear the map and save to file
  clear() {
    this.map.clear();
    this.saveToFile();
  }

  // Static method to get the singleton instance
  static getInstance(filePath: string) {
    if (!AznCategoryMapper.instance) {
      AznCategoryMapper.instance = new AznCategoryMapper(filePath);
    }
    return AznCategoryMapper.instance;
  }
}
