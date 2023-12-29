import OpenAI from "openai";
import { ChatCompletionUserMessageParam } from "openai/resources/index.mjs";
import { db } from "~/server/db";
import { ChatCompletionAssistantMessageParam,ChatCompletionCreateParams,ChatCompletionMessage,ChatCompletionMessageParam,ChatCompletionSystemMessageParam } from "openai/resources/index.mjs";
import { NextApiRequest, NextApiResponse } from "next";
const openai = new OpenAI();

//creates summary of conversation history and returns it 
export async function gen_summary(userId:string){
    //start w fake conversation history:
    const fake_history = [{"role":"user","content":"I got distracted by "}]
    const user = await db.user.findUnique({
        where: { id: userId },
        include: {
            conversationHistory:true
        }
    })
    const history= user?.conversationHistory //array of objects
    return history
    //get user's messages, turn into string, summarize
}

//intent: what happened today, what went wrong/what fixed it, apply to similar situatiosn tmw 

export async function generate_chat(userId:string,input:string){
    while (true){
        const msg: ChatCompletionMessageParam = {
            "role": "system",
            "content": input,
        };
    }
}
const history: ChatCompletionMessageParam[]=[]
history.push({"role":"user","content":"I got distracted by "})

//separate function to generate chat 
export function testType(history:string[]){
    const typehist = history
    console.log(typeof history)
    history.push("Hello")
    //history.push({"role":"user","content":"Hello there"})
    const is_array = Array.isArray(history)
    return is_array
}

export async function chat(req:NextApiRequest,res:NextApiResponse, history:ChatCompletionMessageParam[]=[]){
    //format request as {"message":user_input}
    console.log(typeof history)
    switch (req.method){
        case "GET":
            res.status(200).json({ test: "this is string returned!" });
            break;
        case "POST":
            const request_body = req.body;
            const usr_message = request_body?.message
            console.log(usr_message)
            
            try {
                const new_user_msg: ChatCompletionMessageParam = {
                    "role": "user",
                    "content": usr_message,
                };
                console.log(new_user_msg)
                history.push(new_user_msg)
                console.log(history)
            //create response
                const response = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages:history,
                    stream:false
                });
                const new_model_msg: ChatCompletionMessageParam = {
                    "role":"assistant",
                    "content": response.choices[0]?.message.content
                }
                history.push(new_model_msg)
                console.log(history)

                res.status(200).json({ "Done": response.choices[0]?.message.content });
                return history;

            } catch {
                res.status(500).json({ error: "Internal server error" });
            }
    
    default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default async function add_to_string_memory(userId:string,history:ChatCompletionMessageParam[]=[],today:string){
    //iterate through history, add user comments to string, summarize string
    //call every time a new message is added, only append that message to string
    const today_memory = await db.user.findUnique({
        where: { id: userId },
        include: {
            memory:{
                where:{
                    createdAt: today
                }
            }
        }
    });
    console.log(today_memory)
    let userComments: string = "";
    for (let i = 0; i < history.length;i++){
        if (history[i]?.role == "user"){
            userComments.concat(history[i]?.content?.toString() ?? " ")
        }
    }
}
export async function summarize(memory:string){
    const summarizer_sys_message:ChatCompletionMessageParam = {"role":"system","content":`Summarize this string: ${memory} and separate into categories`}
    const messages:ChatCompletionMessageParam[]=[summarizer_sys_message]
    const summarizer = await openai.chat.completions.create({
        model:"gpt-3.5-turbo",
        messages: messages,
        stream:false
    })
    const summary = summarizer.choices[0]?.message.content
    return summary
}

