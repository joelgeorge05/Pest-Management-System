export const diseases = [
    {
        id: "tomato-blight",
        name: "Late Blight",
        crop: "Tomato",
        keywords: ["tomato", "spots", "mold", "brown leaves"],
        description: "A destructive fungal disease that causes dark spots on leaves and fruit, often with a white moldy growth in humid conditions.",
        symptoms: [
            "Water-soaked dark spots on leaves",
            "White mold on leaf undersides",
            "Brown, rotting fruit"
        ],
        treatments: {
            organic: [
                "Spray with Neem oil diluted in water (5ml per liter)",
                "Apply copper-based organic fungicides",
                "Remove and destroy infected plant parts immediately"
            ],
            inorganic: [
                "Apply Chlorothalonil or Mancozeb fungicides according to label",
                "Use systematic fungicides like Acrobat or Curzate in severe cases"
            ],
            homemade: [
                "Baking Soda Mixture: 1 tbsp baking soda + 1 tsp vegetable oil + 1 tsp liquid soap + 1 gallon water",
                "Garlic Spray: Crush 2 bulbs garlic, steep in water overnight, strain and spray"
            ]
        },
        prevention: "Ensure good air circulation, avoid overhead watering, and rotate crops every 3 years.",
        image: "https://images.unsplash.com/photo-1591857177580-dc82b9e4e1aa?auto=format&fit=crop&q=80&w=1000"
    },
    {
        id: "rice-blast",
        name: "Rice Blast",
        crop: "Rice",
        keywords: ["rice", "blast", "spots", "lesions"],
        description: "One of the most destructive diseases of rice worldwide, caused by the fungus Magnaporthe oryzae.",
        symptoms: [
            "Diamond-shaped lesions on leaves",
            "White or gray centers with reddish-brown borders",
            "Rotting panicles (neck blast)"
        ],
        treatments: {
            organic: [
                "Treat seeds with Pseudomonas fluorescens (10g/kg)",
                "Spray Tulsi leaf extract"
            ],
            inorganic: [
                "Spray Tricyclazole 75 WP or Carbendazim 50 WP",
                "Apply Isoprothiolane 40 EC"
            ],
            homemade: [
                "Neem Seed Kernel Extract (NSKE) 5% spray",
                "Cow dung slurry spray"
            ]
        },
        prevention: "Use resistant varieties, avoid excessive nitrogen fertilizer, and maintain proper water level.",
        image: "https://images.unsplash.com/photo-1536630562615-5c50c00ce583?auto=format&fit=crop&q=80&w=1000"
    },
    {
        id: "potato-scab",
        name: "Common Scab",
        crop: "Potato",
        keywords: ["potato", "scab", "rough", "skin"],
        description: "A bacterial disease that causes rough, corky scabs on the potato tubers.",
        symptoms: [
            "Rough, corky patches on tuber skin",
            "Pitted or raised lesions",
            "Reduced market quality"
        ],
        treatments: {
            organic: [
                "Maintain soil pH around 5.0-5.2",
                "Use sulfur to lower soil pH"
            ],
            inorganic: [
                "Seed treatment with Mancozeb",
                "Soil application of Pentachloronitrobenzene (PCNB)"
            ],
            homemade: [
                "Mustard crop rotation/green manure",
                "Avoid using fresh manure"
            ]
        },
        prevention: "Plant resistant varieties, maintain high soil moisture during tuber initiation, and practice crop rotation.",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=1000"
    },
    {
        id: "corn-rust",
        name: "Common Rust",
        crop: "Corn/Maize",
        keywords: ["corn", "maize", "rust", "orange spots"],
        description: "Fungal disease causing pustules on leaves that interfere with photosynthesis.",
        symptoms: [
            "Small, powdery orange-brown pustules on leaves",
            "Leaves turning yellow and dying",
            "Stunted growth"
        ],
        treatments: {
            organic: [
                "Remove lower infected leaves",
                "Apply biological control agents like Bacillus subtilis"
            ],
            inorganic: [
                "Fungicides with Azoxystrobin or Propiconazole",
                "Apply at first sign of infection"
            ],
            homemade: [
                "Vinegar solution (caution with concentration)",
                "Milk and water spray (1:10 ratio)"
            ]
        },
        prevention: "Plant resistant hybrids and plant early to avoid peak rust season.",
        image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=1000"
    }
];

export const seasonalAdvice = [
    {
        month: "December",
        crops: ["Wheat", "Mustard", "Potato"],
        advice: "Monitor for Late Blight in potatoes due to cold/humid weather. Check wheat for rust infections early."
    },
    {
        month: "January",
        crops: ["Vegetables", "Winter Wheat"],
        advice: "Protect young saplings from frost. Ensure proper irrigation to mitigate cold stress."
    }
];
