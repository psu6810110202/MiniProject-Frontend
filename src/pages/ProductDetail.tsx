import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import { productAPI, type Product } from '../services/api';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { items } = useProducts();
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
    
    return {
      product_id: item.id?.toString() || 'unknown',
      name: item.name,
      description: `${item.name} - High quality ${item.category} from ${item.fandom} collection. Perfect for collectors and fans.`,
      price: numericPrice,
      category: item.category,
      fandom: item.fandom,
      image: item.image,
      stock: Math.floor(Math.random() * 50) + 10, // Random stock for demo
      is_preorder: Math.random() > 0.7, // Random pre-order for demo
      release_date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deposit_amount: Math.floor(numericPrice * 0.2),
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
      
      // First try to find in ProductContext
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
            is_preorder: true,
            release_date: '2026-02-15',
            deposit_amount: 500,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProduct(fallbackProduct);
          setError('Using demo data - product not found in catalog or API');
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
      addToCart({
            id: Number(product.product_id),
            name: product.name,
            price: `฿${product.price.toLocaleString()}`,
            category: product.category,
            fandom: product.fandom,
            image: product.image
        });
      
      // Show success feedback and navigate to cart
      setTimeout(() => {
        setAddingToCart(false);
        // Navigate to cart after adding
        navigate('/cart');
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
              
              {product.is_preorder && (
                <span style={{
                  padding: '6px 12px',
                  background: '#FF5722',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  verticalAlign: 'middle',
                  alignSelf: 'center'
                }}>
                  PRE-ORDER
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#FF5722',
            marginBottom: '30px'
          }}>
            ฿{product.price.toLocaleString()}
          </div>

          {/* Pre-Order Information */}
          {product.is_preorder && (
            <div style={{
              background: 'rgba(255, 87, 34, 0.1)',
              border: '1px solid #FF5722',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px'
            }}>
              <h3 style={{
                margin: '0 0 15px 0',
                color: '#FF5722',
                fontSize: '1.1rem'
              }}>
                📅 Pre-Order Information
              </h3>
              <div style={{ marginBottom: '10px' }}>
                <strong>Release Date:</strong> {formatDate(product.release_date!)}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Expected:</strong> {getRelativeTime(product.release_date!)}
              </div>
              <div>
                <strong>Deposit Required:</strong> ฿{product.deposit_amount?.toLocaleString()}
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
                background: addingToCart ? '#4CAF50' : '#FF5722',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: addingToCart || product.stock === 0 ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                opacity: product.stock === 0 ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!addingToCart && product.stock > 0) {
                  e.currentTarget.style.background = '#E64A19';
                }
              }}
              onMouseLeave={(e) => {
                if (!addingToCart) {
                  e.currentTarget.style.background = '#FF5722';
                }
              }}
            >
              {addingToCart ? '✓ Added to Cart' : product.stock === 0 ? 'Out of Stock' : (product.is_preorder ? 'Pre-Order Now' : 'Add to Cart')}
            </button>

            <button
              style={{
                padding: '15px 30px',
                background: 'transparent',
                color: '#FF5722',
                border: '2px solid #FF5722',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FF5722';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#FF5722';
              }}
            >
              ❤️
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
