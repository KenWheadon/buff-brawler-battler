Buff Brawl - Game Design Document (GDD)

---

1. High Concept
   A fast-paced, risk-reward roguelite where you battle waves with a single starter character, gamble on a 3x3 card flip grid to level up, then choose to capture the boss to unlock a new fighter — ending your run — or continue onward to try and earn more currency and get to the final boss.
   Core Fantasy: Skill earns power. Power reveals muscle. Victory claims a rival.

---

2. Core Loop
1. Start Run → Choose Wolf (only starter).
1. Battle Waves (3) → each Win Earn Flip Tokens.
1. Face Boss (Bear) → Win → Capture (unlock Bear, end run) or continue on fighting.
1. Once you lose you get to pick an unlocked character and spend the Flip Tokens to Flip cards in a 3x3 Grid → Each revealed card gives bonus stats to the fighter → flip 6 out of the 9 to level up and move to the next grid.
1. Repeat to unlock all characters, level them all up to max level (3) and unlock their outfits (by leveling up) AND beat the final boss of the game.

---

3. Characters
   Character Unlock Method Base Stats (ATK/DEF/SPD/HP) L1 Move L2 Move L3 Move
   Wolf Default 10 / 10 / 15 / 50 Claw (attack) – 100% Dash (increase speed) – 90% Roar (decrease opponent defense -10, increase your attack +5) – 75%
   Bear Capture Boss 30 / 10 / 10 / 40 Slam (attack) – 100% Guard (block next attack) – 80% Crush (attack, -5 opponent defense) – 75%

---

4. Mechanics
   4.1 Turn-Based Combat
   • Turn Order: The order is based on speed, if you’re fast enough you could move twice in a row. The persons speed is 1/X and then these are used to figure out the turn order.
   • Damage: Damage is the attack minus the percentage of the defense (5 defense is 5% less damage)
   • Waves: 3 escalating foes → Boss (Bear).
   • Reward: +1 Flip Token per win, +5 for winning the boss fight.
   4.2 Leveling: 3x3 Flip Grid
   • Cost: 1st flip = 1 token, +1 per flip (1→2→3...).
   • Grid: 9 cards — 6 Power ups, 3 Blanks.
   • Power: +1–5 to ATK/DEF or + 1-2 to SPD
   • Level Up Rules:
   • 6+ Power cards → can choose to Level Up
   • Max Levels Ups: 2 (L1 → L2 → L3)
   Level Stat Buff New Move
   L2 +10% all Second Move
   L3 +20% all Third Move
   4.3 Boss & Capture
   • 1st Boss: Bear with 1.5x stats and all attacks unlocked
   • On Win: → Capture → Unlock Bear permanently, end run. → Gallery + high score.

---

5. Progression & Replay
   • Persistent: Captured characters and stat + level upgrades

Screens.
Title screen – with start button to start combat screen, character selection button to open the character gallery screen.
Character Gallery – click CURRENT character to go to gallery of all characters (locked and unlocked). Click a character in the gallery to open up the training screen. Click BACK to go to the title screen.
Training screen shows the grid of 9 cards, and their current flipped or unflipped state. The full stats for the selected character is shown. The total flip points are shown, and can be spent to flip cards. Once 6+ of the grid of 9 are flipped, a ‘Level up’ button appears if the character is level 1 or 2. Leveling up provides a bonus (+10% for level 2, +20% for level 3). Can click BACK or SELECT to exit the training screen and go back to the character gallery.
Combat screen shows the selected character, the current monster, the available moves for the selected character, the HP for both characters. Also shows along the top the turn order – with an icon for the characters.
After each combat round, it goes to a ‘results screen’ showing the win or loss, the tokens earned and either the ability to continue, capture (if it’s a boss fight) or return to menu if the player lost.
