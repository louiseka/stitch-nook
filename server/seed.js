const bcrypt = require('bcrypt');
const { db, initDb } = require('./db');

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Crochet1!';

const USERS = [
  { username: 'yarnlover' },
  { username: 'crochetqueen' },
  { username: 'hookmaster' },
  { username: 'stitchwitch' },
];

const PATTERNS = [
  {
    username: 'yarnlover',
    title: 'Bobble Stitch Blanket',
    author: null,
    difficulty: 'intermediate',
    description: 'A cosy textured blanket made entirely in bobble stitch — the raised bobbles create a gorgeous dimpled surface perfect for snuggling up with.',
    hookSize: '6.0mm',
    yarnWeight: 'Chunky',
    yarnColours: 'Oatmeal, Burnt Orange',
    instruction_terms: 'us',
    instructions: `<h2>Foundation</h2><ul><li>Ch a multiple of 2 + 1 to your desired width (e.g. ch 61 for approx 60cm)</li><li>Row 1: sc in 2nd ch from hook, *bobble in next ch, sc in next ch* repeat across, turn</li></ul><h2>Bobble Stitch</h2><ul><li>Yo, insert hook, yo, pull up loop (x5) — 11 loops on hook</li><li>Yo and pull through all 11 loops, ch 1 to close</li></ul><h2>Body Rows</h2><ul><li>Row 2 (WS): ch 1, sc in first st, *bobble in next st, sc in next st* repeat across, turn</li><li>Repeat Row 2 until blanket reaches desired length</li><li>Fasten off and weave in ends</li></ul>`,
  },
  {
    username: 'crochetqueen',
    title: 'Amigurumi Bunny',
    author: 'CrochetQueen Originals',
    difficulty: 'intermediate',
    description: 'An adorable little bunny worked in the round — floppy ears, a fluffy tail, and a squishy body make this the perfect handmade gift.',
    hookSize: '3.5mm',
    yarnWeight: 'DK / 8 ply',
    yarnColours: 'Soft Grey, Pink',
    instruction_terms: 'us',
    instructions: `<h2>Head</h2><ul><li>Magic ring, 6 sc into ring (6)</li><li>Inc in each st around (12)</li><li>*Sc 1, inc* repeat around (18)</li><li>*Sc 2, inc* repeat around (24)</li><li>Sc even for 4 rounds (24)</li><li>*Sc 2, dec* repeat around (18)</li><li>Stuff firmly. *Sc 1, dec* repeat around (12)</li><li>Dec around until closed (6). Fasten off.</li></ul><h2>Body</h2><ul><li>Magic ring, 6 sc (6) → inc each (12) → *sc 1, inc* (18) → *sc 2, inc* (24)</li><li>Sc even for 6 rounds. *Sc 2, dec* (18). *Sc 1, dec* (12). Stuff. Dec to close.</li></ul><h2>Ears (make 2)</h2><ul><li>Ch 4, sc in 2nd ch from hook, sc 1, 3 sc in last ch, work back along other side, sc 2, sl st to join</li><li>Round 2: inc, sc, 3 inc, sc, inc, sl st to join</li><li>Fasten off leaving a long tail for sewing</li></ul><h2>Finishing</h2><ul><li>Sew head to body, attach ears to top of head</li><li>Embroider eyes and nose with black yarn</li><li>Make a small pompom for tail and attach</li></ul>`,
  },
  {
    username: 'hookmaster',
    title: 'Classic Ripple Afghan',
    author: null,
    difficulty: 'beginner',
    description: 'A timeless chevron ripple throw in three colours — the gentle waves are relaxing to work and make a striking striped blanket.',
    hookSize: '5.5mm',
    yarnWeight: 'Aran / 10 ply',
    yarnColours: 'Cream, Sage Green, Dusty Blue',
    instruction_terms: 'us',
    instructions: `<h2>Foundation</h2><ul><li>Using Colour A, ch a multiple of 12 + 3 (e.g. ch 123 for approx 100cm)</li><li>Row 1: 2 dc in 4th ch from hook, *dc 4, dc3tog, dc 4, 3 dc in next ch* repeat to last 3 ch, dc3tog, turn</li></ul><h2>Body</h2><ul><li>Row 2: ch 3, 2 dc in first st, *dc 4, dc3tog, dc 4, 3 dc in next st* repeat to last 3 sts, dc3tog</li><li>Change colour every 2 rows in sequence: Colour A → B → C → A</li><li>Continue until blanket reaches desired length (approx 50 rows for a throw)</li></ul><h2>Finishing</h2><ul><li>Fasten off all colours and weave in ends</li><li>Optional: single crochet border around entire blanket in Colour A</li></ul>`,
  },
  {
    username: 'stitchwitch',
    title: 'Daisy Flower Coasters',
    author: 'Stitch Witch Studio',
    difficulty: 'beginner',
    description: 'Sweet daisy coasters worked in the round — quick to make and a lovely way to use up scraps of cotton yarn. Makes a set of four.',
    hookSize: '3.5mm',
    yarnWeight: 'Sport / 5 ply',
    yarnColours: 'White, Sunshine Yellow, Leaf Green',
    instruction_terms: 'us',
    instructions: `<h2>Centre (Yellow)</h2><ul><li>Magic ring, ch 1, 8 sc into ring, sl st to join (8)</li><li>Fasten off Yellow, join White</li></ul><h2>Petals (White)</h2><ul><li>*Ch 5, sl st in 2nd ch from hook, sc, hdc, sc, sl st back into centre ring* repeat 8 times for 8 petals</li><li>Sl st to join, fasten off White, join Green</li></ul><h2>Leaf Border (Green)</h2><ul><li>Round 1: sc evenly around the outside of all petals</li><li>Round 2: *sc 3, ch 3, sl st in 2nd ch from hook, sc back* repeat for a picot edge</li><li>Sl st to join and fasten off</li></ul><h2>Finishing</h2><ul><li>Weave in all ends and lightly steam block to flatten</li><li>Make 3 more for a full set of 4</li></ul>`,
  },
  {
    username: 'yarnlover',
    title: 'Market Tote Bag',
    author: null,
    difficulty: 'beginner',
    description: 'A sturdy open-weave tote bag using simple mesh stitch — great for shopping trips or the beach, and quick enough to finish in a weekend.',
    hookSize: '5.0mm',
    yarnWeight: 'Worsted',
    yarnColours: 'Natural Cotton, Terracotta',
    instruction_terms: 'us',
    instructions: `<h2>Base</h2><ul><li>Ch 31. Sc across (30 sts). Ch 1, turn.</li><li>Work 10 rows of sc for a rectangular base</li><li>Join in the round with sl st, ch 1</li></ul><h2>Body (Mesh Pattern)</h2><ul><li>Round 1: *ch 2, skip 1, sc in next st* repeat around, sl st to join</li><li>Repeat Round 1 until bag measures approx 35cm from base</li></ul><h2>Top Edging</h2><ul><li>Work 2 rounds of sc, inc 4 sts evenly on first round to keep it tidy</li></ul><h2>Handles (make 2)</h2><ul><li>Join Terracotta yarn, ch 60, sl st to bag 30 sts across, work sc back along chain for a sturdy double-layered handle</li><li>Repeat on opposite side</li><li>Fasten off and weave in all ends</li></ul>`,
  },
  {
    username: 'hookmaster',
    title: 'Granny Square Cardigan',
    author: 'Hookmaster Designs',
    difficulty: 'advanced',
    description: 'A boho cardigan constructed entirely from joined granny squares — fully customisable in size and colour. A rewarding project for confident crocheters.',
    hookSize: '4.0mm',
    yarnWeight: 'DK / 8 ply',
    yarnColours: 'Cream, Rust, Mustard, Forest Green',
    instruction_terms: 'us',
    instructions: `<h2>Granny Square (make approx 40)</h2><ul><li>Magic ring, ch 3, 2 dc, ch 2, *3 dc, ch 2* x3, sl st to join (4 clusters)</li><li>Round 2: sl st to corner, ch 3, 2 dc in corner sp, ch 1, *3 dc ch 2 3 dc in corner, ch 1* x3, 3 dc in first corner, ch 2, sl st</li><li>Round 3: sl st to corner, ch 3, 2 dc, ch 2, *3 dc ch 1 in side sp, 3 dc ch 2 3 dc in corner* x3, finish round, sl st</li><li>Fasten off and weave in ends. Block all squares.</li></ul><h2>Layout & Joining</h2><ul><li>Lay out squares: 5 wide x 4 tall for each front panel, 10 wide x 4 tall for back</li><li>Join with flat slip stitch join (WS facing) for a neat seam</li><li>Sleeves: join 4 x 3 squares in a tube for each arm</li></ul><h2>Assembly</h2><ul><li>Sew or sl st shoulder seams, set in sleeves</li><li>Work sc border around all edges and neckline in Cream</li><li>Optional: add 3 buttons to front opening</li></ul>`,
  },
  {
    username: 'stitchwitch',
    title: 'Chunky Ribbed Beanie',
    author: null,
    difficulty: 'beginner',
    description: 'A warm and stretchy ribbed beanie worked in rows and seamed — the slip stitch ribbing creates beautiful texture and a great fit.',
    hookSize: '7.0mm',
    yarnWeight: 'Super Chunky',
    yarnColours: 'Charcoal, Cream',
    instruction_terms: 'us',
    instructions: `<h2>Brim</h2><ul><li>Ch 12 (or adjust for desired rib width)</li><li>Row 1: sl st in back loop only of 2nd ch from hook, sl st BLO across (11 sts), ch 1, turn</li><li>Repeat Row 1 until brim measures approx 52–58cm (to fit adult head), join ends with sl st</li></ul><h2>Crown</h2><ul><li>Rotate work 90°, sc evenly along long edge (approx 30 sts)</li><li>Join in the round. Work 4 rounds even in sc</li><li>Dec round: *sc 3, dec* around</li><li>Dec round: *sc 2, dec* around</li><li>Dec round: *sc 1, dec* around</li><li>Final round: dec around until 6 sts remain</li></ul><h2>Finishing</h2><ul><li>Cut yarn leaving a 20cm tail, thread through remaining sts and pull tight</li><li>Fasten off and weave in all ends</li><li>Optional: attach a large pompom to the crown in Cream</li></ul>`,
  },
];

