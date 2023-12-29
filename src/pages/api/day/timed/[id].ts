//shows remaining events today
import { db } from "~/server/db";

const currentTime = new Date().toISOString().split("T")[1]
console.log(currentTime)

export function tester(){
    const currentTime = new Date().toISOString().split("T")[1]//this is UTC
    console.log(currentTime)
    return currentTime
}

export function checkIn(){
    //use yesterday's memory as context
    
}

function calculate_free_time(){
    //calculates free time between events
}

export function get_remaining_events(userId:string,currentTime:string){
    //returns list of events remaining today
}