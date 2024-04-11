export class ResponseDto {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly data: any
  ) {}
}
