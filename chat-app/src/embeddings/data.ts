//generate embeddings through code

//1st => creates a knowledge base of embeddings from text and saves it.

import { readFileSync, writeFileSync } from "fs";
import OpenAI from "openai";
import { join } from "path";

export type DataWithEmbeddings = {
    input: string,
    embeddings: number[]
}

const openai = new OpenAI();

export const generateEmbeddings = async (input: string | string[]) => {

    const response = await openai.embeddings.create({
        input: input,
        model: "text-embedding-3-small"

    });

    console.log(response.data);
    return response;

};

//function to load the input
export const loadInputJson = <T>(filename: string): T => {
    //dirname is the current directory name
    const path = join(__dirname, filename);
    //read file data
    const rawInputData = readFileSync(path);

    return JSON.parse(rawInputData.toString());
}

//save embeddings to a json file

const saveEmbeddingToJson = (embeddings: any, filename: string) => {
    //convert received embeddings to string as You can’t directly save an object to a file.
    const embeddingsString = JSON.stringify(embeddings);
    //convert to binary Buffer as Files are written in bytes, not strings
    const buffer = Buffer.from(embeddingsString);

    //path where the file be written
    const path = join(__dirname, filename);

    //write
    writeFileSync(path, buffer);

    console.log(`Embeddings saved to ${path}`);

}

const main = async () => {
    const input = loadInputJson<string[]>("inputStatements.json");
    const embeddings = await generateEmbeddings(input);

    const dataWithEmbeddings: DataWithEmbeddings[] = input.map((input, index) => ({
        input,
        embeddings: embeddings.data[index].embedding
    }))

    saveEmbeddingToJson(dataWithEmbeddings, "embeddingsWithData2.json");
}

main();
// generateEmbeddings("he")