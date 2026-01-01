import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface PaymentStep {
  id: string;
  label: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  time?: string;
}

const Payment: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: '💳',
      description: 'Visa, Mastercard, AMEX'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Direct bank transfer'
    },
    {
      id: 'digital_wallet',
      name: 'Digital Wallet',
      icon: '📱',
      description: 'PromptPay, TrueMoney, etc.'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🌐',
      description: 'International payments'
    }
  ];

  const paymentSteps: PaymentStep[] = [
    { id: 'select_method', label: 'Select Payment Method', status: 'completed' },
    { id: 'process_payment', label: 'Process Payment', status: currentStep >= 1 ? 'completed' : 'in_progress' },
    { id: 'verify_payment', label: 'Verify Payment', status: currentStep >= 2 ? 'completed' : 'upcoming' },
    { id: 'confirm_order', label: 'Confirm Order', status: currentStep >= 3 ? 'completed' : 'upcoming' }
  ];

  const handleProcessPayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setCurrentStep(1);
      setTimeout(() => {
        setCurrentStep(2);
        setTimeout(() => {
          setCurrentStep(3);
          setPaymentComplete(true);
          setIsProcessing(false);
        }, 2000);
      }, 2000);
    }, 2000);
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      case 'upcoming': return '#666';
      default: return '#666';
    }
  };

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      color: 'var(--text-main)'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: 'var(--text-main)'
        }}>
          💳 Create Process Payment
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1.1rem'
        }}>
          Complete your order payment securely
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Payment Methods */}
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '20px',
            color: 'var(--text-main)'
          }}>
            Select Payment Method
          </h2>
          
          <div style={{
            display: 'grid',
            gap: '15px'
          }}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => !isProcessing && setSelectedMethod(method.id)}
                style={{
                  padding: '20px',
                  border: `2px solid ${selectedMethod === method.id ? '#FF5722' : 'var(--border-color)'}`,
                  borderRadius: '12px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  background: selectedMethod === method.id ? 'rgba(255, 87, 34, 0.1)' : 'var(--card-bg)',
                  transition: 'all 0.3s ease',
                  opacity: isProcessing ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 87, 34, 0.1)',
                    borderRadius: '10px'
                  }}>
                    {method.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 5px 0',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      color: 'var(--text-main)'
                    }}>
                      {method.name}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: 'var(--text-muted)'
                    }}>
                      {method.description}
                    </p>
                  </div>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #FF5722',
                    borderRadius: '50%',
                    background: selectedMethod === method.id ? '#FF5722' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {selectedMethod === method.id && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: 'white',
                        borderRadius: '50%'
                      }} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Process Payment Button */}
          <button
            onClick={handleProcessPayment}
            disabled={!selectedMethod || isProcessing || paymentComplete}
            style={{
              width: '100%',
              padding: '15px 30px',
              background: isProcessing || paymentComplete ? '#4CAF50' : '#FF5722',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: (!selectedMethod || isProcessing || paymentComplete) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '30px',
              opacity: (!selectedMethod || isProcessing || paymentComplete) ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (selectedMethod && !isProcessing && !paymentComplete) {
                e.currentTarget.style.background = '#E64A19';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isProcessing && !paymentComplete) {
                e.currentTarget.style.background = '#FF5722';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {isProcessing ? '⏳ Processing Payment...' : 
             paymentComplete ? '✅ Payment Complete' : 
             '💳 Process Payment'}
          </button>
        </div>

        {/* Payment Progress */}
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '20px',
            color: 'var(--text-main)'
          }}>
            Payment Progress
          </h2>

          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '25px'
          }}>
            {/* Selected Method Info */}
            {selectedPaymentMethod && (
              <div style={{
                marginBottom: '30px',
                padding: '15px',
                background: 'rgba(255, 87, 34, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 87, 34, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '5px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{selectedPaymentMethod.icon}</span>
                  <span style={{
                    fontWeight: 'bold',
                    color: 'var(--text-main)'
                  }}>
                    {selectedPaymentMethod.name}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)'
                }}>
                  {selectedPaymentMethod.description}
                </div>
              </div>
            )}

            {/* Progress Steps */}
            <div style={{
              display: 'grid',
              gap: '15px'
            }}>
              {paymentSteps.map((step, index) => (
                <div key={step.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: getStepColor(step.status),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    position: 'relative'
                  }}>
                    {step.status === 'completed' ? '✓' : index + 1}
                    {index < paymentSteps.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        top: '40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '2px',
                        height: '30px',
                        background: paymentSteps[index + 1].status === 'completed' ? '#4CAF50' : '#666'
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 'bold',
                      color: 'var(--text-main)',
                      marginBottom: '2px'
                    }}>
                      {step.label}
                    </div>
                    {step.status === 'in_progress' && (
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#FF9800'
                      }}>
                        Processing...
                      </div>
                    )}
                    {step.status === 'completed' && (
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#4CAF50'
                      }}>
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Complete Message */}
            {paymentComplete && (
              <div style={{
                marginTop: '30px',
                padding: '20px',
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid #4CAF50',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '10px'
                }}>
                  🎉
                </div>
                <h3 style={{
                  margin: '0 0 10px 0',
                  color: '#4CAF50',
                  fontWeight: 'bold'
                }}>
                  Payment Successful!
                </h3>
                <p style={{
                  margin: 0,
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem'
                }}>
                  Your order has been confirmed and is being processed.
                </p>
                <button
                  onClick={() => navigate('/orders')}
                  style={{
                    marginTop: '15px',
                    padding: '10px 20px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  View Orders
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
