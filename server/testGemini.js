require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const key = process.env.GEMINI_API_KEY;
console.log('KEY exists:', !!key);

const genAI = new GoogleGenerativeAI(key || '');

async function tryModel(name) {
    try {
        const model = genAI.getGenerativeModel({ model: name });
        const result = await model.generateContent('Reply with just: WORKING');
        const text = result.response.text().trim();
        console.log('OK', name, '->', text.substring(0, 60));
        return true;
    } catch (e) {
        // Print FULL error
        console.log('FAIL', name);
        console.log(e.message || e);
        return false;
    }
}

tryModel('gemini-1.5-flash').then(() => tryModel('gemini-2.0-flash'));
