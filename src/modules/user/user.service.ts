import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { ProfileDto, AccountDto, UpdateNicknameDto, UpdateProfileDto, UpdateAccountDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async fetchUserByOauth(oauthId: string, provider: string): Promise<User | null> {
    return await this.userRepository.findByOauth(oauthId, provider);
  }

  async isNickNameAvailable(id: string, nickname: string): Promise<boolean> {
    const user =  await this.userRepository.findByNickname(nickname);
    
    if (user) {
      return user.id === id
    } else {
      return true
    }
  }

  async fetchProfile(id: string): Promise<ProfileDto> {
    const user =  await this.userRepository.findByIdWithPreferences(id);
  
    if (user) {
      return ProfileDto.fromEntity(user)
    } else {
      throw Error()
    }
  }

  async fetchAccount(id: string): Promise<AccountDto> {
    const user = await this.userRepository.findById(id);

    if (user) {
      return AccountDto.fromEntity(user)
    } else {
      throw Error()
    }
  }

  async createOauthUser(data: Partial<User>): Promise<User> {
    return await this.userRepository.save(data);
  }

  async updateUser(id: string, dto: UpdateNicknameDto | UpdateProfileDto | UpdateAccountDto ): Promise<void> {
    const user = dto.toEntity() 
    await this.userRepository.updateUserById(id, user);
  }

  async deleteUserById(id: string): Promise<void> {
    await this.userRepository.remove(id);
  }
}
