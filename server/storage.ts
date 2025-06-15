// Note: User management not implemented yet - keeping storage interface for future use

// Simple placeholder storage for future use
export interface IStorage {
  // Add storage methods as needed
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize storage as needed
  }
}

export const storage = new MemStorage();