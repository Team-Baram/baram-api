import { Injectable } from '@nestjs/common'
import { PreferenceRepository } from './preference.repository'
import { Preference } from './preference.entity'
import { CreatePreferenceDto, PreferenceDto, UpdatePreferenceDto } from './preference.dto'

@Injectable()
export class PreferenceService {
    constructor(
        private readonly preferenceRepository: PreferenceRepository
    ){}

    async createPreference(userId: string, dto: CreatePreferenceDto): Promise<PreferenceDto> {
        const entity = dto.toEntity()
        const preference = await this.preferenceRepository.save(userId, entity)
        return PreferenceDto.fromEntity(preference) 
    }

    async updatePreference(dto: UpdatePreferenceDto): Promise<void> {
        const preference = dto.toEntity()
        await this.preferenceRepository.updatePreferenceById(dto.id, preference)
    }
}

