import OpenAI from "openai";

const openai = new OpenAI();

const getTrainsBetweenStations = (origin: string, destination: string): { trains: string[] } => {
    if (origin === "Delhi" && destination === "Mumbai") {
        return {
            trains: ["Train 1", "Train 2", "Train 3", "Rajdhani"]

        }
    } else if (origin === "Mumbai" && destination === "Delhi") {
        return {
            trains: ["Shatabdi", "Duronto", "Train 4"]
        }
    }
    return {
        trains: ["Premium Train", "Express Train"]
    }
}

//newer update => Tool responses (must be an object or boolean, not string or string[])
//OpenAI recently updated how the functions (now called tools) API works. It now requires function outputs to be objects or booleans, not raw strings or arrays.

const bookTicket = (train: string): { status: string } => {
    if (train === "Rajdhani") {
        return { status: "334455" }
    } else {
        return {
            status: "UNAVAILABLE"
        }
    }
};


//context

const history: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
        role: "system",
        content: "Hello! I am Train Reservation Assistant. How can I help you? limit responses in 30 words or less",

    }
];


const callOpenAIWithFunctons = async () => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: history,
        //deterministic as we have hardcoded data
        temperature: 0,
        tools: [
            {
                type: "function",
                function: {
                    name: "getTrainsBetweenStations",
                    parameters: {
                        type: "object",
                        properties: {
                            origin: {
                                type: "string",
                                description: "the origin station"
                            },
                            destination: {
                                type: "string",
                                description: "the destination station"
                            }
                        },
                        required: ["origin", "destination"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "bookTicket",
                    parameters: {
                        type: "object",
                        properties: {
                            train: {
                                type: "string",
                                description: "The train name",
                            }
                        },
                        required: ["train"]
                    },
                }
            }
        ],
        tool_choice: "auto"
    });

    const shouldInvokeFunction = response.choices[0].finish_reason === "tool_calls";

    if (shouldInvokeFunction) {
        const toolCall = response.choices[0].message.tool_calls?.[0];

        if (!toolCall) {
            return;
        };

        const functionName = toolCall.function.name;

        if (functionName === "getTrainsBetweenStations") {
            //extract the argumnets from the toolcall function

            const argRaw = toolCall.function.arguments;
            const { origin, destination } = JSON.parse(argRaw);

            const trains = getTrainsBetweenStations(origin, destination);

            history.push(response.choices[0].message);

            history.push({
                role: "tool",
                //just passing the whole array as string, openai is smart enough to figure it out on its own
                content: JSON.stringify(trains),
                tool_call_id: toolCall.id
            })


        }
        if (functionName === "bookTicket") {
            //extract the argumnets from the toolcall function

            const argRaw = toolCall.function.arguments;
            const { train } = JSON.parse(argRaw);

            const ticket = bookTicket(train);

            history.push(response.choices[0].message);

            history.push({
                role: "tool",
                content: JSON.stringify(ticket),
                tool_call_id: toolCall.id
            })


        }

    };

    // call openai again with function calling response
    const finalResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: history,
        temperature: 0

    });

    console.log(finalResponse.choices[0].message.content)

};

process.stdin.addListener("data", async (data) => {
    const userInput = data.toString().trim();

    history.push({
        role: "user",
        content: userInput
    });

    await callOpenAIWithFunctons();

})