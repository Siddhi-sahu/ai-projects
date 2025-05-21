import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";


if (!process.env.PINECONE_API_KEY) {
    throw new Error("pinecone api key is not set")
}
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const faqSingaporeInfo = `
Singapore is a city-state in Southeast Asia. Founded as a British trading colony in 1819, since independence it has become one of the world's most prosperous countries.`;

const faqIndiaInfo = `
India, officially the Republic of India, is a country in South Asia. It is the seventh-largest country by land area, the second-most populous country, and the most populous democracy in the world. Bounded by the Indian Ocean on the south, the Arabian Sea on the southwest, and the Bay of Bengal on the southeast. It has a total land area of 3.287 million square kilometers and a population of 1.222 billion people.`;

const faqAustraliaInfo = `
Australia is a country and continent surrounded by the Indian and Pacific oceans. Its major cities – Sydney, Brisbane, Melbourne, Perth, Adelaide – are coastal. `;

type faqDataType = {
    faqInfo: string,
    reference: string,
    relevance: number
};

const dataToEmbed: faqDataType[] = [
    {
        faqInfo: faqSingaporeInfo,
        reference: "Singapore",
        relevance: 0.88
    },
    {
        faqInfo: faqAustraliaInfo,
        reference: "Australia",
        relevance: 1.02
    },
    {
        faqInfo: faqIndiaInfo,
        reference: "India",
        relevance: 0.99
    },
];
const pineconeIndex = pinecone.index<faqDataType>("siddhi-chat-app-index");

const storeEmbeddings = async () => {

    await Promise.all(
        dataToEmbed.map(async (data, index) => {
            const embeddingResult = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: [data.faqInfo]
            });
            const embedding = embeddingResult.data[0].embedding;

            await pineconeIndex.upsert([{
                id: `id-${index}`,
                values: embedding,
                metadata: data
            }])

        })
    )
};

//querying means asking the database to find the most relevant data points (vectors) based on a given input.
const queryEmbeddings = async (question: string) => {
    const queryEmbeddingsResult = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: question
    });

    const queryEmbeddings = queryEmbeddingsResult.data[0].embedding;

    const queryResult = await pineconeIndex.query({
        vector: queryEmbeddings,
        topK: 1,
        includeMetadata: true,
        includeValues: true
    });

    return queryResult;

};

const askAi = async (relevantInfo: string, question: string) => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
            {
                role: "assistant",
                content: `Answer the next question using the information provided: ${relevantInfo}`
            },
            {
                role: "user",
                content: question
            }
        ]
    });

    const result = response.choices[0].message.content;
    console.log(result);
}

const main = async () => {
    // await storeEmbeddings();
    const question = "what is the population of india";
    const result = await queryEmbeddings(question);
    const relevantInfo = result.matches[0].metadata;
    if (relevantInfo) {

        await askAi(relevantInfo.faqInfo, question);
    }
};

main();