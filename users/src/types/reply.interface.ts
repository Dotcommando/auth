// For transferring messages between microservices
export interface IReply<T> {
  data: T | null;
  total?: number;
  errors?: string[];
}
