import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common' 
import { TicketsService } from './tickets.service' 
import { ApiTags, ApiOperation } from '@nestjs/swagger' 
  
@ApiTags('tickets')  
@Controller('api/tickets')  
export class TicketsController { 
  constructor(private readonly ticketsService: TicketsService) {} 
  
  @Get()  
  findAll() {  
    return this.ticketsService.findAll();  
  } 
  
  @Get(':id')  
  findOne(@Param('id') id: string) {  
    return this.ticketsService.findOne(id);  
  } 
  
  @Post()  
  create(@Body() data: any) {  
    return this.ticketsService.create(data);  
  } 
  
  @Put(':id')  
  update(@Param('id') id: string, @Body() data: any) {  
    return this.ticketsService.update(id, data);  
  } 
  
  @Delete(':id')  
  remove(@Param('id') id: string) {  
    return this.ticketsService.remove(id);  
  }  
} 
