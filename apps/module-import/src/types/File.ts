export interface ImportedData {
  __status: 'READY' | 'IMPORTING' | 'IMPORTED' | 'ERROR';
  __id: number;
  __expand: boolean;
  __error?: string;
  [key: string]: unknown;
}
