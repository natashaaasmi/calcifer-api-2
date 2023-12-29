import { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { db } from "~/server/db";

interface CalChatApiBody {
  //messages: Array<ChatCompletionMessageParam>;
  //messages: Array<any>;
  msg: string;
}

/*export default async function requestHandler(req:NextApiRequest,res:NextApiResponse){
  switch (req.method) {
    case "GET":
      // Get data from your database
      res.status(200).json({ test: "this is string returned!" });
      break;
    case "POST":
      // Update or create data in your database
      const reqbody = req.body as string;
      try {
        if (reqbody === "undefined" || reqbody === null){
          res.status(400).json({ error: "No request body" });
          return;
        }
        
        console.log(reqbody)

      // save chat history to database
        //const history = body.msg;

        const savedMessages = await db.chatRoom.create({
          data: {
            title: "CalChat",
            body: reqbody,

          //history: history as string[],
          },
        });
        //console.log("savedmessages")
        res.status(200).json({ reqbody });
        break;

      } catch {
        res.status(500).json({ error: "Internal server error" });
      }
    
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}*/