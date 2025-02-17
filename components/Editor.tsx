'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import * as monaco from 'monaco-editor'
import Sandbox from './Sandbox'
import detectSyntaxErrors from './detectSyntaxErrors'
import lintCode from './lintCode'
import FileUploader from './FileUploader'
import { Button } from './ui/button'
import { CirclePlay, Download, RotateCcw, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from './ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Input } from './ui/input'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
})

interface EditorProps {
  code: string
  setCode: (value: string) => void
  setOutput: (value: string) => void
  setLogs: (logs: string[]) => void
  isDarkMode: boolean
}

const Editor = ({
  code,
  setCode,
  setOutput,
  setLogs,
  isDarkMode,
}: EditorProps) => {
  const editorRef = useRef<any>(null)
  const sandbox = new Sandbox()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [fileName, setFileName] = useState('script.js')

  useEffect(() => {
    const savedCode = localStorage.getItem('editorCode')
    if (savedCode) setCode(savedCode)
  }, [])

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value)
      localStorage.setItem('editorCode', value)
      updateEditorMarkers(value)
    }
  }

  const runCode = () => {
    sandbox.executeCode(code, (result) => {
      if (result.error) {
        setOutput(`❌ Error: ${result.error}`)
        setLogs([])
      } else {
        setOutput(result.output)
        setLogs(result.logs || [])
      }
    })
  }

  const updateEditorMarkers = (code: string) => {
    if (!editorRef.current) return
    const orphanErrors = detectSyntaxErrors(code)
    const lintErrors = lintCode(code)

    const markers = [...orphanErrors, ...lintErrors].map((err) => ({
      startLineNumber: 1,
      startColumn: err.index + 1,
      endLineNumber: 1,
      endColumn: err.index + (err.length || 2),
      message: err.message,
      severity: monaco.MarkerSeverity.Error,
    }))

    monaco.editor.setModelMarkers(
      editorRef.current.getModel(),
      'owner',
      markers,
    )
  }

  // ✅ Clears Editor Content
  const clearEditor = () => {
    setCode('')
    localStorage.removeItem('editorCode')
  }

  // ✅ Downloads File
  const downloadFile = () => {
    const blob = new Blob([code], { type: 'text/javascript' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = fileName.endsWith('.js') ? fileName : `${fileName}.js`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsDialogOpen(false)
  }

  return (
    <div className={`relative border rounded-xl p-4 min-h-[500px] md:h-[700px] shadow-lg transition-all duration-300 
      ${isDarkMode ? "border-gray-800 bg-black text-white" : "border-gray-300 bg-white text-black"}`}>
      {/* ✅ File Upload Button - Theme Adjusted */}
      <div className={`absolute top-2 left-2 z-10 rounded-full cursor-pointer ${isDarkMode ? "hover:bg-gray-800 text-white" : "hover:bg-gray-200 text-black "} `}>
        <FileUploader onFileLoad={(name, content) => setCode(content)} />
      </div>

      {/* ✅ Run Code Button */}
      <Button
        onClick={runCode}
        className={`absolute z-20 top-2 right-2 px-3 py-2 rounded-full bg-transparent transition duration-300 
        ${isDarkMode ? "hover:bg-gray-800 text-white" : "hover:bg-gray-200 text-black"}`}
      >
        <CirclePlay size={24} stroke={isDarkMode ? "#fff" : "#333"} />
      </Button>

      {/* ✅ Download Button - Theme Adjusted */}
      <Button
        onClick={() => setIsDialogOpen(true)}
        className={`absolute bottom-2 left-2 px-3 py-2 rounded-full bg-transparent transition duration-300 
        ${isDarkMode ? "hover:bg-gray-800 text-white" : "hover:bg-gray-200 text-black"}`}
      >
        <Download size={24} stroke={isDarkMode ? "#fff" : "#333"} />
      </Button>

      {/* ✅ Download Dialog - Adjusted for Dark & Light Mode */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className={`rounded-lg p-6 w-[500px] h-[200px] transition-all duration-300 
          ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
        >
          {/* Accessible but visually hidden title */}
          <VisuallyHidden>
            <DialogTitle>Enter File Name</DialogTitle>
          </VisuallyHidden>

          <Input
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Type the file name"
            className={`w-full p-3 mt-10 text-xl border-none rounded-md transition-all duration-300 
            ${isDarkMode ? "bg-black text-white focus:ring-blue-500" : "bg-white text-black focus:ring-gray-400"}`}
          />

          <DialogFooter className="mt-4 flex justify-between">
            <Button
              onClick={downloadFile}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-md text-lg font-semibold"
            >
              Save
            </Button>
            <Button
              onClick={() => setIsDialogOpen(false)}
              className="bg-gray-600 hover:bg-gray-500 text-white px-5 py-2 rounded-md text-lg font-semibold"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Clear Editor Button */}
      <Button
        onClick={clearEditor}
        className={`absolute bottom-2 right-2 px-3 py-2 rounded-full bg-transparent transition duration-300 
        ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
      >
        <RotateCcw size={24} stroke={isDarkMode ? "#fff" : "#333"} />
      </Button>

      {/* Monaco Editor */}
      <MonacoEditor
        height="600px"
        language="javascript"
        theme="vs-dark"
        value={code}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          automaticLayout: true,
          lineNumbers: (lineNumber) => '•', // ✅ Replace numbers with dots
          lineNumbersMinChars: 2, // ✅ Ensures dots are properly aligned
          glyphMargin: false, // ✅ Removes additional margin
        }}
        onChange={handleEditorChange}
        onMount={(editor, monaco) => {
          editorRef.current = editor
          updateEditorMarkers(code)

          // ✅ Force Monaco Editor Background to Black
          monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#000000', // ✅ Pure black
              'editor.foreground': '#ffffff', // White text
              'editor.lineHighlightBackground': '#000000',
              'editor.selectionBackground': '#333333',
              'editorCursor.foreground': '#ffffff',
            },
          })

          monaco.editor.setTheme('custom-dark')
        }}
        className="rounded-lg mt-14 "
      />
    </div>
  )
}

export default Editor
