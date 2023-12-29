import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from "openai";
import { PrismaClient } from '@prisma/client'

const openai = new OpenAI()
 
type ResponseData = {
  message: string
}

export async function userResponse(inputString:string){
  var history = new Array()
  history.push({role:'user',content:inputString})
  const response = await openai.chat.completions.create({
    messages: history,
    model:'gpt-3.5-turbo'
  });

  let resp = response.choices[0]?.message.content?.replace(/\n/g, ' ')
  
//   return resp
} 

export default async function modelResponse(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  //const data = await openai.chat.completions.create({
    //messages:[{role:'user',content:'Hello'}],
   // model:'gpt-3.5-turbo'
  //})
  const data = await userResponse("Hello, why is the sky blue?")
  if (data != undefined && data != null){
    res.status(200).json({ message: data })
    const message = prisma.message.create({
      data: {
        content:data,
        sentBy:'assistant',
      }
    })
    console.log('Added')
  }
  
}

//prisma functions
const prisma = new PrismaClient()

export async function createUser(name:string,email:string){
  const user = await prisma.user.create({
    data: {
      name:name,
      email:email,
    }
  })
  console.log(user)
}

export async function createMessage(content:string,sentBy:string){
  const message = await prisma.message.create({
    data: {
      content:content,
      sentBy:sentBy, //sent by either user or assistant
    }
  })
}








