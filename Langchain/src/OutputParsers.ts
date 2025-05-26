import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser, CommaSeparatedListOutputParser, StructuredOutputParser} from "@langchain/core/output_parsers";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.8
});

const stringOutputParser = async () => {

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

const commaSeparatedListOutputParser = async() =>{
    const prompt = ChatPromptTemplate.fromTemplate(
    "Provide best six movies, separated by commas, for the genre: {genre}. Make it comma separated. And don't add numbered list");
    const parser = new CommaSeparatedListOutputParser();

    const chain = prompt.pipe(model).pipe(parser);
    const response = await chain.invoke({
        genre: "sci-fi"
    });

    console.log(response);
}
const structuredOutputParser = async() => {
    const templatePrompt = ChatPromptTemplate.fromTemplate(
        `extract the information from the following text:
        Text: {text}
        formattingInstructions: {FormatingInstructions}`
    );

    const parser = StructuredOutputParser.fromNamesAndDescriptions({
        name: "the name of the user",
    age: "the age of the user",
    interests: "what the user is interested in",
    });

    const chain = templatePrompt.pipe(model).pipe(parser);

    const result = await chain.invoke({
        text: "sanidhya is 25 years old and is interested in playing video games",
        FormatingInstructions: parser.getFormatInstructions()
    });

    console.log(result);
};

structuredOutputParser();
// commaSeparatedListOutputParser();
// stringOutputParser()