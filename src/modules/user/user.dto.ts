import { IsString, IsNumber, IsBoolean, IsOptional, Matches } from 'class-validator'
import { Type } from 'class-transformer'
import { User } from './user.entity'
import { Preference } from '@modules/preference/preference.entity'

export class UpdateNicknameDto {
    @IsString()
    @IsOptional()
    @Matches(/^(?!.*[_.]{2})(?![_.])[a-zA-Z가-힣0-9._]{2,12}(?<![_.])$/, {
        message: 'invalid nickname'
    })
    nickname: string

    public toEntity(): Partial<User>  {
        return User.fromUpdateNicknameDto(this)
    }
}

export class ProfileDto {
    avatarUrl: string
    nickname: string
    isReportPublic: boolean 
    preferences: Preference[]

    static fromEntity({avatarUrl, nickname, isReportPublic, preferences}: User): ProfileDto {
        const dto = new ProfileDto()
        dto.avatarUrl = avatarUrl 
        dto.nickname = nickname 
        dto.isReportPublic = isReportPublic
        dto.preferences = preferences
        return dto
    }
}

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    avatarUrl: string

    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isReportPublic: boolean 

    public toEntity(): Partial<User> {
        return User.fromUpdateProfileDto(this)
    }
}

export class AccountDto {
    provider: string
    name: string
    email: string
    nickname: string
    mobile: string
    mobileE164: string

    static fromEntity({ provider, name, email, nickname, mobile, mobileE164 }: User): AccountDto {
        const dto = new AccountDto()
        dto.provider = provider
        dto.name = name
        dto.email = email
        dto.nickname = nickname
        dto.mobile = mobile
        dto.mobileE164 = mobileE164
        return dto
    }
}

export class UpdateAccountDto {
    @IsString()
    @IsOptional()

    @Matches(/^(?!.*[_.]{2})(?![_.])[a-zA-Z가-힣0-9._]{2,12}(?<![_.])$/, {
        message: 'invalid nickname'
    })
    nickname: string

    @IsString()
    @IsOptional()
    mobile: string

    @IsString()
    @IsOptional()
    mobileE164: string

    public toEntity(): Partial<User> {
        return User.fromUpdateAccountDto(this)
    }
}