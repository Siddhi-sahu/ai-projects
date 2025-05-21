import { ChatOpenAI } from "@langchain/openai";

//langchain's own version of openai
const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.8,
    maxTokens: 500,
    // verbose: true
});

const main = async () => {
    //1. invoke
    // const response = await model.invoke("tell me the gist of the movie 'intersteller'");
    // console.log(response.content);

    //2. batch
    // const response = await model.batch(["hi", "how are you"]);

    // console.log(response)

    //3. stream
    const response = await model.stream(
        "give me a movie recommendation"
    );

    for await (const res of response) {
        console.log(res.content);
    }

}

main();