export interface RegularProduct {
    id: number;
    name: string;
    price: number;
    category: string;
    fandom: string;
    image: string;
    description: string;
    stock: number;
}

export const regularProducts: RegularProduct[] = [
    {
        id: 101,
        name: "Hazbin Hotel: แองเจิล ดัสต์ ตุ๊กตา",
        price: 1250,
        category: "ตุ๊กตา",
        fandom: "Hazbin hotel",
        image: "http://localhost:3000/images/covers/Hazbin Hotal.jpg",
        description: "ตุ๊กตานุ่มๆ ของแองเจิล ดัสต์จาก Hazbin Hotel",
        stock: 100
    },
    {
        id: 102,
        name: "Undertale: เสื้อยืด The Fallen Human",
        price: 890,
        category: "เสื้อผ้า",
        fandom: "Undertale",
        image: "http://localhost:3000/images/covers/Undertale.jpeg",
        description: "เสื้อยืดคอตัวคุณภาพพรีเมียมลายหัวใจวิญญาณ",
        stock: 50
    },
    {
        id: 103,
        name: "Genshin Impact: ไปม่อน อาหารฉุกเฉิน ฟิกเกอร์",
        price: 3500,
        category: "ฟิกเกอร์",
        fandom: "Genshin impact",
        image: "http://localhost:3000/images/covers/Genshin.webp",
        description: "ฟิกเกอร์ไปม่อนขนาด 1/7 รายละเอียดสูง",
        stock: 20
    },
    {
        id: 104,
        name: "Identity V: นกฮูกของ Seer พร็อพ",
        price: 1500,
        category: "พร็อพ",
        fandom: "Identity V",
        image: "http://localhost:3000/images/covers/Identity V.webp",
        description: "พร็อปนกฮูกของ Seer ขนาดเท่าจริง",
        stock: 15
    },
    {
        id: 105,
        name: "Alien Stage: ไอวาน เข็มกลัด",
        price: 150,
        category: "เครื่องประดับ",
        fandom: "Alien stage",
        image: "http://localhost:3000/images/covers/Alien_stage.webp",
        description: "เข็มกลัดโลหะลายไอวานจาก Alien Stage",
        stock: 200
    },
    {
        id: 106,
        name: "Cookie Run: Kingdom - โคมไฟ Pure Vanilla Cookie",
        price: 2200,
        category: "ของตกแต่งบ้าน",
        fandom: "Cookie run kingdom",
        image: "http://localhost:3000/images/covers/Cookie_run_kingdom.webp",
        description: "โคมไฟรูปไม้เท้าของ Pure Vanilla Cookie",
        stock: 30
    },
    {
        id: 107,
        name: "Project Sekai: Leo/need อัลบั้ม CD",
        price: 950,
        category: "สื่อ",
        fandom: "Project sekai",
        image: "http://localhost:3000/images/covers/Project_sekai.webp",
        description: "อัลบั้มเพลงต้นฉบับของ Leo/need",
        stock: 45
    },
    {
        id: 108,
        name: "Milgram: ฮารุกะ พวงกุญแจ",
        price: 250,
        category: "เครื่องประดับ",
        fandom: "Milgram",
        image: "http://localhost:3000/images/covers/Milgram.jpg",
        description: "พวงกุญแจอะคริลิกของฮารุกะจาก Milgram",
        stock: 80
    }
];
