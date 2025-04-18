import { OpenAI } from "openai";
import { encoding_for_model } from "tiktoken";

//create a new open ai client
const openai = new OpenAI();
const encoder = encoding_for_model("gpt-4o-mini")

const MAX_TOKENS = 500;

// 1st => define context with system instructions
const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
        role: "system",
        content: "Act like a girl's girl."

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


    if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
        removeOlderTokens()

    }
    console.log(responseMessage.content);


};



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

//this goes thro messages content if its a string just add the token length but if its an array, loop through the array sum every content "text" and add it to the length variable
const getContextLength = () => {
    let length = 0;
    context.forEach((message: OpenAI.Chat.Completions.ChatCompletionMessageParam) => {
        //content of a msag  can be string or arrray when the message is succesful 
        if (typeof message.content === "string") {
            length += encoder.encode(message.content).length
        } else if (Array.isArray(message.content)) {
            message.content.forEach((content) => {
                if (content.type === "text") {
                    length += encoder.encode(content.text).length

                }
            })
        }


    })
    return length;
}

const removeOlderTokens = () => {
    let contextLength = getContextLength();

    while (contextLength > MAX_TOKENS) {

        for (let i = 0; i < contextLength; i++) {
            const message = context[i];

            if (message.role !== "system") {
                context.splice(i, 1);
                contextLength = getContextLength();
                console.log("updated context length ; ", contextLength);

                break;
            }
        }
    }

}