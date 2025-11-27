'use server';

/**
 * @fileOverview This file defines a Genkit flow for assessing credit risk of new borrowers.
 *
 * It uses AI to analyze historical data and available information to provide a risk assessment.
 * - assessCreditRisk - The function to assess credit risk.
 * - CreditRiskInput - The input type for the assessCreditRisk function.
 * - CreditRiskOutput - The output type for the assessCreditRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreditRiskInputSchema = z.object({
  borrowerData: z.string().describe('Detailed information about the borrower, including financial history, credit score, and other relevant data.'),
  loanAmount: z.number().describe('The amount of the loan requested.'),
  loanPurpose: z.string().describe('The stated purpose of the loan.'),
});
export type CreditRiskInput = z.infer<typeof CreditRiskInputSchema>;

const CreditRiskOutputSchema = z.object({
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The assessed risk level of the borrower.'),
  riskFactors: z.string().describe('A summary of the key factors contributing to the risk assessment.'),
  recommendedAction: z.string().describe('Recommended action based on the risk assessment, such as approve, deny, or request additional information.'),
});
export type CreditRiskOutput = z.infer<typeof CreditRiskOutputSchema>;

export async function assessCreditRisk(input: CreditRiskInput): Promise<CreditRiskOutput> {
  return assessCreditRiskFlow(input);
}

const assessCreditRiskPrompt = ai.definePrompt({
  name: 'assessCreditRiskPrompt',
  input: {schema: CreditRiskInputSchema},
  output: {schema: CreditRiskOutputSchema},
  prompt: `You are an expert credit risk analyst.
  Assess the credit risk of a borrower based on the following information:

  Borrower Data: {{{borrowerData}}}
  Loan Amount: {{{loanAmount}}}
  Loan Purpose: {{{loanPurpose}}}

  Provide a risk assessment, including the risk level (Low, Medium, or High), the key risk factors, and a recommended action (approve, deny, or request additional information).

  Ensure that the output is structured according to the CreditRiskOutputSchema, including descriptions for each field:
  - riskLevel: The assessed risk level of the borrower.
  - riskFactors: A summary of the key factors contributing to the risk assessment.
  - recommendedAction: Recommended action based on the risk assessment.
  `,
});

const assessCreditRiskFlow = ai.defineFlow(
  {
    name: 'assessCreditRiskFlow',
    inputSchema: CreditRiskInputSchema,
    outputSchema: CreditRiskOutputSchema,
  },
  async input => {
    const {output} = await assessCreditRiskPrompt(input);
    return output!;
  }
);
