export interface Item {
    id: number;
    name: string;
    price: string;
    category: string;
    fandom: string;
    image: string;
}

export const mockItems: Item[] = [
    {
        id: 1,
        name: "ไมค์โฟนของอลาสเตอร์ พร็อพ",
        price: "฿2,500",
        category: "พร็อพสำเนา",
        fandom: "Hazbin hotel",
        image: "http://localhost:3000/images/covers/Hazbin Hotal.jpg"
    },
    {
        id: 2,
        name: "ฮูดดี้ Sans",
        price: "฿1,200",
        category: "เสื้อผ้า",
        fandom: "Undertale",
        image: "http://localhost:3000/images/covers/Undertale.jpeg"
    },
    {
        id: 3,
        name: "ฟิกเกอร์ไรเดน โชกุน",
        price: "฿5,500",
        category: "ฟิกเกอร์",
        fandom: "Genshin impact",
        image: "http://localhost:3000/images/covers/Genshin.webp"
    },
    {
        id: 4,
        name: "ตุ๊กตาการ์เดนเนอร์",
        price: "฿890",
        category: "ตุ๊กตา",
        fandom: "Identity V",
        image: "http://localhost:3000/images/covers/Identity V.webp"
    },
    {
        id: 5,
        name: "หนังสือศิลปะ Alien Stage",
        price: "฿1,500",
        category: "หนังสือ",
        fandom: "Alien stage",
        image: "http://localhost:3000/images/covers/Alien_stage.webp"
    },
    {
        id: 6,
        name: "หมอนอิงจินเจอร์เบรฟ คุกกี้",
        price: "฿650",
        category: "หมอน",
        fandom: "Cookie run kingdom",
        image: "http://localhost:3000/images/covers/Cookie_run_kingdom.webp"
    },
    {
        id: 7,
        name: "ฟิกเกอร์ฮัตสึเนะ มิคุ ฉบับโลก",
        price: "฿1,800",
        category: "ฟิกเกอร์",
        fandom: "Project sekai",
        image: "http://localhost:3000/images/covers/Project_sekai.webp"
    },
    {
        id: 8,
        name: "สแตนด์อะคริลิก Milgram Es",
        price: "฿450",
        category: "สแตนด์อะคริลิก",
        fandom: "Milgram",
        image: "http://localhost:3000/images/covers/Milgram.jpg"
    }
];