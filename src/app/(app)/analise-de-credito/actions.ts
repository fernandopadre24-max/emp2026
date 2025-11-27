'use server';

import { assessCreditRisk } from '@/ai/flows/credit-risk-assessment';
import type { CreditRiskInput, CreditRiskOutput } from '@/ai/flows/credit-risk-assessment';

export async function runCreditAnalysis(
  input: CreditRiskInput
): Promise<CreditRiskOutput> {
  try {
    const result = await assessCreditRisk(input);
    return result;
  } catch (error) {
    console.error('Error in credit analysis:', error);
    throw new Error('Falha ao realizar a análise de crédito. Tente novamente.');
  }
}
