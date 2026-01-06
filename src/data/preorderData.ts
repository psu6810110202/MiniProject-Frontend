export interface PreOrderItem {
    id: number;
    name: string;
    price: number;
    deposit: number;
    releaseDate: string;
    image: string;
    description: string;
    fandom: string;
    category: string;
}

export const preorderItems: PreOrderItem[] = [
    {
        id: 1,
        name: "ฮัตสึเนะ มิคุ: 16th Birthday Ver.",
        price: 8500,
        deposit: 1000,
        releaseDate: "2024-08-31",
        image: "http://localhost:3000/images/covers/Project_sekai.webp",
        description: "การ์ดสะสมฉลองวันเกิดครบรอบ 16 ปีของมิคุ พร้อมดีไซน์สีสันสดใส",
        fandom: "Project sekai",
        category: "ฟิกเกอร์"
    },
    {
        id: 2,
        name: "Genshin Impact: ไรเดน โชกุน สตัวต์",
        price: 14500,
        deposit: 2500,
        releaseDate: "2024-12-15",
        image: "http://localhost:3000/images/covers/Genshin.webp",
        description: "สตัวต์พรีเมียมของอาร์คอนแห่งสายฟ้า พร้อมไฟ LED",
        fandom: "Genshin impact",
        category: "ฟิกเกอร์"
    },
    {
        id: 3,
        name: "Hazbin Hotel: อลาสเตอร์ วิทยุกระดับชั้น",
        price: 5200,
        deposit: 500,
        releaseDate: "2024-09-20",
        image: "http://localhost:3000/images/covers/Hazbin Hotal.jpg",
        description: "ฟิกเกอร์รายละเอียดสูงของอลาสเตอร์พร้อมไมค์โฟน",
        fandom: "Hazbin hotel",
        category: "ฟิกเกอร์"
    },
    {
        id: 4,
        name: "Identity V: กล่องสะสม Truce Limited",
        price: 28000,
        deposit: 5000,
        releaseDate: "2025-01-10",
        image: "http://localhost:3000/images/covers/Identity V.webp",
        description: "กล่องสะสมขนาดใหญ่บรรจุสกินและไอเทมพิเศษ",
        fandom: "Identity V",
        category: "อื่นๆ"
    }
];
