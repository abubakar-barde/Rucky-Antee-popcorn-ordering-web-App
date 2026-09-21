import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { PaymentMethod, Order, OrderItem } from '../../types';
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  Smartphone,
  MapPin,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  Loader2,
  Lock,
  ShieldCheck,
  X,
} from 'lucide-react';
import { formatNaira } from '../../lib/currency';
import { getPaystackPublicKey, isPaystackConfigured, isPaystackTestMode } from '../../lib/paystack';
import { usePaystackPayment } from 'react-paystack';

interface CheckoutPageProps {
  onBackToCart: () => void;
  onOrderSuccess?: (order: Order) => void;
}

interface ValidationErrors {
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  paymentMethod?: string;
  cart?: string;
  auth?: string;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToCart,
  onOrderSuccess,
}) => {
  const { user, setShowAuthModal, setAuthModalTab } = useAuth();
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { createOrder } = useOrders();

  // Form inputs
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.default_address || '');
  const [deliveryCity, setDeliveryCity] = useState(user?.default_city || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Keep form initialized with user profile info if user logs in after mounting
  useEffect(() => {
    if (user) {
      if (!customerName && user.full_name) setCustomerName(user.full_name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!deliveryAddress && user.default_address) setDeliveryAddress(user.default_address);
      if (!deliveryCity && user.default_city) setDeliveryCity(user.default_city);
    }
  }, [user]);

  // Submission & Validation states
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);

  // Paystack configuration
  const paystackKey = getPaystackPublicKey();
  const hasPaystackKey = isPaystackConfigured();
  const isTestMode = isPaystackTestMode();

  const paystackConfig = {
    reference: `RA-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`,
    email: user?.email || 'customer@ruckynantee.com',
    amount: Math.round(total * 100), // Paystack expects amount in Kobo
    publicKey: paystackKey || 'pk_test_unconfigured_placeholder',
    firstname: customerName.trim().split(' ')[0] || 'Customer',
    lastname: customerName.trim().split(' ').slice(1).join(' ') || '',
    phone: customerPhone.trim(),
    metadata: {
      custom_fields: [
        {
          display_name: 'Customer Phone',
          variable_name: 'customer_phone',
          value: customerPhone.trim(),
        },
        {
          display_name: 'Delivery Address',
          variable_name: 'delivery_address',
          value: `${deliveryAddress.trim()}, ${deliveryCity.trim()}`,
        },
      ],
    },
  };

  const initializePaystack = usePaystackPayment(paystackConfig);

  // Validate form fields
  const validateForm = (): boolean => {
    const errs: ValidationErrors = {};

    if (!user) {
      errs.auth = 'Please sign in to your Supabase account to place an order.';
    }

    if (!customerName.trim()) {
      errs.customerName = 'Full name is required';
    } else if (customerName.trim().length < 2) {
      errs.customerName = 'Please enter a valid full name (at least 2 characters)';
    }

    if (!customerPhone.trim()) {
      errs.customerPhone = 'Phone number is required for courier delivery';
    } else if (customerPhone.trim().replace(/\D/g, '').length < 7) {
      errs.customerPhone = 'Please enter a valid phone number';
    }

    if (!deliveryAddress.trim()) {
      errs.deliveryAddress = 'Delivery address is required';
    } else if (deliveryAddress.trim().length < 5) {
      errs.deliveryAddress = 'Please provide a complete street address';
    }

    if (!deliveryCity.trim()) {
      errs.deliveryCity = 'City or area is required';
    }

    if (!paymentMethod) {
      errs.paymentMethod = 'Please select a payment method';
    }

    if (items.length === 0) {
      errs.cart = 'Your cart is empty. Add popcorn items before checking out.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Finalize order creation in Supabase
  const executeCreateOrder = async (
    finalPaymentStatus: 'Paid' | 'Unpaid',
    transactionReference?: string
  ) => {
    if (!user) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const orderItems: OrderItem[] = items.map((cartItem) => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        order_id: '',
        product_id: cartItem.product.id,
        product_name: `${cartItem.product.name} (${cartItem.selectedSize.label})`,
        quantity: cartItem.quantity,
        unit_price: cartItem.unitPrice,
        subtotal: cartItem.totalPrice,
        total_price: cartItem.totalPrice,
      }));

      const noteParts: string[] = [];
      if (deliveryNotes.trim()) noteParts.push(deliveryNotes.trim());
      if (transactionReference) noteParts.push(`[Paystack Ref: ${transactionReference}]`);
      const combinedNotes = noteParts.join(' | ');

      const newOrder = await createOrder({
        customer_id: user.id,
        user_id: user.id,
        customer_name: customerName.trim(),
        customer_email: user.email,
        customer_phone: customerPhone.trim(),
        phone: customerPhone.trim(),
        delivery_address: deliveryAddress.trim(),
        delivery_city: deliveryCity.trim(),
        delivery_notes: combinedNotes,
        notes: combinedNotes,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: finalPaymentStatus,
        subtotal,
        delivery_fee: deliveryFee,
        discount: 0,
        total,
        items: orderItems,
      });

      clearCart();
      if (onOrderSuccess) {
        onOrderSuccess(newOrder);
      }
    } catch (err: any) {
      console.error('Order creation in Supabase failed:', err);
      setSubmitError(err.message || 'Failed to place order into Supabase database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main order submission handler
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!user) {
      setAuthModalTab('login');
      setShowAuthModal(true);
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (paymentMethod === 'Card') {
      if (hasPaystackKey) {
        setIsSubmitting(true);
        try {
          initializePaystack({
            onSuccess: (res: any) => {
              const reference = res?.reference || res?.trans || `PAY-${Date.now()}`;
              executeCreateOrder('Paid', reference);
            },
            onClose: () => {
              setIsSubmitting(false);
            },
          });
        } catch (err: any) {
          setIsSubmitting(false);
          setSubmitError(
            err?.message || 'Unable to open Paystack payment modal. Please verify your public key.'
          );
        }
      } else {
        // Public key not yet set in settings: offer simulated card payment for instant verification
        setShowSimulatedModal(true);
      }
      return;
    }

    // Direct checkout for Cash on Delivery / Mobile Transfer
    executeCreateOrder(paymentMethod === 'Cash on Delivery' ? 'Unpaid' : 'Paid');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={onBackToCart}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-amber-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
          Ruckyn Antee Popcorn Checkout
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display tracking-tight">
          Delivery & Payment Details
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Provide your recipient coordinates and payment method for fresh kettle dispatch.
        </p>
      </div>

      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Order Submission Error</p>
            <p className="mt-0.5 text-rose-700">{submitError}</p>
          </div>
        </div>
      )}

      {errors.auth && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{errors.auth}</span>
          </div>
          <button
            onClick={() => {
              setAuthModalTab('login');
              setShowAuthModal(true);
            }}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl whitespace-nowrap"
          >
            Sign In Now
          </button>
        </div>
      )}

      {errors.cart && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.cart}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Delivery info & Payment options */}
        <div className="lg:col-span-8 space-y-6">
          {/* Contact & Delivery Section */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-stone-900 font-display">
                Delivery Coordinates
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: undefined }));
                  }}
                  placeholder="Enter full name"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                    errors.customerName ? 'border-rose-500 bg-rose-50/20' : 'border-stone-300'
                  } focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                />
                {errors.customerName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.customerName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errors.customerPhone) setErrors((prev) => ({ ...prev, customerPhone: undefined }));
                  }}
                  placeholder="e.g. +234 803 123 4567"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                    errors.customerPhone ? 'border-rose-500 bg-rose-50/20' : 'border-stone-300'
                  } focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                />
                {errors.customerPhone && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.customerPhone}</p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Delivery Address *
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => {
                  setDeliveryAddress(e.target.value);
                  if (errors.deliveryAddress) setErrors((prev) => ({ ...prev, deliveryAddress: undefined }));
                }}
                placeholder="Street address, building, apartment / suite"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                  errors.deliveryAddress ? 'border-rose-500 bg-rose-50/20' : 'border-stone-300'
                } focus:ring-2 focus:ring-amber-500 focus:outline-none`}
              />
              {errors.deliveryAddress && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.deliveryAddress}</p>
              )}
            </div>

            {/* City / State */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                City / Region *
              </label>
              <input
                type="text"
                value={deliveryCity}
                onChange={(e) => {
                  setDeliveryCity(e.target.value);
                  if (errors.deliveryCity) setErrors((prev) => ({ ...prev, deliveryCity: undefined }));
                }}
                placeholder="e.g. Lagos, Abuja, Port Harcourt"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border ${
                  errors.deliveryCity ? 'border-rose-500 bg-rose-50/20' : 'border-stone-300'
                } focus:ring-2 focus:ring-amber-500 focus:outline-none`}
              />
              {errors.deliveryCity && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.deliveryCity}</p>
              )}
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Order Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Special delivery instructions, gate directions, or kettle requests"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-stone-900 font-display">
                Payment Method *
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'Card',
                  label: 'Debit / Credit Card',
                  icon: <CreditCard className="w-4 h-4 text-amber-700" />,
                  desc: 'Pay securely via Paystack (Visa, Verve, Mastercard)',
                },
                {
                  id: 'Mobile Transfer',
                  label: 'Instant Bank Transfer',
                  icon: <Smartphone className="w-4 h-4 text-amber-700" />,
                  desc: 'Direct bank transfer / USSD',
                },
                {
                  id: 'Cash on Delivery',
                  label: 'Cash on Delivery (COD)',
                  icon: <Banknote className="w-4 h-4 text-amber-700" />,
                  desc: 'Pay cash upon arrival of courier',
                },
                {
                  id: 'Apple Pay / Google Pay',
                  label: 'Digital Wallet',
                  icon: <Smartphone className="w-4 h-4 text-amber-700" />,
                  desc: '1-tap secure wallet',
                },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id as PaymentMethod)}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      {method.icon}
                      <span className="text-xs font-bold text-stone-900">{method.label}</span>
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">{method.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Card / Paystack Info Card */}
            {paymentMethod === 'Card' && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3 mt-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-stone-900">
                      Paystack Secure Card Checkout
                    </span>
                  </div>
                  {hasPaystackKey ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {isTestMode ? 'Paystack Test Mode' : 'Paystack Live Mode'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Demo Mode Available
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap text-[11px] text-stone-600">
                  <span className="px-2 py-0.5 rounded bg-white border border-stone-200 font-medium">
                    Mastercard
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-stone-200 font-medium">
                    Visa
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-stone-200 font-medium">
                    Verve
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-stone-200 font-medium">
                    Apple Pay
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-stone-200 font-medium">
                    Bank Transfer
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed">
                  {hasPaystackKey
                    ? 'When you click "Pay with Card (Paystack)", a secure Paystack modal will open to complete your payment with instant authorization.'
                    : 'To process real card transactions, configure your PAYSTACK_PUBLIC_KEY in Settings. In the preview environment, clicking the button below allows you to test simulated card payment.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-stone-900 font-display flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs font-semibold text-stone-500">({items.length} items)</span>
          </h2>

          {items.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-400">
              Your popcorn bag is empty.
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-stone-800 truncate">{it.product.name}</p>
                    <p className="text-[11px] text-stone-400">
                      {it.selectedSize.label} × {it.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-stone-900 whitespace-nowrap">
                    {formatNaira(it.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">{formatNaira(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="font-semibold text-stone-900">
                {deliveryFee === 0 ? 'FREE' : formatNaira(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Amount</span>
              <span className="text-amber-800">{formatNaira(total)}</span>
            </div>
          </div>

          <button
            id="checkout-place-order-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-stone-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : paymentMethod === 'Card' ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay {formatNaira(total)} with Card</span>
              </>
            ) : paymentMethod === 'Cash on Delivery' ? (
              <>
                <Banknote className="w-4 h-4" />
                <span>Place Order (Cash on Delivery)</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Place Order & Dispatch</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-stone-400 text-center leading-relaxed">
            Directly persists order and line items to your Supabase PostgreSQL database.
          </p>
        </div>
      </form>

      {/* Simulated Demo Card Payment Modal */}
      {showSimulatedModal && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-stone-900 text-sm">Simulated Card Payment</h3>
              </div>
              <button
                onClick={() => setShowSimulatedModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <p>
                <strong>PAYSTACK_PUBLIC_KEY</strong> is currently awaiting configuration in your
                Settings panel.
              </p>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Customer:</span>
                  <span className="text-stone-900">{customerName}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Recipient Phone:</span>
                  <span className="text-stone-900">{customerPhone}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-200">
                  <span>Total Amount:</span>
                  <span className="text-amber-700">{formatNaira(total)}</span>
                </div>
              </div>
              <p className="text-[11px] text-stone-500">
                Clicking &quot;Authorize Test Payment&quot; below will simulate a successful card
                authorization and write the order to your Supabase database.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSimulatedModal(false);
                  executeCreateOrder('Paid', `DEMO-CARD-${Date.now()}`);
                }}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold rounded-xl text-xs transition-colors"
              >
                Authorize Test Payment
              </button>
              <button
                type="button"
                onClick={() => setShowSimulatedModal(false)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

