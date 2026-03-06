class ApiRespons {
  statusCode: number;
  message: string;
  data: any;
  success: boolean;

  constructor(
    statusCode: number,
    data: any,
    message: string = "Success",
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = this.statusCode < 400;
  }
}

export { ApiRespons };
