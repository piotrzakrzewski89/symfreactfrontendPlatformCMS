import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../auth/useAuth';
import { formatPrice } from '../../utils/bookUtils';
import type { CartItem } from '../../types/book.types';

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { cartItems, getTotalPrice, getTotalItems, clearCart, removeFromCart, updateQuantity } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: products, 2: shipping, 3: payment, 4: review, 5: success
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  
  const [shippingData, setShippingData] = useState<ShippingFormData>({
    firstName: admin?.firstName || '',
    lastName: admin?.lastName || '',
    email: admin?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Polska',
    notes: ''
  });
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  const [selectedPayment, setSelectedPayment] = useState<string>('transfer');

  // Koszty - ceny są już brutto, więc musimy wyliczyć netto i VAT
  const subtotalBrutto = getTotalPrice; // suma brutto (ceny w systemie)
  const netPrice = subtotalBrutto / 1.23; // cena netto
  const tax = subtotalBrutto - netPrice; // VAT = brutto - netto
  
  // Konfiguracja kosztów dostawy
  const SHIPPING_CONFIG = {
    freeShippingThreshold: 200,  // darmowa dostawa powyżej 200 zł
    standardCost: 12.99,         // standardowa dostawa 12.99 zł
    expressCost: 19.99           // ekspresowa dostawa 19.99 zł
  };
  
  const shippingCost = subtotalBrutto > SHIPPING_CONFIG.freeShippingThreshold ? 0 : SHIPPING_CONFIG.standardCost;
  const total = subtotalBrutto + shippingCost; // suma do zapłaty

  // Pobieranie zapisanych adresów
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const userUuid = admin?.sub || admin?.user_uuid || admin?.uuid;
        const token = admin?.token?.access_token || admin?.token;
        
        if (!userUuid || !token) {
          return;
        }

        const response = await fetch(`http://localhost:8084/api/shipping-addresses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch addresses');
        }

        const data = await response.json();
        setSavedAddresses(data.data || []);
        
        // Auto-select default address if available
        const defaultAddress = data.data?.find(addr => addr.isDefault);
        if (defaultAddress && !selectedAddressId) {
          handleAddressSelect(defaultAddress.id);
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    if (admin?.sub || admin?.user_uuid || admin?.uuid) {
      fetchAddresses();
    }
  }, [admin?.sub, admin?.user_uuid, admin?.uuid, admin?.token?.access_token, admin?.token]);

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    const selected = savedAddresses.find(addr => addr.id === addressId);
    if (selected) {
      setSelectedAddressId(addressId);
      setShippingData({
        ...shippingData,
        firstName: selected.firstName,
        lastName: selected.lastName,
        email: selected.email,
        phone: selected.phone || '',
        address: selected.address,
        city: selected.city,
        postalCode: selected.postalCode,
        country: selected.country
      });
    }
  };

  // Handle quick address selection (from saved addresses)
  const handleQuickAddressSelect = (addressId: string) => {
    handleAddressSelect(addressId);
    setStep(3);
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'transfer',
      name: 'Przelew bankowy',
      description: 'Tradycyjny przelew na konto bankowe',
      icon: '🏦'
    },
    {
      id: 'card',
      name: 'Płatność kartą',
      description: 'Szybka płatność online',
      icon: '💳'
    },
    {
      id: 'blik',
      name: 'BLIK',
      description: 'Natychmiastowa płatność BLIK',
      icon: '📱'
    },
    {
      id: 'cash',
      name: 'Płatność przy odbiorze',
      description: 'Zapłata przy odbiorze przesyłki',
      icon: '💵'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateShippingForm = (): boolean => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    const missing = required.filter(field => !shippingData[field as keyof ShippingFormData]);
    
    if (missing.length > 0) {
      setError('Wypełnij wszystkie wymagane pola');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (step === 2 && !validateShippingForm()) {
      return;
    }
    
    setError(null);
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      // Tworzymy tablicę zakupów dla bulk endpointu
      const purchasesData = cartItems.map((item) => ({
        bookUuid: item.uuid,
        buyerUuid: admin?.sub || admin?.user_uuid || admin?.uuid,
        buyerName: `${admin?.firstName || ''} ${admin?.lastName || ''}`.trim() || admin?.email,
        buyerEmail: admin?.email,
        quantity: item.quantity,
        purchasePrice: item.price
      }));

      const response = await fetch('http://localhost:8084/api/purchases/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin?.token?.access_token || admin?.token}`
        },
        body: JSON.stringify({ purchases: purchasesData })
      });

      if (!response.ok) {
        // Spróbuj odczytać response jako tekst
        const responseText = await response.text();
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (jsonError) {
          // Jeśli nie jest JSON, użyj surowego tekstu
          throw new Error(responseText || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Poprawna obsługa różnych formatów błędów
        let errorMessage = 'Nie udało się złożyć zamówienia';
        
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors) {
          // errors może być obiektem lub tablicą
          if (Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join(', ');
          } else if (typeof errorData.errors === 'object') {
            errorMessage = Object.values(errorData.errors).flat().join(', ');
          } else {
            errorMessage = String(errorData.errors);
          }
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        data = { message: 'Purchase created successfully' };
      }

      // Ustawiamy dane zamówienia z odpowiedzi backendu
      setOrderData(data);
      setOrderCompleted(true);
      setStep(5); // Success
      clearCart();
    } catch (err) {
      setError(err.message || 'Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderCompleted) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center py-5">
                <h3>Koszyk jest pusty</h3>
                <p className="text-muted">Dodaj produkty do koszyka, aby złożyć zamówienie.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/books')}
                >
                  Przeglądaj książki
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Główna zawartość */}
        <div className="col-lg-12">
          {/* Progress bar */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                {['Produkty', 'Dostawa', 'Płatność', 'Podsumowanie', 'Potwierdzenie'].map((label, index) => (
                  <div key={index} className="d-flex align-items-center">
                    <div 
                      className={`rounded-circle d-flex align-items-center justify-content-center ${step > index + 1 ? 'bg-success text-white' : step === index + 1 ? 'bg-primary text-white' : 'bg-secondary text-white'}`}
                      style={{ width: '30px', height: '30px', fontSize: '14px' }}
                    >
                      {step > index + 1 ? '✓' : index + 1}
                    </div>
                    <span className={`ms-2 ${step === index + 1 ? 'fw-bold text-primary' : 'text-muted'}`}>
                      {label}
                    </span>
                    {index < 4 && <div className="mx-3 text-muted">→</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Products */}
          {step === 1 && (
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">🛒 Zebrane produkty</h5>
                  </div>
                  <div className="card-body">
                    {cartItems.map((item: CartItem) => (
                      <div key={item.uuid} className="card mb-3">
                        <div className="card-body">
                          <div className="row align-items-center">
                            {/* Miniatura okładki */}
                            <div className="col-md-2">
                              {!item.coverImage ? (
                                <div className="alert alert-danger py-2 text-center" style={{ width: '80px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <div>
                                    <i className="bi bi-exclamation-triangle"></i>
                                    <div style={{ fontSize: '10px' }}>Brak okładki</div>
                                  </div>
                                </div>
                              ) : (
                                <img 
                                  src={item.coverImage ? 
                                    (item.coverImage.startsWith('http') ? item.coverImage : `http://localhost:8084${item.coverImage}`) : 
                                    `https://picsum.photos/seed/${item.uuid}/80/110.jpg`
                                  } 
                                  alt={item.title}
                                  style={{ width: '80px', height: '110px', objectFit: 'cover' }}
                                  className="rounded shadow-sm"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    // Zmień na alert o błędzie zamiast fallback
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="alert alert-danger py-2 text-center" style="width: 80px; height: 110px; display: flex; align-items: center; justify-content: center;">
                                          <div>
                                            <i class="bi bi-exclamation-triangle"></i>
                                            <div style="font-size: 10px;">Błąd</div>
                                          </div>
                                        </div>
                                      `;
                                    }
                                  }}
                                  onLoad={(e) => {
                                    const target = e.target as HTMLImageElement;
                                  }}
                                />
                              )}
                            </div>
                            
                            {/* Informacje o produkcie */}
                            <div className="col-md-7">
                              <h6 className="mb-2 fw-bold">{item.title}</h6>
                              <p className="text-muted mb-2 small">Kategoria: {item.category}</p>
                              <div className="d-flex align-items-center">
                                <span className="badge bg-primary me-2">{formatPrice(item.price)}</span>
                                <span className="text-muted small">Cena za sztukę</span>
                              </div>
                            </div>
                            
                            {/* Kontrola ilości */}
                            <div className="col-md-1">
                              <label className="form-label small mb-2">Ilość:</label>
                              <div className="d-flex align-items-center">
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => updateQuantity(item.uuid, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  style={{ width: '28px', height: '28px', padding: '0' }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                                <span className="mx-2 fw-bold">{item.quantity}</span>
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => updateQuantity(item.uuid, item.quantity + 1)}
                                  style={{ width: '28px', height: '28px', padding: '0' }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            {/* Cena i usuń */}
                            <div className="col-md-2 text-end">
                              <div className="mb-2">
                                <div className="fw-bold fs-5">{formatPrice(item.price * item.quantity)}</div>
                                <small className="text-muted">Suma</small>
                              </div>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeFromCart(item.uuid)}
                              >
                                <i className="bi bi-trash"></i> Usuń
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Podsumowanie kosztów */}
                    <div className="mt-4 p-3 bg-light rounded">
                      <h6 className="mb-3">📊 Podsumowanie kosztów</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Produkty ({getTotalItems}):</span>
                            <span>{formatPrice(subtotalBrutto)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Dostawa:</span>
                            <span>
                              {shippingCost === 0 ? (
                                <span className="text-success">Darmowa!</span>
                              ) : (
                                formatPrice(shippingCost)
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2">
                            <span>VAT (23%):</span>
                            <span>{formatPrice(tax)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Netto:</span>
                            <span>{formatPrice(netPrice)}</span>
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold fs-5">Razem:</span>
                        <span className="fw-bold text-primary fs-5">{formatPrice(total)}</span>
                      </div>
                      
                      {shippingCost > 0 && (
                        <div className="alert alert-info py-2 mt-3">
                          <small>
                            🎁 Darmowa dostawa dla zamówień powyżej {formatPrice(SHIPPING_CONFIG.freeShippingThreshold)}
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/books')}
                      >
                        ← Kontynuuj zakupy
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={handleNextStep}
                      >
                        Dalej →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Shipping */}
          {step === 2 && (
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">📦 Dane dostawy</h5>
                  </div>
                  <div className="card-body">
                    {/* Zapisane adresy */}
                    {savedAddresses.length > 0 && (
                      <div className="mb-4">
                        <h6 className="mb-3">🏠 Wybierz zapisany adres</h6>
                        {loadingAddresses ? (
                          <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            Ładowanie adresów...
                          </div>
                        ) : (
                          <div className="row">
                            {savedAddresses.map((address) => (
                              <div key={address.id} className="col-md-6 mb-3">
                                <div 
                                  className={`card h-100 cursor-pointer ${selectedAddressId === address.id ? 'border-primary' : ''}`}
                                  onClick={() => handleAddressSelect(address.id)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        {address.isDefault && (
                                          <span className="badge bg-primary mb-2">Domyślny</span>
                                        )}
                                        <h6 className="card-title">{address.label}</h6>
                                        <p className="card-text small mb-1">
                                          <strong>{address.firstName} {address.lastName}</strong><br />
                                          {address.address}<br />
                                          {address.postalCode} {address.city}<br />
                                          {address.country}
                                        </p>
                                        <small className="text-muted">
                                          {address.email} | {address.phone || 'Brak telefonu'}
                                        </small>
                                      </div>
                                      <div>
                                        <button 
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuickAddressSelect(address.id);
                                          }}
                                        >
                                          Użyj tego adresu →
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <hr className="my-4" />
                      </div>
                    )}

                    {/* Formularz nowego adresu */}
                    <div className="mb-3">
                      <h6 className="mb-3">✏️ Wprowadź dane dostawy</h6>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Imię *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="firstName"
                          value={shippingData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Nazwisko *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="lastName"
                          value={shippingData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={shippingData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Telefon *</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={shippingData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Adres *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={shippingData.address}
                        onChange={handleInputChange}
                        placeholder="Ulica i numer budynku"
                        required
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Miasto *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={shippingData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Kod pocztowy *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="postalCode"
                          value={shippingData.postalCode}
                          onChange={handleInputChange}
                          placeholder="XX-XXX"
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Kraj *</label>
                        <select
                          className="form-select"
                          name="country"
                          value={shippingData.country}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Polska">Polska</option>
                          <option value="Niemcy">Niemcy</option>
                          <option value="Czechy">Czechy</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Uwagi (opcjonalnie)</label>
                      <textarea
                        className="form-control"
                        name="notes"
                        value={shippingData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Dodatkowe informacje dotyczące dostawy..."
                      />
                    </div>

                    <div className="d-flex justify-content-between">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={handlePrevStep}
                      >
                        ← Wróć
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={handleNextStep}
                      >
                        Dalej →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">💳 Metoda płatności</h5>
                  </div>
                  <div className="card-body">
                    {paymentMethods.map(method => (
                      <div 
                        key={method.id}
                        className={`card mb-2 ${selectedPayment === method.id ? 'border-primary' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="payment"
                                value={method.id}
                                checked={selectedPayment === method.id}
                                onChange={() => setSelectedPayment(method.id)}
                              />
                            </div>
                            <div className="ms-3">
                              <div className="d-flex align-items-center">
                                <span className="me-2" style={{ fontSize: '24px' }}>{method.icon}</span>
                                <div>
                                  <h6 className="mb-1">{method.name}</h6>
                                  <small className="text-muted">{method.description}</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="d-flex justify-content-between mt-4">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={handlePrevStep}
                      >
                        ← Wstecz
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={handleNextStep}
                      >
                        Dalej →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">📋 Podsumowanie zamówienia</h5>
                  </div>
                  <div className="card-body">
                    {/* Shipping info */}
                    <div className="mb-4">
                      <h6>Dane dostawy:</h6>
                      <p className="mb-1">
                        {shippingData.firstName} {shippingData.lastName}<br />
                        {shippingData.address}<br />
                        {shippingData.postalCode} {shippingData.city}<br />
                        {shippingData.country}<br />
                        📧 {shippingData.email}<br />
                        📱 {shippingData.phone}
                      </p>
                    </div>

                    {/* Payment info */}
                    <div className="mb-4">
                      <h6>Metoda płatności:</h6>
                      <p className="mb-1">
                        {paymentMethods.find(m => m.id === selectedPayment)?.icon} {' '}
                        {paymentMethods.find(m => m.id === selectedPayment)?.name}
                      </p>
                    </div>

                    {/* Order items */}
                    <div className="mb-4">
                      <h6>Produkty:</h6>
                      {cartItems.map((item: CartItem) => (
                        <div key={item.uuid} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                          <div>
                            <h6 className="mb-1">{item.title}</h6>
                            <small className="text-muted">
                              {formatPrice(item.price)} × {item.quantity}
                            </small>
                          </div>
                          <span className="fw-bold">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Podsumowanie kosztów */}
                    <div className="mt-4 p-3 bg-light rounded">
                      <h6 className="mb-3">📊 Podsumowanie kosztów</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Produkty ({getTotalItems}):</span>
                            <span>{formatPrice(subtotalBrutto)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Dostawa:</span>
                            <span>
                              {shippingCost === 0 ? (
                                <span className="text-success">Darmowa!</span>
                              ) : (
                                formatPrice(shippingCost)
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2">
                            <span>VAT (23%):</span>
                            <span>{formatPrice(tax)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Netto:</span>
                            <span>{formatPrice(netPrice)}</span>
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold fs-5">Razem:</span>
                        <span className="fw-bold text-primary fs-5">{formatPrice(total)}</span>
                      </div>
                      
                      {shippingCost > 0 && (
                        <div className="alert alert-info py-2 mt-3">
                          <small>
                            🎁 Darmowa dostawa dla zamówień powyżej {formatPrice(SHIPPING_CONFIG.freeShippingThreshold)}
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="d-flex justify-content-between">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={handlePrevStep}
                      >
                        ← Wstecz
                      </button>
                      <button 
                        className="btn btn-success"
                        onClick={handleSubmitOrder}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Składanie zamówienia...
                          </>
                        ) : (
                          '✓ Złóż zamówienie'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-body text-center py-5">
                    <div className="text-success mb-3" style={{ fontSize: '48px' }}>
                      ✓
                    </div>
                    <h3 className="mb-3">Zamówienie złożone pomyślnie!</h3>
                    <p className="text-muted mb-4">
                      Dziękujemy za zakupy. Potwierdzenie zamówienia zostało wysłane na adres email.
                    </p>
                    
                    {/* Podsumowanie zamówienia */}
                    <div className="mb-4 p-3 bg-light rounded text-start">
                      <h6 className="mb-3">📋 Szczegóły zamówienia:</h6>
                      
                      {/* Lista zakupionych książek */}
                      {orderData?.orderSummary?.books?.map((book: any, index: number) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                          <div>
                            <h6 className="mb-1">{book.title}</h6>
                            <small className="text-muted">
                              {formatPrice(book.unitPrice)} × {book.quantity}
                            </small>
                          </div>
                          <span className="fw-bold">
                            {formatPrice(book.totalPrice)}
                          </span>
                        </div>
                      ))}
                      
                      <div className="d-flex justify-content-between mb-2">
                        <span>Liczba produktów:</span>
                        <span className="fw-bold">{orderData?.orderSummary?.totalItems || getTotalItems}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Wartość produktów:</span>
                        <span className="fw-bold text-primary">{formatPrice(orderData?.orderSummary?.totalPrice || getTotalPrice)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Dostawa:</span>
                        <span className="fw-bold">
                          {shippingCost === 0 ? 'Darmowa!' : formatPrice(shippingCost)}
                        </span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Razem:</span>
                        <span className="fw-bold text-primary fs-5">{formatPrice((orderData?.orderSummary?.totalPrice || getTotalPrice) + shippingCost)}</span>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-center gap-3">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/user/my-books')}
                      >
                        Moje książki
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/books')}
                      >
                        Kontynuuj zakupy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
