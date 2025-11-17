import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  HelpCircle, 
  Send, 
  CheckCircle, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Support = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'technical',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          user_email: user.email,
          title: formData.title,
          category: formData.category,
          description: formData.description,
          status: 'open',
          priority: 'medium',
        });

      if (error) throw error;

      toast({
        title: 'Ticket criado com sucesso!',
        description: 'Nossa equipe entrará em contato em breve.',
      });

      setFormData({ title: '', category: 'technical', description: '' });
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Erro ao criar ticket',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: 'Como funciona o sistema de batalha?',
      answer: 'No sistema de batalha, você escolhe um atributo da sua carta (Número Atômico, Massa Atômica, Densidade, etc.) e compara com a carta do oponente. O maior valor vence e o ganhador fica com ambas as cartas. O jogo continua até que um jogador fique sem cartas.'
    },
    {
      question: 'O que são Super Trunfos?',
      answer: 'Super Trunfos são cartas especiais marcadas com uma estrela dourada. Elas vencem qualquer carta comum, independente dos atributos. Porém, cada Super Trunfo tem uma fraqueza específica contra outro tipo de elemento.'
    },
    {
      question: 'Como posso conseguir mais cartas?',
      answer: 'Você recebe cartas iniciais ao criar sua conta e pode ganhar mais cartas vencendo batalhas. No futuro, haverá também um sistema de pacotes de cartas que você poderá abrir periodicamente.'
    },
    {
      question: 'O que acontece se eu perder uma batalha?',
      answer: 'Se você perder uma batalha, você perde a carta que estava sendo usada naquela rodada. O objetivo é acumular o máximo de cartas possível vencendo seus oponentes.'
    },
    {
      question: 'Como funciona o sistema de ranking?',
      answer: 'O ranking é calculado baseado no seu total de pontos, taxa de vitória, sequências de vitórias e outras estatísticas. Quanto mais você joga e vence, maior sua posição no ranking global.'
    },
    {
      question: 'Posso recuperar cartas perdidas?',
      answer: 'Atualmente, cartas perdidas em batalhas não podem ser recuperadas. Por isso, é importante escolher bem seus atributos e gerenciar seu baralho com estratégia.'
    },
    {
      question: 'Como funcionam os atributos das cartas?',
      answer: 'Cada carta tem 6 atributos principais: Número Atômico, Massa Atômica, Eletronegatividade, Densidade, Ponto de Fusão e Reatividade. Valores maiores geralmente são melhores, exceto para Ponto de Fusão onde se compara o valor absoluto.'
    },
    {
      question: 'Existe um limite de cartas que posso ter?',
      answer: 'Não há limite para o número de cartas que você pode acumular. Quanto mais cartas você tiver, mais opções terá para construir estratégias de batalha.'
    }
  ];

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-2">
          Central de Suporte
        </h1>
        <p className="text-muted-foreground">Perguntas frequentes e atendimento ao jogador</p>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="faq" className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4" />
            <span>FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Criar Ticket</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-cosmic-gold" />
                <span>Perguntas Frequentes</span>
              </CardTitle>
              <CardDescription>
                Encontre respostas rápidas para as dúvidas mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-cosmic-gold" />
                <span>Criar Ticket de Suporte</span>
              </CardTitle>
              <CardDescription>
                Não encontrou sua resposta? Entre em contato conosco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Problema</Label>
                  <Input
                    id="title"
                    placeholder="Descreva brevemente o problema"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Problema Técnico</SelectItem>
                      <SelectItem value="gameplay">Dúvida de Gameplay</SelectItem>
                      <SelectItem value="account">Questão de Conta</SelectItem>
                      <SelectItem value="bug">Reportar Bug</SelectItem>
                      <SelectItem value="suggestion">Sugestão</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Detalhada</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva seu problema ou pergunta em detalhes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={6}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/1000 caracteres
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !user}
                  className="w-full bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Ticket
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Resposta em até 24h</p>
                    <p className="text-xs text-muted-foreground">
                      Tickets são respondidos de segunda a sexta
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Informações úteis</p>
                    <p className="text-xs text-muted-foreground">
                      Inclua capturas de tela se possível para facilitar o diagnóstico
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
