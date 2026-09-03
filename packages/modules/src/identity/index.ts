export interface EmailProofDelivery {
  deliver(input: {
    normalizedEmail: string;
    proof: string;
    expiresAt: string;
    returnPath: string;
  }): Promise<void>;
}
