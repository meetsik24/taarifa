import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

const rows = [
  {
    tarehe: "2026-11-16",
    kanda: "Kanda ya Mashariki",
    mkoa: "Dar es Salaam",
    halmashauri: "Halmashauri ya Manispaa ya Kinondoni",
    shughuli: "Upimaji wa VVU sokoni Mwananyamala",
    aina: "Upimaji wa VVU",
    eneo: "Wafanyabiashara wadogo",
    mdau: "Ofisi ya Afya Kinondoni",
    hali: "Imekamilika",
    vvuMe: 48,
    vvuKe: 36,
    maambukiziMe: 4,
    maambukiziKe: 2,
    waliounganishwa: 5,
    elimu: 80,
    kondomu: 600,
    pep: 10,
    jipime: 20,
    ushahidi: "Ripoti ya tovuti, 16 Novemba 2026",
  },
  {
    tarehe: "2026-11-17",
    kanda: "Kanda ya Kati",
    mkoa: "Dodoma",
    halmashauri: "Halmashauri ya Jiji la Dodoma",
    shughuli: "Elimu shuleni Makole",
    aina: "Elimu na uhamasishaji",
    eneo: "Wanafunzi wa sekondari",
    mdau: "TAMISEMI Dodoma",
    hali: "Inaendelea",
    vvuMe: 0,
    vvuKe: 0,
    maambukiziMe: 0,
    maambukiziKe: 0,
    waliounganishwa: 0,
    elimu: 210,
    kondomu: 350,
    pep: 0,
    jipime: 0,
    ushahidi: "Orodha ya mahudhurio",
  },
  {
    tarehe: "2026-11-15",
    kanda: "Kanda ya Kaskazini",
    mkoa: "Kilimanjaro",
    halmashauri: "Halmashauri ya Manispaa ya Moshi",
    shughuli: "Upimaji kwenye soko la Mwanga",
    aina: "Upimaji wa VVU",
    eneo: "Jamii ya soko",
    mdau: "Kituo cha afya Majengo",
    hali: "Imekamilika",
    vvuMe: 22,
    vvuKe: 19,
    maambukiziMe: 1,
    maambukiziKe: 2,
    waliounganishwa: 3,
    elimu: 40,
    kondomu: 180,
    pep: 6,
    jipime: 12,
    ushahidi: "Fomu ya tovuti",
  },
  {
    tarehe: "2026-11-18",
    kanda: "Kanda ya Nyanda za Juu Kusini",
    mkoa: "Mbeya",
    halmashauri: "Halmashauri ya Jiji la Mbeya",
    shughuli: "Matangazo ya redio ya WAD",
    aina: "Mawasiliano",
    eneo: "Wananchi wa jiji",
    mdau: "Redio Mbeya",
    hali: "Haijaanza",
    vvuMe: 0,
    vvuKe: 0,
    maambukiziMe: 0,
    maambukiziKe: 0,
    waliounganishwa: 0,
    elimu: 0,
    kondomu: 0,
    pep: 0,
    jipime: 0,
    ushahidi: "",
  },
  {
    tarehe: "2026-11-14",
    kanda: "Kanda ya Mashariki",
    mkoa: "Morogoro",
    halmashauri: "Halmashauri ya Manispaa ya Morogoro",
    shughuli: "Rufaa ya wateja wapya",
    aina: "Rufaa na uunganishaji",
    eneo: "Vijana",
    mdau: "Kliniki ya CTC",
    hali: "Imesitishwa",
    vvuMe: 8,
    vvuKe: 11,
    maambukiziMe: 0,
    maambukiziKe: 0,
    waliounganishwa: 0,
    elimu: 15,
    kondomu: 0,
    pep: 0,
    jipime: 0,
    ushahidi: "Kliniki ilifungwa kwa siku hiyo",
  },
];

const pool = new Pool({ connectionString, max: 1 });

try {
  await pool.query("DELETE FROM submissions WHERE sample = true");
  for (const row of rows) {
    await pool.query(
      `INSERT INTO submissions (
        created_at, tarehe, kanda, mkoa, halmashauri, shughuli, aina, eneo, mdau, hali,
        vvu_me, vvu_ke, maambukizi_me, maambukizi_ke, waliounganishwa, elimu, kondomu,
        pep, jipime, ushahidi, sample
      ) VALUES (
        now(), $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, true
      )`,
      [
        row.tarehe,
        row.kanda,
        row.mkoa,
        row.halmashauri,
        row.shughuli,
        row.aina,
        row.eneo,
        row.mdau,
        row.hali,
        row.vvuMe,
        row.vvuKe,
        row.maambukiziMe,
        row.maambukiziKe,
        row.waliounganishwa,
        row.elimu,
        row.kondomu,
        row.pep,
        row.jipime,
        row.ushahidi,
      ],
    );
  }
  const count = await pool.query(
    "SELECT COUNT(*)::int AS n FROM submissions WHERE sample = true",
  );
  console.log(`Inserted ${count.rows[0].n} sample rows.`);
} finally {
  await pool.end();
}
