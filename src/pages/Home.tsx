import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ---------------------------------------------------------
// 📦 ข้อ 6: Mock Data (ข้อมูลจำลอง)
// สร้างตัวแปรเก็บข้อมูลไว้ในไฟล์นี้เลย เพื่อแก้ปัญหาหาไฟล์ไม่เจอ
// ---------------------------------------------------------
const mockItems = [
    {
        id: 1,
        name: "Demon Slayer: Rengoku Figure",
        price: "฿4,500",
        category: "Figure",
        image: "https://via.placeholder.com/300x300/FF5722/FFFFFF?text=Rengoku"
    },
    {
        id: 2,
        name: "One Piece: Shanks Sword",
        price: "฿12,000",
        category: "Weapon Replica",
        image: "https://via.placeholder.com/300x300/333333/FFFFFF?text=Shanks"
    },
    {
        id: 3,
        name: "Naruto: Leaf Headband",
        price: "฿850",
        category: "Accessory",
        image: "https://via.placeholder.com/300x300/0a0a0a/FFFFFF?text=Headband"
    },
    {
        id: 4,
        name: "AOT: Scout Cloak",
        price: "฿1,290",
        category: "Apparel",
        image: "https://via.placeholder.com/300x300/1565C0/FFFFFF?text=Cloak"
    },
    {
        id: 5,
        name: "Genshin: Vision Keychains",
        price: "฿350",
        category: "Keychain",
        image: "https://via.placeholder.com/300x300/9C27B0/FFFFFF?text=Vision"
    },
    {
        id: 6,
        name: "Pokemon: Charizard Plush",
        price: "฿990",
        category: "Plush",
        image: "https://via.placeholder.com/300x300/FF9800/FFFFFF?text=Charizard"
    }
];

const Home: React.FC = () => {
  // --- State Setup ---
  // เช็ค Theme ปัจจุบัน (Dark/Light)
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // เช็คสถานะ Login (ข้อ 5)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // State สำหรับโหลดข้อมูล (ข้อ 3) และเก็บข้อมูล (ข้อ 6)
  const [items, setItems] = useState<typeof mockItems>([]); 
  const [loading, setLoading] = useState(false);

  // --- Effects ---

  // 1. ตรวจจับการเปลี่ยน Theme แบบ Real-time
  useEffect(() => {
    const checkTheme = () => {
        const t = document.documentElement.getAttribute('data-theme');
        if(t && t !== currentTheme) setCurrentTheme(t);
    };
    const interval = setInterval(checkTheme, 100); 
    return () => clearInterval(interval);
  }, [currentTheme]);

  // 2. Logic หลัก: เช็ค Login และโหลดข้อมูล (ข้อ 3, 4, 5)
  useEffect(() => {
    // ข้อ 5: เช็ค Client-side Storage ว่ามี Token ไหม
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (token) {
        setIsLoggedIn(true);
        // เริ่มต้นการโหลด (ข้อ 3)
        setLoading(true);
        
        // จำลองการดึงข้อมูลจาก Server (รอ 1.5 วินาที)
        setTimeout(() => {
            setItems(mockItems); // เอาข้อมูลเข้า State
            setLoading(false);   // หยุดโหลด
        }, 1500);
        
    } else {
        setIsLoggedIn(false);
    }
  }, []);

  const isDark = currentTheme === 'dark';

  // --- Styles (ข้อ 7: UI Effects & CSS) ---
  const pageStyle: React.CSSProperties = {
      padding: '40px 20px',
      minHeight: '90vh',
      textAlign: 'center',
      // พื้นหลังไล่สี เปลี่ยนตามโหมด
      background: isDark 
        ? 'radial-gradient(circle at center, #2e1005 0%, #000000 80%)' 
        : 'radial-gradient(circle at center, #fff3e0 0%, #ffffff 80%)',
      transition: 'background 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: isLoggedIn ? 'flex-start' : 'center'
  };

  // --- Render Sections (การแสดงผล) ---

  // 🛑 กรณีที่ 1: ยังไม่ Login (ข้อ 4: Routing Logic)
  if (!isLoggedIn) {
      return (
        <div style={pageStyle}>
            {/* โลโก้แบบ Conditional Rendering */}
            <img 
                src={isDark ? '/DomPort_DarkTone.png' : '/DomPort.png'} 
                alt="Logo" 
                style={{ width: '220px', marginBottom: '30px', filter: 'drop-shadow(0 0 15px rgba(255,87,34,0.4))' }} 
            />
            <h1 style={{ fontSize: '4rem', marginBottom: '20px', fontWeight: '900', color: isDark ? '#fff' : '#333' }}>
                Welcome to <span style={{ color: '#FF5722' }}>DomPort</span>
            </h1>
            <p style={{ fontSize: '1.3rem', color: isDark ? '#aaa' : '#666', marginBottom: '40px' }}>
                Please login to view exclusive collections.
            </p>
            {/* ปุ่ม Link ไปหน้า Login */}
            <Link to="/login" style={{
                padding: '15px 40px', fontSize: '1.1rem', background: '#FF5722', color: 'white',
                borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold',
                boxShadow: '0 0 20px rgba(255, 87, 34, 0.4)',
                transition: 'transform 0.2s'
            }}>
                Login to Explore
            </Link>
        </div>
      );
  }

  // ✅ กรณีที่ 2: Login แล้ว -> แสดง Dashboard สินค้า
  return (
    <div style={pageStyle}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '40px', color: isDark ? '#fff' : '#333', fontWeight: '800' }}>
            Featured <span style={{ color: '#FF5722' }}>Collections</span>
        </h2>

        {/* ข้อ 3: แสดง Loading Spinner ถ้ากำลังโหลด */}
        {loading ? (
            <div style={{ marginTop: '50px' }}>
                {/* CSS Animation หมุนๆ */}
                <div style={{
                    width: '50px', height: '50px',
                    border: '5px solid rgba(255, 87, 34, 0.3)',
                    borderTop: '5px solid #FF5722',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                }}></div>
                <p style={{ marginTop: '20px', color: '#888' }}>Loading items...</p>
                {/* Style Block สำหรับ Animation Keyframes */}
                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        ) : (
            // ข้อ 6 & 7: Grid แสดงรายการสินค้า
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Responsive Grid
                gap: '30px',
                width: '100%',
                maxWidth: '1200px',
                padding: '20px'
            }}>
                {items.map((item) => (
                    // Card Component
                    <div 
                        key={item.id}
                        style={{
                            background: isDark ? '#1a1a1a' : '#fff',
                            borderRadius: '15px',
                            overflow: 'hidden',
                            // ข้อ 7: เงาและการเคลื่อนไหว
                            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)',
                            border: isDark ? '1px solid #333' : '1px solid #eee',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                        // Event Handlers สำหรับ Hover Effect (ข้อ 7)
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 87, 34, 0.3)'; // เงาส้มเรืองแสง
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)';
                        }}
                    >
                        {/* รูปภาพสินค้า */}
                        <div style={{ height: '220px', overflow: 'hidden' }}>
                            <img 
                                src={item.image} 
                                alt={item.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>

                        {/* รายละเอียดสินค้า */}
                        <div style={{ padding: '20px', textAlign: 'left' }}>
                            <span style={{ 
                                fontSize: '0.8rem', color: '#FF5722', fontWeight: 'bold', 
                                background: 'rgba(255, 87, 34, 0.1)', padding: '5px 10px', borderRadius: '20px'
                            }}>
                                {item.category}
                            </span>
                            <h3 style={{ 
                                margin: '15px 0 10px', fontSize: '1.2rem', color: isDark ? '#fff' : '#333' 
                            }}>
                                {item.name}
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isDark ? '#ccc' : '#555' }}>
                                    {item.price}
                                </span>
                                <button style={{
                                    padding: '8px 15px',
                                    background: 'transparent',
                                    border: '2px solid #FF5722',
                                    color: '#FF5722',
                                    fontWeight: 'bold',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#FF5722';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#FF5722';
                                }}>
                                    Add +
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default Home;