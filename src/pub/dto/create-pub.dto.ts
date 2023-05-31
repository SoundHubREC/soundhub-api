export class CreatePubDto {
  userName: string;
  legalName: string;
  password: string;
  acessToken?: number;
  refreshToken?: number;
  code?: string;
}
