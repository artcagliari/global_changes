export interface Submission {
    id: string;
    userId: string;
    userName: string; // Adicionado para facilitar a exibição no admin
    videoUrl: string; // Simularemos isso com um nome de arquivo
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
  }
  
  export interface Reward {
    id: string;
    name: string;
    pointCost: number;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    points: number;
  }