import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import OpenAI from "openai";

//
const chroma = new ChromaClient({ path: "http://localhost:8000" });
const faqSingaporeInfo = `
Singapore is a city-state in Southeast Asia. Founded as a British trading colony in 1819, since independence it has become one of the world's most prosperous countries.`;

const faqIndiaInfo = `
India, officially the Republic of India, is a country in South Asia. It is the seventh-largest country by land area, the second-most populous country, and the most populous democracy in the world. Bounded by the Indian Ocean on the south, the Arabian Sea on the southwest, and the Bay of Bengal on the southeast. It has a total land area of 3.287 million square kilometers and a population of 1.222 billion people.`;

const faqAustraliaInfo = `
Australia is a country and continent surrounded by the Indian and Pacific oceans. Its major cities – Sydney, Brisbane, Melbourne, Perth, Adelaide – are coastal. `;

//This tells Chroma to use OpenAI's model to convert text into vectors (embeddings), which allows the database to later search by meaning.

const embeddingFunction: OpenAIEmbeddingFunction = new OpenAIEmbeddingFunction({
    openai_api_key: process.env.OPENAI_API_KEY,
    openai_model: "text-embedding-3-small"
});

const collectionName = `faq-India`;

const createCollection = async () => {
    await chroma.createCollection({
        name: collectionName
    })
};

const getCollection = async () => {
    //attach the embedding function to collection in the dattabase
    const collection = await chroma.getCollection({
        name: collectionName,
        embeddingFunction: embeddingFunction
    });

    return collection;

}
const populateCollection = async () => {
    const collection = await getCollection();
    //stores the 3 documents into the collection, each with its own ID.
    await collection.add({
        ids: ["id1", "id2", "id3"],
        documents: [faqAustraliaInfo, faqIndiaInfo, faqSingaporeInfo]
    });

    // These documents get converted into embeddings using the embeddingFunction, so Chroma can later search through them using semantic similarity (meaning, not just keywords).
};

const askQuestion = async (question: string) => {
    // const question = "what is the population of india?";


    const collection = await getCollection();

    //Chroma converts the question into an embedding and compares it with the saved ones. And it returns ghe most similiar
    const response = await collection.query({
        nResults: 1,
        queryTexts: question
    });

    // Get the actual text of the top matching document so you can use it as context for GPT to generate a final answer.
    const relevantInfo = response.documents[0][0];

    if (relevantInfo) {
        const openai = new OpenAI();
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                // This is called context injection
                {
                    role: "assistant",
                    content: `Answer the next question using the information provided: ${relevantInfo}`
                }, {
                    role: "user",
                    content: question
                }
            ]
        });

        console.log(response.choices[0].message)
    } else {
        console.log("No relevant Info on the matter.")
    }
};

const getUserQuestion = async () => {
    process.stdin.addListener("data", async (input) => {
        const userInput = input.toString().trim();

        await askQuestion(userInput);
    });

}

const main = async () => {
    // await createCollection();
    // await populateCollection();
    await getUserQuestion();
}

main();