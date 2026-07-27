import { UserRepository } from "../repositories/user.repository";
import { SafeUser } from "../entities/user.entity";
import { RegisterDto } from "../dtos/auth/register.dto";
import { LoginDto } from "../dtos/auth/login.dto";
import { AppError } from "../utils/app-error";
import { hashPassword, comparePassword } from "../utils/password.util";
import { signAccessToken } from "../utils/jwt.util";

export interface AuthResult {
  readonly user: SafeUser;
  readonly token: string;
}

function toSafeUser<T extends { password: string }>(user: T): Omit<T, "password"> {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export class AuthService {
  constructor(private readonly userRepository: UserRepository = new UserRepository()) {}

  async register(dto: RegisterDto): Promise<SafeUser> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw AppError.conflict("A user with this email already exists");
    }

    const hashedPassword = await hashPassword(dto.password);
    const user = await this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      role: dto.role
    });

    return toSafeUser(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const isMatch = await comparePassword(dto.password, user.password);
    if (!isMatch) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });

    return { user: toSafeUser(user), token };
  }
}
