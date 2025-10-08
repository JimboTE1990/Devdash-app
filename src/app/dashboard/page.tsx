'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Board as BoardComponent } from '@/components/board/Board'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Board } from '@/lib/types'
import { createMarketingBoard, createProductBoard, createCustomBoard } from '@/lib/mock-data'
import { Plus, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const { user, loading, isTrialActive, isPremium } = useAuth()
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [activeBoard, setActiveBoard] = useState<string>('marketing')
  const [showNewBoardInput, setShowNewBoardInput] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      // Initialize default boards
      const marketingBoard = createMarketingBoard(user.uid)
      const productBoard = createProductBoard(user.uid)
      setBoards([marketingBoard, productBoard])
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleUpdateBoard = (updatedBoard: Board) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === updatedBoard.id ? updatedBoard : board
      )
    )
  }

  const handleCreateCustomBoard = () => {
    if (newBoardName.trim()) {
      const customBoard = createCustomBoard(user.uid, newBoardName.trim())
      setBoards([...boards, customBoard])
      setActiveBoard(customBoard.id)
      setNewBoardName('')
      setShowNewBoardInput(false)
    }
  }

  const currentBoard = boards.find((board) => board.id === activeBoard)

  return (
    <div className="h-screen flex flex-col">
      {/* Trial/Premium Status Banner */}
      {isTrialActive && user.trialEndDate && (
        <div className="bg-[#7dd87d] text-white px-4 py-2 text-center">
          <p className="text-sm font-medium">
            Trial Active - {Math.ceil((user.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
          </p>
        </div>
      )}

      {!isPremium && !isTrialActive && (
        <div className="bg-yellow-600 text-white px-4 py-2 text-center">
          <p className="text-sm font-medium">
            Your trial has expired. Upgrade to Premium to continue using DevDash.
          </p>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">
              Welcome back, {user.firstName || user.email}!
            </p>
          </div>
          {user.plan === 'premium' && (
            <Badge variant="default">Premium</Badge>
          )}
        </div>

        <Tabs
          value={activeBoard}
          onValueChange={setActiveBoard}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-4">
            <TabsList>
              {boards.map((board) => (
                <TabsTrigger key={board.id} value={board.id}>
                  {board.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {showNewBoardInput ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateCustomBoard()
                    if (e.key === 'Escape') {
                      setShowNewBoardInput(false)
                      setNewBoardName('')
                    }
                  }}
                  placeholder="Board name..."
                  className="w-48"
                  autoFocus
                />
                <Button onClick={handleCreateCustomBoard} size="sm">
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setShowNewBoardInput(false)
                    setNewBoardName('')
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowNewBoardInput(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Board
              </Button>
            )}
          </div>

          {boards.map((board) => (
            <TabsContent
              key={board.id}
              value={board.id}
              className="flex-1 overflow-hidden m-0"
            >
              {currentBoard && (
                <div className="h-full bg-[#2d4a4a] rounded-lg border border-[#4a6a6a]">
                  <BoardComponent
                    board={currentBoard}
                    onUpdateBoard={handleUpdateBoard}
                  />
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
