// Setup function calling=>
//#Configure the function calling
//#Decide which function to call
//#Call the function
//#call openAI with the function response

// todo:debugg tool to understand better
import { OpenAI } from "openai";

const openai = new OpenAI();

const getCurrentDateAndTime = () => {
    const date = new Date();

    return date.toLocaleString()
}

const callOpenAIWithFunctonCalling = async () => {
    const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: "you are a helful assistant"
        },
        {
            role: "user",
            content: "what is the current date and time, answer in 20 words"
        }
    ];

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: context,
        //configure the function caliing
        tools: [
            {
                type: "function",
                function: {
                    name: "getCurrentDateAndTime",
                    description: "get the current date and time"
                }
            }
        ],

        //#Decide which function to call

        tool_choice: "auto" // openai will decide which tool to use
    });

    console.log('First openai response:', response.choices[0].message.content);


    //whenever there is a function call the finish_reason property of the openai response will change to tool_calls
    //and based on this finish reason we will check whether we will invoke the function
    const shouldInvokeFunction = response.choices[0].finish_reason === 'tool_calls';

    //toolcall will have all our defined functions, rn its 1 so we hardcode [0]
    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall) {
        return;
    }

    if (shouldInvokeFunction) {
        const functionName = toolCall.function.name;

        if (functionName === "getCurrentDateAndTime") {
            const functionResponse = getCurrentDateAndTime();
            //we push the response from earlier into the context; this is the response to tell openai to use tools
            context.push(response.choices[0].message);
            //we also push the functionresponse into the context
            context.push({
                role: "tool",
                content: functionResponse,
                tool_call_id: toolCall.id
            })

        }

    };
    // final response in case ai used tools                        
    const finalResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: context

    });

    console.log("final response from openai: ", finalResponse.choices[0].message.content);
};



callOpenAIWithFunctonCalling();