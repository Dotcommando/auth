export interface ICorrelatedMsg<TData = any> {
  correlationId: string;
  data: TData;
}
