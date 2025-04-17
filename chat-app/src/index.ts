//basic implemetation of chat app

import { OpenAI } from "openai";

//create a new open ai client
const openai = new OpenAI();


process.stdin.addListener("data", async (input) => {
    const userInput = input.toString().trim();

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "Act like a girl's girl"
            },
            {
                role: "user",
                content: userInput

            }
        ]
    });

    console.log(response.choices[0].message.content)
})
