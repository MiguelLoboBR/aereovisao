import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function DebugPage() {
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiMessage, setApiMessage] = useState('');
  const [staticFileStatus, setStaticFileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [staticMessage, setStaticMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [appInfo, setAppInfo] = useState<Record<string, any>>({});
  
  useEffect(() => {
    // Coletar informações do ambiente
    const info = {
      url: window.location.href,
      host: window.location.host,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      networkType: (navigator as any).connection ? (navigator as any).connection.effectiveType : 'unknown',
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };
    setAppInfo(info);
  }, []);
  
  const testApiConnection = async () => {
    try {
      setApiStatus('loading');
      setApiMessage('Testando API...');
      
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      setApiStatus('success');
      setApiMessage(`API respondeu com status ${response.status}. Resposta: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error('Erro ao testar API:', error);
      setApiStatus('error');
      setApiMessage(`Erro ao conectar na API: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const testStaticFiles = async () => {
    try {
      setStaticFileStatus('loading');
      setStaticMessage('Testando acesso a arquivos estáticos...');
      
      // Criar um elemento de imagem temporário
      const img = new Image();
      const testUrl = '/favicon.ico'; // Ou qualquer arquivo estático
      
      img.onload = () => {
        setStaticFileStatus('success');
        setStaticMessage(`Arquivo estático ${testUrl} carregado com sucesso`);
      };
      
      img.onerror = (e) => {
        setStaticFileStatus('error');
        setStaticMessage(`Erro ao carregar arquivo estático ${testUrl}: ${e}`);
      };
      
      img.src = testUrl;
    } catch (error) {
      console.error('Erro ao testar arquivos estáticos:', error);
      setStaticFileStatus('error');
      setStaticMessage(`Erro ao testar arquivos estáticos: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const testUploadDirectory = async () => {
    try {
      setUploadStatus('loading');
      setUploadMessage('Testando acesso ao diretório de uploads...');
      
      // Testar se conseguimos acessar um arquivo de teste no diretório uploads
      const response = await fetch('/uploads/test.txt');
      
      if (response.ok) {
        setUploadStatus('success');
        setUploadMessage(`Diretório de uploads acessível. Status: ${response.status}`);
      } else {
        setUploadStatus('error');
        setUploadMessage(`Erro ao acessar diretório de uploads. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao testar diretório de uploads:', error);
      setUploadStatus('error');
      setUploadMessage(`Erro ao testar diretório de uploads: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Página de Diagnóstico</h1>
      
      <Tabs defaultValue="api">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="static">Arquivos Estáticos</TabsTrigger>
          <TabsTrigger value="info">Informações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Conexão API</CardTitle>
              <CardDescription>Verifica se a API está funcionando corretamente</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Este teste verifica se a API está respondendo corretamente.</p>
              
              <Button 
                onClick={testApiConnection}
                disabled={apiStatus === 'loading'}
                className="mr-2"
              >
                {apiStatus === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : 'Testar API'}
              </Button>
              
              <Button 
                onClick={testUploadDirectory}
                disabled={uploadStatus === 'loading'}
              >
                {uploadStatus === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : 'Testar Diretório de Uploads'}
              </Button>
              
              {apiMessage && (
                <div className={`mt-4 p-3 rounded ${
                  apiStatus === 'success' ? 'bg-green-100 text-green-700' : 
                  apiStatus === 'error' ? 'bg-red-100 text-red-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {apiMessage}
                </div>
              )}
              
              {uploadMessage && (
                <div className={`mt-4 p-3 rounded ${
                  uploadStatus === 'success' ? 'bg-green-100 text-green-700' : 
                  uploadStatus === 'error' ? 'bg-red-100 text-red-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {uploadMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="static" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Arquivos Estáticos</CardTitle>
              <CardDescription>Verifica se os arquivos estáticos estão sendo servidos corretamente</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Este teste verifica se os arquivos estáticos estão sendo servidos corretamente.</p>
              
              <Button 
                onClick={testStaticFiles}
                disabled={staticFileStatus === 'loading'}
              >
                {staticFileStatus === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : 'Testar Arquivos Estáticos'}
              </Button>
              
              {staticMessage && (
                <div className={`mt-4 p-3 rounded ${
                  staticFileStatus === 'success' ? 'bg-green-100 text-green-700' : 
                  staticFileStatus === 'error' ? 'bg-red-100 text-red-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {staticMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Aplicativo</CardTitle>
              <CardDescription>Detalhes sobre o ambiente de execução</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(appInfo).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4">
                    <span className="font-medium text-muted-foreground">{key}:</span>
                    <span className="col-span-2">{String(value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}