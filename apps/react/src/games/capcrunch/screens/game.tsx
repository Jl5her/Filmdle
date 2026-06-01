import { nbaAnswerPool, nbaPlayers } from "@stardle/data"
import { useCallback, useMemo } from "react"
import type { Suggestion } from "@/games/_common/components/guess-input"
import { GameScreen } from "@/games/_common/screens/game-screen"
import { buildCuratedSearch } from "@/shared/lib/curated-search"
import { buildCapCrunchColumns } from "../columns"
import type { CapCrunchGuess } from "../types"

const curated = buildCuratedSearch(nbaPlayers, "name")

export default function CapCrunchGame() {
  const columns = useMemo(() => buildCapCrunchColumns(), [])

  // Cap Crunch is a curated-only game — every guessable player lives in
  // the bundled roster, so there's no upstream API to fan out to.
  const fetchSuggestions = useCallback(
    async (query: string, _signal: AbortSignal): Promise<Suggestion[]> => {
      return curated.search(query, 8).map((player) => ({
        key: `c:${player.id}`,
        label: player.name,
      }))
    },
    [],
  )

  const resolveByKey = useCallback(async (key: string): Promise<CapCrunchGuess> => {
    const id = key.startsWith("c:") ? key.slice(2) : key
    const player = curated.get(id)
    if (!player) throw new Error(`Unknown player: ${key}`)
    return player
  }, [])

  return (
    <GameScreen<CapCrunchGuess>
      title="Cap Crunch"
      gameKey="capcrunch"
      curatedItems={nbaPlayers}
      answerPool={nbaAnswerPool}
      idOf={(p) => p.id}
      nameOf={(p) => p.name}
      columns={columns}
      searchPlaceholder="Type an NBA player's name..."
      fetchSuggestions={fetchSuggestions}
      resolveByKey={resolveByKey}
    />
  )
}
