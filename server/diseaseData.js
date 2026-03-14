// server/diseaseData.js
// Comprehensive pesticide and treatment data per disease

const DISEASE_PESTICIDES = {
    'Tomato Late Blight': {
        pesticides: [
            {
                name: 'Ridomil Gold MZ (Mancozeb + Metalaxyl)',
                description: 'Systemic fungicide highly effective against Phytophthora infestans causing late blight.',
                purchaseLink: 'https://www.amazon.in/s?k=Ridomil+Gold+MZ+fungicide',
                priceRange: '₹350–₹700 per 500g',
                usageSteps: [
                    'Mix 30g of Ridomil Gold MZ in 15 litres of water.',
                    'Apply as foliar spray covering upper and lower leaf surfaces.',
                    'Repeat every 7–10 days during active infection.',
                    'Do not apply within 7 days of harvest.',
                    'Wear gloves and mask while handling the chemical.',
                ],
            },
            {
                name: 'Chlorothalonil 75% WP',
                description: 'Contact fungicide for preventive control of late blight.',
                purchaseLink: 'https://www.amazon.in/s?k=Chlorothalonil+fungicide+tomato',
                priceRange: '₹200–₹450 per 500g',
                usageSteps: [
                    'Dissolve 20g per 10 litres of water.',
                    'Spray thoroughly on all plant parts.',
                    'Apply weekly starting at first sign of disease.',
                    'Alternate with systemic fungicide for best results.',
                ],
            },
        ],
    },
    'Tomato Early Blight': {
        pesticides: [
            {
                name: 'Mancozeb 75% WP (Dithane M-45)',
                description: 'Broad-spectrum protectant fungicide against Alternaria solani.',
                purchaseLink: 'https://www.amazon.in/s?k=Mancozeb+Dithane+M45+fungicide',
                priceRange: '₹150–₹300 per 500g',
                usageSteps: [
                    'Mix 2.5g per litre of water.',
                    'Spray every 7–10 days from early growth stages.',
                    'Ensure complete coverage of foliage.',
                    'Rotate with other fungicides to avoid resistance.',
                    'Pre-harvest interval: 10 days.',
                ],
            },
        ],
    },
    'Potato Early Blight': {
        pesticides: [
            {
                name: 'Mancozeb 75% WP',
                description: 'Effective against Alternaria solani in potato crops.',
                purchaseLink: 'https://www.amazon.in/s?k=Mancozeb+potato+blight',
                priceRange: '₹150–₹320 per 500g',
                usageSteps: [
                    'Dissolve 2g per litre of water.',
                    'Begin spraying at crop emergence.',
                    'Repeat every 10 days until 2 weeks before harvest.',
                    'Spray in cool morning hours for best absorption.',
                ],
            },
        ],
    },
    'Potato Late Blight': {
        pesticides: [
            {
                name: 'Cymoxanil + Mancozeb (Curzate M8)',
                description: 'Systemic + contact fungicide for severe late blight control.',
                purchaseLink: 'https://www.amazon.in/s?k=Cymoxanil+Mancozeb+Curzate+potato',
                priceRange: '₹400–₹800 per kg',
                usageSteps: [
                    'Mix 2.5g per litre of water.',
                    'Apply at first sign of blight or as preventive measure.',
                    'Spray every 5–7 days during wet/humid weather.',
                    'Destroy infected foliage immediately.',
                    'Pre-harvest interval: 7 days.',
                ],
            },
        ],
    },
    'Corn Common Rust': {
        pesticides: [
            {
                name: 'Propiconazole 25% EC (Tilt)',
                description: 'Triazole fungicide for rust and other foliar diseases in corn/maize.',
                purchaseLink: 'https://www.amazon.in/s?k=Propiconazole+Tilt+fungicide+maize',
                priceRange: '₹280–₹600 per 250ml',
                usageSteps: [
                    'Dilute 1ml per litre of water.',
                    'Apply at first detection of rust pustules.',
                    'Repeat after 14 days if infection persists.',
                    'Spray in early morning or evening.',
                    'Pre-harvest interval: 14 days.',
                ],
            },
        ],
    },
    'Corn Northern Leaf Blight': {
        pesticides: [
            {
                name: 'Azoxystrobin + Propiconazole (Amistar Top)',
                description: 'Premium fungicide for northern leaf blight in maize.',
                purchaseLink: 'https://www.amazon.in/s?k=Azoxystrobin+Propiconazole+Amistar+maize',
                priceRange: '₹500–₹950 per 200ml',
                usageSteps: [
                    'Mix 1.5ml per litre of water.',
                    'Apply before disease establishment for best results.',
                    'A single application is often sufficient.',
                    'Use a full coverage sprayer for evenness.',
                ],
            },
        ],
    },
    'Apple Scab': {
        pesticides: [
            {
                name: 'Captan 50% WP',
                description: 'Protectant fungicide for apple scab (Venturia inaequalis).',
                purchaseLink: 'https://www.amazon.in/s?k=Captan+50+WP+apple+scab',
                priceRange: '₹250–₹500 per 500g',
                usageSteps: [
                    'Mix 3g per litre of water.',
                    'Begin spraying at bud break (green tip stage).',
                    'Repeat every 7 days during wet/rainy weather.',
                    'Ensure fruit and foliage are covered.',
                    'Pre-harvest interval: 14 days.',
                ],
            },
        ],
    },
    'Apple Black Rot': {
        pesticides: [
            {
                name: 'Thiophanate-Methyl 70% WP',
                description: 'Systemic fungicide effective against black rot in apples.',
                purchaseLink: 'https://www.amazon.in/s?k=Thiophanate+Methyl+apple+fungicide',
                priceRange: '₹300–₹650 per 500g',
                usageSteps: [
                    'Mix 1g per litre of water.',
                    'Spray from pre-bloom through petal fall stage.',
                    'Repeat every 10–14 days.',
                    'Remove and destroy mummified fruits from trees.',
                ],
            },
        ],
    },
    'Grape Black Rot': {
        pesticides: [
            {
                name: 'Myclobutanil 10% WP (Systhane)',
                description: 'Triazole fungicide for grape black rot control.',
                purchaseLink: 'https://www.amazon.in/s?k=Myclobutanil+Systhane+grape',
                priceRange: '₹400–₹700 per 250g',
                usageSteps: [
                    'Mix 1g per litre of water.',
                    'Begin at bud break and apply every 10 days.',
                    'Most critical protection period: bloom to 4 weeks after.',
                    'Do not use more than 4 times per season.',
                ],
            },
        ],
    },
    'Rice Leaf Blast': {
        pesticides: [
            {
                name: 'Tricyclazole 75% WP (Beam)',
                description: 'Systemic fungicide specifically for rice blast disease.',
                purchaseLink: 'https://www.amazon.in/s?k=Tricyclazole+Beam+rice+blast',
                priceRange: '₹300–₹600 per 250g',
                usageSteps: [
                    'Mix 0.06% solution (0.6g per litre).',
                    'Apply at tillering stage and before panicle emergence.',
                    'Spray in early morning for best efficacy.',
                    'Repeat after 15 days if infection persists.',
                    'Pre-harvest interval: 14 days.',
                ],
            },
        ],
    },
    default: {
        pesticides: [
            {
                name: 'Mancozeb 75% WP (General Broad-Spectrum)',
                description: 'Safe, broad-spectrum fungicide suitable for most plant diseases.',
                purchaseLink: 'https://www.amazon.in/s?k=Mancozeb+fungicide+plant+disease',
                priceRange: '₹150–₹350 per 500g',
                usageSteps: [
                    'Mix 2.5g per litre of clean water.',
                    'Spray uniformly on affected plants in early morning.',
                    'Repeat every 7–10 days until symptoms subside.',
                    'Always wear protective equipment while spraying.',
                    'Store away from children and pets.',
                ],
            },
            {
                name: 'Neem Oil Spray (Organic option)',
                description: 'Natural, eco-friendly option for mild to moderate infections.',
                purchaseLink: 'https://www.amazon.in/s?k=neem+oil+pesticide+agriculture',
                priceRange: '₹80–₹200 per litre',
                usageSteps: [
                    'Mix 5ml neem oil + 1ml liquid soap per litre of water.',
                    'Shake well and spray on all plant surfaces.',
                    'Apply every 5–7 days.',
                    'Best applied in the evening to avoid leaf burn.',
                    'Safe for use till harvest.',
                ],
            },
        ],
    },
};

function getPesticidesForDisease(diseaseName) {
    if (!diseaseName) return DISEASE_PESTICIDES.default.pesticides;

    // Try exact match first
    if (DISEASE_PESTICIDES[diseaseName]) {
        return DISEASE_PESTICIDES[diseaseName].pesticides;
    }

    // Try partial match
    const key = Object.keys(DISEASE_PESTICIDES).find(
        (k) => k !== 'default' && diseaseName.toLowerCase().includes(k.toLowerCase().split(' ').slice(1).join(' '))
    );

    return key ? DISEASE_PESTICIDES[key].pesticides : DISEASE_PESTICIDES.default.pesticides;
}

module.exports = { getPesticidesForDisease, DISEASE_PESTICIDES };
