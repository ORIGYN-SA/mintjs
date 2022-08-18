export type KnownError<T> = {
  error_code: T;
};

export type OrigynError = {
  text: string;
  error: object;
  number: BigInt;
  flag_point: string;
};

export type OrigynResponse<T, K> = {
  ok?: T;
  err?: OrigynError | KnownError<K>;
};
