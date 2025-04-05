import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, Clock, Users } from "lucide-react";
import { ProfessionalSelector } from "@/components/schedule/ProfessionalSelector";
import { WeeklyProfessorSchedule } from "@/components/schedule/WeeklyProfessorSchedule";

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

export function ProfessorSemanal() {
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  // Buscar dados dos profissionais
  const { data: professionals, isLoading: professionalsLoading } = useQuery({
    queryKey: ['/api/professionals'],
    staleTime: 30000
  });

  // Função para selecionar um professor
  const handleSelectProfessional = (professional: Professional) => {
    setSelectedProfessional(professional);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Cabeçalho normal (sem fixar) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 pt-2">
          <div>
            <h1 className="text-2xl font-bold">Visualização Semanal do Professor</h1>
            <p className="text-muted-foreground">
              Visualize todos os dias da semana para um professor específico
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Link href="/schedule">
              <Button variant="outline" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Voltar para Escalas
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Layout responsivo */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-[300px_1fr]">
          {/* Seletor de professor (ocupa toda a largura em dispositivos móveis) */}
          <div className="order-1 md:order-1">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2 flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Selecionar Professor
                    </h2>
                    
                    {professionalsLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <ProfessionalSelector 
                        professionals={professionals || []}
                        onSelect={handleSelectProfessional}
                        selectedProfessional={selectedProfessional}
                      />
                    )}
                  </div>
                  
                  {selectedProfessional && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                      <h3 className="font-medium text-blue-700 flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Professor Selecionado
                      </h3>
                      <div className="mt-2 flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                          <span className="text-primary-700 font-medium text-xs">
                            {selectedProfessional.initials}
                          </span>
                        </div>
                        <span className="font-medium">{selectedProfessional.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Área principal com a grade semanal (ocupa toda a largura em dispositivos móveis) */}
          <div className="order-2 md:order-2 overflow-hidden">
            {selectedProfessional ? (
              <WeeklyProfessorSchedule professional={selectedProfessional} />
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="text-center p-6">
                  <Users className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">Nenhum professor selecionado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Selecione um professor para visualizar sua grade semanal completa.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfessorSemanal;