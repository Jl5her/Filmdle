# Plotdle — "Poorly Explained Plot" generation prompt

You write "poorly explained plots": one-line movie summaries that are technically
accurate but written in the most reductive, unflattering, or absurdly literal way
possible. Players read the plot and try to guess the movie in three tries.

## Style rules
1. **Accurate but wrong-headed.** Every claim must be literally true of the film,
   but framed from a cynical, mundane, or deliberately skewed point of view
   (heroes read as criminals, magic reads as mundane, epics read as small errands).
2. **Reductive labels, never names.** No character names, actor names, places or
   words from the title. Describe people by a blunt label: "a billionaire",
   "a homeless wizard", "big dude", "a pile of garbage", "an old immigrant man".
3. **Short.** One sentence, ideally 8–25 words. A long run-on is fine only if
   the run-on itself is the joke.
4. **One weird specific detail — but never the giveaway.** Include one concrete,
   oddly chosen detail that rewards fans, but pick a *secondary* detail, or
   describe the famous element so obliquely it isn't instantly recognizable.
   Good: "while eating lots of oranges" (not the horse head), "because he can't
   sleep", "a rock collection" (not "Infinity Stones"). Never name the film's
   single most famous object, quote, food, or image — that alone gives it away.
   Bad: "gets rich off shrimp" (Forrest Gump), "his only friend is a volleyball"
   (Cast Away), "worried about a spinning top" (Inception).
   Famous elements are fine if you blur them one level: "the seafood business"
   (not shrimp), "sports equipment" (not a volleyball), "a piece of jewelry"
   (not the One Ring).
   Apply the same blur to *every* keyword, not just the most famous one: swap
   specific nouns for their broader category. "Christmas party" → "office
   party", "snakes" → "reptiles", "Nazis" → "Germans", "Saturday detention" →
   "a weekend punishment", "marshmallow" → "snack food".
   **Two-clue rule:** each plot should hold about two clues that are each vague
   on their own but together point clearly to one movie. Test: if any single
   phrase alone names the movie, blur it; if you need more than two clues to
   narrow it down, add a more specific one.
5. **Casual voice, funny when it fits.** Plain, deadpan, slightly dumb. "Dude",
   "guy", "gets", "a lot of". The humor comes from the skewed framing itself
   (a hero described as a criminal, an epic described as an errand). When a
   film has a naturally absurd angle, lean into it with one funny twist of
   phrasing; when it doesn't, a dry literal summary is fine. At most one joke
   per plot, and not every plot needs one. No puns on the title, no forced
   punchlines, no slang, no emojis.
6. **Guessable.** A fan should get it within three guesses. Avoid summaries that
   fit many movies equally well.
7. **Don't write "(animated)" in the plot.** Set `"animated": true` instead; the
   game shows an "Animated" tag next to the plot.
8. **Use the TMDB title and release year** so the answer can be matched against
   the game's movie search (e.g. "WALL·E", "Star Wars" not "A New Hope").

9. **Main character hint.** Also write `character`: a poorly written description
   of the main character, shown as a tap-to-reveal hint. Same voice and rules
   (reductive label, blur every keyword, no names or giveaway detail), 6–16
   words. It must add information beyond the plot, not restate it.
   e.g. Forrest Gump → "A man who never stops moving and has strong opinions
   about candy"; Die Hard → "A sweaty cop who really needs a pair of shoes";
   Star Wars → "A whiny farm kid who desperately wants to go to the mall".
10. **Genre.** Set `genre` to the film's primary genre, exactly one of: Action,
    Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy,
    History, Horror, Music, Mystery, Romance, Science Fiction, Thriller, War,
    Western. For animated films pick the main genre other than Animation.

## Examples (approved)
- An old man abducts a young boy to try to replace his deceased wife → Up (2009, animated)
- A homeless wizard recruits a young teen to commit an act of terrorism → Star Wars (1977)
- Big dude wants to get a hold of a rock collection for population control → Avengers: Infinity War (2018)
- Dude starts a testosterone-fueled crime organization because he's bored and can't sleep → Fight Club (1999)
- A cook who embraces serious health code violations is rewarded by a critic with a free restaurant → Ratatouille (2007, animated)
- A short guy inherits some jewelry from a relative and has to walk a really long way to throw it away → The Lord of the Rings: The Fellowship of the Ring (2001)
- A cop flies across the country to make up with his wife and ends up ruining her office party → Die Hard (1988)
- A teacher who's afraid of reptiles races the Germans to find an antique box → Raiders of the Lost Ark (1981)
- A not-very-smart guy gets rich in the seafood business and keeps running into presidents → Forrest Gump (1994)
- A guy obsessed with being on time gets stuck on an island for four years and befriends some sports equipment → Cast Away (2000)
- A girl falls for her kidnapper after he gives her a library → Beauty and the Beast (1991, animated)
- A retired government employee takes his daughter's trip overseas extremely personally → Taken (2008)
- Eight soldiers risk everything to send one guy home, and he doesn't want to go → Saving Private Ryan (1998)
- A rude weatherman keeps reliving the same small-town festival until he gets really good at piano, and also as a person → Groundhog Day (1993)
- A guy shows up naked and tries to kill a waitress because of something her kid will do later → The Terminator (1984)
- A farmer leaves his kids to find humanity a new home and comes back younger than his daughter → Interstellar (2014)

## Task
Write {{COUNT}} new poorly explained plots for well-known movies.
Only use movies released {{YEAR_RANGE}}.
Do not reuse any movie already in the pool: {{EXCLUDE_TITLES}}
(Run `node scripts/plotdle/exclude-list.mjs` to print the current pool titles.
Then add the result with `node scripts/plotdle/add-plots.mjs <file> --shuffle`
and `node scripts/plotdle/sync-tmdb.mjs`.)
Mix genres and difficulty: ~40% easy, 40% medium, 20% hard.

Return only a JSON array, no prose:
[
  {
    "plot": "string",
    "character": "string",
    "genre": "Comedy",
    "title": "Official English title",
    "year": 1999,
    "animated": false,
    "difficulty": "easy" | "medium" | "hard"
  }
]
