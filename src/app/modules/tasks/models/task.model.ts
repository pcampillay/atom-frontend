// Define la interfaz para el timestamp de Firestore
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Task {
  id: string | number;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at?: string | FirestoreTimestamp;
  updatedAt?: Date;
}