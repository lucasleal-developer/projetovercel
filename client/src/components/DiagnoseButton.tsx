import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AlertCircle, Database, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DiagnoseStatus {
  api: string;
  database: string;
  checks: string[];
  errors: string[];
  environment?: string;
  environment_variables?: { name: string; configured: boolean }[];
}

export function DiagnoseButton() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<DiagnoseStatus | null>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const result = await fetch('/api/diagnose');
      if (!result.ok) {
        throw new Error(`Erro ao acessar diagnóstico: ${result.status}`);
      }
      const data = await result.json();
      setStatus(data);
      setOpen(true);
    } catch (error) {
      console.error("Erro ao executar diagnóstico:", error);
      toast({
        title: "Erro no diagnóstico",
        description: "Não foi possível verificar o status da API e banco de dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={runDiagnostic}
        disabled={loading}
      >
        {loading ? (
          <span className="animate-pulse">Verificando...</span>
        ) : (
          <>
            <Database className="mr-2 h-4 w-4" />
            Verificar Conexão
          </>
        )}
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Diagnóstico de Conexão</DialogTitle>
            <DialogDescription>
              Status da API e conexão com banco de dados
            </DialogDescription>
          </DialogHeader>
          
          {status && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <div className="flex items-center mb-2">
                    <div className={`mr-2 h-3 w-3 rounded-full ${status.api === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h3 className="font-semibold">Status da API</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {status.api === 'ok' ? 'API funcionando corretamente' : 'API com problemas'}
                  </p>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex items-center mb-2">
                    <div className={`mr-2 h-3 w-3 rounded-full ${status.database === 'ok' ? 'bg-green-500' : status.database === 'desconhecido' ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                    <h3 className="font-semibold">Banco de Dados</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {status.database === 'ok' ? 'Conectado ao banco de dados' : 
                     status.database === 'desconhecido' ? 'Status desconhecido' : 
                     'Erro na conexão'}
                  </p>
                </div>
              </div>
              
              {status.environment && (
                <div className="border rounded-md p-3">
                  <h3 className="font-semibold mb-2">Ambiente</h3>
                  <p className="text-sm">{status.environment}</p>
                </div>
              )}
              
              {status.checks && status.checks.length > 0 && (
                <div className="border rounded-md p-3">
                  <h3 className="font-semibold mb-2">Verificações</h3>
                  <ul className="text-sm space-y-1">
                    {status.checks.map((check, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="text-green-500 h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{check}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {status.errors && status.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erros encontrados</AlertTitle>
                  <AlertDescription>
                    <ul className="text-sm list-disc pl-5 mt-2">
                      {status.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {status.environment_variables && status.environment_variables.length > 0 && (
                <div className="border rounded-md p-3">
                  <h3 className="font-semibold mb-2">Variáveis de Ambiente</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {status.environment_variables.map((variable, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`mr-2 h-2 w-2 rounded-full ${variable.configured ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm">{variable.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}