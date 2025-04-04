import { supabase } from './supabase';
import { IStorage } from './storage';
import {
  User, InsertUser,
  Professional, InsertProfessional,
  ActivityType, InsertActivityType,
  TimeSlot, InsertTimeSlot,
  Schedule, InsertSchedule,
  WeekDay,
  defaultActivityTypes
} from '@shared/schema';

export class SupabaseStorage implements IStorage {
  constructor() {
    // Inicializa as tabelas básicas
    this.setupDatabase().catch(err => {
      console.error("Erro ao configurar banco de dados Supabase:", err);
    });
  }

  async setupDatabase() {
    try {
      // Verifica se já existem tipos de atividades
      const { data: existingActivityTypes, error: activityError } = await supabase
        .from('activity_types')
        .select('*');
      
      if (activityError) {
        console.error("Erro ao verificar tipos de atividades:", activityError);
      } else if (!existingActivityTypes || existingActivityTypes.length === 0) {
        console.log("Inicializando tipos de atividades padrão no Supabase");
        for (const activityType of defaultActivityTypes) {
          await this.createActivityType(activityType);
        }
      }

      // Verifica se já existem slots de tempo
      const { data: existingTimeSlots, error: timeSlotsError } = await supabase
        .from('time_slots')
        .select('*');
      
      if (timeSlotsError) {
        console.error("Erro ao verificar slots de tempo:", timeSlotsError);
      } else if (!existingTimeSlots || existingTimeSlots.length === 0) {
        console.log("Inicializando slots de tempo padrão no Supabase");
        const defaultTimeSlots: InsertTimeSlot[] = [
          { startTime: "08:00", endTime: "08:30", interval: 30, isBaseSlot: 1 },
          { startTime: "08:30", endTime: "09:00", interval: 30, isBaseSlot: 1 },
          { startTime: "09:00", endTime: "09:30", interval: 30, isBaseSlot: 1 },
          { startTime: "09:30", endTime: "10:00", interval: 30, isBaseSlot: 1 },
          { startTime: "10:00", endTime: "10:30", interval: 30, isBaseSlot: 1 },
          { startTime: "10:30", endTime: "11:00", interval: 30, isBaseSlot: 1 },
          { startTime: "11:00", endTime: "11:30", interval: 30, isBaseSlot: 1 },
          { startTime: "11:30", endTime: "12:00", interval: 30, isBaseSlot: 1 },
          { startTime: "13:00", endTime: "13:30", interval: 30, isBaseSlot: 1 },
          { startTime: "13:30", endTime: "14:00", interval: 30, isBaseSlot: 1 },
          { startTime: "14:00", endTime: "14:30", interval: 30, isBaseSlot: 1 },
          { startTime: "14:30", endTime: "15:00", interval: 30, isBaseSlot: 1 },
          { startTime: "15:00", endTime: "15:30", interval: 30, isBaseSlot: 1 },
          { startTime: "15:30", endTime: "16:00", interval: 30, isBaseSlot: 1 },
          { startTime: "16:00", endTime: "16:30", interval: 30, isBaseSlot: 1 },
          { startTime: "16:30", endTime: "17:00", interval: 30, isBaseSlot: 1 }
        ];
        
        for (const timeSlot of defaultTimeSlots) {
          await this.createTimeSlot(timeSlot);
        }
      }

      // Verifica se já existem profissionais
      const { data: existingProfessionals, error: professionalsError } = await supabase
        .from('professionals')
        .select('*');
      
      if (professionalsError) {
        console.error("Erro ao verificar profissionais:", professionalsError);
      } else if (!existingProfessionals || existingProfessionals.length === 0) {
        console.log("Inicializando profissionais de exemplo no Supabase");
        const defaultProfessionals: InsertProfessional[] = [
          { name: "Prof. Paulo", initials: "PP", active: 1 },
          { name: "Profa. Ana Maria", initials: "AM", active: 1 },
          { name: "Prof. Carlos", initials: "CL", active: 1 },
          { name: "Prof. João", initials: "JM", active: 1 },
          { name: "Profa. Maria", initials: "MM", active: 1 }
        ];
        
        for (const professional of defaultProfessionals) {
          await this.createProfessional(professional);
        }
      }

      console.log("Configuração do banco de dados Supabase concluída com sucesso");
    } catch (err) {
      console.error("Erro durante a configuração do banco de dados Supabase:", err);
      throw err;
    }
  }
  // Usuários
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Erro ao criar usuário: ${error?.message || 'Desconhecido'}`);
    }
    
    return data as User;
  }
  
  // Profissionais
  async getAllProfessionals(): Promise<Professional[]> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .order('name');
    
    if (error) {
      throw new Error(`Erro ao buscar profissionais: ${error.message}`);
    }
    
    return data as Professional[] || [];
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Professional;
  }

  async createProfessional(professional: InsertProfessional): Promise<Professional> {
    const { data, error } = await supabase
      .from('professionals')
      .insert(professional)
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Erro ao criar profissional: ${error?.message || 'Desconhecido'}`);
    }
    
    return data as Professional;
  }

  async updateProfessional(id: number, data: Partial<InsertProfessional>): Promise<Professional | undefined> {
    const { data: updatedData, error } = await supabase
      .from('professionals')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !updatedData) return undefined;
    return updatedData as Professional;
  }

  async deleteProfessional(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id);
    
    return !error;
  }
  
  // Tipos de Atividades
  async getAllActivityTypes(): Promise<ActivityType[]> {
    const { data, error } = await supabase
      .from('activity_types')
      .select('*')
      .order('name');
    
    if (error) {
      throw new Error(`Erro ao buscar tipos de atividades: ${error.message}`);
    }
    
    return data as ActivityType[] || [];
  }

  async getActivityType(id: number): Promise<ActivityType | undefined> {
    const { data, error } = await supabase
      .from('activity_types')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as ActivityType;
  }

  async getActivityTypeByCode(code: string): Promise<ActivityType | undefined> {
    const { data, error } = await supabase
      .from('activity_types')
      .select('*')
      .eq('code', code)
      .single();
    
    if (error || !data) return undefined;
    return data as ActivityType;
  }

  async createActivityType(activityType: InsertActivityType): Promise<ActivityType> {
    const { data, error } = await supabase
      .from('activity_types')
      .insert(activityType)
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Erro ao criar tipo de atividade: ${error?.message || 'Desconhecido'}`);
    }
    
    return data as ActivityType;
  }

  async updateActivityType(id: number, data: Partial<InsertActivityType>): Promise<ActivityType | undefined> {
    const { data: updatedData, error } = await supabase
      .from('activity_types')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !updatedData) return undefined;
    return updatedData as ActivityType;
  }

  async deleteActivityType(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('activity_types')
      .delete()
      .eq('id', id);
    
    return !error;
  }
  
  // Horários
  async getAllTimeSlots(): Promise<TimeSlot[]> {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('startTime');
    
    if (error) {
      throw new Error(`Erro ao buscar horários: ${error.message}`);
    }
    
    return data as TimeSlot[] || [];
  }

  async getBaseTimeSlots(): Promise<TimeSlot[]> {
    // Suponha que os slots base não tenham alguma propriedade específica
    // ou tenham uma flag "isBase" = true, por exemplo
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('startTime');
    
    if (error) {
      throw new Error(`Erro ao buscar horários base: ${error.message}`);
    }
    
    return data as TimeSlot[] || [];
  }

  async getTimeSlot(id: number): Promise<TimeSlot | undefined> {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as TimeSlot;
  }

  async createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const { data, error } = await supabase
      .from('time_slots')
      .insert(timeSlot)
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Erro ao criar horário: ${error?.message || 'Desconhecido'}`);
    }
    
    return data as TimeSlot;
  }

  async deleteTimeSlot(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', id);
    
    return !error;
  }
  
  // Escalas
  async getSchedulesByDay(weekday: WeekDay): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('weekday', weekday);
    
    if (error) {
      throw new Error(`Erro ao buscar escalas por dia: ${error.message}`);
    }
    
    return data as Schedule[] || [];
  }

  async getSchedulesByProfessional(professionalId: number): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('professionalId', professionalId);
    
    if (error) {
      throw new Error(`Erro ao buscar escalas por profissional: ${error.message}`);
    }
    
    return data as Schedule[] || [];
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Schedule;
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Erro ao criar escala: ${error?.message || 'Desconhecido'}`);
    }
    
    return data as Schedule;
  }

  async updateSchedule(id: number, data: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const { data: updatedData, error } = await supabase
      .from('schedules')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !updatedData) return undefined;
    return updatedData as Schedule;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);
    
    return !error;
  }
}