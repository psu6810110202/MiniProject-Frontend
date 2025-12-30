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