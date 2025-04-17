import { OpenAI } from "openai";
import dotenv from 'dotenv';
import { encoding_for_model } from "tiktoken";
dotenv.config();


if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
}
//create an insatance of OpenAi class

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const main = async () => {
    //define the prompt
    const prompt = "I need to start resistance training. is it good for me?limit in 10 words or less";

    //send the api request
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        // max_tokens: 30,
        //more choices, n = number of outputs the model generate
        // n: 2
    });

    //Print the response
    console.log(response.choices[0].message.content);
    //if n=2; message = whole message
    // console.log(response.choices[1].message)


};

//how to get tokens for a specific promot useful for calculation of estimated costs
const encodePrompt = (prompt: string) => {
    //create an encoder for the model
    const encoder = encoding_for_model("gpt-3.5-turbo");

    //encode the prompt
    const tokens = encoder.encode(prompt);
    console.log(tokens);

}

encodePrompt("I need to start resistance training. is it good for me? Limit it in 10 words or less.")

main();

