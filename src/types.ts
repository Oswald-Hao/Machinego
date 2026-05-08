export interface Lesson {
  id: string;
  title: string;
  content: string;
  visualizerType: 'relu' | 'ffn' | 'cnn' | 'rnn' | 'transformer' | 'optimizer' | 'linear_regression' | 'kmeans' | 'dropout';
  quiz: Quiz;
}

export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
}
