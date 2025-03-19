import {  format } from 'date-fns';

/**
 * Utilitários para trabalhar com datas em UTC de forma consistente no sistema
 */
export class DateUtils {
  
  /**
   * Converte uma string de data para um objeto Date em UTC
   * 
   * @param dateString String de data no formato 'YYYY-MM-DD'
   * @returns Objeto Date em UTC
   */
  static parseToUTC(dateString: string): Date {
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }
  
  /**
   * Converte uma string de data e hora para um objeto Date em UTC
   * 
   * @param dateTimeString String de data e hora
   * @returns Objeto Date em UTC
   */
  static parseTimeToUTC(dateTimeString: string): Date {
    const date = new Date(dateTimeString);
    return date;
  }
  
  /**
   * Retorna o início do dia em UTC para uma data
   * 
   * @param date Objeto Date
   * @returns Objeto Date representando o início do dia em UTC
   */
  static startOfDayUTC(date: Date): Date {
    const result = new Date(date);
    result.setUTCHours(0, 0, 0, 0);
    return result;
  }
  
  /**
   * Retorna o fim do dia em UTC para uma data
   * 
   * @param date Objeto Date
   * @returns Objeto Date representando o fim do dia em UTC
   */
  static endOfDayUTC(date: Date): Date {
    const result = new Date(date);
    result.setUTCHours(23, 59, 59, 999);
    return result;
  }
  
  /**
   * Formata uma data em UTC para string no formato 'YYYY-MM-DD'
   * 
   * @param date Objeto Date
   * @returns String formatada
   */
  static formatUTC(date: Date): string {
    // Cria uma cópia para não modificar a data original
    const utcDate = new Date(date.getTime());
    
    // Ajusta o fuso horário para UTC
    const offset = utcDate.getTimezoneOffset();
    if (offset !== 0) {
      // Adiciona o offset (em minutos) para converter para UTC
      // getTimezoneOffset retorna minutos, então multiplicamos por 60000 para converter para milissegundos
      utcDate.setTime(utcDate.getTime() + (offset * 60000));
    }
    
    // Converte para o formato ISO e pega apenas a parte da data (YYYY-MM-DD)
    return utcDate.toISOString().split('T')[0];
  }
  
  /**
   * Formata uma data e hora em UTC para string no formato 'YYYY-MM-DD HH:mm'
   * 
   * @param date Objeto Date
   * @returns String formatada
   */
  static formatTimeUTC(date: Date): string {
    return format(date, 'yyyy-MM-dd HH:mm');
  }
  
  /**
   * Cria uma data UTC a partir de partes de data e hora
   * 
   * @param year Ano
   * @param month Mês (0-11)
   * @param day Dia
   * @param hours Horas (opcional)
   * @param minutes Minutos (opcional)
   * @returns Objeto Date em UTC
   */
  static createUTCDate(
    year: number,
    month: number,
    day: number,
    hours: number = 0,
    minutes: number = 0
  ): Date {
    const date = new Date();
    date.setUTCFullYear(year, month, day);
    date.setUTCHours(hours, minutes, 0, 0);
    return date;
  }
  
  /**
   * Obtém o dia da semana em UTC (0 = Domingo, 1 = Segunda, etc.)
   * 
   * @param date Objeto Date
   * @returns Número representando o dia da semana em UTC
   */
  static getDayOfWeekUTC(date: Date): number {
    return date.getUTCDay();
  }
  
  /**
   * Adiciona dias a uma data em UTC
   * 
   * @param date Objeto Date
   * @param days Número de dias a adicionar
   * @returns Nova data em UTC
   */
  static addDaysUTC(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }
} 