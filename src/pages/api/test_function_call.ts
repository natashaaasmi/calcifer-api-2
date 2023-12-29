//test function call

import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { db } from "~/server/db";
import { NextApiRequest, NextApiResponse } from "next";
import create_event from "./cal_functions";

const openai = new OpenAI();

export async function user_input_http(res:NextApiResponse,req:NextApiRequest){
    switch (req.method){
        case "GET":
            break;
        case "POST":
            try {
                const history:ChatCompletionMessageParam[]=[]
                const request_body = req.body;
                const user_input = request_body?.user_input
                history.push({"role":"user","content":user_input})
                const openai_resp = await openai.chat.completions.create({
                    model:"gpt-3.5-turbo",
                    messages:history,
                    stream:false
                })
                const response = openai_resp.choices[0]?.message.content
                res.status(200).json({"response":response})
                break;
            }
            catch {
                res.status(500).json({ error: "Internal server error" });
            }
            default:
                res.setHeader("Allow", ["GET", "POST"]);
                res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export async function gpt_function_call(history:ChatCompletionMessageParam[],user_input:string){
    //add function call
    tools: [{
        "type":"function",
        "function":{
            "name":"create_event",
            "description":"Create an event using the description, start time and end time",
            "parameters":{
                "type":"object",
                "properties":{
                    "summary":{
                        "type":"string",
                        "description":"The name of the event"
                    },
                    "day":{
                        "type":"string",
                        "description":"The day of the event"
                    },
                    "start":{
                        "type":"string",
                        "description":"The start time of the event"
                    },
                    "end":{
                        "type":"string",
                        "description":"The end time of the event"
                    }
                }
            }
        }
    }]
    available_functions: [{create_event: create_event}]
    history.push({"role":"user","content":user_input})
    const openai_resp = await openai.chat.completions.create({
        model:"gpt-3.5-turbo",
        messages:history,
        stream:false
    })
    const response = openai_resp.choices[0]?.message.content
    return response

}