export interface UpdatePost {
    id: number;
    title: string;
    date: string;
    category: 'Announcement' | 'New Release' | 'Event' | 'Delay';
    content: string;
    image?: string;
    author: string;
    title_th?: string;
    content_th?: string;
}

export const updatePosts: UpdatePost[] = [
    {
        id: 1,
        title: "Grand Opening of DomPort Online Store!",
        title_th: "เปิดตัวอย่างเป็นทางการ! ร้านค้าออนไลน์ DomPort",
        date: "2024-01-01",
        category: "Announcement",
        content: "We are thrilled to announce the official launch of DomPort! Your one-stop shop for all things anime figures and collectibles. To celebrate, we are giving away double points on all first purchases this week!",
        content_th: "เรามีความยินดีที่จะประกาศการเปิดตัวอย่างเป็นทางการของ DomPort! ร้านค้าจุดหมายปลายทางของคุณสำหรับทุกสิ่งที่เกี่ยวกับฟิกเกอร์อนิเมะและของสะสม เพื่อเฉลิมฉลอง เรามอบแต้มคูณสองให้กับการซื้อของครั้งแรกทั้งหมดในสัปดาห์นี้!",
        image: "https://via.placeholder.com/600x300/FF5722/FFFFFF?text=Grand+Opening",
        author: "Admin"
    },
    {
        id: 2,
        title: "Wonder Festival 2024 Recap",
        title_th: "สรุปงาน Wonder Festival 2024",
        date: "2024-02-15",
        category: "Event",
        content: "The Winter Wonder Festival was a blast! We saw upcoming prototypes for Chainsaw Man and Spy x Family figures. Check out our gallery for exclusive photos from the event floor.",
        content_th: "งาน Wonder Festival ฤดูหนาวประสบความสำเร็จอย่างสูง! เราได้เห็นต้นแบบล่าสุดของฟิกเกอร์ Chainsaw Man และ Spy x Family ตรวจสอบแกลเลอรี่ของเราสำหรับรูปภาพพิเศษจากพื้นที่งาน",
        author: "Editor_Sarah"
    },
    {
        id: 3,
        title: "Production Delay: EVA Unit-01",
        title_th: "เลื่อนการผลิต: EVA Unit-01",
        date: "2024-03-10",
        category: "Delay",
        content: "We regret to inform you that the release of the EVA Unit-01 Awakening statue has been pushed back by 2 months due to manufacturing adjustments to ensure the highest quality. We apologize for the inconvenience.",
        content_th: "เราต้องขออภัยที่ต้องแจ้งว่าการวางจำหน่ายของสถานะ EVA Unit-01 Awakening ได้ถูกเลื่อนออกไป 2 เดือนเนื่องจากการปรับปรุงกระบวนการผลิตเพื่อให้แน่ใจว่าได้คุณภาพสูงสุด เราขออภัยในความไม่สะดวก",
        author: "Logistics Team"
    },
    {
        id: 4,
        title: "New Pre-Orders: Hololive Generation 3",
        title_th: "เปิดรับสั่งจองล่วงหน้าใหม่: Hololive Generation 3",
        date: "2024-03-20",
        category: "New Release",
        content: "Pre-orders are now open for the entire Hololive Fantasy generation! secure your favorite vtuber scale figure today. Limited stocks available.",
        content_th: "เปิดรับสั่งจองล่วงหน้าสำหรับทั้งรุ่น Hololive Fantasy generation แล้ววันนี้! จองฟิกเกอร์ VTuber ที่คุณชื่นชอบในขนาดสเกลตอนนี้ จำนวนจำกัด",
        image: "https://via.placeholder.com/600x300/4fc3f7/FFFFFF?text=Hololive+Gen3",
        author: "Admin"
    }
];
