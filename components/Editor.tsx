'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import * as monaco from 'monaco-editor'
import Sandbox from './Sandbox'
import detectSyntaxErrors from './detectSyntaxErrors'
import lintCode from './lintCode'
import FileUploader from './FileUploader'
import { Button } from './ui/button'
import { CirclePlay, Download, RotateCcw } from 'lucide-react'
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
    <div
      className={`relative border rounded-xl p-4 min-h-[500px] md:h-[700px] shadow-lg transition-all duration-300 
      ${isDarkMode ? 'border-gray-800 bg-black text-white' : 'border-gray-300 bg-white text-black'}`}
    >
      {/* File Upload */}
      <div className="absolute top-2 left-2 z-10 cursor-pointer">
        <FileUploader onFileLoad={(name, content) => setCode(content)} />
      </div>

      {/* Run Button */}
      <Button
        onClick={runCode}
        className={`absolute z-20 top-2 right-2 px-3 py-2 rounded-full bg-transparent transition duration-300 
        ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
      >
        <CirclePlay size={24} stroke={isDarkMode ? '#fff' : '#333'} />
      </Button>

      {/* Bottom Left - Open Download Dialog */}
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="absolute bottom-2 left-2 px-3 py-2 text-white rounded-full bg-transparent hover:bg-gray-800 transition duration-300 cursor-pointer"
      >
        <Download size={24} />
      </Button>
      {/* Download Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black text-white border-none shadow-md rounded-lg p-6 w-[500px] h-[200px]">
          {/* Accessible but visually hidden title */}
          <VisuallyHidden>
            <DialogTitle>Enter File Name</DialogTitle>
          </VisuallyHidden>

          <Input
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Type the file name"
            className="w-full p-3 mt-10 text-xl border-none rounded-md bg-black text-white 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 
             focus:shadow-[0px_0px_15px_rgba(59,130,246,0.7)] 
             transition-all duration-300"
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

      {/* Clear Editor Button */}
      <Button
        onClick={clearEditor}
        className={`absolute bottom-2 right-2 px-3 py-2 rounded-full bg-transparent transition duration-300 
        ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
      >
        <RotateCcw size={24} stroke={isDarkMode ? '#fff' : '#333'} />
      </Button>

      {/* Monaco Editor */}
      <MonacoEditor
        height="600px"
        language="javascript"
        theme={isDarkMode ? 'custom-dark' : 'custom-light'}
        value={code}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
        onChange={handleEditorChange}
        onMount={(editor) => {
          editorRef.current = editor

          // Define themes
          monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#000000',
              'editor.foreground': '#ffffff',
              'editor.lineHighlightBackground': '#222222',
              'editor.selectionBackground': '#333333',
              'editorCursor.foreground': '#ffffff',
            },
          })

          monaco.editor.defineTheme('custom-light', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#ffffff',
              'editor.foreground': '#000000',
              'editor.lineHighlightBackground': '#f2f2f2',
              'editor.selectionBackground': '#dcdcdc',
              'editorCursor.foreground': '#000000',
            },
          })

          // Set initial theme
          monaco.editor.setTheme(isDarkMode ? 'custom-dark' : 'custom-light')
        }}
        className='mt-14'
      />
    </div>
  )
}

export default Editor
