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
        image: "http://localhost:3000/images/covers/Hazbin Hotal.jpg"
    },
    {
        id: 2,
        name: "Sans Hoodie",
        price: "฿1,200",
        category: "Apparel",
        fandom: "Undertale",
        image: "http://localhost:3000/images/covers/Undertale.jpeg"
    },
    {
        id: 3,
        name: "Raiden Shogun Figure",
        price: "฿5,500",
        category: "Figure",
        fandom: "Genshin impact",
        image: "http://localhost:3000/images/covers/Genshin.webp"
    },
    {
        id: 4,
        name: "Gardener Plush Doll",
        price: "฿890",
        category: "Plush",
        fandom: "Identity V",
        image: "http://localhost:3000/images/covers/Identity V.webp"
    },
    {
        id: 5,
        name: "Alien Stage Official Artbook",
        price: "฿1,500",
        category: "Book",
        fandom: "Alien stage",
        image: "http://localhost:3000/images/covers/Alien_stage.webp"
    },
    {
        id: 6,
        name: "GingerBrave Cookie Cushion",
        price: "฿650",
        category: "Cushion",
        fandom: "Cookie run kingdom",
        image: "http://localhost:3000/images/covers/Cookie_run_kingdom.webp"
    },
    {
        id: 7,
        name: "Hatsune Miku Sekai Ver. Figure",
        price: "฿1,800",
        category: "Figure",
        fandom: "Project sekai",
        image: "http://localhost:3000/images/covers/Project_sekai.webp"
    },
    {
        id: 8,
        name: "Milgram Es Acrylic Stand",
        price: "฿450",
        category: "Acrylic Stand",
        fandom: "Milgram",
        image: "http://localhost:3000/images/covers/Milgram.jpg"
    }
];