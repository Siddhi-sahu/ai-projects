import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.8
});

const fromTemplate = async () => {

    //creating a dynamic prompt
    const prompt = ChatPromptTemplate.fromTemplate("write a summary of the movie {movieName} in 30 words");

    // const interstellerPrompt = await prompt.format({
    //     movieName: "interstellar"
    // });

    // console.log(interstellerPrompt);

    // creating chain: connecting model with prompt
    const chain = prompt.pipe(model);
    const response = await chain.invoke({
        movieName: "interstellar"
    });
    console.log(response.content);
};

const fromMessage = async () => {
    // drawback: fromMessage does not have type checking
    // but it will throw error on run time

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "write a summary of the movie {movieName} in 30 words"],
        ["user", "{movieName}"]
    ]);

    const chain = prompt.pipe(model);
    const response = await chain.invoke({
        movieName: "inception"
    });

    console.log(response.content);
};

fromMessage();

// fromTemplate();