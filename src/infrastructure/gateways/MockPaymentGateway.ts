import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { PaymentGateway } from '../../domain/gateways/PaymentGateway';

/**
 * Gateway de pagamento mock para demonstração
 */
export class MockPaymentGateway implements PaymentGateway {
  /**
   * Processa um pagamento simulado
   */
  async processPayment(data: {
    amount: number;
    method: PaymentMethod;
    data: any;
    ticketId: string;
    userId: string;
  }): Promise<{
    status: PaymentStatus;
    transactionId: string;
    message?: string;
  }> {
    // Simula um tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Gera um transactionId simulado
    const transactionId = `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Simulação de sucesso ou falha baseada em critérios simples
    let status: PaymentStatus = PaymentStatus.PAID;
    let message: string | undefined;
    
    // Para demonstração, vamos simular falha em 10% dos pagamentos ou se valor for muito alto
    const shouldFail = Math.random() < 0.1 || data.amount > 10000;
    
    if (shouldFail) {
      status = PaymentStatus.FAILED;
      message = 'Pagamento recusado pela operadora.';
    }
    
    // Validações específicas para cada método de pagamento
    switch(data.method) {
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        if (!data.data.cardNumber || !data.data.cardHolder || !data.data.expirationDate || !data.data.cvv) {
          status = PaymentStatus.FAILED;
          message = 'Dados do cartão incompletos.';
        }
        
        // Simulando cartão recusado para números terminados em '0000'
        if (data.data.cardNumber?.endsWith('0000')) {
          status = PaymentStatus.FAILED;
          message = 'Cartão recusado pela operadora.';
        }
        break;
      
      case PaymentMethod.PIX:
        if (!data.data.pixKey) {
          status = PaymentStatus.FAILED;
          message = 'Chave PIX não informada.';
        }
        break;
      
      case PaymentMethod.BOLETO:
        // Boleto sempre gera pendente inicialmente
        status = PaymentStatus.PENDING;
        message = 'Boleto gerado com sucesso. Aguardando pagamento.';
        break;
    }
    
    console.log(`[MockPaymentGateway] Processando pagamento: ${data.amount} via ${data.method} - Status: ${status}`);
    
    return {
      status,
      transactionId,
      message
    };
  }
} 