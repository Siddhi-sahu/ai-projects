// calculate similiarity between embeddings
//2nd => compares a new input to that base and finds the most similar stored statement.

import { DataWithEmbeddings, generateEmbeddings, loadInputJson } from "./data";

//This tells you how similar the two vectors are — very common in embeddings or recommendation systems.
const dotProduct = (a: number[], b: number[]) => {
    //a.reduce(...) goes through each element in array a.
    //val is the current value from array a. b[index] is the corresponding value from array b.
    //acc (accumulator) keeps adding up the result of these multiplications.
    //0 is the initial value of acc.
    return a.reduce((acc, val, index) => acc + val * b[index], 0)
};

// angle between two vectors
const cosineSimiliarilty = (a: number[], b: number[]) => {
    const dot = dotProduct(a, b); // Step 1: dot product (numerator)

    const normA = Math.sqrt(dotProduct(a, a))  // Step 2: magnitude of vector a or sqrt(a1^2 + a2^2 + ... + an^2)
    const normB = Math.sqrt(dotProduct(b, b))  // Step 2: magnitude of vector b or sqrt(b1^2 + ab^2 + ... + bn^2)

    return dot / (normA * normB)  // Step 4: cosine similarity
}

const main = async () => {
    //load inputstatements
    const inputstatementsEmbeddings = loadInputJson<DataWithEmbeddings[]>("embeddingsWithData2.json")
    //input we will compare our other inputs with

    const input = "how many koalas";

    //generated embeddings of our input;
    const inputEmbeddings = await generateEmbeddings(input);

    //compare them two
    const similarities: {
        input: string;
        similarity: number;
    }[] = inputstatementsEmbeddings.map((data) => ({
        input: data.input,
        similarity: cosineSimiliarilty(data.embeddings, inputEmbeddings.data[0].embedding)
    }));

    const sortedSimilarities = similarities.sort((a, b) => b.similarity - a.similarity);

    console.log(`Similarity of ${input}`, sortedSimilarities);

};

main();


