'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { UpgradePrompt } from '@/components/upgrade/UpgradePrompt'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Copy, Heart, MessageSquare, Users, Grid, Clock, Star, Share2, MoreVertical, FolderOpen, Search, Edit2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface StickyNote {
  id: string
  content: string
  color: string
  x: number
  y: number
  sectionId: string | null
  createdAt: Date
}

interface BoardSection {
  id: string
  name: string
  color: string
  order: number
}

interface Collaborator {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: Date
}

interface Board {
  id: string
  name: string
  notes: StickyNote[]
  sections: BoardSection[]
  collaborators: Collaborator[]
  comments: Comment[]
  isFavorite: boolean
  isShared: boolean
  createdAt: Date
  updatedAt: Date
  thumbnail?: string
}

const COLORS = [
  '#fef08a', // yellow
  '#bfdbfe', // blue
  '#fecaca', // red
  '#bbf7d0', // green
  '#e9d5ff', // purple
  '#fed7aa', // orange
  '#fbcfe8', // pink
]

const SECTION_COLORS = [
  '#f3f4f6', // gray
  '#dbeafe', // blue
  '#fef3c7', // yellow
  '#d1fae5', // green
  '#fce7f3', // pink
]

type ViewMode = 'gallery' | 'board'
type CategoryFilter = 'all' | 'recent' | 'shared' | 'favorites'

