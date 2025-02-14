'use client'
import { useEffect, useState } from 'react'
import { ArrowRight, Link, Loader } from 'lucide-react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import Prompt from './Prompt'

const ChatView = () => {
  const [messages, setMessages] = useState<any[]>([]) // To store chat messages
  const [userInput, setUserInput] = useState<string>('') // To capture user input
  const [loading, setLoading] = useState(false) // To manage loading state
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false) // To prevent multiple responses

  // Handle user input submission
  const onGenerate = async (input: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: input }])
    setUserInput('') // Clear input after sending message
  }

  useEffect(() => {
    // Only generate AI response if the message was sent by the user and response isn't already being generated
    if (messages.length > 0 && messages[messages.length - 1].role === 'user' && !isGeneratingResponse) {
      GetAiResponse() // Generate AI response
    }
  }, [messages]) // Run this effect whenever messages are updated

  const GetAiResponse = async () => {
    setIsGeneratingResponse(true) // Set the flag to true to prevent further requests
    setLoading(true)

    const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT
    try {
      const result = await axios.post('/api/ai-chat', { prompt: PROMPT })
      console.log(result.data.result)

      // Add AI response to messages
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: result.data.result },
      ])
    } catch (error) {
      console.error('Error fetching AI response:', error)
    } finally {
      setIsGeneratingResponse(false) // Reset the flag when the AI response is done
      setLoading(false) // Stop loading
    }
  }

  return (
    <div className="relative h-[85vh] flex flex-col">
      <div className="flex-1 overflow-y-scroll scrollbar-hide pl-5 ">
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className="p-3 rounded-lg mb-2 flex gap-2 items-center leading-7"
              style={{ backgroundColor: '#f5f5f5' }}
            >
              {msg?.role === 'user' && (
                <div className="rounded-full w-8 h-8 bg-gray-300" /> // Placeholder for user image
              )}
              <ReactMarkdown className="flex flex-col">
                {msg?.content}
              </ReactMarkdown>
            </div>
          ))
        ) : (
          <p>No messages available.</p> // You can show a fallback message here
        )}
        {loading && (
          <div
            className="p-3 rounded-lg mb-2 flex gap-2 items-center"
            style={{ backgroundColor: '#f5f5f5' }}
          >
            <Loader className="animate-spin" />
            <h2>Generating response...</h2>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="flex gap-2 items-end ">
        <div
          className="p-5 border rounded-xl max-w-xl w-full mt-3"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="flex gap-2">
            <textarea
              value={userInput}
              onChange={(event) => setUserInput(event.target.value)}
              placeholder="Type your message..."
              className="outline-none bg-transparent w-full h-32 max-h-56 resize-none"
            />
            {userInput && (
              <ArrowRight
                onClick={() => onGenerate(userInput)}
                className="bg-blue-500 p-2 h-10 w-10 rounded-md cursor-pointer"
              />
            )}
          </div>
          <div>
            <Link className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatView
