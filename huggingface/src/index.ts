//npm i -D typescript ts-node @types/node
import { InferenceClient } from "@huggingface/inference";
import { writeFile } from "fs";

const client = new InferenceClient(process.env.HUGGING_FACE_TOKEN);

//embedings using huggingface model; Feature extraction category

const generateEmbeddings = async () => {
  const results = await client.featureExtraction({
    inputs: "I like to walk",
    model: "intfloat/e5-small-v2",
  });

  console.log(results);
};

const translate = async () => {
  const results = await client.translation({
    model: "Helsinki-NLP/opus-mt-en-es",
    inputs: "my name is siddhi",
  });

  console.log(results);
};

const translateWithParam = async () => {
  const result = await client.translation({
    inputs: "Hola mundo",
    // model: "Helsinki-NLP/opus-mt-en-de",
    model: "facebook/nllb-200-distilled-600M",
    // @ts-ignore
    parameters: {
      src_lang: "spa_Latn",
      tgt_lang: "eng-Latn",
    },
  });
  console.log(result);
};

const answerQuestions = async () => {
  const result = await client.questionAnswering({
    model: 'deepset/roberta-base-squad2',
    inputs: {
      context:
        "The Apollo program, also known as Project Apollo, was the third United States human spaceflight program carried out by the National Aeronautics and Space Administration (NASA), which accomplished landing the first humans on the Moon from 1969 to 1972.",
        question: "What was the goal of Apollo program?",
    },
  });

  console.log(result);
};

// these models are confirmed to have Hosted Inference API support and compatible with @huggingface/inference:

// black-forest-labs/FLUX.1-dev
// latent-consistency/lcm-lora-sdxl
// Kwai-Kolors/Kolors
const textToImage = async() => {
    //its still a blob??
    const result = await client.textToImage({
        inputs: "capybara coding on a computer",
        model: "black-forest-labs/FLUX.1-dev",
        parameters: {
            negative_prompt: "blurry"
        },
        provider: "replicate",
    });

    //convert blob to buffer
    // const arrayBuffer = await result.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);

    writeFile('image.png', result, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    })
}

// generateEmbeddings();
// translate();
// translateWithParam()
// answerQuestions()
textToImage()


