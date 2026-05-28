import { evaluateColumn, type GameColumn } from "../columns"
import { Tile } from "./tile"

interface Props<T> {
  guess: T
  answer: T
  columns: GameColumn<T>[]
  nameOf: (item: T) => string
  animate?: boolean
}

export function GuessRow<T>({ guess, answer, columns, nameOf, animate }: Props<T>) {
  return (
    <div>
      <div className="guess-name px-2 py-1 text-center uppercase text-primary-900 dark:text-primary-50">
        {nameOf(guess)}
      </div>
      <div className="flex gap-1 justify-center">
        {columns.map((column, i) => (
          <Tile
            key={column.id}
            cell={evaluateColumn(guess, answer, column)}
            animate={animate}
            delayIndex={i}
          />
        ))}
      </div>
    </div>
  )
}
