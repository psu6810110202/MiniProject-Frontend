import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import { preorderItems, type PreOrderItem } from '../data/preorderData';
import { productAPI, type Product } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const PreOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { likedProductIds, toggleLikeProduct } = useProducts();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  // Convert PreOrderItem to Product format
  const convertPreOrderToProduct = (item: PreOrderItem): Product => {
    return {
      product_id: item.id.toString(),
      name: item.name,
      description: item.description || `${item.name} - Exclusive pre-order item from our premium collection. Limited availability.`,
      price: item.price,
      category: 'Pre-Order',
      fandom: 'Exclusive',
      image: item.image,
      stock: 100, // Pre-orders typically have unlimited stock
      is_preorder: true,
      release_date: item.releaseDate,
      deposit_amount: item.deposit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  useEffect(() => {
    if (id) {
      loadPreOrderProduct(id);
    }
  }, [id]);

  const loadPreOrderProduct = async (productId: string) => {
    console.log('Loading pre-order product with ID:', productId);
    console.log('Available preorder items:', preorderItems);
    
    try {
      setLoading(true);

      // Find product in pre-order items only
      const preOrderItem = preorderItems.find(item => item.id.toString() === productId);
      console.log('Found preorder item:', preOrderItem);

      if (preOrderItem) {
        const convertedProduct = convertPreOrderToProduct(preOrderItem);
        console.log('Converted pre-order product:', convertedProduct);
        setProduct(convertedProduct);
        setError(null);
      } else {
        // Try API as fallback
        try {
          console.log('Trying API...');
          const data = await productAPI.getById(productId);
          setProduct(data);
          setError(null);
        } catch (apiError) {
          console.log('API failed, using fallback');
          const fallbackProduct: Product = {
            product_id: productId,
            name: 'Pre-Order Not Found',
            description: 'The requested pre-order item could not be found. Please check the pre-order page and select a valid item.',
            price: 0,
            category: 'Pre-Order',
            fandom: 'Unknown',
            image: '/api/placeholder/400/400',
            stock: 0,
            is_preorder: true,
            release_date: new Date().toISOString().split('T')[0],
            deposit_amount: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProduct(fallbackProduct);
          setError('Pre-order item not found. Please return to the pre-order page.');
        }
      }
    } catch (err) {
      console.error('Failed to load pre-order product:', err);
      setError('Failed to load pre-order product');
      const fallbackProduct: Product = {
        product_id: productId,
        name: 'Error Loading Pre-Order',
        description: 'An error occurred while loading this pre-order. Please try again later.',
        price: 0,
        category: 'Pre-Order',
        fandom: 'Error',
        image: '/api/placeholder/400/400',
        stock: 0,
        is_preorder: true,
        release_date: new Date().toISOString().split('T')[0],
        deposit_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProduct(fallbackProduct);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const safeId = isNaN(Number(product.product_id)) ? Date.now() : Number(product.product_id);
      addToCart({
        id: safeId,
        name: product.name,
        price: `฿${product.price.toLocaleString()}`,
        category: product.category,
        fandom: product.fandom,
        image: product.image
      });

      setTimeout(() => {
        setAddingToCart(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setAddingToCart(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0 && diffDays <= 30) return `In ${diffDays} days`;
    if (diffDays > 30) return `In ${Math.ceil(diffDays / 30)} months`;
    return 'Coming soon';
  };

  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-main)'
      }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Loading pre-order details...</div>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #FF5722',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-main)'
      }}>
        <h2>Pre-Order Not Found</h2>
        <Link to="/preorder" style={{ color: '#FF5722' }}>Back to Pre-Orders</Link>
      </div>
    );
  }

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      color: 'var(--text-main)'
    }}>
      {/* Breadcrumb */}
      <div style={{
        marginBottom: '30px',
        fontSize: '0.9rem',
        color: 'var(--text-muted)'
      }}>
        <Link to="/" style={{ color: 'var(--text-muted', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <Link to="/preorder" style={{ color: 'var(--text-muted', textDecoration: 'none' }}>Pre-Orders</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ color: 'var(--text-main)' }}>{product.name}</span>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'rgba(255, 152, 0, 0.1)',
          border: '1px solid #FF9800',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: '#FF9800'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'start'
      }}>
        {/* Product Images */}
        <div>
          {/* Main Image */}
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-color)',
            marginBottom: '20px'
          }}>
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,87,34,0.05)'
              }}
            />
          </div>

          {/* Thumbnail Gallery */}
          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                onClick={() => setSelectedImage(index)}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  border: selectedImage === index ? '2px solid #FF5722' : '1px solid var(--border-color)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img
                  src={product.image}
                  alt={`View ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Information */}
        <div>
          {/* Product Name with Pre-Order Badge */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0',
                  color: 'var(--text-main)',
                  lineHeight: '1.2',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FF5722';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-main)';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {product.name}
              </h1>

              {product.is_preorder ? (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #FF5722, #E64A19)',
                    color: 'white',
                    borderRadius: '25px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    verticalAlign: 'middle',
                    alignSelf: 'center',
                    boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)',
                    animation: 'pulse 2s infinite'
                  }}>
                    PRE-ORDER EXCLUSIVE
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    background: 'rgba(255, 87, 34, 0.1)',
                    color: '#FF5722',
                    borderRadius: '15px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: '1px solid #FF5722'
                  }}>
                    LIMITED EDITION
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Price */}
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#FF5722',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'baseline',
            gap: '15px'
          }}>
            <div>
              ฿{product.price.toLocaleString()}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#666',
              fontWeight: 'normal'
            }}>
              <div style={{ color: '#FF5722', fontWeight: 'bold' }}>PRE-ORDER PRICE</div>
              <div>Deposit: ฿{product.deposit_amount?.toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: '#999' }}>
                (฿{Math.round(product.price * 0.2).toLocaleString()} now + ฿{Math.round(product.price * 0.8).toLocaleString()} on release)
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{
              lineHeight: '1.5',
              color: 'var(--text-muted)',
              margin: 0,
              fontSize: '0.95rem'
            }}>
              {product.description}
            </p>
          </div>

          {/* Quantity Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <span style={{ fontWeight: 'bold' }}>Quantity:</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  padding: '10px 15px',
                  border: 'none',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                -
              </button>
              <div style={{
                padding: '10px 20px',
                minWidth: '60px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {quantity}
              </div>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                style={{
                  padding: '10px 15px',
                  border: 'none',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                +
              </button>
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Max: {product.stock} units
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              style={{
                flex: 1,
                padding: '15px 30px',
                background: addingToCart ? '#4CAF50' : 'linear-gradient(135deg, #FF5722, #E64A19)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: addingToCart || product.stock === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: product.stock === 0 ? 0.5 : 1,
                boxShadow: '0 4px 16px rgba(255, 87, 34, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!addingToCart && product.stock > 0) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #E64A19, #D84315)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!addingToCart) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FF5722, #E64A19)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {addingToCart ? '✓ Added to Cart' : product.stock === 0 ? 'Out of Stock' : ' Pre-Order Now'}
            </button>

            <button
              onClick={() => {
                if (product?.product_id) toggleLikeProduct(Number(product.product_id));
              }}
              style={{
                width: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                background: 'transparent',
                border: '2px solid #FF5722',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 87, 34, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {product && likedProductIds.includes(Number(product.product_id)) ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF5722" stroke="#FF5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              )}
            </button>
          </div>

          {/* Additional Information */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px'
          }}>
            <h4 style={{ marginBottom: '15px' }}>Product Details</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '0.9rem',
              color: 'var(--text-muted)'
            }}>
              <div><strong>Stock:</strong> {product.stock} units</div>
              <div><strong>Product ID:</strong> {product.product_id}</div>
            </div>
          </div>

          {/* Material Information */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px',
            marginTop: '20px'
          }}>
            <h4 style={{ marginBottom: '15px' }}>Material & Specifications</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '0.9rem',
              color: 'var(--text-muted)'
            }}>
              <div><strong>Material:</strong> Premium PVC Vinyl</div>
              <div><strong>Height:</strong> 18 cm</div>
              <div><strong>Weight:</strong> 450g</div>
              <div><strong>Base:</strong> 7cm x 5cm</div>
              <div><strong>Paint:</strong> Hand-painted details</div>
              <div><strong>Packaging:</strong> Collector's box</div>
              <div><strong>Authenticity:</strong> Certificate included</div>
              <div><strong>Limited Edition:</strong> 500 pieces worldwide</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreOrderDetail;
