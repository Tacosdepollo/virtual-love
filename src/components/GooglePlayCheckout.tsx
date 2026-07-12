import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CreditCard, Gift, ArrowRight, ShieldCheck, CheckCircle2, Loader2, Coins, Sparkles } from "lucide-react";
import { billingService, GooglePlayPaymentMethod } from "../services/billingService";
import { Button } from "./ui/button";
import { audioManager } from "../lib/audio";

interface GooglePlayCheckoutProps {
  productId: string;
  productName: string;
  price: number;
  language: 'es' | 'en';
  onClose: () => void;
  onSuccess: () => void;
}

export default function GooglePlayCheckout({
  productId,
  productName,
  price,
  language,
  onClose,
  onSuccess
}: GooglePlayCheckoutProps) {
  const [methods, setMethods] = useState<GooglePlayPaymentMethod[]>(billingService.getPaymentMethods());
  const [selectedMethodId, setSelectedMethodId] = useState<string>("method_balance");
  const [showRedeem, setShowRedeem] = useState<boolean>(false);
  const [redeemCode, setRedeemCode] = useState<string>("");
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [purchaseStep, setPurchaseStep] = useState<'checkout' | 'success'>('checkout');

  const selectedMethod = methods.find(m => m.id === selectedMethodId);
  const isBalanceSufficient = selectedMethod?.type === 'balance' ? (selectedMethod.balance || 0) >= price : true;

  const handleRedeem = () => {
    audioManager.play('click');
    setRedeemError(null);
    setRedeemSuccess(null);

    const result = billingService.redeemGiftCard(redeemCode);
    if (result.success) {
      setRedeemSuccess(result.message);
      setMethods([...billingService.getPaymentMethods()]); // Refresh list
      setRedeemCode("");
      audioManager.play('pop');
    } else {
      setRedeemError(result.message);
    }
  };

  const handleBuy = () => {
    if (selectedMethod?.type === 'balance' && !isBalanceSufficient) {
      audioManager.play('pop');
      setRedeemError(language === 'es' ? "Saldo insuficiente. Por favor, canjea una tarjeta de regalo o selecciona otro método." : "Insufficient balance. Please redeem a gift card or select another method.");
      return;
    }

    audioManager.play('click');
    setIsPurchasing(true);

    // Simulate standard Google Play secure authorization loader
    setTimeout(() => {
      // Deduct balance if Google Play balance was used
      if (selectedMethod?.type === 'balance' && selectedMethod.balance !== undefined) {
        selectedMethod.balance -= price;
      }
      setIsPurchasing(false);
      setPurchaseStep('success');
      audioManager.play('transition');

      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ y: "100%", opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="w-full sm:max-w-md bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] sm:max-h-none"
      >
        {/* Google Play Green Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

        <AnimatePresence mode="wait">
          {purchaseStep === 'checkout' ? (
            <motion.div
              key="checkout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-6 flex-1 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="text-white font-black text-sm tracking-tighter">▶</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                      Google Play
                    </h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Facturación Segura</p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Card */}
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-zinc-100">{productName}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {productId.startsWith("coins") 
                      ? (language === 'es' ? "Monedas virtuales para GIMS.ai" : "Virtual coins for GIMS.ai")
                      : (language === 'es' ? "Suscripción Premium" : "Premium Subscription")
                    }
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-400">${price.toFixed(2)} USD</div>
                  <p className="text-[10px] text-zinc-500">Impuestos incl.</p>
                </div>
              </div>

              {/* Payment Methods Choice */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
                  {language === 'es' ? "Selecciona Método de Pago" : "Choose Payment Method"}
                </label>
                
                <div className="space-y-2">
                  {methods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        audioManager.play('click');
                        setSelectedMethodId(m.id);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
                        selectedMethodId === m.id
                          ? "bg-emerald-500/10 border-emerald-500 text-zinc-100"
                          : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/60 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {m.type === 'balance' ? (
                          <Coins className="w-5 h-5 text-amber-400" />
                        ) : (
                          <CreditCard className="w-5 h-5 text-zinc-400" />
                        )}
                        <div>
                          <span className="font-medium text-sm block">{m.name}</span>
                          {m.type === 'balance' && (
                            <span className={`text-xs block mt-0.5 ${
                              (m.balance || 0) >= price ? "text-emerald-400 font-semibold" : "text-rose-400"
                            }`}>
                              {language === 'es' ? `Saldo: $${m.balance?.toFixed(2)} USD` : `Balance: $${m.balance?.toFixed(2)} USD`}
                            </span>
                          )}
                          {m.type === 'card' && (
                            <span className="text-xs text-zinc-500 block">{m.detail}</span>
                          )}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        selectedMethodId === m.id 
                          ? "border-emerald-500 bg-emerald-500" 
                          : "border-zinc-700"
                      }`}>
                        {selectedMethodId === m.id && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Redemeer block */}
              <div className="border-t border-zinc-900 pt-4">
                {!showRedeem ? (
                  <button
                    onClick={() => {
                      audioManager.play('click');
                      setShowRedeem(true);
                    }}
                    className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    <Gift className="w-4 h-4" />
                    {language === 'es' ? "¿Tienes un código o tarjeta de regalo?" : "Have a code or physical gift card?"}
                  </button>
                ) : (
                  <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-emerald-400" />
                        {language === 'es' ? "Canjear Tarjeta o Código" : "Redeem Gift Card or Promo Code"}
                      </span>
                      <button 
                        onClick={() => setShowRedeem(false)}
                        className="text-xs text-zinc-500 hover:text-zinc-300"
                      >
                        {language === 'es' ? "Cerrar" : "Close"}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ej: GIMS50, PLAY100, MXN..."
                        value={redeemCode}
                        onChange={(e) => setRedeemCode(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 uppercase"
                      />
                      <Button
                        onClick={handleRedeem}
                        className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs"
                      >
                        {language === 'es' ? "Aplicar" : "Apply"}
                      </Button>
                    </div>

                    {redeemError && (
                      <p className="text-xs text-rose-400 font-medium">{redeemError}</p>
                    )}
                    {redeemSuccess && (
                      <p className="text-xs text-emerald-400 font-medium">{redeemSuccess}</p>
                    )}
                    
                    <div className="bg-zinc-950/50 p-2 rounded border border-zinc-800/40">
                      <p className="text-[10px] text-zinc-500 leading-relaxed">
                        💡 {language === 'es' 
                          ? "Puedes ingresar un código de simulación (p. ej., GIMS100, PLAYGIFT) para simular la recarga de saldo de tarjetas físicas." 
                          : "You can enter a simulated promo code (e.g., GIMS100, PLAYGIFT) to simulate physical gift card balance top ups."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleBuy}
                  disabled={isPurchasing || (selectedMethod?.type === 'balance' && !isBalanceSufficient)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-base rounded-2xl h-14 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-black" />
                      <span>{language === 'es' ? "Procesando pago..." : "Processing secure payment..."}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-black" />
                      <span>{language === 'es' ? "Comprar con 1 toque" : "Buy with 1-tap"}</span>
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
                  Al completar la compra, aceptas los{" "}
                  <span className="text-zinc-400 underline cursor-pointer">Términos de Servicio de Google Play</span> y permites a GIMS.ai procesar la recarga de monedas inmediatamente.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center space-y-6 flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/5 animate-pulse">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-heading text-zinc-100">
                  {language === 'es' ? "¡Pago Exitoso!" : "Payment Successful!"}
                </h3>
                <p className="text-sm text-zinc-400">
                  {language === 'es' 
                    ? "Google Play procesó tu saldo correctamente. GIMS ha acreditado tu cuenta."
                    : "Google Play cleared your funds successfully. GIMS has credited your account."}
                </p>
              </div>

              <div className="bg-zinc-900/50 px-6 py-3 rounded-full border border-zinc-800/80 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-xs font-semibold text-zinc-200">
                  {language === 'es' ? "Sincronizando con Firestore..." : "Syncing with Firestore..."}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
