import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import create_event from "../../utils/cal_functions";
import OpenAI from "openai";
import { env } from "~/env";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ExpectedResponse {
  // Define the properties and their types here
  // For example:
  events: Array<{
    summary: string;
    location: string;
    description: string;
    start: {
      dateTime: string;
      timeZone: string;
    };
    end: {
      dateTime: string;
      timeZone: string;
    };
    recurrence: string[];
    attendees: string[];
    reminders: {
      useDefault: boolean;
      overrides: string[];
    };
  }>;
}

export default async function requestHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET":
      // Get data from your database
      res.status(200).json({ test: "this is string returned!" });
      break;
    case "POST":
      // Update or create data in your database
      const reqbody = req.body as string;
      try {
        if (reqbody === "undefined" || reqbody === null) {
          res.status(400).json({ error: "No request body" });
          return;
        }

        // create new event with nlp

        // const cal_event = create_event("test","today","12:00pm","1:00pm")

        // console.log(cal_event)

        const cal_event = {
          summary: "Test",
          start: "2023-12-21T12:00:00-08:00",
          end: "2023-12-21T13:00:00-08:00",
          description: "Testing",
        };

        const expectedResponseType = {
          events: [
            {
              summary: "string",
              location: "string",
              description: "string",
              start: {
                dateTime: "string",
                timeZone: "string",
              },
              end: {
                dateTime: "string",
                timeZone: "string",
              },
              recurrence: "string[]",
              attendees: "string[]",
              reminders: {
                useDefault: "boolean",
                overrides: "string[]",
              },
            },
          ],
        };

        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant designed to output an array of JSON objects, each representing a unique Google Calendar event. The structure of each event should follow: ${JSON.stringify(
                expectedResponseType,
              )}`,
            },
            {
              role: "user",
              content:
                "Generate 10 google calendar instance event that will help reach goal of building SwiftUI app in an array",
            },
          ],
          model: "gpt-3.5-turbo-1106",
          response_format: { type: "json_object" },
        });

        const responseContent = completion?.choices[0]?.message?.content;

        // check if responseContent conforms to ExpectedResponse
        // if not, throw error

        console.log("Here is the response content:");
        console.log(responseContent);

        // Replace escaped characters
        const jsonString = responseContent
          ?.replace(/\\n/g, "")
          .replace(/\\"/g, '"');

        if (!jsonString) {
          res.status(400).json({ error: "Invalid response content" });
          return;
        }

        // Parse into a JSON object
        const retuenedObjects = JSON.parse(jsonString) as ExpectedResponse;

        res.status(200).json(retuenedObjects);

        break;
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
