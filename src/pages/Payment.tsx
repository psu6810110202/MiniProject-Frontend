import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart, type CartItem } from '../contexts/CartContext';
import { type Order } from '../data/mockOrders';
import './Payment.css';

type PaymentMethodId = 'cash' | 'promptpay' | 'card';

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, totalAmount, clearCart, addOrder } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: (user as any)?.address || '',
    paymentMethod: 'cash' as PaymentMethodId
  });

  useEffect(() => {
    const prefill = (location.state as any)?.prefill;
    if (!prefill) return;

    setForm(prev => ({
      ...prev,
      name: typeof prefill.name === 'string' ? prefill.name : prev.name,
      phone: typeof prefill.phone === 'string' ? prefill.phone : prev.phone,
      address: typeof prefill.address === 'string' ? prefill.address : prev.address
    }));
  }, [location.state]);

  useEffect(() => {
    if (cartItems.length === 0 && !paymentComplete) {
      navigate('/cart');
    }
  }, [cartItems.length, navigate, paymentComplete]);

  const totals = useMemo(() => {
    const shipping = totalAmount > 1000 ? 0 : 50;
    return { subtotal: totalAmount, shipping, total: totalAmount + shipping };
  }, [totalAmount]);

  const paymentMethods = useMemo(
    () =>
      [
        { id: 'cash' as const, name: 'เงินสดปลายทาง', icon: '💵', description: 'จ่ายเมื่อได้รับสินค้า' },
        { id: 'promptpay' as const, name: 'พร้อมเพย์', icon: '📱', description: 'สแกนจ่ายได้ทันที' },
        { id: 'card' as const, name: 'บัตรเครดิต/เดบิต', icon: '💳', description: 'Visa / Mastercard' }
      ],
    []
  );

  const validate = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('กรุณากรอกชื่อ เบอร์โทร และที่อยู่ให้ครบถ้วน');
      return false;
    }
    if (cartItems.length === 0) {
      setError('ตะกร้าสินค้าว่าง');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const newOrder: Order = {
        id: orderId,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        items: cartItems.map((item: CartItem) => ({
          name: item.name,
          quantity: item.quantity,
          price: Number(String(item.price).replace(/[^0-9.-]+/g, ''))
        })),
        total: totals.total,
        carrier: 'Thailand Post',
        trackingNumber: `TH${Date.now().toString().slice(-10)}`
      };

      addOrder(newOrder);
      clearCart();
      setPaymentComplete(true);

      setTimeout(() => {
        navigate(`/profile/orders/${orderId}`, { state: { order: newOrder } });
      }, 900);
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentComplete) {
    return (
      <div className="payment-page">
        <div className="payment-shell">
          <div className="payment-success">
            <div className="payment-success__icon">✅</div>
            <div className="payment-success__title">ชำระเงินสำเร็จ</div>
            <div className="payment-success__subtitle">กำลังพาไปหน้ารายละเอียดคำสั่งซื้อ…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-shell">
        <div className="payment-header">
          <div className="payment-header__title">การชำระเงิน</div>
          <div className="payment-header__subtitle">กรอกข้อมูลให้ครบ แล้วกดชำระเงินเพื่อสร้างคำสั่งซื้อ</div>
        </div>

        <form className="payment-grid" onSubmit={handleSubmit}>
          <div className="payment-left">
            <div className="payment-card">
              <div className="payment-card__title">ข้อมูลผู้ซื้อ</div>

              {error && <div className="payment-alert">{error}</div>}

              <div className="payment-fields">
                <div className="payment-field">
                  <label>ชื่อ-นามสกุล</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="กรอกชื่อ-นามสกุล"
                    autoComplete="name"
                  />
                </div>

                <div className="payment-field">
                  <label>เบอร์โทรศัพท์</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="เช่น 0812345678"
                    autoComplete="tel"
                  />
                </div>

                <div className="payment-field payment-field--full">
                  <label>ที่อยู่จัดส่ง</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                    autoComplete="street-address"
                  />
                </div>
              </div>
            </div>

            <div className="payment-card">
              <div className="payment-card__title">วิธีการชำระเงิน</div>
              <div className="payment-methods">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`payment-method ${form.paymentMethod === m.id ? 'is-active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, paymentMethod: m.id }))}
                    disabled={isProcessing}
                  >
                    <div className="payment-method__icon">{m.icon}</div>
                    <div className="payment-method__meta">
                      <div className="payment-method__name">{m.name}</div>
                      <div className="payment-method__desc">{m.description}</div>
                    </div>
                    <div className="payment-method__check" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="payment-right">
            <div className="payment-card">
              <div className="payment-card__title">สรุปคำสั่งซื้อ</div>

              <div className="payment-summary">
                <div className="payment-summary__list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="payment-summary__row">
                      <div className="payment-summary__name">{item.name}</div>
                      <div className="payment-summary__qty">x{item.quantity}</div>
                    </div>
                  ))}
                </div>

                <div className="payment-summary__totals">
                  <div className="payment-summary__totalRow">
                    <span>รวมสินค้า</span>
                    <span>฿{totals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="payment-summary__totalRow">
                    <span>ค่าจัดส่ง</span>
                    <span>฿{totals.shipping.toLocaleString()}</span>
                  </div>
                  <div className="payment-summary__totalRow payment-summary__totalRow--grand">
                    <span>ยอดชำระ</span>
                    <span>฿{totals.total.toLocaleString()}</span>
                  </div>
                </div>

                <button className="payment-pay" type="submit" disabled={isProcessing}>
                  {isProcessing ? 'กำลังดำเนินการ…' : `ชำระเงิน ฿${totals.total.toLocaleString()}`}
                </button>
                <button className="payment-back" type="button" onClick={() => navigate('/cart')} disabled={isProcessing}>
                  กลับไปตะกร้า
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payment;
