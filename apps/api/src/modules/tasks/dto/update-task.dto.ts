import { Priority, TaskStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'futureDate' })
class FutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value) return true;
    return new Date(value) > new Date();
  }

  defaultMessage() {
    return 'Please select a valid deadline (must be a future date)';
  }
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string | null;

  @IsOptional()
  @IsDateString()
  @Validate(FutureDateConstraint)
  dueDate?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
