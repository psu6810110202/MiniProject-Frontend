import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';
import { preorderItems } from '../../data/preorderData';
import { regularProducts } from '../../data/regularProducts';

const ProductDetail: React.FC = () => {
  const { id, name } = useParams<{ id: string; name: string }>();
  const { addToCart } = useCart();
  const { items, likedProductIds, toggleLikeProduct } = useProducts();

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
      stock: item.stock || 10,
      is_preorder: item.deposit !== undefined,
      release_date: item.releaseDate || new Date().toISOString().split('T')[0],
      deposit_amount: item.deposit || 0,
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
  }, [id, items]);

  const loadProduct = async (productId: string) => {
    console.log('Loading product with ID:', productId);
    console.log('Available items in context:', items);

    try {
      setLoading(true);

      // First, try to find product in ProductContext items
      const contextItem = items.find(item =>
        item.id?.toString() === productId
      );

      console.log('Found context item:', contextItem);

      if (contextItem) {
        const convertedProduct = convertItemToProduct(contextItem);
        console.log('Converted product:', convertedProduct);
        setProduct(convertedProduct);
        setError(null);
        return;
      }

      // Check pre-order items
      const preOrderItem = preorderItems.find(item => item.id.toString() === productId);
      console.log('Found preorder item:', preOrderItem);

      if (preOrderItem) {
        const convertedProduct = convertItemToProduct(preOrderItem);
        setProduct(convertedProduct);
        setError(null);
        return;
      }

      // Check regular products
      const regularProduct = regularProducts.find(item => item.id.toString() === productId);
      console.log('Found regular product:', regularProduct);

      if (regularProduct) {
        const convertedProduct = convertItemToProduct(regularProduct);
        setProduct(convertedProduct);
        setError(null);
        return;
      }

      // If no product found, create a fallback product
      console.log('Creating fallback product for ID:', productId);
      const fallbackProduct = {
        product_id: productId,
        name: `Product ${productId}`,
        description: `This is a test product for ID ${productId}. The actual product data might not be available.`,
        price: 999,
        category: 'Regular',
        fandom: name || 'Test Fandom',
        image: `https://via.placeholder.com/300?text=Product+${productId}`,
        stock: 10,
        is_preorder: false,
        release_date: new Date().toISOString().split('T')[0],
        deposit_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setProduct(fallbackProduct);
      setError(null);
      console.log('Created fallback product:', fallbackProduct);

    } catch (err) {
      console.error('Error loading product:', err);
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

      // Note: Points will be awarded after payment completion
      console.log(`Item added to cart. Points will be awarded after payment completion.`);

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
        <p>Product ID: {id}</p>
        <p>Fandom: {name}</p>
        <Link to="/" style={{ color: '#FF5722' }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      color: 'var(--text-main)',
      background: 'var(--bg-color)',
      height: 'auto',
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
          to={`/fandoms/${name}`}
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
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400?text=No+Image';
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
          {/* Product Name with Badges */}
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
            </div>
          </div>

          {/* Price */}
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#4CAF50',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'baseline',
            gap: '15px'
          }}>
            <div>
              ฿{product.price.toLocaleString()}
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

          {/* Material Information */}
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

      {/* Add pulse animation */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 87, 34, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 87, 34, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
