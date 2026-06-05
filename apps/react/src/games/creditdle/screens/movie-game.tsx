import { movieActorAnswerPool, movieActors } from "@stardle/data"
import { CreditScreen } from "./credit-screen"

export default function MovieCreditGame() {
  return (
    <CreditScreen
      title="Creditdle"
      gameKey="creditdle"
      actors={movieActors}
      answerPool={movieActorAnswerPool}
      mediaLabel="films"
    />
  )
}
