import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { UserStats } from "../types";

export interface GooglePlayPaymentMethod {
  id: string;
  name: string;
  type: 'balance' | 'card' | 'giftcard';
  detail?: string;
  balance?: number;
}

class BillingService {
  private mockMethods: GooglePlayPaymentMethod[] = [
    { id: "method_balance", name: "Saldo de Google Play", type: "balance", balance: 15.00 },
    { id: "method_card_1", name: "Visa •••• 5678", type: "card", detail: "Débito" },
    { id: "method_card_2", name: "Mastercard •••• 1234", type: "card", detail: "Crédito" }
  ];

  public isCapacitor(): boolean {
    return typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
  }

  // Get mock payment methods for sandbox UI
  public getPaymentMethods(): GooglePlayPaymentMethod[] {
    return this.mockMethods;
  }

  // Add a physical card code (Gift card redemption)
  public redeemGiftCard(code: string): { success: boolean; amount: number; message: string } {
    const trimmed = code.toUpperCase().replace(/\s/g, "");
    if (!trimmed || trimmed.length < 8) {
      return { 
        success: false, 
        amount: 0, 
        message: "El código ingresado es inválido o está incompleto." 
      };
    }

    // Gift card triggers a balance increment
    const randomAmount = Math.floor(Math.random() * 200) + 50; // Random $50 - $250 MXN / USD
    const balanceMethod = this.mockMethods.find(m => m.type === 'balance');
    if (balanceMethod && balanceMethod.balance !== undefined) {
      balanceMethod.balance += randomAmount;
    }

    return {
      success: true,
      amount: randomAmount,
      message: `¡Felicidades! Se han abonado $${randomAmount}.00 a tu Saldo de Google Play.`
    };
  }

  /**
   * Triggers a real Google Play In-App Purchase inside Android, 
   * or prompts the interactive high-fidelity Google Play modal on web browsers.
   */
  public async purchaseItem(
    productId: string,
    price: number,
    userId: string | undefined,
    userStats: UserStats,
    onSuccess: (updatedStats: UserStats) => void
  ): Promise<boolean> {
    if (this.isCapacitor()) {
      try {
        console.log(`[Google Play Billing] Initiating native purchase for Product ID: ${productId}`);
        const cap = (window as any).Capacitor;
        const PlayBilling = cap.Plugins.GooglePlayBilling || cap.Plugins.Billing;
        
        if (PlayBilling) {
          // Native bridge call
          const result = await PlayBilling.launchBillingFlow({
            productId: productId,
            type: productId.startsWith("subscription") ? "subs" : "inapp"
          });
          
          if (result && result.success) {
            await this.applyPurchaseFirestore(productId, userId, userStats, onSuccess);
            return true;
          }
        } else {
          console.warn("Capacitor billing plugin not fully loaded in this environment. Falling back to simulated flow.");
        }
      } catch (err) {
        console.error("Native Google Play Billing failed, falling back to simulated checkout:", err);
      }
    }

    // In regular web mode, we return false so the UI can pop up our stunning, interactive Google Play payment dialog.
    return false;
  }

  /**
   * Helper to write back to Firestore on successful purchase
   */
  public async applyPurchaseFirestore(
    productId: string,
    userId: string | undefined,
    currentStats: UserStats,
    onSuccess: (updatedStats: UserStats) => void
  ) {
    if (!userId) return;

    let updatedStats = { ...currentStats };

    if (productId.startsWith("coins_")) {
      const amount = parseInt(productId.split("_")[1]) || 100;
      updatedStats = {
        ...currentStats,
        coins: (currentStats.coins || 0) + amount
      };
    } else if (productId === "subscription_monthly") {
      updatedStats = {
        ...currentStats,
        subscription: {
          active: true,
          startDate: Date.now(),
          lastClaimDate: 0,
          type: 'monthly'
        }
      };
    }

    try {
      await updateDoc(doc(db, "users", userId), { stats: updatedStats });
      onSuccess(updatedStats);
    } catch (e) {
      console.error("Firestore update failed during Google Play purchase settlement:", e);
    }
  }
}

export const billingService = new BillingService();
