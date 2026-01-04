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
        image: "https://via.placeholder.com/400x500/FF69B4/FFFFFF?text=Angel+Dust",
        description: "Soft and cuddly plush of Angel Dust from Hazbin Hotel.",
        stock: 100
    },
    {
        id: 102,
        name: "Undertale: The Fallen Human T-Shirt",
        price: 890,
        category: "Apparel",
        fandom: "Undertale",
        image: "https://via.placeholder.com/400x500/000000/FFFFFF?text=Undertale+Tee",
        description: "High quality cotton t-shirt featuring the iconic heart soul.",
        stock: 50
    },
    {
        id: 103,
        name: "Genshin Impact: Paimon Emergency Food Figure",
        price: 3500,
        category: "Figure",
        fandom: "Genshin impact",
        image: "https://via.placeholder.com/400x500/FFFFFF/000000?text=Paimon",
        description: "Detailed 1/7 scale figure of Paimon.",
        stock: 20
    },
    {
        id: 104,
        name: "Identity V: Seer Owl Prop",
        price: 1500,
        category: "Prop",
        fandom: "Identity V",
        image: "https://via.placeholder.com/400x500/3E2723/FFFFFF?text=Seer+Owl",
        description: "Life-size replica of the Seer's owl companion.",
        stock: 15
    },
    {
        id: 105,
        name: "Alien Stage: Ivan Badge",
        price: 150,
        category: "Accessories",
        fandom: "Alien stage",
        image: "https://via.placeholder.com/400x500/607D8B/FFFFFF?text=Ivan+Badge",
        description: "Metal badge featuring Ivan from Alien Stage.",
        stock: 200
    },
    {
        id: 106,
        name: "Cookie Run: Kingdom - Pure Vanilla Cookie Lamp",
        price: 2200,
        category: "Home Decor",
        fandom: "Cookie run kingdom",
        image: "https://via.placeholder.com/400x500/FFECB3/FFFFFF?text=Pure+Vanilla+Lamp",
        description: "Ambient lamp shaped like Pure Vanilla Cookie's staff.",
        stock: 30
    },
    {
        id: 107,
        name: "Project Sekai: Leo/need CD Album",
        price: 950,
        category: "Media",
        fandom: "Project sekai",
        image: "https://via.placeholder.com/400x500/3F51B5/FFFFFF?text=Leo+need+Album",
        description: "Original soundtrack album of Leo/need.",
        stock: 45
    },
    {
        id: 108,
        name: "Milgram: Haruka Keychain",
        price: 250,
        category: "Accessories",
        fandom: "Milgram",
        image: "https://via.placeholder.com/400x500/FFC107/FFFFFF?text=Haruka+Key",
        description: "Acrylic keychain of Haruka from Milgram.",
        stock: 80
    }
];
