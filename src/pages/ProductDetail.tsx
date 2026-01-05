import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import { productAPI, type Product } from '../services/api';
import { preorderItems } from '../data/preorderData';
import { regularProducts } from '../data/regularProducts';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { items, likedProductIds, toggleLikeProduct } = useProducts();
  const { t } = useLanguage();
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
      description: item.description || `${item.name} - High quality ${item.category || 'collectible'} from ${item.fandom || 'Exclusive'} collection. Perfect for collectors and fans.`,
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
    console.log('Loading product with ID:', productId);
    console.log('Available items in context:', items);
    console.log('Available preorder items:', preorderItems);
    console.log('Available regular products:', regularProducts);

    try {
      setLoading(true);

      // First, try to find product in ProductContext items (catalog items)
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

      // If not found in catalog, check if this might be a pre-order or regular product
      // But only search in appropriate data sources based on context
      // Check if this might be a pre-order or regular product

      // Check pre-order items first (since they have lower IDs 1-50)
      const preOrderItem = preorderItems.find(item => item.id.toString() === productId);
      console.log('Found preorder item:', preOrderItem);

      if (preOrderItem) {
        const convertedProduct = convertItemToProduct(preOrderItem);
        setProduct(convertedProduct);
        setError(null);
        return;
      }

      // Then check regular products (IDs 101+)
      const regularProduct = regularProducts.find(item => item.id.toString() === productId);
      console.log('Found regular product:', regularProduct);

      if (regularProduct) {
        const convertedProduct = convertItemToProduct(regularProduct);
        setProduct(convertedProduct);
        setError(null);
        return;
      }

      // If still not found, try API as last resort
      try {
        console.log('Trying API...');
        const data = await productAPI.getById(productId);
        setProduct(data);
        setError(null);
        return;
      } catch (apiError) {
        console.log('API failed, using fallback');
        // Use fallback data if nothing else works
        const fallbackProduct: Product = {
          product_id: productId,
          name: t('product_not_found'),
          description: t('product_not_found_description') || 'The requested product could not be found in our catalog. Please check the product ID or return to catalog and select a valid product.',
          price: 0,
          category: 'Unknown',
          fandom: 'Unknown',
          image: '/api/placeholder/400/400',
          stock: 0,
          is_preorder: false,
          release_date: new Date().toISOString().split('T')[0],
          deposit_amount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProduct(fallbackProduct);
        setError(t('product_not_found_error') || 'Product not found in catalog. Please return to catalog and select a valid product.');
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      setError(t('error_loading_product') || 'Failed to load product');
      const fallbackProduct: Product = {
        product_id: productId,
        name: t('error_loading_product_name') || 'Error Loading Product',
        description: t('error_loading_product_description') || 'An error occurred while loading this product. Please try again later.',
        price: 0,
        category: 'Error',
        fandom: 'Error',
        image: '/api/placeholder/400/400',
        stock: 0,
        is_preorder: false,
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

      // Show success feedback
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
        color: 'var(--text-main)'
      }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '20px' }}>{t('loading_product_details')}</div>
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
        <h2>{t('product_not_found')}</h2>
        <Link to="/catalog" style={{ color: '#FF5722' }}>{t('back_to_catalog')}</Link>
      </div>
    );
  }

  // Calculate Display ID (Sequential per Fandom)
  const displayId = React.useMemo(() => {
    if (!product) return '...';

    // 1. Sort all items (mock + real)
    const allItems = [...items].sort((a, b) => Number(a.id) - Number(b.id)); // Assuming ID is numericable

    // 2. Mappings
    const fandomMap: Record<string, number> = {
      'Hazbin hotel': 1, 'Undertale': 2, 'Genshin impact': 3,
      'Identity V': 4, 'Alien stage': 5, 'Cookie run kingdom': 6,
      'Project sekai': 7, 'Milgram': 8
    };
    const categoryMap: Record<string, number> = {
      'Prop Replica': 1, 'Apparel': 2, 'Figure': 3,
      'Plush': 4, 'Book': 5, 'Cushion': 6, 'Acrylic Stand': 7
    };

    // 3. Find our running number
    let runningParam = 0;
    let myRunningNum = 0;

    for (const item of allItems) {
      if (item.fandom === product.fandom) {
        runningParam++;
        // Check if this item matches our current product
        // We compare strictly (ID or Name if ID is tricky)
        if (String(item.id) === String(product.product_id) || item.name === product.name) {
          myRunningNum = runningParam;
          break;
        }
      }
    }

    // If not found in list (e.g. newly added or API only), default to 1 or Max+1
    if (myRunningNum === 0) myRunningNum = runningParam + 1; // Assume next

    const fId = fandomMap[product.fandom] || 9;
    const cId = categoryMap[product.category] || 9;

    return `${fId}${cId}${myRunningNum}`;
  }, [product, items]);

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
        <Link to="/" style={{ color: 'var(--text-muted', textDecoration: 'none' }}>{t('home')}</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <Link to="/catalog" style={{ color: 'var(--text-muted', textDecoration: 'none' }}>{t('catalog')}</Link>
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
                  alt={`${t('view')} ${index + 1}`}
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
                    {t('preorder_exclusive')}
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
                    {t('limited_edition')}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                    ✅ {t('in_stock_ready_ship')}
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
                    {t('immediate_delivery')}
                  </span>
                  {/* Category & Fandom Tags */}
                  <div style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)'
                  }}>
                    {product.category}
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 8px rgba(156, 39, 176, 0.3)'
                  }}>
                    {product.fandom}
                  </div>
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
                <div style={{ color: '#FF5722', fontWeight: 'bold' }}>{t('preorder_price')}</div>
                <div>{t('deposit')}: ฿{product.deposit_amount?.toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>
                  ({t('now')} ฿{Math.round(product.price * 0.2).toLocaleString()} + {t('on_release')} ฿{Math.round(product.price * 0.8).toLocaleString()})
                </div>
              </div>
            )}
            {!product.is_preorder && (
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: 'normal'
              }}>
                <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>{t('regular_price')}</div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>
                  {t('ships_within_days')}
                </div>
              </div>
            )}
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
            <span style={{ fontWeight: 'bold' }}>{t('quantity')}:</span>
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
              {t('max_units')}: {product.stock} {t('units')}
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
              {addingToCart ? `✓ ${t('added_to_cart')}` :
                product.stock === 0 ? t('out_of_stock') :
                  (product.is_preorder ? ` ${t('preorder_now')}` : ` ${t('add_to_cart')}`)
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
            <h4 style={{ marginBottom: '15px' }}>{t('product_details')}</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '0.9rem',
              color: 'var(--text-muted)'
            }}>
              <div><strong>{t('stock')}:</strong> {product.stock} {t('units')}</div>
              <div><strong>{t('product_id_label')}:</strong> {displayId}</div>
            </div>
          </div>

          {/* Material Information */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px',
            marginTop: '20px'
          }}>
            <h4 style={{ marginBottom: '15px' }}>{t('material_specifications')}</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '0.9rem',
              color: 'var(--text-muted)'
            }}>
              <div><strong>{t('material')}:</strong> {t('premium_pvc_vinyl')}</div>
              <div><strong>{t('height')}:</strong> 18 cm</div>
              <div><strong>{t('weight')}:</strong> 450g</div>
              <div><strong>{t('base')}:</strong> 7cm x 5cm</div>
              <div><strong>{t('paint')}:</strong> {t('hand_painted_details')}</div>
              <div><strong>{t('packaging')}:</strong> {t('collectors_box')}</div>
              <div><strong>{t('authenticity')}:</strong> {t('certificate_included')}</div>
              <div><strong>{t('limited_edition')}:</strong> {t('limited_edition_pieces')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
