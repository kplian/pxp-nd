//import { FindOperator } from 'typeorm';
export default interface ListParam {
  where?: {
    [key: string]: any
  }[];
  skip: number;
  take: number;
  order: {
    [key: string]: string
  }
}