//rag app takes info not from the ai data but from the web, the perosnalised data from the site mentioned
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {Document} from "@langchain/core/documents";
//in-memory db in place of a vectordb
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
//helps us visit a url
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.8
});

const question = "Langchain framework consists of which open source libraries?";

const main = async() => {
    // Create a web loader
    const loader = new CheerioWebBaseLoader(
  "https://js.langchain.com/docs/introduction",
  {
    // optional params: ...
  }
   );
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 150,
        chunkOverlap: 10,
    });

    const spliitedDocs = await splitter.splitDocuments(docs);

    //create an embedding instance
    const embeddings = new OpenAIEmbeddings();

    // Create a vector store (in memory for this example)
    const vectorStore = new MemoryVectorStore(embeddings);

    // Add documents to the vector store; as in vector store you can only store documents so we need to convert our strings to documents
    await vectorStore.addDocuments(spliitedDocs);

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