"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Send, Plus, MessageSquare, User, Bot, Menu, ChevronDown, BookOpen, MoreVertical, Edit3, Bookmark, BookmarkCheck, Trash2, Star, Upload, Database, Cloud, Server, FileText, BarChart3, Globe, Settings, Key, Lock, X, Mic, Volume2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
// Remove direct import since we'll use API routes

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

type ArtifactType = "code" | "image" | "table"

interface Artifact {
  id: string
  type: ArtifactType
  label: string
  content: string
}

interface ChatRecord {
  id: string
  name: string
  isBookmarked: boolean
  updatedAt: number
  messages: Message[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your ntropiq AI assistant. I can help you with data analytics, machine learning models, and insights from your data. How can I assist you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Artifacts state
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [isArtifactsOpen, setIsArtifactsOpen] = useState(false)
  // Voice input
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<any>(null)
  // Voice output per message
  const [audioSrcById, setAudioSrcById] = useState<Record<string, string>>({})
  const [isPlayingById, setIsPlayingById] = useState<Record<string, boolean>>({})
  const audioRefById = useRef<Record<string, HTMLAudioElement | null>>({})
  const [voiceMode, setVoiceMode] = useState<boolean>(false)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const voiceBufferRef = useRef<string>("")
  const interimBufferRef = useRef<string>("")

  // Chat management state
  const [chatName, setChatName] = useState("Analytics Chat")
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Data upload and connection state
  const [dataSourcesOpen, setDataSourcesOpen] = useState(false)
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [dataSourceConfig, setDataSourceConfig] = useState<Record<string, string>>({})

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Data sources configuration
  const dataSources = [
    {
      id: 'file-upload',
      name: 'Upload Files',
      description: 'Upload CSV, JSON, Excel files',
      icon: Upload,
      category: 'Files',
      fields: []
    },
    {
      id: 'mysql',
      name: 'MySQL Database',
      description: 'Connect to MySQL database',
      icon: Database,
      category: 'Databases',
      fields: [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost or IP address' },
        { name: 'port', label: 'Port', type: 'number', placeholder: '3306' },
        { name: 'database', label: 'Database Name', type: 'text', placeholder: 'my_database' },
        { name: 'username', label: 'Username', type: 'text', placeholder: 'root' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'password' }
      ]
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      description: 'Connect to PostgreSQL database',
      icon: Database,
      category: 'Databases',
      fields: [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost' },
        { name: 'port', label: 'Port', type: 'number', placeholder: '5432' },
        { name: 'database', label: 'Database Name', type: 'text', placeholder: 'postgres' },
        { name: 'username', label: 'Username', type: 'text', placeholder: 'postgres' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'password' }
      ]
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      description: 'Connect to MongoDB database',
      icon: Database,
      category: 'Databases',
      fields: [
        { name: 'connectionString', label: 'Connection String', type: 'text', placeholder: 'mongodb://localhost:27017/database' },
        { name: 'database', label: 'Database Name', type: 'text', placeholder: 'my_database' },
        { name: 'collection', label: 'Collection Name', type: 'text', placeholder: 'my_collection' }
      ]
    },
    {
      id: 'aws-s3',
      name: 'AWS S3',
      description: 'Connect to Amazon S3 bucket',
      icon: Cloud,
      category: 'Cloud Storage',
      fields: [
        { name: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: 'Your AWS Access Key' },
        { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: 'Your AWS Secret Key' },
        { name: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1' },
        { name: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket' }
      ]
    },
    {
      id: 'google-cloud',
      name: 'Google Cloud Storage',
      description: 'Connect to Google Cloud Storage',
      icon: Cloud,
      category: 'Cloud Storage',
      fields: [
        { name: 'projectId', label: 'Project ID', type: 'text', placeholder: 'my-project-id' },
        { name: 'keyFile', label: 'Service Account Key (JSON)', type: 'textarea', placeholder: 'Paste your service account JSON key' },
        { name: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket' }
      ]
    },
    {
      id: 'bigquery',
      name: 'Google BigQuery',
      description: 'Connect to Google BigQuery',
      icon: BarChart3,
      category: 'Data Warehouses',
      fields: [
        { name: 'projectId', label: 'Project ID', type: 'text', placeholder: 'my-project-id' },
        { name: 'keyFile', label: 'Service Account Key (JSON)', type: 'textarea', placeholder: 'Paste your service account JSON key' },
        { name: 'dataset', label: 'Dataset ID', type: 'text', placeholder: 'my_dataset' }
      ]
    },
    {
      id: 'snowflake',
      name: 'Snowflake',
      description: 'Connect to Snowflake data warehouse',
      icon: Database,
      category: 'Data Warehouses',
      fields: [
        { name: 'account', label: 'Account', type: 'text', placeholder: 'your-account.snowflakecomputing.com' },
        { name: 'username', label: 'Username', type: 'text', placeholder: 'your-username' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'your-password' },
        { name: 'warehouse', label: 'Warehouse', type: 'text', placeholder: 'COMPUTE_WH' },
        { name: 'database', label: 'Database', type: 'text', placeholder: 'MY_DATABASE' },
        { name: 'schema', label: 'Schema', type: 'text', placeholder: 'PUBLIC' }
      ]
    },
    {
      id: 'api-rest',
      name: 'REST API',
      description: 'Connect to REST API endpoints',
      icon: Globe,
      category: 'APIs',
      fields: [
        { name: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://api.example.com' },
        { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your API key' },
        { name: 'authType', label: 'Authentication Type', type: 'select', options: ['None', 'API Key', 'Bearer Token', 'Basic Auth'] },
        { name: 'endpoints', label: 'Endpoints', type: 'textarea', placeholder: 'List of endpoints to fetch data from' }
      ]
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Connect to Salesforce CRM',
      icon: Cloud,
      category: 'CRM & Business',
      fields: [
        { name: 'username', label: 'Username', type: 'text', placeholder: 'your-email@domain.com' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'your-password' },
        { name: 'securityToken', label: 'Security Token', type: 'password', placeholder: 'your-security-token' },
        { name: 'isSandbox', label: 'Sandbox', type: 'checkbox', placeholder: 'Check if using sandbox' }
      ]
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Connect to Google Analytics',
      icon: BarChart3,
      category: 'Analytics',
      fields: [
        { name: 'viewId', label: 'View ID', type: 'text', placeholder: 'Your GA View ID' },
        { name: 'keyFile', label: 'Service Account Key (JSON)', type: 'textarea', placeholder: 'Paste your service account JSON key' },
        { name: 'startDate', label: 'Start Date', type: 'date', placeholder: 'YYYY-MM-DD' },
        { name: 'endDate', label: 'End Date', type: 'date', placeholder: 'YYYY-MM-DD' }
      ]
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Connect to HubSpot CRM',
      icon: Cloud,
      category: 'CRM & Business',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your HubSpot API key' },
        { name: 'portalId', label: 'Portal ID', type: 'text', placeholder: 'Your HubSpot Portal ID' }
      ]
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Connect to Google Sheets',
      icon: FileText,
      category: 'Cloud Storage',
      fields: [
        { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'Your Google Sheets ID' },
        { name: 'keyFile', label: 'Service Account Key (JSON)', type: 'textarea', placeholder: 'Paste your service account JSON key' },
        { name: 'range', label: 'Range', type: 'text', placeholder: 'A1:Z1000' }
      ]
    },
    {
      id: 'redshift',
      name: 'Amazon Redshift',
      description: 'Connect to Amazon Redshift',
      icon: BarChart3,
      category: 'Data Warehouses',
      fields: [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'your-cluster.redshift.amazonaws.com' },
        { name: 'port', label: 'Port', type: 'number', placeholder: '5439' },
        { name: 'database', label: 'Database', type: 'text', placeholder: 'your_database' },
        { name: 'username', label: 'Username', type: 'text', placeholder: 'your_username' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'your_password' }
      ]
    },
    {
      id: 'aws-athena',
      name: 'Amazon Athena',
      description: 'Connect to Amazon Athena',
      icon: Cloud,
      category: 'Data Warehouses',
      fields: [
        { name: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: 'Your AWS Access Key' },
        { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: 'Your AWS Secret Key' },
        { name: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1' },
        { name: 'database', label: 'Database', type: 'text', placeholder: 'your_database' },
        { name: 's3OutputLocation', label: 'S3 Output Location', type: 'text', placeholder: 's3://your-bucket/path/' }
      ]
    },
    {
      id: 'sql-server',
      name: 'Microsoft SQL Server',
      description: 'Connect to SQL Server',
      icon: Server,
      category: 'Databases',
      fields: [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost or server name' },
        { name: 'port', label: 'Port', type: 'number', placeholder: '1433' },
        { name: 'database', label: 'Database', type: 'text', placeholder: 'your_database' },
        { name: 'username', label: 'Username', type: 'text', placeholder: 'sa' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'your_password' }
      ]
    },
    {
      id: 'mariadb',
      name: 'MariaDB',
      description: 'Connect to MariaDB',
      icon: Database,
      category: 'Databases',
      fields: [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost' },
        { name: 'port', label: 'Port', type: 'number', placeholder: '3306' },
        { name: 'database', label: 'Database', type: 'text', placeholder: 'your_database' },
        { name: 'username', label: 'Username', type: 'text', placeholder: 'root' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'your_password' }
      ]
    },
    {
      id: 'oracle',
      name: 'Oracle Database',
      description: 'Connect to Oracle Database',
      icon: Database,
      category: 'Databases',
      fields: [
        { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost' },
        { name: 'port', label: 'Port', type: 'number', placeholder: '1521' },
        { name: 'serviceName', label: 'Service Name', type: 'text', placeholder: 'XE' },
        { name: 'username', label: 'Username', type: 'text', placeholder: 'system' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'your_password' }
      ]
    },
    {
      id: 'motherduck',
      name: 'MotherDuck',
      description: 'Connect to MotherDuck',
      icon: Database,
      category: 'Data Warehouses',
      fields: [
        { name: 'token', label: 'API Token', type: 'password', placeholder: 'Your MotherDuck token' },
        { name: 'database', label: 'Database', type: 'text', placeholder: 'your_database' }
      ]
    },
    {
      id: 'databricks',
      name: 'Databricks',
      description: 'Connect to Databricks',
      icon: BarChart3,
      category: 'Data Warehouses',
      fields: [
        { name: 'serverHostname', label: 'Server Hostname', type: 'text', placeholder: 'your-workspace.cloud.databricks.com' },
        { name: 'httpPath', label: 'HTTP Path', type: 'text', placeholder: '/sql/1.0/warehouses/...' },
        { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Your Databricks token' }
      ]
    },
    {
      id: 'airtable',
      name: 'Airtable',
      description: 'Connect to Airtable',
      icon: FileText,
      category: 'Cloud Storage',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Airtable API key' },
        { name: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX' },
        { name: 'tableName', label: 'Table Name', type: 'text', placeholder: 'Table 1' }
      ]
    },
    {
      id: 'custom',
      name: 'Custom Data Source',
      description: 'Set up a custom connection',
      icon: Settings,
      category: 'Custom',
      fields: [
        { name: 'connectionType', label: 'Connection Type', type: 'select', options: ['JDBC', 'ODBC', 'REST API', 'Other'] },
        { name: 'connectionString', label: 'Connection String/URL', type: 'text', placeholder: 'Your connection details' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe your data source' }
      ]
    }
  ]

  // Group data sources by category
  const groupedDataSources = dataSources.reduce((acc, source) => {
    if (!acc[source.category]) {
      acc[source.category] = []
    }
    acc[source.category].push(source)
    return acc
  }, {} as Record<string, typeof dataSources>)

  // Data source handlers
  const handleDataSourceSelect = (sourceId: string) => {
    const source = dataSources.find(s => s.id === sourceId)
    if (source) {
      setSelectedDataSource(sourceId)
      if (sourceId === 'file-upload') {
        // Trigger file upload
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
        input.accept = '.csv,.json,.xlsx,.xls'
        input.onchange = (e) => {
          const files = Array.from((e.target as HTMLInputElement).files || [])
          setUploadedFiles(prev => [...prev, ...files])
          // Add message about uploaded files
          const fileMessage: Message = {
            id: Date.now().toString(),
            content: `Files uploaded successfully: ${files.map(f => f.name).join(', ')}. I can now help you analyze this data. What would you like to explore?`,
            role: "assistant",
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, fileMessage])
        }
        input.click()
        setDataSourcesOpen(false)
      } else {
        setDataSourceConfig({})
        setConfigDialogOpen(true)
        setDataSourcesOpen(false)
      }
    }
  }

  const handleConfigSave = () => {
    const source = dataSources.find(s => s.id === selectedDataSource)
    if (source) {
      // Add message about successful connection
      const connectionMessage: Message = {
        id: Date.now().toString(),
        content: `Successfully connected to ${source.name}! I can now help you analyze data from this source. What insights would you like me to generate?`,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, connectionMessage])
      setConfigDialogOpen(false)
      setSelectedDataSource(null)
      setDataSourceConfig({})
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    const userInput = input.trim()
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Generate AI response using API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Extract artifacts and open panel
      const extracted = extractArtifacts(assistantMessage.content)
      setArtifacts(extracted)
      setIsArtifactsOpen(extracted.length > 0)

      // Speak the assistant response with ElevenLabs
      if (assistantMessage.content && assistantMessage.content.length < 1600) {
        speakResponse(assistantMessage.content, assistantMessage.id)
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm experiencing some technical difficulties right now. Please try your question again in a moment. If the problem persists, please check your internet connection or contact support.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  function extractArtifacts(text: string): Artifact[] {
    const found: Artifact[] = []
    const codeBlockRegex = /```([\w+-]*)\n([\s\S]*?)```/g
    let codeMatch
    let codeIndex = 1
    while ((codeMatch = codeBlockRegex.exec(text)) !== null) {
      const language = codeMatch[1] || "code"
      const code = codeMatch[2]
      found.push({
        id: `code-${Date.now()}-${codeIndex++}`,
        type: "code",
        label: language.toUpperCase(),
        content: code.trim(),
      })
    }

    const imageRegex = /!\[[^\]]*\]\((https?:[^)]+)\)/g
    let imgMatch
    let imgIndex = 1
    while ((imgMatch = imageRegex.exec(text)) !== null) {
      found.push({
        id: `img-${Date.now()}-${imgIndex++}`,
        type: "image",
        label: "Image",
        content: imgMatch[1],
      })
    }

    const hasTable = /\n\|[^\n]*\|\n\|\s*[-:]+/.test(text)
    if (hasTable) {
      const tableMatch = text.match(/(\n\|[\s\S]*?(?:\n\n|$))/)
      if (tableMatch) {
        found.push({
          id: `table-${Date.now()}`,
          type: "table",
          label: "Table",
          content: tableMatch[1].trim(),
        })
      }
    }

    return found
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  // Initialize speech recognition if available
  useEffect(() => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (SR) {
      const rec = new SR()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'
      rec.onresult = (event: any) => {
        let final = ''
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) final += transcript
          else interim += transcript
        }
        if (voiceMode) {
          if (final) {
            voiceBufferRef.current = (voiceBufferRef.current ? voiceBufferRef.current + ' ' : '') + final.trim()
          }
          interimBufferRef.current = interim.trim()
          const combined = (voiceBufferRef.current + ' ' + interimBufferRef.current).trim()
          if (combined) setInput(combined)
          // reset 3s silence timer on any result
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = setTimeout(() => {
            const textToSend = (voiceBufferRef.current || combined).trim()
            if (textToSend) {
              setInput(textToSend)
              voiceBufferRef.current = ''
              interimBufferRef.current = ''
              // stop listening during request
              try { recognitionRef.current?.stop() } catch {}
              setIsRecording(false)
              const fakeEvent = { preventDefault: () => {} } as any
              handleSubmit(fakeEvent)
              // resume after short delay if still in voice mode
              setTimeout(() => { if (voiceMode) startListening() }, 600)
            }
          }, 3000)
        } else if (final) {
          setInput(prev => (prev ? prev + ' ' : '') + final.trim())
        }
      }
      rec.onend = () => setIsRecording(false)
      recognitionRef.current = rec
    }
  }, [])

  const startListening = () => {
    const rec = recognitionRef.current
    if (!rec) return
    try {
      voiceBufferRef.current = ''
      interimBufferRef.current = ''
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'
      rec.start()
      setIsRecording(true)
    } catch {}
  }

  const stopListening = () => {
    try { recognitionRef.current?.stop() } catch {}
    setIsRecording(false)
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
  }

  // Auto start/stop when toggling voice mode
  useEffect(() => {
    if (voiceMode) startListening()
    else stopListening()
    // cleanup on unmount
    return () => stopListening()
  }, [voiceMode])

  const toggleMic = () => {
    const rec = recognitionRef.current
    if (!rec) {
      alert('Speech recognition is not supported in this browser.')
      return
    }
    if (isRecording) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Play assistant responses via ElevenLabs TTS
  const speakResponse = async (text: string, messageId?: string) => {
    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      if (messageId) {
        setAudioSrcById(prev => ({ ...prev, [messageId]: url }))
      }
      const audio = new Audio(url)
      audioRefById.current[messageId || 'latest'] = audio
      setIsPlayingById(prev => ({ ...prev, [messageId || 'latest']: true }))
      audio.onended = () => setIsPlayingById(prev => ({ ...prev, [messageId || 'latest']: false }))
      audio.onerror = () => setIsPlayingById(prev => ({ ...prev, [messageId || 'latest']: false }))
      await audio.play()
    } catch (e) {
      console.error('TTS playback error', e)
    }
  }

  // Chat management functions
  const handleRename = () => {
    setNewName(chatName)
    setRenameDialogOpen(true)
  }

  const confirmRename = () => {
    if (newName.trim()) {
      setChatName(newName.trim())
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
    // In a real app, this would delete the chat from the backend
    console.log("Chat deleted")
    setDeleteDialogOpen(false)
    // Redirect to home or create new chat
    setMessages([{
      id: "1",
      content: "Hello! I'm your ntropiq AI assistant. I can help you with data analytics, machine learning models, and insights from your data. How can I assist you today?",
      role: "assistant",
      timestamp: new Date(),
    }])
    setChatName("New Chat")
  }

  // Persist/Load chat
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    // Load last chat
    const savedId = localStorage.getItem('ntropiq:lastChatId')
    const chatsRaw = localStorage.getItem('ntropiq:chats')
    if (chatsRaw) {
      const chats: ChatRecord[] = JSON.parse(chatsRaw)
      const current = savedId ? chats.find(c => c.id === savedId) : chats[0]
      if (current) {
        setChatName(current.name)
        setIsBookmarked(current.isBookmarked)
        setMessages(current.messages.map(m => ({...m, timestamp: new Date(m.timestamp)})))
      }
    }
  }, [])

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    const id = localStorage.getItem('ntropiq:lastChatId') || Date.now().toString()
    localStorage.setItem('ntropiq:lastChatId', id)
    const chatsRaw = localStorage.getItem('ntropiq:chats')
    let chats: ChatRecord[] = chatsRaw ? JSON.parse(chatsRaw) : []
    const existingIndex = chats.findIndex(c => c.id === id)
    const record: ChatRecord = {
      id,
      name: chatName,
      isBookmarked,
      updatedAt: Date.now(),
      messages,
    }
    if (existingIndex >= 0) chats[existingIndex] = record
    else chats.unshift(record)
    localStorage.setItem('ntropiq:chats', JSON.stringify(chats))
  }, [chatName, isBookmarked, messages])

  return (
    <div className="h-screen flex bg-[#fafafa] font-sans">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden bg-white border-r border-[#e5e5e5] flex flex-col`}>
        <div className="p-4 border-b border-[#e5e5e5]">
          <Link href="/" className="flex items-center gap-3 mb-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-uuY7YmId8tYIqbTx5mQN3jHsVvVQtk.webp"
              alt="ntropiq logo"
              width="24"
              height="24"
              className="object-contain"
            />
            <span className="text-xl font-semibold text-[#1a1a1a]">ntropiq</span>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full justify-between gap-2 bg-[#1a1a1a] text-white hover:bg-[#333]">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem 
                onClick={() => setMessages([{
                  id: "1",
                  content: "Hello! I'm your ntropiq AI assistant. I can help you with data analytics, machine learning models, and insights from your data. How can I assist you today?",
                  role: "assistant",
                  timestamp: new Date(),
                }])}
                className="cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                New Chat
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/notebook" className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  New Notebook
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium text-[#666] uppercase tracking-wide mb-3">
                Bookmarked Chats
              </div>
              <div id="bookmarked-chats" className="space-y-1 text-sm">
                {typeof window !== 'undefined' && (JSON.parse(localStorage.getItem('ntropiq:chats') || '[]') as ChatRecord[])
                  .filter(c => c.isBookmarked)
                  .sort((a,b)=>b.updatedAt-a.updatedAt)
                  .map(c => (
                    <button key={c.id} className="w-full text-left px-2 py-1 rounded hover:bg-[#f5f5f5]" onClick={()=>{
                      localStorage.setItem('ntropiq:lastChatId', c.id)
                      window.location.reload()
                    }}>
                      {c.name}
                    </button>
                  ))
                }
                {typeof window !== 'undefined' && ((JSON.parse(localStorage.getItem('ntropiq:chats') || '[]') as ChatRecord[]).filter(c=>c.isBookmarked).length===0) && (
                  <div className="text-xs text-[#999] italic">No bookmarked chats yet</div>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-[#666] uppercase tracking-wide mb-3">
                Recent Chats
              </div>
              <div id="recent-chats" className="space-y-1 text-sm">
                {typeof window !== 'undefined' && (JSON.parse(localStorage.getItem('ntropiq:chats') || '[]') as ChatRecord[])
                  .sort((a,b)=>b.updatedAt-a.updatedAt)
                  .slice(0,20)
                  .map(c => (
                    <button key={c.id} className="w-full text-left px-2 py-1 rounded hover:bg-[#f5f5f5]" onClick={()=>{
                      localStorage.setItem('ntropiq:lastChatId', c.id)
                      window.location.reload()
                    }}>
                      {c.name}
                    </button>
                  ))
                }
                {typeof window !== 'undefined' && ((JSON.parse(localStorage.getItem('ntropiq:chats') || '[]') as ChatRecord[]).length===0) && (
                  <div className="text-xs text-[#999] italic">No recent chats</div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-[#e5e5e5]">
          <div className="flex items-center gap-2 text-sm text-[#666]">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="gradient-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4a4a4a" />
                    <stop offset="50%" stopColor="#2a2a2a" />
                    <stop offset="100%" stopColor="#1a1a1a" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="16" fill="url(#gradient-sidebar)" />
                <text x="16" y="20" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui">N</text>
              </svg>
            </div>
            <span>Enterprise User</span>
          </div>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={isArtifactsOpen ? 70 : 100} minSize={40}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white border-b border-[#e5e5e5] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-[#666] hover:text-[#1a1a1a]"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <div>
                    <h1 className="text-lg font-semibold text-[#1a1a1a]">{chatName}</h1>
                    <p className="text-sm text-[#666]">Analytics & ML Assistant</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleBookmark}
                    className="w-8 h-8 text-[#666] hover:text-[#1a1a1a] rounded-full"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-[#1a1a1a]" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-[#666] hover:text-[#1a1a1a] rounded-full"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={handleRename}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Rename chat
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
                            Bookmark chat
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDelete} className="text-[#ea4335] focus:text-[#ea4335]">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <Link href="/" className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">
                Back to Home
              </Link>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-6">
              <div className="max-w-3xl mx-auto py-6 space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      {message.role === "user" ? (
                        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <defs>
                              <linearGradient id="gradient-message" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4a4a4a" />
                                <stop offset="50%" stopColor="#2a2a2a" />
                                <stop offset="100%" stopColor="#1a1a1a" />
                              </linearGradient>
                            </defs>
                            <circle cx="16" cy="16" r="16" fill="url(#gradient-message)" />
                            <text x="16" y="20" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui">N</text>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {message.role === "user" && (
                          <span className="text-sm font-medium text-[#1a1a1a]">You</span>
                        )}
                        <span className="text-xs text-[#666]">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="max-w-none">
                        {message.role === "user" ? (
                          <div className="text-[#1a1a1a] leading-relaxed whitespace-pre-wrap m-0 max-h-96 overflow-y-auto scroll-smooth border border-[#e5e5e5] rounded-lg p-3 bg-[#f8f9fa] scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                            {message.content}
                          </div>
                        ) : (
                          <div className="text-[#1a1a1a] leading-relaxed m-0 max-h-96 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 font-normal">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: (props) => <h2 {...props} className="text-xl font-semibold" />,
                                h2: (props) => <h3 {...props} className="text-lg font-semibold" />,
                                h3: (props) => <h4 {...props} className="text-base font-semibold" />,
                                p: (props) => <p {...props} className="mb-2" />,
                                ul: (props) => <ul {...props} className="list-disc pl-5 space-y-1" />,
                                ol: (props) => <ol {...props} className="list-decimal pl-5 space-y-1" />,
                                li: (props) => <li {...props} className="leading-relaxed" />,
                                code: (props) => <code {...props} className="bg-transparent p-0" />,
                                pre: (props) => <pre {...props} className="m-0" />,
                                strong: (props) => <strong {...props} className="font-semibold" />,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                            <div className="mt-2">
                              <button
                                className={`p-1 rounded border ${isPlayingById[message.id] ? 'bg-[#16a34a] text-white border-[#16a34a] animate-pulse' : 'bg-white text-[#666] border-[#e5e5e5] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]'}`}
                                onClick={() => speakResponse(message.content, message.id)}
                                aria-label="Play audio"
                                title="Play audio"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                          <defs>
                            <linearGradient id="gradient-typing" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#4a4a4a" />
                              <stop offset="50%" stopColor="#2a2a2a" />
                              <stop offset="100%" stopColor="#1a1a1a" />
                            </linearGradient>
                          </defs>
                          <circle cx="16" cy="16" r="16" fill="url(#gradient-typing)" />
                          <text x="16" y="20" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui">N</text>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-[#666]">typing...</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="bg-white border-t border-[#e5e5e5] p-4">
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="relative">
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => setDataSourcesOpen(true)}
                    className="absolute left-3 bottom-3 h-8 w-8 bg-transparent hover:bg-[#f5f5f5] border border-[#e5e5e5] text-[#666] hover:text-[#1a1a1a] z-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about your data, analytics, or ML models..."
                    className="min-h-[100px] max-h-[300px] resize-none pr-12 pb-14 bg-[#fafafa] border-[#e5e5e5] focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] text-[#1a1a1a] placeholder:text-[#666] text-left placeholder:text-left"
                    style={{ 
                      height: 'auto',
                      paddingTop: '23px',
                      paddingLeft: '12px',
                      lineHeight: '1.5'
                    }}
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      onClick={toggleMic}
                      className={`h-8 w-8 ${isRecording ? 'bg-[#e11d48] hover:bg-[#b91c1c] text-white' : 'bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] text-[#666]'} `}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                    <button
                      type="button"
                      onClick={() => setVoiceMode(v => !v)}
                      aria-label="Toggle voice mode"
                      title={voiceMode ? 'Voice mode: on' : 'Voice mode: off'}
                      className={`h-8 w-8 rounded-full flex items-center justify-center border ${voiceMode ? 'bg-[#16a34a]/10 border-[#16a34a]/30' : 'bg-white border-[#e5e5e5] hover:bg-[#f5f5f5]'} `}
                    >
                      <div className={`flex gap-0.5 ${voiceMode ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]'}`}>
                        <span className="inline-block w-[2px] h-[10px] bg-current rounded-sm"></span>
                        <span className="inline-block w-[2px] h-[14px] bg-current rounded-sm"></span>
                        <span className="inline-block w-[2px] h-[8px] bg-current rounded-sm"></span>
                        <span className="inline-block w-[2px] h-[12px] bg-current rounded-sm"></span>
                      </div>
                    </button>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={(!input.trim() && !voiceMode) || isTyping}
                      className="h-8 w-8 bg-[#1a1a1a] hover:bg-[#333] disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
                <p className="text-xs text-[#666] mt-2 text-center">
                  ntropiq AI can make mistakes. Consider checking important information.
                </p>
              </div>
            </div>
          </div>
        </ResizablePanel>

        {isArtifactsOpen && (
          <>
            <ResizableHandle withHandle className="bg-[#e5e5e5]" />
            <ResizablePanel defaultSize={30} minSize={20} maxSize={60}>
              <div className="h-full flex flex-col border-l border-[#e5e5e5] bg-white">
                <div className="px-4 py-3 flex items-center justify-between border-b border-[#e5e5e5]">
                  <div className="text-sm font-medium text-[#1a1a1a]">Artifacts</div>
                  <button
                    onClick={() => setIsArtifactsOpen(false)}
                    className="text-[#666] hover:text-[#1a1a1a]"
                    aria-label="Close artifacts"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {artifacts.map((a) => (
                      <div key={a.id} className="border border-[#e5e5e5] rounded-md overflow-hidden">
                        <div className="px-3 py-2 text-xs font-medium bg-[#fafafa] text-[#666] border-b border-[#e5e5e5]">
                          {a.label}
                        </div>
                        <div className="p-3 text-sm">
                          {a.type === "code" && (
                            <pre className="whitespace-pre-wrap text-[#1a1a1a] text-xs leading-relaxed">
                              {a.content}
                            </pre>
                          )}
                          {a.type === "image" && (
                            <img src={a.content} alt={a.label} className="max-w-full rounded" />
                          )}
                          {a.type === "table" && (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {a.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    ))}
                    {artifacts.length === 0 && (
                      <div className="text-xs text-[#666]">No artifacts found.</div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
            <DialogDescription>
              Enter a new name for your chat session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chat-name" className="text-right">
                Name
              </Label>
              <Input
                id="chat-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                placeholder="Enter chat name"
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
            <Button onClick={confirmRename} className="bg-[#1a1a1a] hover:bg-[#333]">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{chatName}"? This action cannot be undone and all messages will be lost.
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

      {/* Data Sources Dialog */}
      <Dialog open={dataSourcesOpen} onOpenChange={setDataSourcesOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col p-0 gap-0 bg-white border-0 shadow-2xl">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-[#e5e5e5] flex-shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDataSourcesOpen(false)}
                className="h-8 w-8 text-[#4285f4] hover:text-[#3367d6] hover:bg-[#f8f9ff]"
              >
                ← Back
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-[#1f1f1f]">
                  Select the type of data source (1/2)
                </h2>
                <p className="text-sm text-[#666] mt-1">
                  Set up a new data source to connect to ntropiq.
                </p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
            <div className="p-6 space-y-6 pb-12">
              {/* Drag & Drop File Upload Area */}
              <div 
                className="border-2 border-dashed border-[#dadce0] rounded-lg p-8 text-center bg-[#fafbff] hover:bg-[#f8f9ff] transition-colors cursor-pointer"
                onClick={() => handleDataSourceSelect('file-upload')}
              >
                <div className="space-y-3">
                  <div className="text-[#666]">
                    Drag files here or{' '}
                    <span className="text-[#4285f4] hover:underline cursor-pointer">
                      browse files
                    </span>
                  </div>
                  <div className="flex justify-center gap-2">
                    <span className="px-2 py-1 bg-[#1f1f1f] text-white text-xs rounded">
                      .CSV
                    </span>
                    <span className="px-2 py-1 bg-[#1f1f1f] text-white text-xs rounded">
                      .TXT
                    </span>
                    <span className="px-2 py-1 bg-[#1f1f1f] text-white text-xs rounded">
                      .XLSX
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Sources Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Google Sheets */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('google-sheets')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#0f9d58] rounded flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">Google Sheets</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* PostgreSQL */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('postgresql')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#336791] rounded flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">PostgreSQL</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* MySQL */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('mysql')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#00758f] rounded flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">MySQL</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* Redshift */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('redshift')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#ff9900] rounded flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">Redshift</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* BigQuery */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('bigquery')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#4285f4] rounded flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">Google BigQuery</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* Amazon Athena */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('aws-athena')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#ff9900] rounded flex items-center justify-center">
                      <Cloud className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">Amazon Athena</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* SQL Server */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('sql-server')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#cc2927] rounded flex items-center justify-center">
                      <Server className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">Microsoft SQL Server</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* MariaDB */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('mariadb')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#003545] rounded flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">MariaDB</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* Oracle */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('oracle')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#f80000] rounded flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">Oracle Database</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* Snowflake */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('snowflake')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#29b5e8] rounded flex items-center justify-center">
                      <Cloud className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">Snowflake</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* MotherDuck */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('motherduck')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#ff6b35] rounded flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">MotherDuck</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* Databricks */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('databricks')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#ff3621] rounded flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">Databricks</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* MongoDB */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('mongodb')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#47a248] rounded flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">MongoDB</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* Airtable */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('airtable')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#18bfff] rounded flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">Airtable</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>

                {/* Not finding your data source */}
                <Button
                  variant="outline"
                  onClick={() => handleDataSourceSelect('custom')}
                  className="h-16 justify-start text-left hover:bg-[#f8f9fa] border-[#e5e5e5] p-4 col-span-2"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#9aa0a6] rounded flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#1f1f1f]">Not finding your data source?</span>
                    <div className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-[#666] rotate-[-90deg]" />
                    </div>
                  </div>
                </Button>
              </div>

              {/* Browse Sample Data Sources */}
              <div className="border border-[#e5e5e5] rounded-lg p-4 bg-[#fafbff] mx-0">
                <Button
                  variant="ghost"
                  onClick={() => {
                    // Handle browse sample data sources
                    console.log('Browse sample data sources clicked')
                  }}
                  className="w-full justify-center text-[#4285f4] hover:text-[#3367d6] hover:bg-[#f8f9ff] font-medium py-3"
                >
                  Browse sample data sources →
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Data Source Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Configure {dataSources.find(s => s.id === selectedDataSource)?.name}
            </DialogTitle>
            <DialogDescription>
              Enter the connection details for your data source.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {dataSources
                .find(s => s.id === selectedDataSource)
                ?.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="text-sm font-medium">
                      {field.label}
                    </Label>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={field.name}
                        placeholder={field.placeholder}
                        value={dataSourceConfig[field.name] || ''}
                        onChange={(e) => 
                          setDataSourceConfig(prev => ({
                            ...prev,
                            [field.name]: e.target.value
                          }))
                        }
                        className="w-full min-h-[100px] px-3 py-2 border border-[#e5e5e5] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] focus:border-[#1a1a1a] resize-vertical"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        id={field.name}
                        value={dataSourceConfig[field.name] || ''}
                        onChange={(e) => 
                          setDataSourceConfig(prev => ({
                            ...prev,
                            [field.name]: e.target.value
                          }))
                        }
                        className="w-full px-3 py-2 border border-[#e5e5e5] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] focus:border-[#1a1a1a]"
                      >
                        <option value="">Select an option</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={field.name}
                          checked={dataSourceConfig[field.name] === 'true'}
                          onChange={(e) => 
                            setDataSourceConfig(prev => ({
                              ...prev,
                              [field.name]: e.target.checked ? 'true' : 'false'
                            }))
                          }
                          className="rounded border-[#e5e5e5] text-[#1a1a1a] focus:ring-[#1a1a1a]"
                        />
                        <label htmlFor={field.name} className="text-sm text-[#666]">
                          {field.placeholder}
                        </label>
                      </div>
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={dataSourceConfig[field.name] || ''}
                        onChange={(e) => 
                          setDataSourceConfig(prev => ({
                            ...prev,
                            [field.name]: e.target.value
                          }))
                        }
                        className="border-[#e5e5e5] focus:border-[#1a1a1a] focus:ring-[#1a1a1a]"
                      />
                    )}
                  </div>
                ))}
            </div>
          </ScrollArea>
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setConfigDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfigSave}
              className="bg-[#1a1a1a] hover:bg-[#333]"
            >
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
