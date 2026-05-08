export interface Lesson {
  id: string;
  title: string;
  content: string;
  visualizerType: 'relu' | 'ffn' | 'cnn' | 'rnn' | 'transformer' | 'optimizer' | 'linear_regression' | 'kmeans' | 'dropout' | 'resnet' | 'gan' | 'qlearning' | 'svm' | 'decision_tree' | 'pca' | 'batch_norm' | 'word2vec' | 'gnn' | 'autoencoder' | 'diffusion';
  quiz: Quiz;
}

export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
}
