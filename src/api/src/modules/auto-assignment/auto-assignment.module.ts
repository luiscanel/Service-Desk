import { Module } from '@nestjs/common' 
import { AutoAssignmentService } from './auto-assignment.service' 
  
@Module({ 
  providers: [AutoAssignmentService], 
  exports: [AutoAssignmentService], 
}) 
export class AutoAssignmentModule {} 
