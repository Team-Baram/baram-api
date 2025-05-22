import { Injectable } from '@nestjs/common';
import { PreferenceRepository } from './preference.repository';
import {
  CreatePreferenceDto,
  PreferenceDto,
  UpdatePreferenceDto,
} from './preference.dto';
import { winstonLogger } from '@utils';

@Injectable()
export class PreferenceService {
  constructor(private readonly preferenceRepository: PreferenceRepository) {}

  async createPreference(
    userId: string,
    dto: CreatePreferenceDto,
  ): Promise<PreferenceDto> {
    try {
      const entity = dto.toEntity();
      const preference = await this.preferenceRepository.save(userId, entity);
      return PreferenceDto.fromEntity(preference);
    } catch (err) {
      winstonLogger.error('Failed to create preference', err.stack);
      throw err;
    }
  }

  async updatePreference(dto: UpdatePreferenceDto): Promise<void> {
    try {
      const preference = dto.toEntity();
      await this.preferenceRepository.updatePreferenceById(dto.id, preference);
    } catch (err) {
      winstonLogger.error('Failed to update preference', err.stack);
      throw err;
    }
  }
}
