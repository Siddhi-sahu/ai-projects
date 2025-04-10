import { OpenAI } from "openai";
import dotenv from 'dotenv';
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
    const prompt = "I need to start resistance training. is it good for me? Limit it in 10 words or less.";

    //send the api request
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });

    //Print the response
    console.log(response.choices[0].message.content);


};

main();

