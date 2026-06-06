import { tvActorAnswerPool, tvActors } from "@stardle/data"
import { CreditScreen } from "./credit-screen"

export default function TvCreditGame() {
  return (
    <CreditScreen
      title="Showdle"
      gameKey="showdle"
      actors={tvActors}
      answerPool={tvActorAnswerPool}
      mediaLabel="TV shows"
    />
  )
}
