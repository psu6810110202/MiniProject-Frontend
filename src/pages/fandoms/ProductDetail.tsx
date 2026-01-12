import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';
import { productAPI } from '../../services/api';

const ProductDetail: React.FC = () => {
  const { id, name } = useParams<{ id: string; name: string }>();
  const { addToCart } = useCart();
  const { items } = useProducts();

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

    let baseProduct = {
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
      updated_at: new Date().toISOString(),
      variants: {
        hasSet: false,
        setPrice: 0,
        setQty: 0,
        options: [] as { name: string, price: number, image?: string }[] // Added options array
      }
    };

    // Parse Variants from Description (New JSON Format)
    if (item.description && item.description.includes('--- Variants Data ---')) {
      try {
        const [, subJson] = item.description.split('--- Variants Data ---');
        const parsedVars = JSON.parse(subJson.trim());
        if (Array.isArray(parsedVars) && parsedVars.length > 0) {
          baseProduct.variants = {
            ...baseProduct.variants,
            options: parsedVars
          };
        }
      } catch (e) {
        console.error("Error parsing variants data", e);
      }
    }

    // Parse Variants from Description (Legacy Sales Options)
    if (item.description && item.description.includes('--- Sales Options ---')) {
      const [varStr] = item.description.split('--- Sales Options ---');
      const setPrice = parseInt(varStr.match(/Set Price: (\d+)/)?.[1] || '0');
      const setQty = parseInt(varStr.match(/Set Quantity: (\d+)/)?.[1] || varStr.match(/Box Count: (\d+)/)?.[1] || '0');

      // Clean the description for display if we haven't already (though we might prefer the raw main part)
      // For now, we keep the original logic but prioritize the new Variants Data if present for UI
      if (setPrice) {
        baseProduct.variants = {
          ...baseProduct.variants,
          hasSet: true,
          setPrice,
          setQty
        };
        // If we don't have new JSON variants, create artificial ones from the legacy data for consistent UI
        if (!baseProduct.variants.options) {
          baseProduct.variants.options = [
            { name: 'Single Box', price: baseProduct.price, image: baseProduct.image },
            { name: 'Full Set', price: setPrice, image: baseProduct.image } // Could try to find a set image if available
          ];
        }
      }
    } else if (!baseProduct.variants.options) {
      // Default single option if no variants found
      baseProduct.variants.options = [
        { name: 'Default', price: baseProduct.price, image: baseProduct.image }
      ];
    }

    return baseProduct;
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

    try {
      setLoading(true);

      // 1. Try to find in Regular Items
      const regularItem = items.find(item => item.id?.toString() === productId);
      if (regularItem) {
        setProduct(convertItemToProduct(regularItem));
        setError(null);
        return;
      }

      // 2. API Fallback (Assume regular product)
      // Note: We don't check preOrders context here anymore as that is handled by PreOrderDetail
      console.log('Not found in context, trying API for ID:', productId);
      const apiData = await productAPI.getById(productId);
      if (apiData) {
        setProduct(convertItemToProduct(apiData));
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

  /* State for Variant Selection */
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  useEffect(() => {
    if (product && product.variants?.options?.length > 0) {
      setSelectedVariantIndex(0);
      // If variant has an image, maybe we should set it but let's stick to gallery logic or overwrite for now
      // if (product.variants.options[0].image) ...
    }
  }, [product]);

  const currentVariant = product?.variants?.options?.[selectedVariantIndex] || {
    name: product?.name,
    price: product?.price,
    image: product?.image,
    stock: product?.stock
  };


  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const safeId = isNaN(Number(product.product_id)) ? Date.now() : Number(product.product_id);

      addToCart({
        id: safeId, // We might want a unique ID composed of ProductID + VariantIndex? For now, keeps simplified
        name: `${product.name} - ${currentVariant.name}`,
        price: `฿${Number(currentVariant.price).toLocaleString()}`,
        category: product.category,
        fandom: product.fandom,
        image: currentVariant.image || product.image
      });

      console.log(`Item added to cart.`);

      setTimeout(() => {
        // Simple visual feedback reset
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
  // If Selected Variant has specific image, show that as main?
  // User might prefer standard gallery logic. Let's keep gallery logic but augment main image if variant has one.
  const galleryImages = (product.gallery && product.gallery.length > 0)
    ? [product.image, ...product.gallery].slice(0, 5) // Max 5 images including main
    : [product.image];

  // If the current variant has an image and it's different, prioritize showing it?
  // Usually variants have their own images.
  const displayImage = (currentVariant.image && currentVariant.image !== product.image) ? currentVariant.image : (galleryImages[selectedImage] || product.image);

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '1100px',
      margin: '0 auto',
      color: '#fff',
      background: '#000',
      minHeight: '100vh',
      position: 'relative'
    }}>

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
        gridTemplateColumns: '450px 1fr',
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
              src={displayImage}
              alt={product.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'contain',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.2)'
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400?text=No+Image';
              }}
            />
          </div>

          {/* Thumbnail Gallery */}
          <div className="gallery-scroll" style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '10px',
            scrollBehavior: 'smooth'
          }}>
            {(() => {
              const images = [product.image, ...(product.gallery && Array.isArray(product.gallery) ? product.gallery : [])];
              if (images.length <= 1) return null;

              return images.map((img: string, index: number) => (
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
                    flexShrink: 0,
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
              ));
            })()}
          </div>
        </div>

        {/* Product Information */}
        <div>
          {/* Product Name (No Badges) */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0',
                  color: '#fff',
                  lineHeight: '1.2'
                }}
              >
                {product.name}
              </h1>
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

          {/* Variants Selectors (As Buttons) */}
          {product.variants?.options?.length > 0 && (
            <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ color: '#888', fontSize: '0.9rem', fontWeight: 'bold' }}>Select Option:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {product.variants.options.map((v: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariantIndex(idx)}
                    style={{
                      padding: '10px 20px',
                      background: selectedVariantIndex === idx ? 'linear-gradient(135deg, #FF5722, #E64A19)' : 'var(--card-bg)',
                      color: selectedVariantIndex === idx ? 'white' : 'var(--text-muted)',
                      border: selectedVariantIndex === idx ? 'none' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s',
                      minWidth: '100px',
                      boxShadow: selectedVariantIndex === idx ? '0 4px 12px rgba(255, 87, 34, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedVariantIndex !== idx) {
                        e.currentTarget.style.borderColor = '#FF5722';
                        e.currentTarget.style.color = '#FF5722';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedVariantIndex !== idx) {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Display (Dynamic based on selected variant) */}
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'baseline',
            gap: '15px'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#FF5722'
            }}>
              ฿{Number(currentVariant.price).toLocaleString()}
            </div>
          </div>

          {/* Description Main Text */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{
              lineHeight: '1.5',
              color: 'var(--text-muted)',
              margin: 0,
              fontSize: '0.95rem',
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
                  fontWeight: 'bold',
                  color: 'var(--text-main)'
                }}>
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(Math.min((currentVariant.stock !== undefined ? parseInt(currentVariant.stock) : product.stock), quantity + 1))}
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
                Stock: {currentVariant.stock !== undefined ? currentVariant.stock : product.stock} units
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
              disabled={addingToCart || (currentVariant.stock !== undefined ? parseInt(currentVariant.stock) === 0 : product.stock === 0)}
              style={{
                flex: 1,
                padding: '15px 30px',
                background: addingToCart ? '#4CAF50' : ((currentVariant.stock !== undefined ? parseInt(currentVariant.stock) === 0 : product.stock === 0) ? '#555' : 'linear-gradient(135deg, #FF5722, #E64A19)'),
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: addingToCart || (currentVariant.stock !== undefined ? parseInt(currentVariant.stock) === 0 : product.stock === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: (currentVariant.stock !== undefined ? parseInt(currentVariant.stock) === 0 : product.stock === 0) ? 0.5 : 1,
                boxShadow: '0 4px 16px rgba(255, 87, 34, 0.3)'
              }}
              onMouseEnter={(e) => {
                const stock = currentVariant.stock !== undefined ? parseInt(currentVariant.stock) : product.stock;
                if (!addingToCart && stock > 0) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #E64A19, #D84315)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                const stock = currentVariant.stock !== undefined ? parseInt(currentVariant.stock) : product.stock;
                if (!addingToCart && stock > 0) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FF5722, #E64A19)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {addingToCart ? '✓ Added to Cart' : ((currentVariant.stock !== undefined ? parseInt(currentVariant.stock) === 0 : product.stock === 0) ? 'Out of Stock' : 'Add to Cart')}
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
              <div><strong style={{ color: '#fff' }}>Product ID:</strong> {product.product_id}</div>
              {(() => {
                let specPart = product.description?.split('--- Specifications ---')[1];
                if (specPart) {
                  // Clean up potential trailing data blocks
                  if (specPart.includes('--- Variants Data ---')) {
                    specPart = specPart.split('--- Variants Data ---')[0];
                  }
                  if (specPart.includes('--- Sales Options ---')) {
                    specPart = specPart.split('--- Sales Options ---')[0];
                  }

                  return specPart.trim().split('\n')
                    .filter((line: string) => line.includes(':') && !line.trim().startsWith('[') && !line.trim().startsWith('{'))
                    .map((line: string, idx: number) => {
                      const [key, ...val] = line.split(':');
                      const value = val.join(':').trim();

                      return (
                        <div key={idx}><strong style={{ color: '#fff' }}>{key.trim()}:</strong> {value || '-'}</div>
                      );
                    });
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div >

      <style>{`
        /* Custom Scrollbar for Gallery */
        .gallery-scroll::-webkit-scrollbar {
            height: 8px;
        }
        .gallery-scroll::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05); 
            border-radius: 4px;
        }
        .gallery-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 87, 34, 0.6); 
            border-radius: 4px;
            transition: background 0.3s;
        }
        .gallery-scroll::-webkit-scrollbar-thumb:hover {
            background: #FF5722; 
        }
      `}</style>
    </div >
  );
};

export default ProductDetail;
