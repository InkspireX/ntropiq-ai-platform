"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { 
  Play, 
  Plus, 
  Menu, 
  Save, 
  Download, 
  ChevronDown, 
  MessageSquare, 
  BookOpen,
  Code,
  BarChart3,
  Database,
  Brain,
  Trash2,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Edit3,
  Bookmark,
  BookmarkCheck,
  FileText,
  Star
} from "lucide-react"
// Remove direct import since we'll use API routes
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface NotebookCell {
  id: string
  type: "natural_language" | "code" | "output"
  content: string
  timestamp: Date
  isExecuting?: boolean
  output?: string
}

interface NotebookRecord {
  id: string
  name: string
  isBookmarked: boolean
  updatedAt: number
  cells: Omit<NotebookCell, 'timestamp'> & { timestamp: string } []
}

export default function NotebookPage() {
  const [cells, setCells] = useState<NotebookCell[]>([
    {
      id: "1",
      type: "natural_language",
      content: "",
      timestamp: new Date(),
    },
  ])
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Start with sidebar closed like Colab
  const [activeCell, setActiveCell] = useState<string>("1")
  const cellRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({})
  
  // Notebook management state
  const [notebookName, setNotebookName] = useState("Untitled notebook")
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Load notebook from storage
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    const savedId = localStorage.getItem('ntropiq:lastNotebookId')
    const raw = localStorage.getItem('ntropiq:notebooks')
    if (raw) {
      const notebooks: NotebookRecord[] = JSON.parse(raw)
      const current = savedId ? notebooks.find(n=>n.id===savedId) : notebooks[0]
      if (current) {
        setNotebookName(current.name)
        setIsBookmarked(current.isBookmarked)
        const restored = current.cells.map(c=>({
          ...c,
          timestamp: new Date(c.timestamp)
        })) as NotebookCell[]
        setCells(restored)
        setActiveCell(restored[0]?.id || "1")
      }
    }
  }, [])
  
  // Keyboard shortcuts state
  const [mode, setMode] = useState<"edit" | "command">("edit") // edit mode for typing, command mode for shortcuts
  const [selectedCellIndex, setSelectedCellIndex] = useState(0)
  const [deleteKeyCount, setDeleteKeyCount] = useState(0)
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const addCell = (type: NotebookCell["type"], afterId?: string) => {
    const newCell: NotebookCell = {
      id: Date.now().toString(),
      type,
      content: "",
      timestamp: new Date(),
    }

    setCells(prev => {
      if (afterId) {
        const index = prev.findIndex(cell => cell.id === afterId)
        const newCells = [...prev]
        newCells.splice(index + 1, 0, newCell)
        return newCells
      }
      return [...prev, newCell]
    })

    setActiveCell(newCell.id)
  }

  const deleteCell = (cellId: string) => {
    setCells(prev => prev.filter(cell => cell.id !== cellId))
  }

  const moveCell = (cellId: string, direction: "up" | "down") => {
    setCells(prev => {
      const index = prev.findIndex(cell => cell.id === cellId)
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === prev.length - 1)
      ) {
        return prev
      }

      const newCells = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      
      ;[newCells[index], newCells[targetIndex]] = [newCells[targetIndex], newCells[index]]
      
      return newCells
    })
  }

  const updateCell = (cellId: string, content: string) => {
    setCells(prev =>
      prev.map(cell =>
        cell.id === cellId ? { ...cell, content } : cell
      )
    )
  }

  const executeCell = async (cellId: string) => {
    const cell = cells.find(c => c.id === cellId)
    if (!cell || !cell.content.trim()) return

    setCells(prev =>
      prev.map(c =>
        c.id === cellId ? { ...c, isExecuting: true } : c
      )
    )

    try {
      let output = ""
      
      if (cell.type === "natural_language") {
        // Use API route for natural language processing
        const response = await fetch('/api/notebook/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: cell.content }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate insights')
        }

        const data = await response.json()
        output = data.insights
      } else if (cell.type === "code") {
        // Use API route for code analysis
        const response = await fetch('/api/notebook/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: cell.content, language: 'python' }),
        })

        if (!response.ok) {
          throw new Error('Failed to analyze code')
        }

        const data = await response.json()
        output = `# Code Analysis Results

${data.analysis}

## Code Execution
\`\`\`python
${cell.content}
\`\`\`

*Note: This is a code analysis. In a production environment, this code would be executed in a secure sandbox.*`
      } else {
        output = `Execution completed successfully.
Output: ${new Date().toISOString()}`
      }

      setCells(prev =>
        prev.map(c =>
          c.id === cellId 
            ? { ...c, isExecuting: false, output } 
            : c
        )
      )
    } catch (error) {
      console.error('Error executing cell:', error)
      const errorOutput = `# Execution Error

I encountered an error while processing your ${cell.type === 'natural_language' ? 'query' : 'code'}. Please try again or rephrase your request.

## Troubleshooting Tips:
- Ensure your query is clear and specific
- Check for any syntax errors in code cells
- Verify your internet connection
- Try a simpler version of your request

**Error details**: ${error instanceof Error ? error.message : 'Unknown error'}`

      setCells(prev =>
        prev.map(c =>
          c.id === cellId 
            ? { ...c, isExecuting: false, output: errorOutput } 
            : c
        )
      )
    }
  }

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"
    textarea.style.height = `${Math.max(textarea.scrollHeight, 60)}px`
  }

  // Notebook management functions
  const handleRename = () => {
    setNewName(notebookName)
    setRenameDialogOpen(true)
  }

  const confirmRename = () => {
    if (newName.trim()) {
      setNotebookName(newName.trim())
    }
    setRenameDialogOpen(false)
    setNewName("")
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    // In a real app, this would delete the notebook from the backend
    console.log("Notebook deleted")
    setDeleteDialogOpen(false)
    // Redirect to home or notebook list
    window.location.href = "/"
  }

  // Keyboard shortcut functions
  const selectCell = (index: number) => {
    if (index >= 0 && index < cells.length) {
      setSelectedCellIndex(index)
      const cellId = cells[index].id
      setActiveCell(cellId)
      // Focus the cell in command mode
      if (mode === "command") {
        const textarea = cellRefs.current[cellId]
        if (textarea) {
          textarea.focus()
        }
      }
    }
  }

  const runCell = (cellId: string) => {
    executeCell(cellId)
  }

  const runCellAndSelectNext = (cellId: string) => {
    executeCell(cellId)
    const currentIndex = cells.findIndex(cell => cell.id === cellId)
    if (currentIndex < cells.length - 1) {
      selectCell(currentIndex + 1)
    } else {
      // Add new cell if we're at the end
      addCell("natural_language")
    }
  }

  const insertCellAbove = (afterIndex: number) => {
    const afterId = afterIndex > 0 ? cells[afterIndex - 1].id : undefined
    addCell("natural_language", afterId)
  }

  const insertCellBelow = (afterIndex: number) => {
    const afterId = cells[afterIndex].id
    addCell("natural_language", afterId)
  }

  const deleteCellByIndex = (index: number) => {
    if (cells.length > 1 && index >= 0 && index < cells.length) {
      const cellId = cells[index].id
      deleteCell(cellId)
      // Adjust selected cell index
      if (index >= cells.length - 1) {
        selectCell(Math.max(0, index - 1))
      } else {
        selectCell(index)
      }
    }
  }

  // Global keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in input fields or dialogs are open
      if (renameDialogOpen || deleteDialogOpen) return
      
      const target = e.target as HTMLElement
      const isTextarea = target.tagName === 'TEXTAREA'
      const isInput = target.tagName === 'INPUT'
      
      // Execution shortcuts (work in both modes)
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        const currentCell = cells[selectedCellIndex]
        if (currentCell) {
          runCellAndSelectNext(currentCell.id)
        }
        return
      }
      
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        const currentCell = cells[selectedCellIndex]
        if (currentCell) {
          runCell(currentCell.id)
        }
        return
      }
      
      // Mode switching
      if (e.key === 'Escape' && isTextarea) {
        e.preventDefault()
        setMode("command")
        ;(e.target as HTMLTextAreaElement).blur()
        return
      }
      
      if (e.key === 'Enter' && mode === "command" && !isTextarea && !isInput) {
        e.preventDefault()
        setMode("edit")
        const currentCell = cells[selectedCellIndex]
        if (currentCell) {
          const textarea = cellRefs.current[currentCell.id]
          if (textarea) {
            textarea.focus()
          }
        }
        return
      }
      
      // Command mode shortcuts (only when not typing)
      if (mode === "command" && !isTextarea && !isInput) {
        switch (e.key) {
          case 'ArrowUp':
          case 'k':
            e.preventDefault()
            selectCell(Math.max(0, selectedCellIndex - 1))
            break
            
          case 'ArrowDown':
          case 'j':
            e.preventDefault()
            selectCell(Math.min(cells.length - 1, selectedCellIndex + 1))
            break
            
          case 'a':
            e.preventDefault()
            insertCellAbove(selectedCellIndex)
            break
            
          case 'b':
            e.preventDefault()
            insertCellBelow(selectedCellIndex)
            break
            
          case 'd':
            e.preventDefault()
            // Handle double-d for delete
            if (deleteTimeoutRef.current) {
              clearTimeout(deleteTimeoutRef.current)
              setDeleteKeyCount(0)
              deleteCellByIndex(selectedCellIndex)
            } else {
              setDeleteKeyCount(1)
              deleteTimeoutRef.current = setTimeout(() => {
                setDeleteKeyCount(0)
                deleteTimeoutRef.current = null
              }, 500)
            }
            break
            
          case 'm':
            e.preventDefault()
            // Convert to text/natural language cell
            const currentCell = cells[selectedCellIndex]
            if (currentCell && currentCell.type === 'code') {
              updateCell(currentCell.id, currentCell.content)
              setCells(prev => prev.map(cell => 
                cell.id === currentCell.id ? { ...cell, type: 'natural_language' } : cell
              ))
            }
            break
            
          case 'y':
            e.preventDefault()
            // Convert to code cell
            const currentCodeCell = cells[selectedCellIndex]
            if (currentCodeCell && currentCodeCell.type === 'natural_language') {
              updateCell(currentCodeCell.id, currentCodeCell.content)
              setCells(prev => prev.map(cell => 
                cell.id === currentCodeCell.id ? { ...cell, type: 'code' } : cell
              ))
            }
            break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current)
      }
    }
  }, [mode, selectedCellIndex, cells, renameDialogOpen, deleteDialogOpen])

  // Update selected cell when active cell changes
  useEffect(() => {
    const index = cells.findIndex(cell => cell.id === activeCell)
    if (index !== -1) {
      setSelectedCellIndex(index)
    }
  }, [activeCell, cells])

  // Persist notebook
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    const id = localStorage.getItem('ntropiq:lastNotebookId') || Date.now().toString()
    localStorage.setItem('ntropiq:lastNotebookId', id)
    const raw = localStorage.getItem('ntropiq:notebooks')
    let notebooks: NotebookRecord[] = raw ? JSON.parse(raw) : []
    const existingIndex = notebooks.findIndex(n=>n.id===id)
    const record: NotebookRecord = {
      id,
      name: notebookName,
      isBookmarked,
      updatedAt: Date.now(),
      cells: cells.map(c => ({...c, timestamp: c.timestamp.toISOString()})) as any,
    }
    if (existingIndex >= 0) notebooks[existingIndex] = record
    else notebooks.unshift(record)
    localStorage.setItem('ntropiq:notebooks', JSON.stringify(notebooks))
  }, [notebookName, isBookmarked, cells])

  return (
    <div className="h-screen flex bg-white font-sans">
      {/* Sidebar - Colab style */}
      <div className={`${isSidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden bg-[#f9f9f9] border-r border-[#dadce0] flex flex-col`}>
        <div className="p-4 border-b border-[#dadce0]">
          <Link href="/" className="flex items-center gap-3 mb-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-uuY7YmId8tYIqbTx5mQN3jHsVvVQtk.webp"
              alt="ntropiq logo"
              width="24"
              height="24"
              className="object-contain"
            />
            <span className="text-xl font-medium text-[#202124]">ntropiq</span>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full justify-between gap-2 bg-[#1a73e8] text-white hover:bg-[#1765cc] rounded">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/chat" className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  New Chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.location.reload()}
                className="cursor-pointer"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                New Notebook
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-[#202124] mb-3">
                Bookmarked Notebooks
              </div>
              <div className="space-y-1 text-sm">
                {typeof window !== 'undefined' && (JSON.parse(localStorage.getItem('ntropiq:notebooks') || '[]') as NotebookRecord[])
                  .filter(n=>n.isBookmarked)
                  .sort((a,b)=>b.updatedAt-a.updatedAt)
                  .map(n=> (
                    <button key={n.id} className="w-full text-left px-2 py-1 rounded hover:bg-[#f1f3f4]" onClick={()=>{
                      localStorage.setItem('ntropiq:lastNotebookId', n.id)
                      window.location.reload()
                    }}>
                      {n.name}
                    </button>
                  ))}
                {typeof window !== 'undefined' && ((JSON.parse(localStorage.getItem('ntropiq:notebooks') || '[]') as NotebookRecord[]).filter(n=>n.isBookmarked).length===0) && (
                  <div className="text-sm text-[#9aa0a6] italic">No bookmarked notebooks yet</div>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-[#202124] mb-3">
                Table of contents
              </div>
              <div className="text-sm text-[#5f6368]">
                No headers found
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-[#202124] mb-3">
                Variables
              </div>
              <div className="text-sm text-[#5f6368]">
                No variables defined
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-[#202124] mb-3">
                Recent Notebooks
              </div>
              <div className="space-y-1 text-sm">
                {typeof window !== 'undefined' && (JSON.parse(localStorage.getItem('ntropiq:notebooks') || '[]') as NotebookRecord[])
                  .sort((a,b)=>b.updatedAt-a.updatedAt)
                  .slice(0,20)
                  .map(n=> (
                    <button key={n.id} className="w-full text-left px-2 py-1 rounded hover:bg-[#f1f3f4]" onClick={()=>{
                      localStorage.setItem('ntropiq:lastNotebookId', n.id)
                      window.location.reload()
                    }}>
                      {n.name}
                    </button>
                  ))}
                {typeof window !== 'undefined' && ((JSON.parse(localStorage.getItem('ntropiq:notebooks') || '[]') as NotebookRecord[]).length===0) && (
                  <div className="text-sm text-[#9aa0a6] italic">No recent notebooks</div>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-[#202124] mb-3">
                Quick Actions
              </div>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-[#5f6368] hover:text-[#1a73e8] hover:bg-white rounded"
                >
                  <BarChart3 className="w-4 h-4" />
                  Generate Chart
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-[#5f6368] hover:text-[#1a73e8] hover:bg-white rounded"
                >
                  <Database className="w-4 h-4" />
                  Connect Data
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-[#5f6368] hover:text-[#1a73e8] hover:bg-white rounded"
                >
                  <Brain className="w-4 h-4" />
                  Build ML Model
                </Button>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-[#202124] mb-3">
                Keyboard Shortcuts
              </div>
              <div className="space-y-1 text-xs text-[#5f6368]">
                <div className="flex justify-between">
                  <span>Run cell</span>
                  <span className="font-mono">Shift+Enter</span>
                </div>
                <div className="flex justify-between">
                  <span>Run cell (stay)</span>
                  <span className="font-mono">Ctrl+Enter</span>
                </div>
                <div className="flex justify-between">
                  <span>Edit mode</span>
                  <span className="font-mono">Enter</span>
                </div>
                <div className="flex justify-between">
                  <span>Command mode</span>
                  <span className="font-mono">Esc</span>
                </div>
                <div className="flex justify-between">
                  <span>Insert above</span>
                  <span className="font-mono">A</span>
                </div>
                <div className="flex justify-between">
                  <span>Insert below</span>
                  <span className="font-mono">B</span>
                </div>
                <div className="flex justify-between">
                  <span>Delete cell</span>
                  <span className="font-mono">DD</span>
                </div>
                <div className="flex justify-between">
                  <span>Navigate</span>
                  <span className="font-mono">↑↓/JK</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Notebook Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Colab style */}
        <div className="bg-white border-b border-[#dadce0] px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f8f9fa] rounded-full"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-uuY7YmId8tYIqbTx5mQN3jHsVvVQtk.webp"
                alt="ntropiq logo"
                width="28"
                height="28"
                className="object-contain"
              />
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-normal text-[#202124]">{notebookName}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleBookmark}
                  className="w-8 h-8 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f8f9fa] rounded-full"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-[#1a73e8]" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f8f9fa] rounded-full"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={handleRename}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Rename notebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleBookmark}>
                      {isBookmarked ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 mr-2" />
                          Remove bookmark
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4 mr-2" />
                          Bookmark notebook
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-[#ea4335] focus:text-[#ea4335]">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete notebook
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f8f9fa] rounded text-sm font-medium">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button variant="ghost" size="sm" className="text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f8f9fa] rounded text-sm font-medium">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Link href="/chat" className="text-sm text-[#5f6368] hover:text-[#1a73e8] transition-colors ml-4 font-medium">
              Switch to Chat
            </Link>
          </div>
        </div>

        {/* Notebook Content - Colab style */}
        <ScrollArea className="flex-1 bg-white">
          <div className="max-w-5xl mx-auto py-4">
            <div className="space-y-0">
              {cells.map((cell, index) => (
                <div 
                  key={cell.id} 
                  className={`group transition-all duration-200 border-l-4 hover:border-l-[#1a73e8] ${
                    activeCell === cell.id ? 'border-l-[#1a73e8]' : 'border-l-transparent'
                  } ${cell.type === 'natural_language' ? 'bg-[#fafafa]' : 'bg-white'} ${
                    selectedCellIndex === index && mode === "command" ? 'ring-2 ring-[#1a73e8] ring-opacity-30' : ''
                  }`}
                  onClick={() => {
                    setActiveCell(cell.id)
                    setSelectedCellIndex(index)
                  }}
                >
                  {/* Cell Container */}
                  <div className="flex">
                    {/* Cell Controls */}
                    <div className="w-16 flex flex-col items-center pt-4 bg-white">
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => executeCell(cell.id)}
                          disabled={cell.isExecuting}
                          className="w-10 h-10 rounded-full border border-[#dadce0] hover:bg-[#f8f9fa] hover:border-[#1a73e8] text-[#5f6368] hover:text-[#1a73e8]"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveCell(cell.id, "up")}
                            disabled={index === 0}
                            className="w-6 h-6 rounded-full hover:bg-[#f8f9fa] text-[#5f6368] hover:text-[#1a73e8]"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveCell(cell.id, "down")}
                            disabled={index === cells.length - 1}
                            className="w-6 h-6 rounded-full hover:bg-[#f8f9fa] text-[#5f6368] hover:text-[#1a73e8]"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCell(cell.id)}
                            disabled={cells.length === 1}
                            className="w-6 h-6 rounded-full hover:bg-[#f8f9fa] text-[#ea4335] hover:text-[#d33b32]"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Cell Content */}
                    <div className="flex-1 border-b border-[#e8eaed] last:border-b-0">
                      {/* Cell Label */}
                      <div className="px-4 py-2 flex items-center gap-2">
                        <span className={`text-xs font-mono px-2 py-1 rounded ${
                          cell.type === 'natural_language' ? 'bg-[#e3f2fd] text-[#1565c0]' :
                          cell.type === 'code' ? 'bg-[#e8f5e8] text-[#2e7d32]' : 'bg-[#f5f5f5] text-[#757575]'
                        }`}>
                          [ {index + 1} ]
                        </span>
                        <span className="text-xs text-[#5f6368] font-medium">
                          {cell.type === 'natural_language' ? 'Natural Language' : 
                           cell.type === 'code' ? 'Code' : 'Output'}
                        </span>
                      </div>

                      {/* Cell Input Area */}
                      <div className="px-4 pb-4">
                        {cell.type === 'output' ? (
                          <div className="bg-[#f8f9fa] border border-[#e8eaed] rounded p-4 text-sm font-mono whitespace-pre-wrap text-[#202124]">
                            {cell.content}
                          </div>
                        ) : (
                          <div className="relative">
                            <Textarea
                              ref={(el) => (cellRefs.current[cell.id] = el)}
                              value={cell.content}
                              onChange={(e) => {
                                updateCell(cell.id, e.target.value)
                                adjustTextareaHeight(e.target)
                              }}
                              onFocus={() => {
                                setActiveCell(cell.id)
                                setMode("edit")
                              }}
                              onBlur={() => setMode("command")}
                              placeholder={
                                cell.type === 'natural_language'
                                  ? "Describe what you want to analyze in natural language...\nExample: 'Show me the sales trends for the last quarter and predict next month's revenue'"
                                  : "# Enter your Python code here\nprint('Hello, ntropiq!')"
                              }
                              className={`min-h-[60px] w-full resize-none border border-[#dadce0] rounded focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-sm p-3 ${
                                cell.type === 'code' ? 'font-mono bg-[#f8f9fa]' : 'font-sans bg-white'
                              } placeholder:text-[#9aa0a6]`}
                              style={{ height: 'auto' }}
                            />
                          </div>
                        )}

                        {/* Cell Execution Status */}
                        {cell.isExecuting && (
                          <div className="flex items-center gap-2 mt-3 px-4 text-sm text-[#5f6368]">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-[#1a73e8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-[#1a73e8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-[#1a73e8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span>Executing...</span>
                          </div>
                        )}

                        {/* Cell Output */}
                        {cell.output && (
                          <div className="mt-4 px-4">
                            <div className="bg-white border border-[#e8eaed] rounded-lg overflow-hidden">
                              <div className="bg-[#f8f9fa] px-4 py-2 border-b border-[#e8eaed]">
                                <div className="text-xs text-[#5f6368] font-medium">Output:</div>
                              </div>
                              <div className="p-4 text-sm text-[#202124] max-w-none max-h-96 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    h1: (props) => <h2 {...props} className="text-lg font-semibold mb-2" />,
                                    h2: (props) => <h3 {...props} className="text-base font-semibold mb-1" />,
                                    p: (props) => <p {...props} className="mb-2 leading-relaxed" />,
                                    ul: (props) => <ul {...props} className="list-disc pl-5 space-y-1" />,
                                    ol: (props) => <ol {...props} className="list-decimal pl-5 space-y-1" />,
                                    li: (props) => <li {...props} className="leading-relaxed" />,
                                    code: (props) => <code {...props} className="bg-transparent p-0" />,
                                    pre: (props) => <div {...props} className="m-0" />,
                                    strong: (props) => <strong {...props} className="font-semibold" />,
                                  }}
                                >
                                  {cell.output}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Add Cell Button - Colab style */}
                      <div className="flex justify-center py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" className="h-8 bg-white hover:bg-[#f8f9fa] border border-[#dadce0] text-[#5f6368] hover:text-[#1a73e8] rounded-full">
                              <Plus className="w-4 h-4 mr-1" />
                              Add Cell
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => addCell("natural_language", cell.id)}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Natural Language
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addCell("code", cell.id)}>
                              <Code className="w-4 h-4 mr-2" />
                              Code
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add First Cell Button - Colab style */}
            {cells.length === 0 && (
              <div className="text-center py-16">
                <div className="text-[#5f6368] mb-6 text-lg">Welcome to ntropiq Notebook</div>
                <div className="text-[#9aa0a6] mb-8">Start by adding your first cell</div>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => addCell("natural_language")} 
                    className="bg-[#1a73e8] hover:bg-[#1765cc] text-white rounded-full px-6"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Natural Language Cell
                  </Button>
                  <Button 
                    onClick={() => addCell("code")} 
                    variant="outline" 
                    className="border-[#1a73e8] text-[#1a73e8] hover:bg-[#e8f0fe] rounded-full px-6"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Code Cell
                  </Button>
                </div>
              </div>
            )}

            {/* Colab-style Floating Add Button */}
            <div className="fixed bottom-6 right-6 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-14 h-14 rounded-full bg-[#1a73e8] hover:bg-[#1765cc] text-white shadow-lg hover:shadow-xl transition-all">
                    <Plus className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => addCell("natural_language")}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Natural Language Cell
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addCell("code")}>
                    <Code className="w-4 h-4 mr-2" />
                    Add Code Cell
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename notebook</DialogTitle>
            <DialogDescription>
              Enter a new name for your notebook.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                placeholder="Enter notebook name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    confirmRename()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRename} className="bg-[#1a73e8] hover:bg-[#1765cc]">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete notebook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{notebookName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[#ea4335] hover:bg-[#d33b32]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
