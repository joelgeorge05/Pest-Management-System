export const DISEASE_DATA = {
    // --- APPLE ---
    'Apple___Apple_scab': {
        name: "Apple Scab",
        description: "A fungal disease that causes dark, scabby spots on leaves and fruit.",
        symptoms: ["Olive-green velvety spots on leaves", "Leaves turning yellow and dropping", "Scabby spots on fruit"],
        treatments: {
            organic: ["Apply sulfur or copper-based fungicides.", "Remove infected leaves/fruit."],
            inorganic: ["Captan", "Myclobutanil"],
            homemade: ["Baking soda solution (1 tbsp baking soda, 1 tsp oil, 1 gal water)."]
        },
        prevention: "Plant resistant varieties. Rake and destroy fallen leaves in autumn."
    },
    'Apple___Black_rot': {
        name: "Black Rot",
        description: "A fungal disease causing firm, brown rot on fruit and cankers on branches.",
        symptoms: ["Frog-eye leaf spots", "Fruit rot with concentric bands", "Cankers on limbs"],
        treatments: {
            organic: ["Prune out cankers.", "Copper fungicides."],
            inorganic: ["Captan", "Thiophanate-methyl"],
            homemade: ["Neem oil spray."]
        },
        prevention: "Remove mummified fruit. Prune dead wood."
    },
    'Apple___Cedar_apple_rust': {
        name: "Cedar Apple Rust",
        description: "A fungal disease requiring both apple and cedar/juniper trees to complete its cycle.",
        symptoms: ["Bright orange spots on leaves", "Tube-like structures on underside of leaves"],
        treatments: {
            organic: ["Sulfur sprays.", "Remove nearby galls on cedar trees."],
            inorganic: ["Myclobutanil", "Mancozeb"],
            homemade: ["Garlic water spray."]
        },
        prevention: "Remove nearby Eastern Red Cedar trees if possible. Plant resistant varieties."
    },
    'Apple___healthy': {
        name: "Healthy Apple",
        description: "Your apple tree looks healthy!",
        symptoms: [],
        treatments: { organic: [], inorganic: [], homemade: [] },
        prevention: "Continue regular watering and fertilization."
    },

    // --- BLUEBERRY ---
    'Blueberry___healthy': {
        name: "Healthy Blueberry",
        description: "Your blueberry plant looks healthy!",
        symptoms: [],
        treatments: { organic: [], inorganic: [], homemade: [] },
        prevention: "Maintain acidic soil (pH 4.5-5.5)."
    },

    // --- CHERRY ---
    'Cherry_(including_sour)___Powdery_mildew': {
        name: "Powdery Mildew",
        description: "A common fungal disease appearing as white powder on leaves.",
        symptoms: ["White powdery growth on leaves", "Curling leaves", "Stunted growth"],
        treatments: {
            organic: ["Neem oil", "Sulfur dust"],
            inorganic: ["Myclobutanil", "Propiconazole"],
            homemade: ["Milk spray (40% milk, 60% water)."]
        },
        prevention: "Ensure good air circulation. Prune interior branches."
    },
    'Cherry_(including_sour)___healthy': {
        name: "Healthy Cherry",
        description: "Your cherry tree looks healthy!",
        symptoms: [],
        treatments: { organic: [], inorganic: [], homemade: [] },
        prevention: "Water deeply during drought."
    },

    // --- CORN ---
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
        name: "Gray Leaf Spot",
        description: "A fungal disease causing rectangular gray/brown lesions.",
        symptoms: ["Rectangular lesions restricted by leaf veins", "Gray to tan spots"],
        treatments: {
            organic: ["Crop rotation.", "Resistant hybrids."],
            inorganic: ["Azoxystrobin", "Pyraclostrobin"],
            homemade: ["Compost tea spray."]
        },
        prevention: "Rotate crops. Plow under residue."
    },
    'Corn_(maize)___Common_rust_': {
        name: "Common Rust",
        description: "Fungal pustules on leaves.",
        symptoms: ["Reddish-brown oval pustules on both leaf surfaces"],
        treatments: {
            organic: ["Early planting.", "Resistant varieties."],
            inorganic: ["Headline", "Tilt (Propiconazole)"],
            homemade: ["Baking soda and soap solution."]
        },
        prevention: "Plant resistant hybrids."
    },
    'Corn_(maize)___Northern_Leaf_Blight': {
        name: "Northern Leaf Blight",
        description: "Cigar-shaped gray lesions on leaves.",
        symptoms: ["Large, cigar-shaped gray/green lesions", "Leaves drying out"],
        treatments: {
            organic: ["Bio-fungicides (Bacillus subtilis)."],
            inorganic: ["Mancozeb", "Chlorothalonil"],
            homemade: ["Diluted vinegar spray (caution recommended)."]
        },
        prevention: "Crop rotation. Tillage to bury residue."
    },
    'Corn_(maize)___healthy': {
        name: "Healthy Corn",
        description: "Your corn plant looks healthy!",
        symptoms: [],
        treatments: { organic: [], inorganic: [], homemade: [] },
        prevention: "Ensure adequate nitrogen fertilization."
    },

    // --- GRAPE ---
    'Grape___Black_rot': {
        name: "Black Rot",
        description: "Fungal infection causing shriveled, black mummified berries.",
        symptoms: ["Brown leaf spots with black dots", "Shriveled black fruit"],
        treatments: {
            organic: ["Copper spray.", "Remove mummies."],
            inorganic: ["Mancozeb", "Myclobutanil"],
            homemade: ["Baking soda mix."]
        },
        prevention: "Remove all mummified fruit during winter."
    },
    'Grape___Esca_(Black_Measles)': {
        name: "Esca (Black Measles)",
        description: "A complex fungal trunk disease.",
        symptoms: ["Tiger-stripe pattern on leaves", "Small black spots on berries"],
        treatments: {
            organic: ["Prune and remove infected vines.", "Wound protection."],
            inorganic: ["No effective chemical cure; focus on prevention."],
            homemade: ["None reliable."]
        },
        prevention: "Avoid pruning wounds during heavy rain."
    },
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
        name: "Isariopsis Leaf Spot",
        description: "Fungal leaf spot disease.",
        symptoms: ["Irregular brown spots on leaves", "Premature defoliation"],
        treatments: {
            organic: ["Sulfur or Copper fungicides."],
            inorganic: ["Mancozeb"],
            homemade: ["Neem oil."]
        },
        prevention: "Remove infected leaves."
    },
    'Grape___healthy': {
        name: "Healthy Grape",
        description: "Your grapevine looks healthy!",
        symptoms: [],
        treatments: { organic: [], inorganic: [], homemade: [] },
        prevention: "Prune vines annually for airflow."
    },

    // --- ORANGE ---
    'Orange___Haunglongbing_(Citrus_greening)': {
        name: "Citrus Greening (HLB)",
        description: "A devastating bacterial disease spread by psyllids. NO CURE.",
        symptoms: ["Mottled yellow leaves (asymmetrical)", "Misshapen, green fruit", "Bitter fruit"],
        treatments: {
            organic: ["Control psyllids (vectors).", "Remove infected trees immediately."],
            inorganic: ["Imidacloprid (for vector control)."],
            homemade: ["None. Tree removal is required."]
        },
        prevention: "Use certified disease-free nursery trees. Control psyllids."
    },

    // --- PEACH ---
    'Peach___Bacterial_spot': {
        name: "Bacterial Spot",
        description: "Bacterial infection causing leaf loss and spotted fruit.",
        symptoms: ["Small purple/black spots on leaves", "Shot-hole appearance", "Cracked fruit"],
        treatments: {
            organic: ["Copper sprays (careful of phytotoxicity).", "Oxytetracycline."],
            inorganic: ["Copper ammonium carbonate"],
            homemade: ["Garlic/Pepper spray (limited efficacy)."]
        },
        prevention: "Plant resistant varieties."
    },
    'Peach___healthy': {
        name: "Healthy Peach",
        description: "Your peach tree looks healthy!",
        symptoms: [],
        treatments: { organic: [], inorganic: [], homemade: [] },
        prevention: "Prune for open center to allow light/air."
    },

    // --- PEPPER ---
    'Pepper,_bell___Bacterial_spot': {
        name: "Bacterial Spot",
        description: "Common bacterial disease in humid conditions.",
        symptoms: ["Water-soaked spots on leaves", "Brown spots with yellow halos"],
        treatments: {
            organic: ["Copper soaps.", "Remove infected plants."],
            inorganic: ["Copper hydroxide"],
            homemade: ["Hydrogen peroxide dilute spray."]
        },
        prevention: "Select resistant varieties. Avoid overhead watering."
    },
    'Pepper,_bell___healthy': {
        name: "Healthy Pepper",
        description: "Your pepper plant looks healthy!",
        symptoms: [],
        treatments: { organic: [], inorganic: [], homemade: [] },
        prevention: "Mulch to retain soil moisture."
    },

    // --- POTATO ---
    'Potato___Early_blight': {
        name: "Early Blight",
        description: "Fungal disease starting on older leaves.",
        symptoms: ["Concentric rings inside dark spots (target board)", "Yellowing lower leaves"],
        treatments: {
            organic: ["Copper fungicides.", "Serenade (Bacillus subtilis)."],
            inorganic: ["Chlorothalonil", "Mancozeb"],
            homemade: ["Baking soda spray."]
        },
        prevention: "Rotate with non-solanaceous crops."
    },
    'Potato___Late_blight': {
        name: "Late Blight",
        description: "A devastating water mold disease (Phytophthora infestans) that kills plants rapidly. This is the same pathogen that caused the Irish Potato Famine.",
        symptoms: ["Large, dark, water-soaked spots on leaves", "White fungal growth on undersides in humid weather", "Brown, firm rot on tubers", "Rapid plant collapse"],
        treatments: {
            organic: ["Copper fungicides (preventative, apply every 5-7 days).", "Remove and destroy all infected plants immediately (do not compost).", "Serenade (Bacillus subtilis) can supress mild infections."],
            inorganic: ["Chlorothalonil (Bravo)", "Mancozeb", "Mefenoxam (Ridomil Gold) for commercial use"],
            homemade: ["None reliable for late blight. Immediate removal is the only home remedy to stop spread."]
        },
        prevention: "Plant certified disease-free seed tubers. Destroy volunteer potatoes. Avoid overhead irrigation."
    },
    'Potato___healthy': {
        name: "Healthy Potato",
        description: "Your potato plant looks healthy!",
        symptoms: [],
        treatments: { organic: [], inorganic: [], homemade: [] },
        prevention: "Hill soil around stems."
    },

    // --- RASPBERRY ---
    'Raspberry___healthy': {
        name: "Healthy Raspberry",
        description: "Your raspberry plant looks healthy!",
        symptoms: [],
        treatments: { organic: [], inorganic: [], homemade: [] },
        prevention: "Prune out old canes."
    },

    // --- SOYBEAN ---
    'Soybean___healthy': {
        name: "Healthy Soybean",
        description: "Your soybean plant looks healthy!",
        symptoms: [],
        treatments: { organic: [], inorganic: [], homemade: [] },
        prevention: "Crop rotation."
    },

    // --- SQUASH ---
    'Squash___Powdery_mildew': {
        name: "Powdery Mildew",
        description: "Common white fungal growth on cucurbits.",
        symptoms: ["White powdery patches on leaves", "Yellowing leaves"],
        treatments: {
            organic: ["Neem oil.", "Sulfur."],
            inorganic: ["Myclobutanil"],
            homemade: ["Milk spray (1 part milk : 2 parts water).", "Baking soda."]
        },
        prevention: "Space plants for airflow. Water at base."
    },

    // --- STRAWBERRY ---
    'Strawberry___Leaf_scorch': {
        name: "Leaf Scorch",
        description: "Fungal disease causing irregular purple spots.",
        symptoms: ["Irregular purple blotches", "Leaves drying up (scorched appearance)"],
        treatments: {
            organic: ["Remove old leaves.", "Copper fungicide."],
            inorganic: ["Captan"],
            homemade: ["Chamomile tea spray (mild)."]
        },
        prevention: "Renovate beds annually."
    },
    'Strawberry___healthy': {
        name: "Healthy Strawberry",
        description: "Your strawberry plant looks healthy!",
        symptoms: [],
        treatments: { organic: [], inorganic: [], homemade: [] },
        prevention: "Mulch with straw."
    },

    // --- TOMATO ---
    'Tomato___Bacterial_spot': {
        name: "Bacterial Spot",
        description: "A serious bacterial disease (Xanthomonas spp.) affecting all above-ground plant parts, thriving in warm, wet conditions.",
        symptoms: ["Small, water-soaked spots on leaves that turn necrotic", "Spots may have yellow halos", "Scabby, raised spots on fruit", "Leaf yellowing and drop"],
        treatments: {
            organic: ["Copper-based bactericides (apply early at first sign).", "Agri-Strep (Streptomycin) if permitted.", "Remove severely infected plants."],
            inorganic: ["Fixed Copper + Mancozeb (tank mix is more effective than copper alone)", "Actigard (systemic acquired resistance inducer)"],
            homemade: ["Diluted hydrogen peroxide spray (temporary reduction of surface bacteria)."]
        },
        prevention: "Use disease-free certified seeds. Avoid overhead watering. Stake plants to keep foliage dry."
    },
    'Tomato___Early_blight': {
        name: "Early Blight",
        description: "Common fungal disease affecting older leaves first.",
        symptoms: ["Brown spots with concentric rings (target pattern)", "Lower leaves yellowing"],
        treatments: {
            organic: ["Copper fungicide.", "Neem oil."],
            inorganic: ["Chlorothalonil", "Mancozeb"],
            homemade: ["Baking soda mix (1 tbsp soda, 1 tsp soap, 1 gal water)."]
        },
        prevention: "Stake plants. Mulch to stop soil splash."
    },
    'Tomato___Late_blight': {
        name: "Late Blight",
        description: "A highly destructive disease caused by Phytophthora infestans. Can destroy a crop in days if cool and wet.",
        symptoms: ["LARGE, dark, greasy-looking spots on leaves/stems", "White fuzz on leaf undersides in morning", "Firm, brown rot on fruit (greasy appearance)", "Rapid plant death"],
        treatments: {
            organic: ["Copper spray (preventative only, apply before rain).", "Pull and bag infected plants immediately.", "Biofungicides (Bacillus amyloliquefaciens)."],
            inorganic: ["Chlorothalonil (Daconil)", "Propamocarb", "Cymoxanil"],
            homemade: ["No effective home cure. Prevention and removal are key."]
        },
        prevention: "Avoid planting near potatoes. Destroy volunteer tomato/potato plants. Ensure good airflow."
    },
    'Tomato___Leaf_Mold': {
        name: "Leaf Mold",
        description: "Fungus common in greenhouses or humid areas.",
        symptoms: ["Pale yellow spots on upper leaf", "Olive-green fuzzy mold on underside"],
        treatments: {
            organic: ["Copper fungicide.", "Reduce humidity."],
            inorganic: ["Chlorothalonil"],
            homemade: ["Vinegar solution (caution)."]
        },
        prevention: "Increase spacing/air circulation."
    },
    'Tomato___Septoria_leaf_spot': {
        name: "Septoria Leaf Spot",
        description: "Fungus causing many small spots.",
        symptoms: ["Many small circular spots with dark borders", "Lower leaves dropping"],
        treatments: {
            organic: ["Copper fungicide.", "Remove lower infected leaves."],
            inorganic: ["Chlorothalonil"],
            homemade: ["Baking soda spray."]
        },
        prevention: "Mulch. Do not handle wet plants."
    },
    'Tomato___Spider_mites Two-spotted_spider_mite': {
        name: "Spider Mites",
        description: "Tiny pests that suck plant sap.",
        symptoms: ["Stippling (tiny yellow dots) on leaves", "Fine webbing between leaves", "Bronzing"],
        treatments: {
            organic: ["Neem oil.", "Insecticidal soap.", "Predatory mites."],
            inorganic: ["Specific miticides (abamectin)."],
            homemade: ["Blast with strong water spray.", "Rosemary oil spray."]
        },
        prevention: "Keep plants watered (mites like dry/dusty)."
    },
    'Tomato___Target_Spot': {
        name: "Target Spot",
        description: "Fungal disease with bullseye lesions.",
        symptoms: ["Brown/black lesions with concentric rings", "Fruit pitting"],
        treatments: {
            organic: ["Copper fungicide."],
            inorganic: ["Chlorothalonil", "Azoxystrobin"],
            homemade: ["Baking soda mix."]
        },
        prevention: "Improve airflow. Remove crop debris."
    },
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
        name: "Yellow Leaf Curl Virus",
        description: "Viral disease spread by whiteflies.",
        symptoms: ["Leaves curling upward", "Yellowing edges", "Stunted growth"],
        treatments: {
            organic: ["Control whiteflies (Neem/Soap).", "Remove infected plants (No cure)."],
            inorganic: ["Imidacloprid (for vector control)."],
            homemade: ["Yellow sticky traps for whiteflies."]
        },
        prevention: "Use virus-resistant varieties. Trap whiteflies."
    },
    'Tomato___Tomato_mosaic_virus': {
        name: "Mosaic Virus",
        description: "Highly contagious virus.",
        symptoms: ["Mottled light/dark green pattern", "Distorted leaves", "Fern-like growth"],
        treatments: {
            organic: ["Remove and burn infected plants immediately (No cure).", "Sanitize tools."],
            inorganic: ["None."],
            homemade: ["Milk dip for tools (prevents spread)."]
        },
        prevention: "Wash hands (smokers can transmit TMV). Plant resistant varieties."
    },
    'Tomato___healthy': {
        name: "Healthy Tomato",
        description: "Your tomato plant looks healthy!",
        symptoms: [],
        treatments: { organic: [], inorganic: [], homemade: [] },
        prevention: "Regular watering and pruning."
    }
};
