import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not set")

}
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

type metadata = {
    name: string;
    age: number
}

const createIndex = async () => {
    await pinecone.createIndex({
        name: "siddhi-chat-app-index",
        dimension: 1536,
        metric: 'cosine',
        spec: {
            serverless: {
                cloud: 'aws',
                region: 'us-east-1'
            }
        }
    })
};

const listIndex = async () => {
    const indexes = await pinecone.listIndexes();
    console.log(indexes);
};

const getIndex = async (indexName: string) => {
    const index = pinecone.index<metadata>(indexName);
    console.log(index);
    return index;
};


// namespace: partition vector data from an index into multiple namespaces or groups. This will make the operations limited to a specific namespace.
const createNameSpace = async () => {
    const index = await getIndex("siddhi-chat-app-index");
    const namespace = index.namespace("siddhi-chat-app-index-namespace");
};

// Generate random vectors
const generateRandomVectors = async (length: number) => {

    return Array.from({ length }, () => Math.random());
};

const upsertVectors = async () => {
    const embeddings = await generateRandomVectors(1536);
    const index = await getIndex("siddhi-chat-app-index");

    await index.upsert([
        {
            id: "id-1",
            values: embeddings,
            metadata: {
                name: "john",
                age: 25
            }
        }
    ]);
    console.log("upsert success")
};

const queryVectors = async () => {
    const index = await getIndex("siddhi-chat-app-index");

    const result = await index.query({
        id: "id-2",
        //number of query results to returm
        topK: 1,

        includeMetadata: true
    });

    console.log(result);
}

const main = async () => {
    // await createIndex
    // await listIndex();
    // getIndex('siddhi-chat-app-index')
    // await upsertVectors();
    await queryVectors();
}
main();