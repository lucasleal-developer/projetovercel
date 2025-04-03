import { useState, useMemo, useEffect } from "react";
import { 
  type ActivityType, 
  type ScheduleTimeSlot,
  type ScheduleActivity,
  type ScheduleProfessional,
  type ScheduleTableData
} from "@shared/schema";
import { getActivityColor, getActivityName } from "@/utils/activityColors";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

// Interface para rastrear células selecionadas
export interface SelectedCell {
  professional: ScheduleProfessional;
  timeSlot: ScheduleTimeSlot;
  activity?: ScheduleActivity;
}

// Função auxiliar para converter horário em minutos (para cálculos)
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

interface ScheduleTableProps {
  data: ScheduleTableData | null;
  timeSlots: ScheduleTimeSlot[];
  isLoading: boolean;
  onCellClick: (professional: ScheduleProfessional, timeSlot: ScheduleTimeSlot, activity?: ScheduleActivity) => void;
  onSelectedCellsChange?: (cells: SelectedCell[]) => void;
}

export function ScheduleTable({ 
  data, 
  timeSlots, 
  isLoading, 
  onCellClick,
  onSelectedCellsChange 
}: ScheduleTableProps) {
  const [selectedCells, setSelectedCells] = useState<SelectedCell[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Buscar os tipos de atividades para obter as cores
  // O staleTime: 0 garante que os dados serão atualizados sempre que o componente for montado
  const { data: activityTypesData } = useQuery<ActivityType[]>({
    queryKey: ["/api/activity-types"],
    staleTime: 0,
    refetchOnMount: true,
    // Ao receber os dados, salvar no localStorage para uso em outras partes da aplicação
    onSuccess: (data: ActivityType[]) => {
      if (data) {
        localStorage.setItem('activityTypes', JSON.stringify(data));
      }
    }
  });
  
  // Função para encontrar a atividade de um profissional em um determinado horário
  const findActivity = (professional: ScheduleProfessional, startTime: string) => {
    return professional.horarios.find(h => h.hora === startTime);
  };
  
  // Função para alternar a seleção de uma célula
  const toggleCellSelection = (professional: ScheduleProfessional, timeSlot: ScheduleTimeSlot, activity?: ScheduleActivity) => {
    const cellKey = `${professional.id}-${timeSlot.startTime}`;
    
    // Verificar se a célula já está selecionada
    const isSelected = selectedCells.some(
      cell => cell.professional.id === professional.id && cell.timeSlot.startTime === timeSlot.startTime
    );
    
    if (isSelected) {
      // Remover da seleção
      setSelectedCells(prev => prev.filter(
        cell => !(cell.professional.id === professional.id && cell.timeSlot.startTime === timeSlot.startTime)
      ));
    } else {
      // Adicionar à seleção
      setSelectedCells(prev => [...prev, { professional, timeSlot, activity }]);
    }
  };
  
  // Função para verificar se uma célula está selecionada
  const isCellSelected = (professional: ScheduleProfessional, timeSlot: ScheduleTimeSlot) => {
    return selectedCells.some(
      cell => cell.professional.id === professional.id && cell.timeSlot.startTime === timeSlot.startTime
    );
  };
  
  // Função para lidar com clique nas células
  const handleCellClick = (professional: ScheduleProfessional, timeSlot: ScheduleTimeSlot, activity?: ScheduleActivity) => {
    if (isSelectionMode) {
      toggleCellSelection(professional, timeSlot, activity);
    } else {
      onCellClick(professional, timeSlot, activity);
    }
  };
  
  // Função para editar todas as células selecionadas
  const editSelectedCells = () => {
    if (selectedCells.length > 0) {
      // Usar a primeira célula selecionada como referência
      const firstCell = selectedCells[0];
      onCellClick(firstCell.professional, firstCell.timeSlot, firstCell.activity);
    }
  };
  
  // Função para limpar a seleção
  const clearSelection = () => {
    setSelectedCells([]);
  };
  
  // Função para encontrar um tipo de atividade pelo código
  const findActivityTypeByCode = (code: string) => {
    if (!activityTypesData || !Array.isArray(activityTypesData)) return undefined;
    return activityTypesData.find((type: ActivityType) => type.code === code);
  };
  
  // Removemos a função de cálculo proporcional da altura das células, conforme solicitado
  
  // Efeito para notificar o componente pai sobre mudanças nas células selecionadas
  useEffect(() => {
    if (onSelectedCellsChange) {
      onSelectedCellsChange(selectedCells);
    }
  }, [selectedCells, onSelectedCellsChange]);
  
  // Memorizar os profissionais para evitar recálculos desnecessários
  const professionals = useMemo(() => {
    return data?.profissionais || [];
  }, [data]);
  
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-gray-500">Carregando escala...</p>
        </div>
      </div>
    );
  }
  
  if (!data || professionals.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-2">Nenhum dado disponível</p>
          <p className="text-sm text-gray-400">Selecione outro dia ou adicione profissionais à escala</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6 relative flex flex-col">
      {/* Controles para seleção múltipla - fixo no topo da página */}
      <div className="bg-gray-50 p-3 border-b flex flex-wrap items-center justify-between gap-2 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          {isSelectionMode && (
            <>
              <span className="text-sm text-gray-500">
                {selectedCells.length} células selecionadas
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                disabled={selectedCells.length === 0}
              >
                Limpar seleção
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={editSelectedCells}
                disabled={selectedCells.length === 0}
              >
                Editar selecionados
              </Button>
            </>
          )}
        </div>
        
        <Button
          variant={isSelectionMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsSelectionMode(!isSelectionMode)}
        >
          {isSelectionMode ? "Desativar seleção" : "Ativar seleção múltipla"}
        </Button>
      </div>
      
      <div className="overflow-auto max-h-[calc(100vh-240px)]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-30">
            <tr>
              <th scope="col" className="sticky left-0 z-30 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] shadow-sm">
                Horário
              </th>
              {professionals.map(professional => (
                <th key={professional.id} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] shadow-sm">
                  <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                      <span className="text-primary-700 font-medium">{professional.iniciais}</span>
                    </div>
                    <span>{professional.nome}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot.startTime}>
                <td className="sticky left-0 z-20 bg-white px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap shadow-sm">
                  {timeSlot.startTime} - {timeSlot.endTime}
                </td>
                {professionals.map(professional => {
                  const activity = findActivity(professional, timeSlot.startTime);
                  
                  // Buscar o tipo de atividade pelo código
                  const activityTypeObj = activity?.atividade 
                    ? findActivityTypeByCode(activity.atividade) 
                    : undefined;
                  
                  // Se não encontrar, usamos o código "disponivel_horario" como fallback
                  const activityCode = activity?.atividade || "disponivel_horario";
                  const activityName = activityTypeObj?.name || getActivityName(activityCode);
                  
                  // Obter as cores do tipo de atividade (seja do objeto ou do código)
                  const colors = getActivityColor(activityTypeObj || activityCode);
                  
                  // Verificar se a atividade tem uma cor personalizada
                  const customColor = activityTypeObj?.color || "";
                  const useCustomDot = colors.dot === "bg-custom-color";
                  
                  return (
                    <td key={`${professional.id}-${timeSlot.startTime}`} className="px-1 py-1">
                      <div 
                        className={`${!useCustomDot ? `${colors.bg} ${colors.hoverBg}` : ''} rounded p-2 cursor-pointer transition duration-150 ease-in-out min-h-[70px] relative
                          ${isSelectionMode && isCellSelected(professional, timeSlot) ? 'ring-2 ring-offset-1 ring-primary' : ''}
                        `}
                        style={useCustomDot ? {
                          backgroundColor: `${customColor}15`, // 15% de opacidade
                          transition: 'background-color 0.15s ease-in-out',
                        } : {}}
                        onMouseOver={(e) => {
                          if (useCustomDot) {
                            e.currentTarget.style.backgroundColor = `${customColor}25`; // 25% de opacidade para hover
                          }
                        }}
                        onMouseOut={(e) => {
                          if (useCustomDot) {
                            e.currentTarget.style.backgroundColor = `${customColor}15`; // 15% de opacidade para normal
                          }
                        }}
                        onClick={() => handleCellClick(professional, timeSlot, activity)}
                      >
                        <div className="flex items-center mb-1">
                          {useCustomDot ? (
                            <div 
                              className="h-3 w-3 rounded-full mr-2" 
                              style={{ backgroundColor: customColor }}
                            ></div>
                          ) : (
                            <div className={`h-3 w-3 rounded-full ${colors.dot} mr-2`}></div>
                          )}
                          <span className={`text-xs font-medium ${colors.text}`}>
                            {activityName}
                          </span>
                        </div>
                        {activity?.local && (
                          <p className="text-xs text-gray-600">{activity.local}</p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
