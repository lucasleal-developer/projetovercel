import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AlertCircle, Database, Check, Server, Info, RefreshCw, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DiagnoseStatus {
  api: string;
  database: string;
  checks: string[];
  errors: string[];
  environment?: string;
  environment_variables?: { name: string; configured: boolean }[];
  timestamp?: string;
  platform?: {
    runtime: string;
    vercel: boolean;
  };
  db_type?: string;
  build_info?: {
    node_version: string;
    deployed_at: string;
    vercel_region: string;
  };
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
            <DialogTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Diagnóstico do Sistema
            </DialogTitle>
            <DialogDescription>
              Status da API, banco de dados e ambiente
            </DialogDescription>
          </DialogHeader>
          
          {status && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Status Geral</h3>
                <Badge 
                  variant={status.database === 'ok' && status.api === 'ok' ? 'default' : 'destructive'}
                  className="px-3"
                >
                  {status.database === 'ok' && status.api === 'ok' ? 'Operacional' : 'Problemas Detectados'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-3 bg-card">
                  <div className="flex items-center mb-2">
                    <Globe className={`mr-2 h-4 w-4 ${status.api === 'ok' ? 'text-green-500' : 'text-red-500'}`} />
                    <h3 className="font-semibold">Status da API</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {status.api === 'ok' ? 'API funcionando corretamente' : 'API com problemas'}
                  </p>
                </div>
                
                <div className="border rounded-md p-3 bg-card">
                  <div className="flex items-center mb-2">
                    <Database className={`mr-2 h-4 w-4 ${status.database === 'ok' ? 'text-green-500' : status.database === 'desconhecido' ? 'text-orange-500' : 'text-red-500'}`} />
                    <h3 className="font-semibold">Banco de Dados</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {status.database === 'ok' ? 'Conectado ao banco de dados' : 
                     status.database === 'desconhecido' ? 'Status desconhecido' : 
                     'Erro na conexão'}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              {status.environment && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{status.environment}</Badge>
                  {status.platform?.vercel && (
                    <Badge variant="secondary">Vercel</Badge>
                  )}
                  {status.db_type && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      {status.db_type}
                    </Badge>
                  )}
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
              
              {status.platform && (
                <div className="border rounded-md p-3">
                  <h3 className="font-semibold mb-2">Plataforma</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="font-medium">Runtime:</span> {status.platform.runtime}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Vercel:</span> {status.platform.vercel ? 'Sim' : 'Não'}
                    </div>
                    {status.db_type && (
                      <div className="text-sm col-span-2">
                        <span className="font-medium">Tipo de DB:</span> {status.db_type}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {status.build_info && (
                <div className="border rounded-md p-3">
                  <h3 className="font-semibold mb-2">Informações de Build</h3>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="text-sm">
                      <span className="font-medium">Node:</span> {status.build_info.node_version}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Data:</span> {new Date(status.build_info.deployed_at).toLocaleString('pt-BR')}
                    </div>
                    {status.build_info.vercel_region !== 'unknown' && (
                      <div className="text-sm">
                        <span className="font-medium">Região Vercel:</span> {status.build_info.vercel_region}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {status.timestamp && (
                <div className="text-xs text-muted-foreground mt-4 text-right">
                  Diagnóstico realizado em: {new Date(status.timestamp).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex items-center justify-between space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/api/status', '_blank')}
            >
              <Info className="mr-2 h-4 w-4" />
              Ver JSON Status
            </Button>
            
            <Button 
              onClick={runDiagnostic}
              disabled={loading}
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Atualizando...' : 'Atualizar Diagnóstico'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}