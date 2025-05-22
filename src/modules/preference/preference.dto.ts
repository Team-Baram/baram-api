import { IsString, IsNumber, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { Preference } from './preference.entity'

export class PreferenceDto {
    activityType: string 
    distance: number 
    pace: number
    activityDaysPerWeek: number

    static fromEntity({activityType, distance, pace, activityDaysPerWeek} : Preference): PreferenceDto {
        const dto = new PreferenceDto()
        dto.activityType = activityType
        dto.distance = distance
        dto.pace = pace
        dto.activityDaysPerWeek = activityDaysPerWeek
        return dto
    }
}

export class CreatePreferenceDto {
    @IsString()
    activityType: string 

    @Type(() => Number)
    @IsNumber()
    distance: number 

    @Type(() => Number)
    @IsNumber()
    pace: number

    @Type(() => Number)
    @IsNumber()
    activityDaysPerWeek: number

    public toEntity(): Partial<Preference> {
        return Preference.fromCreatePreferenceDto(this)
    }
}

export class UpdatePreferenceDto {
    @Type(() => Number)
    @IsNumber()
    id: number 

    @IsString()
    @IsOptional()
    activityType: string 

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    distance: number 

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    pace: number

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    activityDaysPerWeek: number

    public toEntity(): Partial<Preference> {
        return Preference.fromUpdatePreferenceDto(this)
    }
}