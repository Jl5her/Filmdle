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
      <div className="marquee px-2 py-1 text-sm text-center uppercase text-primary-700 dark:text-primary-200 leading-none">
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