export default function IdeasPage() {
  const { user, requiresUpgrade } = useAuth()
  const [boards, setBoards] = useState<Board[]>([])
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('gallery')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  // Note dialog
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  // Board dialogs
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [showRenameBoardDialog, setShowRenameBoardDialog] = useState(false)
  const [renameBoardName, setRenameBoardName] = useState('')
  const [isEditingBoardName, setIsEditingBoardName] = useState(false)
  const [tempBoardName, setTempBoardName] = useState('')

  // Section dialog
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [newSectionColor, setNewSectionColor] = useState(SECTION_COLORS[0])
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [tempSectionName, setTempSectionName] = useState('')

  // Collaborator dialog
  const [showCollaboratorDialog, setShowCollaboratorDialog] = useState(false)
  const [collaboratorEmail, setCollaboratorEmail] = useState('')
  const [collaboratorName, setCollaboratorName] = useState('')

  // Comment dialog
  const [showCommentsDialog, setShowCommentsDialog] = useState(false)
  const [newComment, setNewComment] = useState('')

  // Drag state
  const [draggedNote, setDraggedNote] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (user) {
      const storedBoards = localStorage.getItem(`ideas-boards-${user.uid}`)
      if (storedBoards) {
        const parsed = JSON.parse(storedBoards)
        const boardsWithDates = parsed.map((b: any) => ({
          ...b,
          notes: b.notes.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          })),
          comments: b.comments?.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
          })) || [],
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
        }))
        setBoards(boardsWithDates)
      } else {
        // Create default board
        const defaultBoard: Board = {
          id: Date.now().toString(),
          name: 'My First Board',
          notes: [],
          sections: [],
          collaborators: [],
          comments: [],
          isFavorite: false,
          isShared: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setBoards([defaultBoard])
        saveBoards([defaultBoard])
      }
    }
  }, [user])

  const saveBoards = (newBoards: Board[]) => {
    if (user) {
      localStorage.setItem(`ideas-boards-${user.uid}`, JSON.stringify(newBoards))
      setBoards(newBoards)
    }
  }

  const updateCurrentBoard = (updatedBoard: Board) => {
    const updatedBoards = boards.map(b =>
      b.id === updatedBoard.id ? { ...updatedBoard, updatedAt: new Date() } : b
    )
    saveBoards(updatedBoards)
    setCurrentBoard(updatedBoard)
  }

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return

    const newBoard: Board = {
      id: Date.now().toString(),
      name: newBoardName,
      notes: [],
      sections: [],
      collaborators: [],
      comments: [],
      isFavorite: false,
      isShared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    saveBoards([...boards, newBoard])
    setNewBoardName('')
    setShowNewBoardDialog(false)
  }

  const handleRenameBoard = () => {
    if (!renameBoardName.trim() || !currentBoard) return

    const updatedBoard = { ...currentBoard, name: renameBoardName, updatedAt: new Date() }
    updateCurrentBoard(updatedBoard)
    setRenameBoardName('')
    setShowRenameBoardDialog(false)
  }

  const handleCloneBoard = (board: Board) => {
    const clonedBoard: Board = {
      ...board,
      id: Date.now().toString(),
      name: `${board.name} (Copy)`,
      notes: board.notes.map(n => ({ ...n, id: `${Date.now()}-${Math.random()}` })),
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    saveBoards([...boards, clonedBoard])
  }

  const handleDeleteBoard = (boardId: string) => {
    if (confirm('Are you sure you want to delete this board?')) {
      const updatedBoards = boards.filter(b => b.id !== boardId)
      saveBoards(updatedBoards)
      if (currentBoard?.id === boardId) {
        setCurrentBoard(null)
        setViewMode('gallery')
      }
    }
  }

  const handleToggleFavorite = (boardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    const board = boards.find(b => b.id === boardId)
    const willBeFavorite = board ? !board.isFavorite : false

    const updatedBoards = boards.map(b =>
      b.id === boardId ? { ...b, isFavorite: !b.isFavorite } : b
    )
    saveBoards(updatedBoards)
    if (currentBoard?.id === boardId) {
      setCurrentBoard({ ...currentBoard, isFavorite: !currentBoard.isFavorite })
    }

    // Show notification
    setNotification(willBeFavorite ? 'Board added to favourites' : 'Board removed from favourites')
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCreateNote = () => {
    if (!noteContent.trim() || !currentBoard) return

    const newNote: StickyNote = {
      id: Date.now().toString(),
      content: noteContent,
      color: selectedColor,
      x: Math.random() * 60 + 10,
      y: Math.random() * 60 + 10,
      sectionId: selectedSection,
      createdAt: new Date(),
    }

    const updatedBoard = {
      ...currentBoard,
      notes: [...currentBoard.notes, newNote],
    }
    updateCurrentBoard(updatedBoard)
    setNoteContent('')
    setSelectedColor(COLORS[0])
    setSelectedSection(null)
    setShowNoteDialog(false)
  }

  const handleDeleteNote = (noteId: string) => {
    if (!currentBoard) return
    const updatedBoard = {
      ...currentBoard,
      notes: currentBoard.notes.filter(n => n.id !== noteId),
    }
    updateCurrentBoard(updatedBoard)
  }

  const handleCreateSection = () => {
    if (!newSectionName.trim() || !currentBoard) return

    const newSection: BoardSection = {
      id: Date.now().toString(),
      name: newSectionName,
      color: newSectionColor,
      order: currentBoard.sections.length,
    }

    const updatedBoard = {
      ...currentBoard,
      sections: [...currentBoard.sections, newSection],
    }
    updateCurrentBoard(updatedBoard)
    setNewSectionName('')
    setNewSectionColor(SECTION_COLORS[0])
    setShowSectionDialog(false)
  }

  const handleDeleteSection = (sectionId: string) => {
    if (!currentBoard) return
    if (confirm('Delete this section? Notes in this section will not be deleted.')) {
      const updatedBoard = {
        ...currentBoard,
        sections: currentBoard.sections.filter(s => s.id !== sectionId),
        notes: currentBoard.notes.map(n =>
          n.sectionId === sectionId ? { ...n, sectionId: null } : n
        ),
      }
      updateCurrentBoard(updatedBoard)
    }
  }

  const handleAddCollaborator = () => {
    if (!collaboratorEmail.trim() || !collaboratorName.trim() || !currentBoard) return

    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      name: collaboratorName,
      email: collaboratorEmail,
    }

    const updatedBoard = {
      ...currentBoard,
      collaborators: [...currentBoard.collaborators, newCollaborator],
      isShared: true,
    }
    updateCurrentBoard(updatedBoard)
    setCollaboratorEmail('')
    setCollaboratorName('')
    setShowCollaboratorDialog(false)
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !currentBoard || !user) return

    const comment: Comment = {
      id: Date.now().toString(),
      userId: user.uid,
      userName: `${user.firstName} ${user.lastName}`,
      content: newComment,
      createdAt: new Date(),
    }

    const updatedBoard = {
      ...currentBoard,
      comments: [...currentBoard.comments, comment],
    }
    updateCurrentBoard(updatedBoard)
    setNewComment('')
  }

  const handleMouseDown = (e: React.MouseEvent, noteId: string) => {
    const note = currentBoard?.notes.find(n => n.id === noteId)
    if (!note) return

    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setDraggedNote(noteId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNote || !currentBoard) return

    const container = e.currentTarget.getBoundingClientRect()
    const newX = ((e.clientX - container.left - dragOffset.x) / container.width) * 100
    const newY = ((e.clientY - container.top - dragOffset.y) / container.height) * 100

    const clampedX = Math.max(0, Math.min(95, newX))
    const clampedY = Math.max(0, Math.min(95, newY))

    const updatedNotes = currentBoard.notes.map(n =>
      n.id === draggedNote ? { ...n, x: clampedX, y: clampedY } : n
    )
    setCurrentBoard({ ...currentBoard, notes: updatedNotes })
  }

  const handleMouseUp = () => {
    if (draggedNote && currentBoard) {
      updateCurrentBoard(currentBoard)
    }
    setDraggedNote(null)
  }

  const getFilteredBoards = () => {
    let filtered = boards

    // Apply category filter
    switch (categoryFilter) {
      case 'favorites':
        filtered = filtered.filter(b => b.isFavorite)
        break
      case 'shared':
        filtered = filtered.filter(b => b.isShared)
        break
      case 'recent':
        filtered = [...filtered].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 10)
        break
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Show upgrade prompt if trial expired
  if (requiresUpgrade) {
    return <UpgradePrompt mode="page" />
  }

  // Gallery View
  if (viewMode === 'gallery') {
    const filteredBoards = getFilteredBoards()

    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 border-r bg-card p-4">
            <h2 className="text-2xl font-bold text-primary mb-6">Ideas</h2>

            <nav className="space-y-1">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  categoryFilter === 'all' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <Grid className="h-5 w-5" />
                <span>All Boards</span>
                <span className="ml-auto text-sm">{boards.length}</span>
              </button>

              <button
                onClick={() => setCategoryFilter('recent')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  categoryFilter === 'recent' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <Clock className="h-5 w-5" />
                <span>Recents</span>
              </button>

              <button
                onClick={() => setCategoryFilter('shared')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  categoryFilter === 'shared' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <Share2 className="h-5 w-5" />
                <span>Shared</span>
                <span className="ml-auto text-sm">{boards.filter(b => b.isShared).length}</span>
              </button>

              <button
                onClick={() => setCategoryFilter('favorites')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  categoryFilter === 'favorites' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <Heart className="h-5 w-5" />
                <span>Favorites</span>
                <span className="ml-auto text-sm">{boards.filter(b => b.isFavorite).length}</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-3">
                    {categoryFilter === 'all' && 'All Boards'}
                    {categoryFilter === 'recent' && 'Recent Boards'}
                    {categoryFilter === 'shared' && 'Shared Boards'}
                    {categoryFilter === 'favorites' && 'Favorite Boards'}
                  </h1>
                  <p className="text-muted-foreground mb-4">{filteredBoards.length} boards</p>
                  <div className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-lg max-w-2xl">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      💡 Create new boards to organize your ideas, projects, and brainstorming sessions. Each board is a blank canvas for your creativity.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search boards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64 bg-background border-input"
                    />
                  </div>
                  <Button onClick={() => setShowNewBoardDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Board
                  </Button>
                </div>
              </div>

              {/* Board Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBoards.map(board => (
                  <div
                    key={board.id}
                    className="group relative bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setCurrentBoard(board)
                      setViewMode('board')
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg overflow-hidden">
                      {board.notes.length > 0 ? (
                        <div className="absolute inset-0 p-4">
                          {board.notes.slice(0, 6).map((note, idx) => (
                            <div
                              key={note.id}
                              className="absolute text-xs p-2 rounded shadow-sm"
                              style={{
                                backgroundColor: note.color,
                                left: `${10 + (idx % 3) * 30}%`,
                                top: `${10 + Math.floor(idx / 3) * 45}%`,
                                width: '25%',
                                fontSize: '8px',
                              }}
                            >
                              {note.content.substring(0, 20)}...
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                          <FolderOpen className="h-12 w-12" />
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => handleToggleFavorite(board.id, e)}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover:scale-110"
                      >
                        <Heart className={`h-5 w-5 ${board.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground line-clamp-1">{board.name}</h3>

                        <DropdownMenu>
                          <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              setCurrentBoard(board)
                              setViewMode('board')
                            }}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              handleToggleFavorite(board.id)
                            }}>
                              <Heart className="h-4 w-4 mr-2" />
                              {board.isFavorite ? 'Unfavorite' : 'Favorite'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              setCurrentBoard(board)
                              setRenameBoardName(board.name)
                              setShowRenameBoardDialog(true)
                            }}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              handleCloneBoard(board)
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Clone
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteBoard(board.id)
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{formatDate(board.updatedAt)}</p>

                      {/* Collaborators */}
                      <div className="flex items-center gap-2">
                        {user && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground">
                            {user.firstName?.[0] || 'U'}
                          </div>
                        )}
                        {board.collaborators.slice(0, 3).map(collab => (
                          <div
                            key={collab.id}
                            className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs"
                            title={collab.name}
                          >
                            {collab.name[0]}
                          </div>
                        ))}
                        {board.collaborators.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                            +{board.collaborators.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBoards.length === 0 && (
                <div className="text-center py-20">
                  <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold mb-2">No boards found</p>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? 'Try a different search term' : 'Create your first board to get started'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowNewBoardDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Board
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Board Dialog */}
        <Dialog open={showNewBoardDialog} onOpenChange={setShowNewBoardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Board Name</Label>
                <Input
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="e.g., Marketing Ideas, Product Features"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewBoardDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBoard}>
                  Create Board
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notification Toast */}
        {notification && (
          <div className="fixed bottom-6 right-6 bg-card border shadow-lg rounded-lg p-4 animate-in slide-in-from-bottom-5 z-50">
            <p className="text-sm font-medium">{notification}</p>
          </div>
        )}
      </div>
    )
  }

  // Board View
  if (!currentBoard) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setViewMode('gallery')}
                className="gap-2"
              >
                <Grid className="h-4 w-4" />
                All Boards
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  {isEditingBoardName ? (
                    <Input
                      value={tempBoardName}
                      onChange={(e) => setTempBoardName(e.target.value)}
                      onBlur={() => {
                        if (tempBoardName.trim() && tempBoardName !== currentBoard.name) {
                          const updatedBoard = { ...currentBoard, name: tempBoardName, updatedAt: new Date() }
                          updateCurrentBoard(updatedBoard)
                        }
                        setIsEditingBoardName(false)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (tempBoardName.trim() && tempBoardName !== currentBoard.name) {
                            const updatedBoard = { ...currentBoard, name: tempBoardName, updatedAt: new Date() }
                            updateCurrentBoard(updatedBoard)
                          }
                          setIsEditingBoardName(false)
                        } else if (e.key === 'Escape') {
                          setIsEditingBoardName(false)
                        }
                      }}
                      autoFocus
                      className="text-2xl font-bold h-auto px-2 py-1"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-foreground">{currentBoard.name}</h1>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setTempBoardName(currentBoard.name)
                      setIsEditingBoardName(true)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleFavorite(currentBoard.id)}
                  >
                    <Heart className={`h-5 w-5 ${currentBoard.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Last updated {formatDate(currentBoard.updatedAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setShowCollaboratorDialog(true)}>
                <Users className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={() => setShowCommentsDialog(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments ({currentBoard.comments.length})
              </Button>
              <Button variant="outline" onClick={() => setShowSectionDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
              <Button onClick={() => setShowNoteDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>
        </div>
        {/* Helper text banner */}
        <div className="bg-muted/30 border-t border-border/50">
          <div className="container mx-auto px-4 py-3">
            <p className="text-sm text-primary/70 flex items-center gap-2">
              <span>💡</span>
              <span className="leading-relaxed">Click 'Add Note' to create sticky notes. Drag and drop notes to organize them. Create sections to group related ideas together.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Board Canvas */}
      <div className="container mx-auto px-4 py-4">
        <div
          className="relative bg-card rounded-lg border overflow-hidden"
          style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Sections */}
          {currentBoard.sections.length > 0 && (
            <div className="absolute inset-0 flex" style={{ pointerEvents: 'none' }}>
              {currentBoard.sections.map(section => (
                <div
                  key={section.id}
                  className="flex-1 border-r last:border-r-0 p-4"
                  style={{ backgroundColor: section.color, pointerEvents: 'auto' }}
                >
                  <div className="flex items-center justify-between mb-4 gap-2">
                    {editingSectionId === section.id ? (
                      <Input
                        value={tempSectionName}
                        onChange={(e) => setTempSectionName(e.target.value)}
                        onBlur={() => {
                          if (tempSectionName.trim() && tempSectionName !== section.name) {
                            const updatedBoard = {
                              ...currentBoard,
                              sections: currentBoard.sections.map(s =>
                                s.id === section.id ? { ...s, name: tempSectionName } : s
                              ),
                            }
                            updateCurrentBoard(updatedBoard)
                          }
                          setEditingSectionId(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (tempSectionName.trim() && tempSectionName !== section.name) {
                              const updatedBoard = {
                                ...currentBoard,
                                sections: currentBoard.sections.map(s =>
                                  s.id === section.id ? { ...s, name: tempSectionName } : s
                                ),
                              }
                              updateCurrentBoard(updatedBoard)
                            }
                            setEditingSectionId(null)
                          } else if (e.key === 'Escape') {
                            setEditingSectionId(null)
                          }
                        }}
                        autoFocus
                        className="text-sm font-semibold h-7 px-2 py-1"
                      />
                    ) : (
                      <h3 className="font-semibold text-sm text-foreground flex-1">{section.name}</h3>
                    )}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setTempSectionName(section.name)
                          setEditingSectionId(section.id)
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {currentBoard.notes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
              <p className="text-lg">Click "Add Note" to get started</p>
            </div>
          )}

          {currentBoard.notes.map(note => (
            <div
              key={note.id}
              className="absolute cursor-move select-none"
              style={{
                left: `${note.x}%`,
                top: `${note.y}%`,
                backgroundColor: note.color,
                width: '200px',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: draggedNote === note.id ? 1000 : 1,
              }}
              onMouseDown={(e) => handleMouseDown(e, note.id)}
            >
              <div className="flex justify-end mb-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteNote(note.id)
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Sticky Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Note Content</Label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your idea..."
                rows={4}
              />
            </div>

            {currentBoard.sections.length > 0 && (
              <div className="space-y-2">
                <Label>Section (Optional)</Label>
                <select
                  value={selectedSection || ''}
                  onChange={(e) => setSelectedSection(e.target.value || null)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">No section</option>
                  {currentBoard.sections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      selectedColor === color ? 'border-primary scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNote}>
                Create Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Board Dialog */}
      <Dialog open={showRenameBoardDialog} onOpenChange={setShowRenameBoardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Board Name</Label>
              <Input
                value={renameBoardName}
                onChange={(e) => setRenameBoardName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameBoard()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRenameBoardDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRenameBoard}>
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Section Name</Label>
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="e.g., Research, Ideas, To Do"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSection()}
              />
            </div>
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                {SECTION_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewSectionColor(color)}
                    className={`w-10 h-10 rounded border-2 transition-all ${
                      newSectionColor === color ? 'border-primary scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSectionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSection}>
                Create Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collaborator Dialog */}
      <Dialog open={showCollaboratorDialog} onOpenChange={setShowCollaboratorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Collaborator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={collaboratorName}
                onChange={(e) => setCollaboratorName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            {currentBoard.collaborators.length > 0 && (
              <div className="space-y-2">
                <Label>Current Collaborators</Label>
                <div className="space-y-2">
                  {currentBoard.collaborators.map(collab => (
                    <div key={collab.id} className="flex items-center gap-2 p-2 rounded bg-accent">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm text-primary-foreground">
                        {collab.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{collab.name}</p>
                        <p className="text-xs text-muted-foreground">{collab.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCollaboratorDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCollaborator}>
                Add Collaborator
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-4">
              {currentBoard.comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No comments yet</p>
              ) : (
                currentBoard.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm text-primary-foreground shrink-0">
                      {comment.userName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="flex-1"
              />
              <Button onClick={handleAddComment}>
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-card border shadow-lg rounded-lg p-4 animate-in slide-in-from-bottom-5 z-50">
          <p className="text-sm font-medium">{notification}</p>
        </div>
      )}
    </div>
  )
}
