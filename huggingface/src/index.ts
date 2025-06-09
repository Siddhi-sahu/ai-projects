//npm i -D typescript ts-node @types/node
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HUGGING_FACE_TOKEN);

//embedings using huggingface model; Feature extraction category

const generateEmbeddings = async() => {
    const results = await client.featureExtraction({
        inputs: "I like to walk",
        model: 'intfloat/e5-small-v2'
    });

    console.log(results);
};

const translate = async() => {
    const results = await client.translation({
        model: "Helsinki-NLP/opus-mt-en-es",
        inputs: "my name is siddhi",
    });

    console.log(results)
}

// generateEmbeddings();
translate();