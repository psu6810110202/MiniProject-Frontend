import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import { productAPI, type Product } from '../services/api';
import { preorderItems } from '../data/preorderData';
import { regularProducts } from '../data/regularProducts';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { items, likedProductIds, toggleLikeProduct } = useProducts();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  // Convert Item to Product format
  const convertItemToProduct = (item: any): Product => {
    const numericPrice = typeof item.price === 'string'
      ? parseInt(item.price.replace('฿', '').replace(',', '')) || 0
      : (item.price || 0);

    // Check if this is a pre-order item
    const isPreOrderItem = item.deposit !== undefined || item.releaseDate !== undefined;

    return {
      product_id: item.id?.toString() || 'unknown',
      name: item.name,
      description: `${item.name} - High quality ${item.category || 'collectible'} from ${item.fandom || 'Exclusive'} collection. Perfect for collectors and fans.`,
      price: numericPrice,
      category: item.category || (isPreOrderItem ? 'Pre-Order' : 'Regular'),
      fandom: item.fandom || 'Exclusive',
      image: item.image,
      stock: isPreOrderItem ? 100 : (item.stock || Math.floor(Math.random() * 50) + 10),
      is_preorder: isPreOrderItem,
      release_date: item.releaseDate || new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deposit_amount: item.deposit || Math.floor(numericPrice * 0.2),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id, items]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);

      // Try pre-order data first (for pre-order items)
      const preOrderItem = preorderItems.find(item => item.id.toString() === productId);
      
      if (preOrderItem) {
        const convertedProduct = convertItemToProduct(preOrderItem);
        setProduct(convertedProduct);
        setError(null);
      } else {
        // Try regular products data (for regular items)
        const regularProduct = regularProducts.find(item => item.id.toString() === productId);
        
        if (regularProduct) {
          const convertedProduct = convertItemToProduct(regularProduct);
          setProduct(convertedProduct);
          setError(null);
        } else {
          // Then try ProductContext
          const contextItem = items.find(item =>
            item.id?.toString() === productId
          );

          if (contextItem) {
            const convertedProduct = convertItemToProduct(contextItem);
            setProduct(convertedProduct);
            setError(null);
          } else {
            // Try API
            try {
              const data = await productAPI.getById(productId);
              setProduct(data);
              setError(null);
            } catch (apiError) {
              // Use fallback data
              const fallbackProduct: Product = {
                product_id: productId,
                name: 'DomPort Exclusive Figure - Limited Edition',
                description: 'Premium quality collectible figure from DomPort. This exclusive limited edition features detailed craftsmanship and comes with official certificate of authenticity.',
                price: 2590,
                category: 'Vinyl Figures',
                fandom: 'DomPort Original',
                image: '/api/placeholder/400/400',
                stock: 50,
                is_preorder: false,
                release_date: '2026-02-15',
                deposit_amount: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              setProduct(fallbackProduct);
              setError('Using demo data - product not found in catalog or API');
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      setError('Failed to load product');
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

      // Show success feedback
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
        <div style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Loading product details...</div>
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
        <h2>Product not found</h2>
        <Link to="/catalog" style={{ color: '#FF5722' }}>Back to Catalog</Link>
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
        <Link to="/catalog" style={{ color: 'var(--text-muted', textDecoration: 'none' }}>Catalog</Link>
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
          {/* Product Name */}
          {/* Product Name with Pre-Order Badge */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <h1
                onClick={() => navigate(`/product/${product.product_id}`)}
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
                    🔥 PRE-ORDER EXCLUSIVE
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
              ) : (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                    color: 'white',
                    borderRadius: '25px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    verticalAlign: 'middle',
                    alignSelf: 'center',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                  }}>
                    ✅ IN STOCK - READY TO SHIP
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    background: 'rgba(76, 175, 80, 0.1)',
                    color: '#4CAF50',
                    borderRadius: '15px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: '1px solid #4CAF50'
                  }}>
                    IMMEDIATE DELIVERY
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: product.is_preorder ? '#FF5722' : '#4CAF50',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'baseline',
            gap: '15px'
          }}>
            <div>
              ฿{product.price.toLocaleString()}
            </div>
            {product.is_preorder && (
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
            )}
            {!product.is_preorder && (
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 'normal'
              }}>
                <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>REGULAR PRICE</div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>
                  Ships within 2-3 business days
                </div>
              </div>
            )}
          </div>

          {/* Product Type Header */}
          <div style={{
            background: product.is_preorder ? 
              'linear-gradient(135deg, rgba(255, 87, 34, 0.15), rgba(255, 87, 34, 0.05))' : 
              'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05))',
            border: `2px solid ${product.is_preorder ? '#FF5722' : '#4CAF50'}`,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <span style={{ fontSize: '2rem' }}>
                {product.is_preorder ? '🚀' : '📦'}
              </span>
              <div>
                <h2 style={{
                  margin: '0 0 5px 0',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: product.is_preorder ? '#FF5722' : '#4CAF50'
                }}>
                  {product.is_preorder ? 'PRE-ORDER PRODUCT' : 'REGULAR PRODUCT'}
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: product.is_preorder ? '#E64A19' : '#45a049'
                }}>
                  {product.is_preorder ? 
                    'Reserve now and secure your limited edition item before it\'s gone!' : 
                    'Available now for immediate shipping to your doorstep.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Information Section */}
          {product.is_preorder && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(230, 74, 25, 0.05))',
              border: '2px solid #FF5722',
              borderRadius: '16px',
              padding: '25px',
              marginBottom: '30px',
              boxShadow: '0 8px 24px rgba(255, 87, 34, 0.15)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                color: '#FF5722',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                🚀 Pre-Order Details
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '15px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 87, 34, 0.2)'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>📅 Release Date</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#FF5722' }}>
                    {formatDate(product.release_date!)}
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '15px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 87, 34, 0.2)'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>⏰ Expected</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#FF5722' }}>
                    {getRelativeTime(product.release_date!)}
                  </div>
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255, 87, 34, 0.05)',
                padding: '15px',
                borderRadius: '12px',
                border: '1px dashed #FF5722'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>💰 Payment Plan</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  Deposit: ฿{product.deposit_amount?.toLocaleString()} (20%)
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                  Remaining ฿{Math.round(product.price * 0.8).toLocaleString()} due on release
                </div>
              </div>
            </div>
          )}

          {!product.is_preorder && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(69, 160, 73, 0.05))',
              border: '2px solid #4CAF50',
              borderRadius: '16px',
              padding: '25px',
              marginBottom: '30px',
              boxShadow: '0 8px 24px rgba(76, 175, 80, 0.15)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                color: '#4CAF50',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                📦 In-Stock Details
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '15px',
                  borderRadius: '12px',
                  border: '1px solid rgba(76, 175, 80, 0.2)'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>📦 Stock Status</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4CAF50' }}>
                    {product.stock} units available
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '15px',
                  borderRadius: '12px',
                  border: '1px solid rgba(76, 175, 80, 0.2)'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>🚚 Delivery</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4CAF50' }}>
                    Ships in 2-3 days
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>Description</h3>
            <p style={{
              lineHeight: '1.6',
              color: 'var(--text-muted)',
              margin: 0
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
                background: addingToCart ? '#4CAF50' : 
                         product.is_preorder ? 'linear-gradient(135deg, #FF5722, #E64A19)' : 
                         '#FF5722',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: addingToCart || product.stock === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: product.stock === 0 ? 0.5 : 1,
                boxShadow: product.is_preorder ? '0 4px 16px rgba(255, 87, 34, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!addingToCart && product.stock > 0) {
                  e.currentTarget.style.background = product.is_preorder ? 
                    'linear-gradient(135deg, #E64A19, #D84315)' : '#E64A19';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!addingToCart) {
                  e.currentTarget.style.background = product.is_preorder ? 
                    'linear-gradient(135deg, #FF5722, #E64A19)' : '#FF5722';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {addingToCart ? '✓ Added to Cart' : 
               product.stock === 0 ? 'Out of Stock' : 
               (product.is_preorder ? '🚀 Pre-Order Now' : '🛒 Add to Cart')
              }
            </button>

            <button
              onClick={() => {
                if (product?.product_id) toggleLikeProduct(Number(product.product_id));
              }}
              style={{
                width: '60px', // Fixed width for square look
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0', // Reset padding
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
              <div><strong>Category:</strong> {product.category}</div>
              <div><strong>Fandom:</strong> {product.fandom}</div>
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

export default ProductDetail;
