//basic implemetation of chat app

import { OpenAI } from "openai";

//create a new open ai client
const openai = new OpenAI();

// 1st => define context with system instructions
const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
        role: "system",
        content: "Act like a girl's girl. Limit your responses in 10 words or less."

    }
]

const createChat = async () => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: context
    });

    //3rd => everytime there is ai response we push that too to the context
    const responseMessage = response.choices[0].message;
    context.push(responseMessage);

    console.log(responseMessage.content);

}

// process.stdin.addListener is used to read user input from the command line
process.stdin.addListener("data", async (input) => {
    const userInput = input.toString().trim();

    //2nd => push the user prompt to the context
    context.push({
        role: "user",
        content: userInput
    });

    await createChat();
})
