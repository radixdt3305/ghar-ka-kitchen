import User from "../model/user.js";
import { IUserDocument } from "../interfaces/user.interface.js";
import { RegisterRequestDto } from "../dtos/request/register.dto.js";

export class UserRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() }).select("+password");
  }

  async findByPhone(phone: string): Promise<IUserDocument | null> {
    return User.findOne({ phone });
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async create(data: RegisterRequestDto): Promise<IUserDocument> {
    const user = new User(data);
    return user.save();
  }

  async updateVerificationStatus(
    userId: string,
    isVerified: boolean
  ): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(userId, { isVerified }, { new: true });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const count = await User.countDocuments({ phone });
    return count > 0;
  }
}

export const userRepository = new UserRepository();
