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
        name: "Alastor Microphone Staff Replica",
        price: "฿2,500",
        category: "Prop Replica",
        fandom: "Hazbin hotel",
        image: "https://via.placeholder.com/300x300/FF0000/FFFFFF?text=Alastor+Staff"
    },
    {
        id: 2,
        name: "Sans Hoodie",
        price: "฿1,200",
        category: "Apparel",
        fandom: "Undertale",
        image: "https://via.placeholder.com/300x300/0000FF/FFFFFF?text=Sans+Hoodie"
    },
    {
        id: 3,
        name: "Raiden Shogun Figure",
        price: "฿5,500",
        category: "Figure",
        fandom: "Genshin impact",
        image: "https://via.placeholder.com/300x300/9C27B0/FFFFFF?text=Raiden+Shogun"
    },
    {
        id: 4,
        name: "Gardener Plush Doll",
        price: "฿890",
        category: "Plush",
        fandom: "Identity V",
        image: "https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=Gardener+Plush"
    },
    {
        id: 5,
        name: "Alien Stage Official Artbook",
        price: "฿1,500",
        category: "Book",
        fandom: "Alien stage",
        image: "https://via.placeholder.com/300x300/607D8B/FFFFFF?text=Alien+Stage+Artbook"
    },
    {
        id: 6,
        name: "GingerBrave Cookie Cushion",
        price: "฿650",
        category: "Cushion",
        fandom: "Cookie run kingdom",
        image: "https://via.placeholder.com/300x300/795548/FFFFFF?text=GingerBrave"
    },
    {
        id: 7,
        name: "Hatsune Miku Sekai Ver. Figure",
        price: "฿1,800",
        category: "Figure",
        fandom: "Project sekai",
        image: "https://via.placeholder.com/300x300/00BCD4/FFFFFF?text=Miku+Sekai"
    },
    {
        id: 8,
        name: "Milgram Es Acrylic Stand",
        price: "฿450",
        category: "Acrylic Stand",
        fandom: "Milgram",
        image: "https://via.placeholder.com/300x300/9E9E9E/FFFFFF?text=Es+Stand"
    }
];