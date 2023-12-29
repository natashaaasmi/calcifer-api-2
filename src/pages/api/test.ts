import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../server/db";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import create_event from "../../utils/cal_functions";
//import { generate_today_calendar } from "./day/morning/[id]";
import { PrismaClient } from "@prisma/client";
//import   generate_morning  from "./day/morning/[id]";
import { getEvents } from "../../utils/cal_api_test"
import { tester } from "./day/timed/[id]";
//import { chat } from "./default_functions/memory_write";

//const openai = new OpenAI();
interface requestFormat {
  user: string;
  date: string;
}
// types
export default async function requestHandler(req:NextApiRequest,res:NextApiResponse){
  switch (req.method) {
    case "GET":
      // Get data from your database
      res.status(200).json({ test: "this is string returned!" });
      break;
    case "POST":
      // Update or create data in your database
      //format API request with JSON userId and date
      const request_body = req.body;
      const userId = request_body?.userId
      const date = request_body?.date
      try {
        /*if (reqbody === "undefined" || reqbody === null){
          res.status(400).json({ error: "No request body" });
          return;
        }*/

        /*const userAndEvents = await db.user.create({
          data: {
            first_name: "T1",
            name: "T1T2",
            short_profile: "Test",
            events: {
              create: [{
                summary: "Test",
                start: "2023-12-21T12:00:00-08:00",
                end: "2023-12-21T13:00:00-08:00",
                description: "Testing",
              },
              {
                summary:"Test2",
                start: "2023-12-21T4:30:00-08:00",
                end: "2023-12-21T5:00:00-08:00",
                description: "Test",
              }]
            },
          }
        }) *///need to save user id
        console.log("Started")
        const new_userId = "658552f8b30e6836afb5c239"
        //c

        //const new_event = make_fake_events(new_userId)
        //const morning_routine = await generate_morning(new_userId)
        //console.log(new_event)
        /*const findUser = await db.user.findUnique({
          where: { id: new_userId },
          include: {
            events: true
          }
        });
        console.log(findUser?.events) *///returns user

        res.status(200).json({ "Done":"done"});
        break;

      } catch {
        res.status(500).json({ error: "Internal server error" });
      }
    
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
