'use client'

import Image from "next/image";
import { Box, Stack,TextField,Button } from "@mui/material";
import { useState } from "react";


export default function Home() {
  const [messages,setMessages] = useState([])

  const [message,setMessage] = useState('')

  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [
      ...messages,
      {role:'user', parts:[{text:message}]},
      {role:'model', parts:[{text:''}]}
    ])

    const response = fetch('/api/chat',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, {role:'user', parts:[{text:message}] }])
    }).then(async(res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function proccessText({done, value}){
        
        if(done){
          return result
        }
        const text = decoder.decode(value || new Int8Array(), {stream:true})
        setMessages((messages) => {
          
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length -1)
          return [
            ...otherMessages,
            {
              role:lastMessage.role,
              parts: [{text:lastMessage.parts[0].text + text}]
            }
          ]
        })
        console.log(messages)
        return reader.read().then(proccessText)

        
      })
    }).catch(err => console.log(err))
  }

    return(
      <Box
      height="100vh"
      width="100vw"
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}>
        

        <Stack
        direction={"column"}
        height="600px"
        width="800px"
        display={"flex"}
        border={'1px solid black'}
        borderRadius={'20px'}
        p={5}>
                    
          <Stack
          flexBasis={"80%"}
          display={"flex"}
          width={"100%"}
          direction={"column"}
          spacing={2}
          overflow={"auto"}
          >
            {messages.map((message)=>{
              return <Box
              
              fontSize={"1.5rem"}
              p={"5px"}
              maxWidth={"70%"}
              borderRadius={"10px"}
              alignSelf={message.role === "model"?"flex-start":"flex-end"}
              backgroundColor={message.role == "model"?"#E0B0FF": "#FAE6FA"}
              >{message.parts[0].text}
                
              </Box>
            })}
          </Stack>

          <Stack
          flexBasis={"20%"}
          display="flex"
          flexDirection={"row"}
          p={3}
          width={"100%"}
          spacing={2}
          direction={"row"}>
          <TextField fullWidth
          id="message" 
          label="Tell me about..." 
          variant="outlined"
          value={message}
          onChange={(e)=>{setMessage(e.target.value)}} />
          <Button onClick={sendMessage}
          variant="contained">Send</Button>
          </Stack>
              
          

        </Stack>
      </Box>
    )
}
