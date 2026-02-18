import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MacrosController } from './macros.controller';
import { MacrosService } from './macros.service';
import { Macro } from './entities/macro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Macro])],
  controllers: [MacrosController],
  providers: [MacrosService],
  exports: [MacrosService],
})
export class MacrosModule {}
