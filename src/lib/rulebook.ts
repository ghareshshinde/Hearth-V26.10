/**
 * Plain-language summaries of the governing bodies' rules, in our own words, for players of all ages.
 * They are a starting point: the organisers' own rules for the event always win, and every sport links to the full rulebook.
 * A group with `for` applies only to singles or only to doubles; the others apply to both.
 * status "checked" means the points were compared with the official text (or the federation's own summary) in October 2026;
 * "standard" means they are the well-known standard rules, to be confirmed by the organisers against the linked rulebook.
 */
export type Rulebook = {
  body: string
  edition: string
  url: string
  status: 'checked' | 'standard'
  groups: { title: string; items: string[]; for?: 'singles' | 'doubles' }[]
  variations: string[]
}

export const RULEBOOKS: Record<string, Rulebook> = {
  chess: {
    body: 'FIDE Laws of Chess (All India Chess Federation events follow them)',
    edition: 'In force from 1 January 2023',
    url: 'https://handbook.fide.com/chapter/E012023',
    status: 'checked',
    groups: [
      { title: 'Format', items: [
        'Rapid chess gives each player more than 10 and under 60 minutes on the clock.',
        'A player whose time runs out loses, unless the opponent could never checkmate, in which case it is a draw.',
        'Writing the moves down is optional in rapid chess.',
      ] },
      { title: 'Moving the pieces', items: [
        'Touch-move: a piece you deliberately touch must be moved if it has a legal move.',
        'If you touch an opponent’s piece on purpose, you must capture it if you can.',
        'To straighten a piece, say “adjust” before you touch it.',
        'Use one hand for each move, then press the clock with the same hand.',
      ] },
      { title: 'Illegal moves', items: [
        'A move is final once the clock is pressed. If it was illegal, the position is put back.',
        'The first illegal move gives your opponent one extra minute. A second illegal move loses the game.',
      ] },
      { title: 'Draws', items: [
        'Stalemate and positions where nobody can checkmate are draws at once.',
        'You can offer a draw after you move, before you press the clock.',
        'You can claim a draw by threefold repetition or after 50 moves each with no pawn move or capture. A wrong claim gives your opponent extra time.',
        'Fivefold repetition and 75 moves each with no pawn move or capture are automatic draws.',
      ] },
    ],
    variations: ['Many community events use a 10 or 15 minute clock with a small bonus per move.', 'Mobile phones are usually switched off during play.'],
  },
  carrom: {
    body: 'Laws of Carrom adopted by the International Carrom Federation',
    edition: '1993 laws (copy hosted by the English Carrom Federation)',
    url: 'https://www.carrom.co.uk/?p=62',
    status: 'checked',
    groups: [
      { title: 'Equipment', items: [
        'The board is a wooden square of about 74 cm with a pocket in each corner.',
        '19 pieces: 9 white, 9 black and 1 red queen. The striker is at most about 4 cm across and 15 g, with no visible metal.',
      ] },
      { title: 'Starting', items: [
        'The umpire tosses for the choice. The player who breaks plays the white pieces.',
        'The break must be played within 15 seconds of the call to play.',
      ] },
      { title: 'Playing', items: [
        'Flick the striker from behind your baseline. Pushing it is a foul. Do not touch or lean on the board.',
        'Pocket one of your own pieces and you play again. Miss, and the turn passes.',
        'You may only pocket the queen after one of your own pieces. You must then “cover” it by pocketing one of your own in the same or the next stroke, or the queen goes back to the centre.',
      ] },
      { title: 'Scoring', items: [
        'The winner of a board scores 1 point for each opposing piece left on the board. Winning the queen adds 3, up to 12 on one board.',
        'A game ends at 25 points or after 8 boards, and a match is the best of 3 games.',
      ] },
      { title: 'Playing in pairs', for: 'doubles', items: [
        'Partners sit opposite each other, and the turn passes clockwise around the board. Each player plays their own turn with the same pieces as their partner.',
      ] },
      { title: 'Fouls', items: [
        'Pocketing the striker is a “due”: the opponent puts one of your pocketed pieces back on the board and the turn passes.',
        'Pocketing an opponent’s piece counts for them and ends your turn.',
      ] },
    ],
    variations: ['Community events often play a single board to 25 points, or a board of about 20 minutes.', 'Chairs are often allowed for older players.'],
  },
  cricket: {
    body: 'MCC Laws of Cricket (Hyderabad Cricket Association tournaments add their own playing conditions)',
    edition: '2017 Code, 3rd edition (2022)',
    url: 'https://www.lords.org/mcc/the-laws',
    status: 'standard',
    groups: [
      { title: 'Format', items: [
        'Two teams of up to 11. The team batting second tries to pass the first team’s total.',
        'An over is 6 legal balls. Community events usually set the number of overs per side, such as 8 or 10, and a limit of overs per bowler.',
      ] },
      { title: 'Extras', items: [
        'A wide is one run and the ball is bowled again.',
        'A no-ball is one run and the ball is bowled again. It is called for a front-foot overstep or a dangerously high full toss. Many events add a free hit.',
      ] },
      { title: 'Getting out', items: [
        'Bowled, caught, leg before wicket, run out, stumped, hit wicket.',
        'On a no-ball a batter can only be run out, or out for hitting the ball twice or obstructing the field.',
      ] },
      { title: 'Safety', items: [
        'Helmets are advised for hard-ball play. Umpires’ decisions are final.',
      ] },
    ],
    variations: ['Tennis-ball or T10 formats, a powerplay for the first overs, a super over to break a tie in knockouts, and runners for older players are common. Your organisers will state which apply.'],
  },
  badminton: {
    body: 'BWF Laws of Badminton (Badminton Association of India events follow them)',
    edition: 'Adopted 26 April 2025',
    url: 'https://worldbadminton.com/laws/rules_2025.htm',
    status: 'checked',
    groups: [
      { title: 'Scoring', items: [
        'A match is the best of three games, and every rally scores a point, even if you did not serve.',
        'A game goes to 21. At 20 all you need a two-point lead, and at 29 all the next point wins.',
        'The winner of the last game serves first in the next game. Players change ends after each game, and in the third game when a side reaches 11.',
        'There is a 60 second break at 11 points and 120 seconds between games.',
      ] },
      { title: 'Serving', items: [
        'Serve diagonally across the court. The server stands on the right when their score is even, and on the left when it is odd.',
        'The shuttle must be hit below the waist, about 1.15 m, with the racket head below the hand. Both feet stay still until the serve is hit.',
      ] },
      { title: 'Faults', items: [
        'The shuttle lands outside the lines or hits the net and does not cross.',
        'Hitting the shuttle twice in a row, touching the net with your racket or body, reaching over the net to hit it, or blocking your opponent.',
      ] },
      { title: 'The court in singles', for: 'singles', items: [
        'Use the narrower court: the inner side lines. The very back line is the limit for both serving and rallies.',
        'Only one player is on each side, so the server serves from the right when their score is even and from the left when it is odd.',
      ] },
      { title: 'The court in doubles', for: 'doubles', items: [
        'Use the wider court: the outer side lines for rallies. When serving, the back limit is the shorter line closer to the net, so the serve must land in a shorter box than in singles.',
        'Partners swap sides only after winning a point while serving. The serve passes between the two sides in turn.',
      ] },
      { title: 'Conduct', items: [
        'A rally is replayed (a let) if the receiver was not ready or the shuttle gets stuck in the net.',
        'Delaying play or coaching during a rally earns a warning from the umpire.',
      ] },
    ],
    variations: ['Short formats such as one game to 21 or two games to 15 are common at community events.', 'A synthetic shuttle is often used.'],
  },
  'table tennis': {
    body: 'ITTF Laws of Table Tennis (Table Tennis Federation of India events follow them)',
    edition: 'ITTF Statutes, 2026 (the Laws are chapter 2 of the ITTF handbook)',
    url: 'https://db.ittf.com/sites/default/files/public/2026-02/2026_Statutes_v1_consolidated_tc.pdf',
    status: 'standard',
    groups: [
      { title: 'Scoring', items: [
        'A game goes to 11 points and you must win by two. A match is the best of 5 games.',
        'The first server is decided by a draw. Service changes after every 2 points, and after every point from 10 all.',
      ] },
      { title: 'Serving', items: [
        'Hold the ball on your open flat palm, toss it up at least 16 cm and hit it as it falls.',
        'The serve must bounce on your side and then on your opponent’s side.',
        'If a serve touches the net but is otherwise good, it is a let and is served again.',
      ] },
      { title: 'Equipment', items: [
        'The table is 2.74 m by 1.525 m and 76 cm high. The ball is 40 mm. One side of the racket is red and the other black.',
      ] },
      { title: 'In singles', for: 'singles', items: [
        'A good serve may land anywhere on your opponent’s half of the table.',
      ] },
      { title: 'In doubles', for: 'doubles', items: [
        'The serve goes from the right half of your side to the right half of the other side. Partners must hit the ball in turn.',
      ] },
      { title: 'Losing a point', items: [
        'Missing the ball, hitting it twice, or hitting it before it has bounced on your side.',
      ] },
    ],
    variations: ['Community events often play the best of 3 games, or a round-robin of pools.'],
  },
  pickleball: {
    body: 'USA Pickleball rulebook (the International Pickleball Federation rules are closely aligned)',
    edition: '2026 edition',
    url: 'https://usapickleball.org/rules/summary/',
    status: 'checked',
    groups: [
      { title: 'Scoring', items: [
        'In the usual scoring only the serving side scores. A game goes to 11 and you must win by 2. Some events use 15 or 21.',
        'In rally scoring, a point is awarded after every rally.',
      ] },
      { title: 'Serving', items: [
        'Serve diagonally into the correct court with at least one foot behind the baseline. You get one attempt.',
        'Hit the ball with an upward swing, at or below your waist, or use a drop serve.',
      ] },
      { title: 'Serving in singles', for: 'singles', items: [
        'You serve from the right when your score is even and from the left when it is odd. After a fault the serve passes to your opponent.',
      ] },
      { title: 'Serving in doubles', for: 'doubles', items: [
        'Both partners serve before the serve passes to the other side, except at the very start of a game when only one serves.',
      ] },
      { title: 'The two-bounce rule', items: [
        'The serve must bounce once before it is returned, and the return must bounce once before anyone volleys. After that you may volley.',
      ] },
      { title: 'The kitchen', items: [
        'The kitchen is the area 7 feet each side of the net. You cannot volley (hit the ball in the air) while standing in it, even if your momentum carries you in.',
        'You may stand in the kitchen at other times, for example to hit a ball that has bounced.',
        'A serve landing on the kitchen line is short and a fault.',
      ] },
      { title: 'Faults', items: [
        'The ball goes into the net or out. A ball touching any line other than the serve’s kitchen line is in.',
        'Volleying too early, letting the ball bounce twice, touching the net, or being hit by the ball.',
      ] },
    ],
    variations: ['Rally scoring to 15 or 11, or a time limit of about 10 minutes, keeps rounds short at community events.'],
  },
}

export const rulebookFor = (sport: string): Rulebook | undefined => RULEBOOKS[sport.trim().toLowerCase()]