async function seed() {
  await initDb();

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // Insert users (skip if they already exist)
  for (const { username } of USERS) {
    const { rows } = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [username] });
    if (rows.length > 0) {
      console.log(`  User "${username}" already exists — skipping`);
      continue;
    }
    await db.execute({ sql: 'INSERT INTO users (username, password_hash) VALUES (?, ?)', args: [username, hash] });
    console.log(`  Created user: ${username}`);
  }

  // Fetch all users for id lookup
  const { rows: userRows } = await db.execute('SELECT id, username FROM users');
  const userMap = Object.fromEntries(userRows.map(u => [u.username, Number(u.id)]));

  // Insert patterns
  for (const p of PATTERNS) {
    const userId = userMap[p.username];
    if (!userId) { console.warn(`  No user found for "${p.username}" — skipping`); continue; }
    const materials = JSON.stringify({ hookSize: p.hookSize, yarnWeight: p.yarnWeight, yarnColours: p.yarnColours });
    await db.execute({
      sql: `INSERT INTO patterns (user_id, title, author, difficulty, description, instructions, instruction_terms, materials)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, p.title, p.author || null, p.difficulty, p.description, p.instructions, p.instruction_terms, materials],
    });
    console.log(`  Added pattern: "${p.title}" by ${p.username}`);
  }

  console.log('\nSeed complete!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
