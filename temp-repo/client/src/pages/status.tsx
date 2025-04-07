import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AlertCircle, Database, Loader2, CheckCircle, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface DiagnoseStatus {
  api: string;
  database: string;
  checks: string[];
  errors: string[];
  environment?: string;
  environment_variables?: { name: string; configured: boolean }[];
}

export default function StatusPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<DiagnoseStatus | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Executa o diagnóstico automaticamente ao carregar a página
  useEffect(() => {
    runDiagnostic();
  }, []);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const result = await fetch('/api/diagnose');
      if (!result.ok) {
        throw new Error(`Erro ao acessar diagnóstico: ${result.status}`);
      }
      const data = await result.json();
      setStatus(data);
      setLastChecked(new Date());
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Status do Sistema</h1>
          <p className="text-muted-foreground mt-2">
            Diagnóstico de conexão e verificação de componentes
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {lastChecked && (
                <p className="text-sm text-muted-foreground">
                  Última verificação: {lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>
            <Button 
              onClick={runDiagnostic} 
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Verificar Novamente
                </>
              )}
            </Button>
          </div>
          
          {status && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className={`mr-2 h-3 w-3 rounded-full ${status.api === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    API
                  </CardTitle>
                  <CardDescription>
                    Status dos serviços de backend
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    {status.api === 'ok' ? (
                      <div className="bg-green-100 text-green-800 flex items-center p-2 rounded">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        API funcionando corretamente
                      </div>
                    ) : (
                      <div className="bg-red-100 text-red-800 flex items-center p-2 rounded">
                        <XCircle className="h-5 w-5 mr-2" />
                        API com problemas
                      </div>
                    )}
                  </div>
                  
                  {status.environment && (
                    <div className="border rounded p-3 mt-2">
                      <p className="text-sm font-medium mb-1">Ambiente:</p>
                      <p className="text-sm">{status.environment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className={`mr-2 h-3 w-3 rounded-full ${status.database === 'ok' ? 'bg-green-500' : status.database === 'desconhecido' ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                    Banco de Dados
                  </CardTitle>
                  <CardDescription>
                    Conectividade com banco de dados PostgreSQL
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    {status.database === 'ok' ? (
                      <div className="bg-green-100 text-green-800 flex items-center p-2 rounded">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Banco de dados conectado
                      </div>
                    ) : status.database === 'desconhecido' ? (
                      <div className="bg-orange-100 text-orange-800 flex items-center p-2 rounded">
                        <Info className="h-5 w-5 mr-2" />
                        Status desconhecido
                      </div>
                    ) : (
                      <div className="bg-red-100 text-red-800 flex items-center p-2 rounded">
                        <XCircle className="h-5 w-5 mr-2" />
                        Falha na conexão
                      </div>
                    )}
                  </div>
                  
                  {status.environment_variables && (
                    <div className="border rounded p-3 mt-2">
                      <p className="text-sm font-medium mb-2">Variáveis Configuradas:</p>
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
                </CardContent>
              </Card>
            </div>
          )}
          
          {status && status.checks && status.checks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Verificações Realizadas</CardTitle>
                <CardDescription>
                  Resultados dos testes de conexão e acesso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Status</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {status.checks.map((check, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </TableCell>
                        <TableCell>{check}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          
          {status && status.errors && status.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erros Encontrados</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2">
                  {status.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {!status && !loading && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Nenhum diagnóstico executado</AlertTitle>
              <AlertDescription>
                Clique em "Verificar Novamente" para realizar o diagnóstico do sistema.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}