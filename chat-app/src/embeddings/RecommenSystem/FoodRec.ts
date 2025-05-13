import { existsSync, readFileSync, writeFileSync } from "fs";
import OpenAI from "openai";
import { CreateEmbeddingResponse } from "openai/resources/embeddings";
import { join } from "path";

type Food = {
    name: string;
    description: string;
}

type FoodWithEmbeddings = Food & { embedding: number[] };

const openai = new OpenAI();


//helper functions
const generateEmbeddings = async (input: string | string[]) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: input
    });

    console.log(response.data);
    return response;
}

const loadInputJson = <T>(filename: string): T => {
    const filePath = join(__dirname, filename);
    const rawInputData = readFileSync(filePath);
    return JSON.parse(rawInputData.toString());
}

const saveEmbeddingToJson = (embeddings: CreateEmbeddingResponse, filename: string) => {
    const filePath = join(__dirname, filename);
    const embeddingsString = JSON.stringify(embeddings);
    const buffer = Buffer.from(embeddingsString);

    writeFileSync(filePath, buffer);
    console.log(`Embeddings saved to ${filePath}`);

};

const dotProduct = (a: number[], b: number[]) => {
    return a.reduce((acc, val, index) => acc + val * b[index], 0)
};

const cosineSimiliarilty = (a: number[], b: number[]) => {
    const dot = dotProduct(a, b);
    const normA = Math.sqrt(dotProduct(a, a));
    const normB = Math.sqrt(dotProduct(b, b));

    return dot / (normA * normB)

}

//actual code
const main = async () => {
    const data = loadInputJson<Food[]>("Food.json");

    console.log("what food do you like?")
    process.stdin.addListener("data", async (input) => {
        const userInput = input.toString().trim();
        await recommendFood(userInput);
    });

    const recommendFood = async (input: string) => {
        //generate user input embeddings
        const embeddings = await generateEmbeddings(input);

        //food description embeddings
        const descriptionEmbeddings = await getFoodEmbeddings();

        const foodWithEmbeddings: FoodWithEmbeddings[] = [];

        for (let i = 0; i < data.length; i++) {
            foodWithEmbeddings.push({
                name: data[i].name,
                description: data[i].description,
                embedding: descriptionEmbeddings.data[i].embedding
            })

        }

        const similiarities: {
            input: string;
            similiarity: number
        }[] = foodWithEmbeddings.map((food) => ({
            input: food.name,
            similiarity: cosineSimiliarilty(embeddings.data[0].embedding, food.embedding)
        }));

        const sortedSimilarities = similiarities.sort((a, b) => b.similiarity - a.similiarity);

        console.log(`Recomended foods based on your preference ${input}`);
        console.log(sortedSimilarities);

    };

    const getFoodEmbeddings = async () => {
        const filename = "foodDescriptionsEmbeddings.json";
        const filePath = join(__dirname, filename);
        if (existsSync(filePath)) {
            const descriptionEmbeddings = loadInputJson<CreateEmbeddingResponse>(filename);

            return descriptionEmbeddings;
        } else {
            const descriptionEmbeddings = await generateEmbeddings(
                data.map((food) => food.description)
            );

            saveEmbeddingToJson(descriptionEmbeddings, filename);
            return descriptionEmbeddings;
        }
    }



};


main()