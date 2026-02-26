import { UserRole } from "../../constants/enums.js";
import { IAddress } from "../../interfaces/user.interface.js";

export interface RegisterRequestDto {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: UserRole;
  addresses?: IAddress[];
}
