import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import {
  ProfileDto,
  AccountDto,
  UpdateNicknameDto,
  UpdateProfileDto,
  UpdateAccountDto,
} from './user.dto';
import { winstonLogger } from '@utils';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async fetchUserByOauth(
    oauthId: string,
    provider: string,
  ): Promise<User | null> {
    try {
      return await this.userRepository.findByOauth(oauthId, provider);
    } catch (err) {
      winstonLogger.error(`Failed to fetch user`, err.stack);
      throw err;
    }
  }

  async isNickNameAvailable(id: string, nickname: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findByNickname(nickname);

      if (user) {
        return user.id === id;
      } else {
        return true;
      }
    } catch (err) {
      winstonLogger.error(`Failed to check nickname available`, err.stack);
      throw err;
    }
  }

  async fetchProfile(id: string): Promise<ProfileDto> {
    try {
      const user = await this.userRepository.findByIdWithPreferences(id);

      if (user) {
        return ProfileDto.fromEntity(user);
      } else {
        throw Error();
      }
    } catch (err) {
      winstonLogger.error(`Failed to fetch profile`, err.stack);
      throw err;
    }
  }

  async fetchAccount(id: string): Promise<AccountDto> {
    try {
      const user = await this.userRepository.findById(id);

      if (user) {
        return AccountDto.fromEntity(user);
      } else {
        throw Error();
      }
    } catch (err) {
      winstonLogger.error(`Failed to fetch account`, err.stack);
      throw err;
    }
  }

  async createOauthUser(data: Partial<User>): Promise<User> {
    try {
      return await this.userRepository.save(data);
    } catch (err) {
      winstonLogger.error(`Failed to create oauth user`, err.stack);
      throw err;
    }
  }

  async updateUser(
    id: string,
    dto: UpdateNicknameDto | UpdateProfileDto | UpdateAccountDto,
  ): Promise<void> {
    try {
      const user = dto.toEntity();
      await this.userRepository.updateUserById(id, user);
    } catch (err) {
      winstonLogger.error(`Failed to update user`, err.stack);
      throw err;
    }
  }

  async deleteUserById(id: string): Promise<void> {
    try {
      await this.userRepository.remove(id);
    } catch (err) {
      winstonLogger.error(`Failed to delete user`, err.stack);
      throw err;
    }
  }
}
