// src/types.ts

export interface TeamMember {
  studentId: string;
  name: string;
  role: 'Frontend Developer' | 'Backend Developer' | 'Full Stack Developer';
  imageUrl: string;
  githubUrl?: string;
}

export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
}

// Product Types
export interface Item {
  id: number | string;
  name: string;
  price: string;
  category: string;
  fandom: string;
  image: string;
  description?: string; // Added for detailed view
  gallery?: string[];   // Added for multiple images
  stock?: number;       // Added for inventory tracking
}

export interface PreOrderItem {
  id: number;
  name: string;
  price: number;
  deposit: number;
  preOrderCloseDate?: string; // Changed from releaseDate
  image: string;
  description: string;
  fandom: string;
  category: string;
  gallery?: string[];
  domesticShipping?: number;
}