// TopicsScene — runs in a separate spatial window.
// Listens on BroadcastChannel 'luminary-scene-sync' for topic list updates.
// When the user clicks a topic, broadcasts { type: 'select-topic', videoUrl } back to the main scene.

import { useState, useEffect } from 'react'
import type { CompletedTopic } from '@/App'
import TopicsPanel from '@/components/TopicsPanel'
import { SpatialSidePanel } from '@/components/spatial/SpatialClassroom'

export default function TopicsScene() {
  const [topics, setTopics] = useState<CompletedTopic[]>([])
  const [libraryTopics, setLibraryTopics] = useState<CompletedTopic[]>([])
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    const channel = new BroadcastChannel('luminary-scene-sync')
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'topics-state') {
        setTopics(e.data.topics)
        setLibraryTopics(e.data.libraryTopics ?? [])
        setCurrentVideoUrl(e.data.currentVideoUrl)
      }
    }
    channel.addEventListener('message', onMessage)
    return () => {
      channel.removeEventListener('message', onMessage)
      channel.close()
    }
  }, [])

  const handleSelect = (url: string) => {
    setCurrentVideoUrl(url)
    const channel = new BroadcastChannel('luminary-scene-sync')
    channel.postMessage({ type: 'select-topic', videoUrl: url })
    channel.close()
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'transparent', padding: '10px' }}>
      <SpatialSidePanel kind="topics" style={{ width: '100%', height: '100%' }}>
        <TopicsPanel
          topics={topics}
          libraryTopics={libraryTopics}
          currentVideoUrl={currentVideoUrl}
          onSelect={handleSelect}
        />
      </SpatialSidePanel>
    </div>
  )
}
