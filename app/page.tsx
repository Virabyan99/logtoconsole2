'use client'
import { useState, useRef, useEffect } from 'react'
import Editor from '../components/Editor'
import ScreenshotDialog from '../components/ScreenshotDialog'
import { Button } from '../components/ui/button'
import {
  CameraIcon,
  Moon,
  RemoveFormattingIcon,
  RotateCcw,
  Sun,
} from 'lucide-react'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/plugins/babel'
import parserEstree from 'prettier/plugins/estree'

export default function Home() {
  const [code, setCode] = useState('console.log([1, 2, 3, {a:1, b:2}]);')
  const [output, setOutput] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [screenshotDialogOpen, setScreenshotDialogOpen] = useState(false)

  // ✅ Custom theme toggle state (dark mode by default)
  const [isDarkMode, setIsDarkMode] = useState(true)

  // ✅ Ref for capturing screenshots
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") { // ✅ Fix SSR issues
      const storedTheme = localStorage.getItem('theme')
      if (storedTheme) {
        setIsDarkMode(storedTheme === 'dark')
      }
    }
  }, [])

  const formatCode = async () => {
    try {
      const formatted = await prettier.format(code, {
        parser: 'babel',
        plugins: [parserBabel, parserEstree],
        semi: true,
        singleQuote: false,
      })

      setCode(formatted)

      if (typeof window !== "undefined") { // ✅ Prevent SSR error
        localStorage.setItem('editorCode', formatted)
      }
    } catch (error) {
      console.error('Prettier formatting error:', error)
    }
  }

  const clearConsole = () => {
    setLogs([])
    setOutput('')
  }

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)

    if (typeof window !== "undefined") { // ✅ Fix SSR issue
      localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    }
  }

  // ✅ Save Snippet to API
  const saveSnippet = async () => {
    const response = await fetch('/api/save-snippet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    if (response.ok) {
      alert('✅ Snippet saved successfully!')
    } else {
      alert('❌ Failed to save snippet.')
    }
  }

  return (
    <div
      ref={targetRef}
      className={`p-6 grid md:grid-cols-2 gap-4 min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-400 text-black'}`}
    >
      {/* Left Side - Editor */}
      <div className="space-y-4">
        <Editor
          code={code}
          setCode={setCode}
          setOutput={setOutput}
          setLogs={setLogs}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Right Side - Console Output */}
      <div
        className={`relative rounded-lg p-4 min-h-[600px] overflow-y-auto border shadow-md transition-all duration-300 
        ${isDarkMode ? 'bg-black text-white border-gray-800' : 'bg-white text-gray-800 border-gray-300'}`}
      >
        {/* Camera Button */}
        <Button
          onClick={() => setScreenshotDialogOpen(true)}
          className={`absolute top-2 left-2 px-3 py-2 rounded-full bg-transparent transition duration-300 
            ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
        >
          <CameraIcon size={28} stroke={isDarkMode ? '#fff' : '#333'} />
        </Button>

        {/* Clear Button */}
        <Button
          onClick={clearConsole}
          className={`absolute top-2 right-2 px-3 py-2 rounded-full bg-transparent transition duration-300 
            ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
        >
          <RotateCcw size={28} stroke={isDarkMode ? '#fff' : '#333'} />
        </Button>

        {/* Theme Toggle Button */}
        <Button
          onClick={toggleTheme}
          className={`absolute bottom-2 left-2 px-3 py-2 rounded-full bg-transparent transition duration-300 
    ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
        >
          {isDarkMode ? (
            <Sun size={28} stroke="#fff" />
          ) : (
            <Moon size={28} stroke="#333" />
          )}
        </Button>

        {/* Format Code Button */}
        <Button
          onClick={formatCode}
          className={`absolute bottom-2 right-2 px-3 py-2 rounded-full bg-transparent transition duration-300 
            ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
        >
          <RemoveFormattingIcon
            size={28}
            stroke={isDarkMode ? '#fff' : '#333'}
          />
        </Button>

        {/* Console Logs */}
        <div className="space-y-1 mt-5 ml-3 text-xs md:text-lg font-mono p-2 rounded-md">
          {logs.map((log, index) => (
            <pre key={index}>{log}</pre>
          ))}
        </div>

        {/* Formatted Output */}
        <pre className="mt-4 p-2 rounded-md text-sm md:text-lg font-mono whitespace-pre-wrap">
          {output}
        </pre>
      </div>

      {/* Screenshot Dialog */}
      <ScreenshotDialog
        isOpen={screenshotDialogOpen}
        onClose={() => setScreenshotDialogOpen(false)}
        targetRef={targetRef}
      />
    </div>
  )
}
