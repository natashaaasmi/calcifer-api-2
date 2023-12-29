//fetch morning routine for user's id
//initiate morning conversation, write everything to memory
//in conversations only use last 10 entries save the rest to db
import { db } from "~/server/db";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import create_event  from "../../../../utils/cal_functions";
import { ChatCompletionAssistantMessageParam, ChatCompletionCreateParams, ChatCompletionMessage, ChatCompletionMessageParam, ChatCompletionSystemMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI();

interface Morning {
    timeOfDay: string;
    yesterdaySummary: string;
    user: { connect: { id: string } };
    events: Array<any>
}
interface EventInfo {
    summary: string;
    start: string;
    end: string;
    description?: string;
    routine?: { connect: { id: string } };
}
const test_id = "658552f8b30e6836afb5c239" //replace w real user's ID

//date is yyyy-mm-dd
async function get_events(userId:string){
    const new_date = new Date().toISOString().split("T")[0]
    const events = await db.user.findUnique({
        where: { id: userId },
        include: {
            events: {
                where: {
                    start: {
                        contains: new_date
                    },
                    end:{
                        contains: new_date
                    }
                }
            }
        }
    });
    return events
}

export async function make_fake_events(userId:string){
    const date_string = "today"
    const newEvent = create_event("test",date_string,"4:00","5:00",userId,"HW")
    return newEvent
    /*const events = await db.event.create({
        data: {
            summary: "Test1",
            start: "2023-12-21T12:00:00-08:00",
            end: "2023-12-21T13:00:00-08:00",
            description: "Testing",
            user: { connect: {id: userId } },
        }//not sure what this is
        });*/
    }

export async function generate_morning(userId:string){
    const new_date = new Date().toISOString().split("T")[0] //TODO: switch to proper timezone 
    const user1= await db.user.findUnique({
        where: { id: userId },
    })
    // generate before morning
    const greeting_system_prompt: ChatCompletionSystemMessageParam= {"role":"system", "content": `Generate a snarky one line morning greeting for the user: ${user1?.first_name} in the style of Kevin Hart. Incorporate info about the user: ${user1?.short_profile}.`}
    const greeting_history:Array<(ChatCompletionSystemMessageParam | ChatCompletionMessageParam | ChatCompletionAssistantMessageParam)> = []

    greeting_history.push(greeting_system_prompt)
    
    const greeting = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: greeting_history
    })

    greeting_history.push({"role":"user", "content": "What events do I have today?"})
    //get events for today
    const today_events = await db.user.findUnique({
        where: { id: userId },
        include: {
            events: {
                where: {
                    start: {
                        contains: new_date
                    },
                    end:{
                        contains: new_date
                    }
                }
            }
        }
    });

    const morning_routine:object = {
        "greeting": greeting.choices[0]?.message.content,
        "events": today_events?.events ?? [],
        //handle user responses/conversation
        "follow_up_prompt": "Do you need to make any changes to your schedule?"
    }
    
    return morning_routine
}

export async function handler(req:NextApiRequest, res:NextApiResponse){
    switch (req.method) {
        case "GET":
            res.status(200).json({ test: "this is string returned!" });
            break;
        case "POST":
            const request_body = req.body as object;
            try {
                /*if (request_body === "undefined" || request_body === null){
                    res.status(400).json({ error: "No request body" });
                    return;
                }*/
                const new_userId = "658552f8b30e6836afb5c239"
                const userId = request_body
                const morning_routine = await generate_morning(new_userId)
                res.status(200).json({ "Done": morning_routine });
                break;
            } catch {
                res.status(500).json({ error: "Internal server error" });
            }
    }

}


/*export async function get_morning(userId:string){
    //fetch morning routine for user's id
    const morning_routine = await db.user.findUnique({
        where: { 
            id: 
                userId,
            }, 
            include: {
                routines: {
                    where: {
                        timeOfDay: "morning"
                    }
                }
            }
        
    });

    
    return morning_routine
}*/





