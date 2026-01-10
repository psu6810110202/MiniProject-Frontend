import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';
import { productAPI } from '../../services/api';

const ProductDetail: React.FC = () => {
  const { id, name } = useParams<{ id: string; name: string }>();
  const { addToCart } = useCart();
  const { items, preOrders, likedProductIds, toggleLikeProduct } = useProducts();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);


  // Convert Item to Product format
  const convertItemToProduct = (item: any) => {
    const numericPrice = typeof item.price === 'string'
      ? parseInt(item.price.replace('฿', '').replace(',', '')) || 0
      : (item.price || 0);

    return {
      product_id: item.id?.toString() || 'unknown',
      name: item.name,
      description: item.description || `${item.name} - High quality ${item.category || 'collectible'} from ${item.fandom || 'Exclusive'} collection.`,
      price: numericPrice,
      category: item.category || 'Regular',
      fandom: item.fandom || 'Exclusive',
      image: item.image,
      stock: item.stock || 0,
      is_preorder: item?.preOrderCloseDate !== undefined || item?.releaseDate !== undefined || item?.deposit !== undefined,
      release_date: item?.preOrderCloseDate || item.releaseDate || new Date().toISOString().split('T')[0],
      deposit_amount: item.deposit || 0,
      gallery: item.gallery || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  useEffect(() => {
    if (id) {
      loadProduct(id);
    } else {
      console.error('No product ID provided in route');
      setError('No product ID provided');
      setLoading(false);
    }
  }, [id, items, preOrders]);

  const loadProduct = async (productId: string) => {
    console.log('Loading product with ID:', productId);

    try {
      setLoading(true);

      // 1. Try to find in Regular Items
      const regularItem = items.find(item => item.id?.toString() === productId);
      if (regularItem) {
        setProduct(convertItemToProduct(regularItem));
        setError(null);
        return;
      }

      // 2. Try to find in PreOrders
      const cleanId = productId.replace(/^P/i, '');
      const preOrderItem = preOrders.find(item => item.id.toString() === cleanId);
      if (preOrderItem) {
        setProduct(convertItemToProduct(preOrderItem));
        setError(null);
        return;
      }

      // 3. API Fallback
      console.log('Not found in context, trying API for ID:', cleanId);
      const apiData = await productAPI.getById(cleanId);
      if (apiData) {
        setProduct(apiData);
        setError(null);
        return;
      }

    } catch (err) {
      console.error('Error loading product:', err);
      setError('Product not found');
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

      console.log(`Item added to cart.`);

      setTimeout(() => {
        setAddingToCart(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-main)',
        minHeight: '100vh',
        background: 'var(--bg-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
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
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-main)',
        minHeight: '100vh',
        background: 'var(--bg-color)'
      }}>
        <h2>{error || 'Product not found'}</h2>
        <Link to="/" style={{ color: '#FF5722' }}>Back to Home</Link>
      </div>
    );
  }

  // Gallery Logic: Use product.gallery if available, otherwise just main image repeated or single
  const galleryImages = (product.gallery && product.gallery.length > 0)
    ? [product.image, ...product.gallery].slice(0, 5) // Max 5 images including main
    : [product.image];

  const currentImage = galleryImages[selectedImage] || product.image;

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      color: 'var(--text-main)',
      background: 'var(--bg-color)',
      minHeight: '80vh',
      position: 'relative'
    }}>
      {/* Back Button */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10
      }}>
        <Link
          to={`/fandoms/${name || 'all'}`}
          style={{
            textDecoration: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '1rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ← Back
        </Link>
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

      {/* Product Details - Matching PreOrderDetail Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        marginTop: '40px',
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
              src={currentImage}
              alt={product.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'contain',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,87,34,0.02)'
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400?text=No+Image';
              }}
            />
          </div>

          {/* Thumbnail Gallery */}
          {galleryImages.length > 1 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {galleryImages.map((img: string, index: number) => (
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
                    transition: 'transform 0.2s',
                    background: 'var(--card-bg)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img
                    src={img}
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
          )}
        </div>

        {/* Product Information */}
        <div>
          {/* Product Name with Badges */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0',
                  color: 'var(--text-main)',
                  lineHeight: '1.2'
                }}
              >
                {product.name}
              </h1>
              {product.is_preorder && (
                <span style={{
                  padding: '6px 12px',
                  background: 'linear-gradient(135deg, #FF5722, #E64A19)',
                  color: 'white',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  PRE-ORDER
                </span>
              )}
              {product.stock > 0 ? (
                <span style={{
                  padding: '6px 12px',
                  background: 'rgba(76, 175, 80, 0.1)',
                  color: '#4CAF50',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  border: '1px solid #4CAF50'
                }}>
                  IN STOCK
                </span>
              ) : (
                <span style={{
                  padding: '6px 12px',
                  background: 'rgba(244, 67, 54, 0.1)',
                  color: '#F44336',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  border: '1px solid #F44336'
                }}>
                  OUT OF STOCK
                </span>
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
          </div>

          {/* Description Main Text */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{
              lineHeight: '1.6',
              color: 'var(--text-muted)',
              margin: 0,
              fontSize: '1rem',
              whiteSpace: 'pre-wrap'
            }}>
              {product.description ? product.description.split('--- Specifications ---')[0].trim() : ''}
            </p>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
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
                Stock: {product.stock} units
              </span>
            </div>
          )}

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
                background: addingToCart ? '#4CAF50' : (product.stock === 0 ? '#555' : 'linear-gradient(135deg, #FF5722, #E64A19)'),
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: addingToCart || product.stock === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: product.stock === 0 ? 0.7 : 1,
                boxShadow: product.stock > 0 ? '0 4px 16px rgba(255, 87, 34, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!addingToCart && product.stock > 0) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #E64A19, #D84315)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!addingToCart && product.stock > 0) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FF5722, #E64A19)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {addingToCart ? '✓ Added to Cart' : product.stock === 0 ? 'Out of Stock' : (product.is_preorder ? 'Pre-Order Now' : 'Add to Cart')}
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

          {/* Dynamic Specifications */}
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
              <div><strong>Product ID:</strong> {product.product_id}</div>
              <div><strong>Category:</strong> {product.category}</div>
              <div><strong>Fandom:</strong> {product.fandom}</div>
              {(() => {
                const specPart = product.description?.split('--- Specifications ---')[1];
                if (specPart) {
                  return specPart.trim().split('\n')
                    .filter((line: string) => line.includes(':'))
                    .map((line: string, idx: number) => {
                      const [key, ...val] = line.split(':');
                      return (
                        <div key={idx}><strong>{key.trim()}:</strong> {val.join(':').trim()}</div>
                      );
                    });
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
