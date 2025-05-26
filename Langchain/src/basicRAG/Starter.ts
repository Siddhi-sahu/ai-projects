import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {Document} from "@langchain/core/documents";
//in-memory db in place of a vectordb
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.8
});

const hardcodedData = [
  "My full name is John Doe",
  "I am a software engineer",
  "My favorite programming language is JavaScript",
  "My favorite programming language is also python",
  "My favorite programming language is also typescripts",
  "I love to play the guitar",
];

const question = "What is my favorite programming language?";

const main = async() => {
    //create an embedding instance
    const embeddings = new OpenAIEmbeddings();

    // Create a vector store (in memory for this example)
    const vectorStore = new MemoryVectorStore(embeddings);

    // Add documents to the vector store; as in vector store you can only store documents so we need to convert our strings to documents
    await vectorStore.addDocuments(
        hardcodedData.map((text)=> new Document({
            pageContent: text
        }))
    );

    // Retrieve the top 3 most similar documents
    const retriever = vectorStore.asRetriever({
        k: 3
    });

    const result = await retriever._getRelevantDocuments(question);
    const resultDocuments = result.map((doc) => doc.pageContent);

    // console.log(resultDocuments)

    // build template for chat
    const template = ChatPromptTemplate.fromMessages([
        ['system', 'Answer the user questions based on the following context: {context}'],
        ['user', '{query}']
    ]);

    const chain = template.pipe(model);
    const response = await chain.invoke({
        query: question,
        context: resultDocuments
    });

    console.log(response.content);
}

main();