'use server';

import { assessCreditRisk } from '@/ai/flows/credit-risk-assessment';
import type { CreditRiskInput, CreditRiskOutput } from '@/ai/flows/credit-risk-assessment';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Client, Loan } from '@/lib/types';


if (getApps().length === 0) {
  initializeApp({
    // @ts-ignore
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)),
    databaseURL: firebaseConfig.databaseURL,
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore();

export type AnalysisResult = {
  aiResponse: CreditRiskOutput;
  clientData?: Client;
  clientExists: boolean;
};

export async function runCreditAnalysis(
  cpf: string,
  loanAmount: number,
  loanPurpose: string
): Promise<AnalysisResult> {
  try {
    const cleanCpf = cpf.replace(/\D/g, '');
    let borrowerData: any = { cpf: cleanCpf };
    let clientExists = false;
    let foundClient: Client | undefined = undefined;

    // Search for client by CPF
    const clientsRef = db.collection('clients');
    const clientSnapshot = await clientsRef.where('cpf', '==', cleanCpf).limit(1).get();

    if (!clientSnapshot.empty) {
      clientExists = true;
      const clientDoc = clientSnapshot.docs[0];
      foundClient = { id: clientDoc.id, ...clientDoc.data() } as Client;

      // If client exists, gather more data
      const loansRef = db.collection('loans');
      const loansSnapshot = await loansRef.where('clientId', '==', foundClient.id).get();
      const clientLoans = loansSnapshot.docs.map(doc => doc.data() as Loan);

      borrowerData = {
        profile: foundClient,
        loanHistory: clientLoans.map(loan => ({
          amount: loan.amount,
          status: loan.status,
          startDate: loan.startDate,
          installmentsCount: loan.installments.length,
          paidInstallments: loan.installments.filter(i => i.status === 'Pago').length
        })),
        paymentSummary: {
          totalPaid: clientLoans.flatMap(l => l.payments).reduce((acc, p) => acc + p.amount, 0),
          overdueInstallments: clientLoans.flatMap(l => l.installments).filter(i => i.status === 'Atrasado').length,
        }
      };
    } else {
        borrowerData.message = "No existing client found with this CPF. Analysis will be based on general assumptions."
    }

    const aiInput: CreditRiskInput = {
      borrowerData: JSON.stringify(borrowerData, null, 2),
      loanAmount,
      loanPurpose,
    };

    const aiResult = await assessCreditRisk(aiInput);
    
    return {
      aiResponse: aiResult,
      clientData: foundClient,
      clientExists,
    };

  } catch (error) {
    console.error('Error in credit analysis:', error);
    // @ts-ignore
    throw new Error(error.message || 'Falha ao realizar a análise de crédito. Tente novamente.');
  }
}
