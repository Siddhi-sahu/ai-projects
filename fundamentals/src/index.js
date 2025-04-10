import { OpenAI } from "openai";

//create an insatance of OpenAi class

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const main = async () => {
    //define the prompt
    const prompt = "I need to start resistance training. is it good for me? Limit it in 20 words or less.";

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

