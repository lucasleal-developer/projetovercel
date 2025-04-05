import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getActivityColor, getActivityName } from "@/utils/activityColors";

// Componente de loading spinner
function LoadingSpinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };
  
  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="animate-spin"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}

interface Professional {
  id: number;
  name: string;
  initials: string;
}

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
}

interface ActivityType {
  id: number;
  code: string;
  name: string;
  color: string;
}

interface Schedule {
  id: number;
  professionalId: number;
  weekday: string;
  startTime: string;
  endTime: string;
  activityCode: string;
  location: string;
  notes: string;
}

interface ScheduleCell {
  weekday: string;
  activity?: {
    code: string;
    name: string;
    location?: string;
    notes?: string;
  };
}

interface DailySchedule {
  weekday: string;
  formattedName: string;
  schedules: Schedule[];
}

interface WeeklyProfessorScheduleProps {
  professional: Professional;
}

export function WeeklyProfessorSchedule({ professional }: WeeklyProfessorScheduleProps) {
  const [weeklyData, setWeeklyData] = useState<Record<string, ScheduleCell[]>>({});
  
  // Constantes para dias da semana
  const weekdays = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
  const weekdayNames: Record<string, string> = {
    "segunda": "Segunda",
    "terca": "Terça",
    "quarta": "Quarta",
    "quinta": "Quinta",
    "sexta": "Sexta",
    "sabado": "Sábado",
    "domingo": "Domingo"
  };
  
  // Buscar slots de tempo
  const { data: timeSlots, isLoading: timeSlotsLoading } = useQuery({
    queryKey: ['/api/time-slots'],
    staleTime: 30000
  });
  
  // Buscar tipos de atividade
  const { data: activityTypes, isLoading: activityTypesLoading } = useQuery({
    queryKey: ['/api/activity-types'],
    staleTime: 30000
  });
  
  // Buscar escalas para cada dia da semana
  const weekdayQueries = weekdays.map(weekday => {
    return useQuery({
      queryKey: [`/api/schedules/${weekday}`],
      staleTime: 5000,
      enabled: !!professional
    });
  });
  
  // Processar dados quando todas as queries estiverem completas
  useEffect(() => {
    if (professional && timeSlots && !timeSlotsLoading && 
        weekdayQueries.every(query => query.data && !query.isLoading)) {
      
      // Organizamos os dados por time slot e dia da semana
      const weeklyScheduleData: Record<string, ScheduleCell[]> = {};
      
      // Inicializar a grade vazia com todos os slots de tempo
      if (Array.isArray(timeSlots)) {
        timeSlots.forEach((timeSlot: TimeSlot) => {
          const timeKey = `${timeSlot.startTime}-${timeSlot.endTime}`;
          weeklyScheduleData[timeKey] = weekdays.map(weekday => ({
            weekday
          }));
        });
      }
      
      // Preencher com as atividades do professor para cada dia
      weekdayQueries.forEach((query, index) => {
        const weekday = weekdays[index];
        const data = query.data;
        
        // Verificar se os dados da API são válidos
        if (data && Array.isArray(data.profissionais)) {
          // Procurar pelo profissional atual
          const profData = data.profissionais.find((p: any) => p.id === professional.id);
          
          if (profData && Array.isArray(profData.horarios)) {
            profData.horarios.forEach((schedule: any) => {
              const timeKey = `${schedule.inicio}-${schedule.fim}`;
              
              // Se o slot de tempo existe na grade
              if (weeklyScheduleData[timeKey]) {
                // Encontrar o índice correto para o dia da semana
                const dayIndex = weekdays.indexOf(weekday);
                
                // Adicionar a atividade
                if (dayIndex >= 0 && weeklyScheduleData[timeKey][dayIndex]) {
                  weeklyScheduleData[timeKey][dayIndex] = {
                    weekday,
                    activity: {
                      code: schedule.atividade,
                      name: getActivityName(schedule.atividade),
                      location: schedule.local,
                      notes: schedule.observacoes
                    }
                  };
                }
              }
            });
          }
        }
      });
      
      setWeeklyData(weeklyScheduleData);
    }
  }, [professional, timeSlots, activityTypes, weekdayQueries, timeSlotsLoading]);
  
  // Verificar se está carregando
  const isLoading = timeSlotsLoading || activityTypesLoading || 
                    weekdayQueries.some(query => query.isLoading);
  
  // Função para renderizar uma célula da grade
  const renderCell = (cell: ScheduleCell) => {
    if (!cell.activity) {
      return <div className="h-full"></div>;
    }
    
    const activityCode = cell.activity.code;
    const colors = getActivityColor(activityCode);
    
    return (
      <div className={`h-full p-2 ${colors.bg} rounded`}>
        <div className="text-sm font-medium">{cell.activity.name}</div>
        {cell.activity.location && (
          <div className="text-xs mt-1 opacity-75">{cell.activity.location}</div>
        )}
      </div>
    );
  };
  
  // Formatar hora para exibição
  const formatTime = (time: string) => {
    return time.replace(/:(\d+)$/, "h$1");
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center justify-center">
            <LoadingSpinner size="sm" className="mr-2" />
            Carregando dados...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="bg-blue-50 border-b pb-2">
        <CardTitle className="text-xl flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
            <span className="text-blue-800 font-medium text-xs">{professional.initials}</span>
          </div>
          <span>Grade Semanal de {professional.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-max">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 border text-left font-medium text-sm">Horário</th>
                {weekdays.map(day => (
                  <th key={day} className="p-3 border text-center font-medium text-sm">
                    {weekdayNames[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(weeklyData)
                .sort(([timeA], [timeB]) => {
                  const startTimeA = timeA.split('-')[0];
                  const startTimeB = timeB.split('-')[0];
                  return startTimeA.localeCompare(startTimeB);
                })
                .map(([timeRange, cells]) => {
                  const [startTime, endTime] = timeRange.split('-');
                  
                  return (
                    <tr key={timeRange} className="border-b hover:bg-gray-50">
                      <td className="p-2 border font-medium text-sm">
                        {formatTime(startTime)} - {formatTime(endTime)}
                      </td>
                      {cells.map((cell, idx) => (
                        <td key={`${timeRange}-${cell.weekday}`} className="p-0.5 border h-12">
                          {renderCell(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}