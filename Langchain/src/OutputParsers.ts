import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.8
});

const fromTemplate = async () => {

    //creating a dynamic prompt
    const prompt = ChatPromptTemplate.fromTemplate("write a summary of the movie {movieName} in 30 words");
    const parser = new StringOutputParser();

    // creating chain: connecting model with prompt
    const chain = prompt.pipe(model).pipe(parser);
    const response = await chain.invoke({
        movieName: "robot"
    });
    console.log(response);
};



fromTemplate();