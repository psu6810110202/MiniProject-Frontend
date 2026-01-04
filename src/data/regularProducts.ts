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
        name: "Hazbin Hotel: Angel Dust Plush",
        price: 1250,
        category: "Plush",
        fandom: "Hazbin hotel",
        image: "http://localhost:3000/images/covers/Hazbin Hotal.jpg",
        description: "Soft and cuddly plush of Angel Dust from Hazbin Hotel.",
        stock: 100
    },
    {
        id: 102,
        name: "Undertale: The Fallen Human T-Shirt",
        price: 890,
        category: "Apparel",
        fandom: "Undertale",
        image: "http://localhost:3000/images/covers/Undertale.jpeg",
        description: "High quality cotton t-shirt featuring the iconic heart soul.",
        stock: 50
    },
    {
        id: 103,
        name: "Genshin Impact: Paimon Emergency Food Figure",
        price: 3500,
        category: "Figure",
        fandom: "Genshin impact",
        image: "http://localhost:3000/images/covers/Genshin.webp",
        description: "Detailed 1/7 scale figure of Paimon.",
        stock: 20
    },
    {
        id: 104,
        name: "Identity V: Seer Owl Prop",
        price: 1500,
        category: "Prop",
        fandom: "Identity V",
        image: "http://localhost:3000/images/covers/Identity V.webp",
        description: "Life-size replica of the Seer's owl companion.",
        stock: 15
    },
    {
        id: 105,
        name: "Alien Stage: Ivan Badge",
        price: 150,
        category: "Accessories",
        fandom: "Alien stage",
        image: "http://localhost:3000/images/covers/Alien_stage.webp",
        description: "Metal badge featuring Ivan from Alien Stage.",
        stock: 200
    },
    {
        id: 106,
        name: "Cookie Run: Kingdom - Pure Vanilla Cookie Lamp",
        price: 2200,
        category: "Home Decor",
        fandom: "Cookie run kingdom",
        image: "http://localhost:3000/images/covers/Cookie_run_kingdom.webp",
        description: "Ambient lamp shaped like Pure Vanilla Cookie's staff.",
        stock: 30
    },
    {
        id: 107,
        name: "Project Sekai: Leo/need CD Album",
        price: 950,
        category: "Media",
        fandom: "Project sekai",
        image: "http://localhost:3000/images/covers/Project_sekai.webp",
        description: "Original soundtrack album of Leo/need.",
        stock: 45
    },
    {
        id: 108,
        name: "Milgram: Haruka Keychain",
        price: 250,
        category: "Accessories",
        fandom: "Milgram",
        image: "http://localhost:3000/images/covers/Milgram.jpg",
        description: "Acrylic keychain of Haruka from Milgram.",
        stock: 80
    }
];
