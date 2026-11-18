/**
 * Mainland regions and councils from
 * https://www.tanzania.go.tz/directories/local-government
 * (Mikoa [26] and Mamlaka za Serikali za Mtaa).
 * Regional secretariats are left out. That page publishes 100 councils
 * and stops at Newala, so the regions with an empty list have no council there.
 *
 * Names follow the directory. A few labels are corrected so each choice is readable:
 * "Wilaya ya Wilaya ya iringa" is "Wilaya ya Iringa", "Manispaa iringa" is
 * "Manispaa ya Iringa", "kinondoni" is "Kinondoni", the second Kasulu entry
 * (kasulutc.go.tz) is "Mji Kasulu", "Hanang'" is "Hanang", and "jiji la Arusha"
 * is "Jiji la Arusha".
 */

/** Zones people choose from on the entry form. */
export const KANDA = [
  "Kanda ya Mashariki",
  "Kanda ya Kaskazini",
  "Kanda ya Ziwa",
  "Kanda ya Kusini",
  "Kanda ya Magharibi",
  "Kanda ya Nyanda za Juu Kusini",
  "Kanda ya Kati",
] as const;

const kandaSet = new Set<string>(KANDA);

export function isKanda(value: string): boolean {
  return kandaSet.has(value);
}

export const PLACES: { mkoa: string; halmashauri: string[] }[] = [
  {
    mkoa: "Arusha",
    halmashauri: [
      "Halmashauri ya Jiji la Arusha",
      "Halmashauri ya Wilaya ya Arusha",
      "Halmashauri ya Wilaya ya Karatu",
      "Halmashauri ya Wilaya ya Longido",
      "Halmashauri ya Wilaya ya Meru",
      "Halmashauri ya Wilaya ya Monduli",
      "Halmashauri ya Wilaya ya Ngorongoro",
    ],
  },
  {
    mkoa: "Dar es Salaam",
    halmashauri: [
      "Halmashauri ya Jiji la Dar es Salaam",
      "Halmashauri ya Manispaa ya Kigamboni",
      "Halmashauri ya Manispaa ya Kinondoni",
      "Halmashauri ya Manispaa ya Temeke",
      "Halmashauri ya Manispaa ya Ubungo",
    ],
  },
  {
    mkoa: "Dodoma",
    halmashauri: [
      "Halmashauri ya Jiji la Dodoma",
      "Halmashauri ya Mji Kondoa",
      "Halmashauri ya Wilaya ya Bahi",
      "Halmashauri ya Wilaya ya Chamwino",
      "Halmashauri ya Wilaya ya Chemba",
      "Halmashauri ya Wilaya ya Kondoa",
      "Halmashauri ya Wilaya ya Kongwa",
      "Halmashauri ya Wilaya ya Mpwapwa",
    ],
  },
  {
    mkoa: "Geita",
    halmashauri: [
      "Halmashauri ya Mji Geita",
      "Halmashauri ya Wilaya ya Bukombe",
      "Halmashauri ya Wilaya ya Chato",
      "Halmashauri ya Wilaya ya Geita",
      "Halmashauri ya Wilaya ya Mbogwe",
      "Halmashauri ya Wilaya ya Nyang'hwale",
    ],
  },
  {
    mkoa: "Iringa",
    halmashauri: [
      "Halmashauri ya Manispaa ya Iringa",
      "Halmashauri ya Mji Mafinga",
      "Halmashauri ya Wilaya ya Iringa",
      "Halmashauri ya Wilaya ya Kilolo",
      "Halmashauri ya Wilaya ya Mufindi",
    ],
  },
  {
    mkoa: "Kagera",
    halmashauri: [
      "Halmashauri ya Manispaa ya Bukoba",
      "Halmashauri ya Wilaya ya Biharamulo",
      "Halmashauri ya Wilaya ya Bukoba",
      "Halmashauri ya Wilaya ya Karagwe",
      "Halmashauri ya Wilaya ya Kyerwa",
      "Halmashauri ya Wilaya ya Missenyi",
      "Halmashauri ya Wilaya ya Muleba",
      "Halmashauri ya Wilaya ya Ngara",
    ],
  },
  {
    mkoa: "Katavi",
    halmashauri: [
      "Halmashauri ya Manispaa ya Mpanda",
      "Halmashauri ya Wilaya ya Mlele",
      "Halmashauri ya Wilaya ya Mpimbwe",
      "Halmashauri ya Wilaya ya Nsimbo",
      "Halmashauri ya Wilaya ya Tanganyika",
    ],
  },
  {
    mkoa: "Kigoma",
    halmashauri: [
      "Halmashauri ya Manispaa ya Kigoma/Ujiji",
      "Halmashauri ya Mji Kasulu",
      "Halmashauri ya Wilaya ya Buhigwe",
      "Halmashauri ya Wilaya ya Kakonko",
      "Halmashauri ya Wilaya ya Kasulu",
      "Halmashauri ya Wilaya ya Kibondo",
      "Halmashauri ya Wilaya ya Kigoma",
      "Halmashauri ya Wilaya ya Uvinza",
    ],
  },
  {
    mkoa: "Kilimanjaro",
    halmashauri: [
      "Halmashauri ya Manispaa ya Moshi",
      "Halmashauri ya Wilaya ya Hai",
      "Halmashauri ya Wilaya ya Moshi",
      "Halmashauri ya Wilaya ya Mwanga",
      "Halmashauri ya Wilaya ya Rombo",
      "Halmashauri ya Wilaya ya Same",
      "Halmashauri ya Wilaya ya Siha",
    ],
  },
  {
    mkoa: "Lindi",
    halmashauri: [
      "Halmashauri ya Manispaa ya Lindi",
      "Halmashauri ya Wilaya ya Kilwa",
      "Halmashauri ya Wilaya ya Lindi",
      "Halmashauri ya Wilaya ya Liwale",
      "Halmashauri ya Wilaya ya Nachingwea",
      "Halmashauri ya Wilaya ya Ruangwa",
    ],
  },
  {
    mkoa: "Manyara",
    halmashauri: [
      "Halmashauri ya Mji Babati",
      "Halmashauri ya Mji Mbulu",
      "Halmashauri ya Wilaya ya Babati",
      "Halmashauri ya Wilaya ya Hanang",
      "Halmashauri ya Wilaya ya Kiteto",
      "Halmashauri ya Wilaya ya Mbulu",
      "Halmashauri ya Wilaya ya Simanjiro",
    ],
  },
  {
    mkoa: "Mara",
    halmashauri: [
      "Halmashauri ya Manispaa ya Musoma",
      "Halmashauri ya Mji Bunda",
      "Halmashauri ya Mji Tarime",
      "Halmashauri ya Wilaya ya Bunda",
      "Halmashauri ya Wilaya ya Butiama",
      "Halmashauri ya Wilaya ya Musoma",
      "Halmashauri ya Wilaya ya Rorya",
      "Halmashauri ya Wilaya ya Serengeti",
      "Halmashauri ya Wilaya ya Tarime",
    ],
  },
  {
    mkoa: "Mbeya",
    halmashauri: [
      "Halmashauri ya Jiji la Mbeya",
      "Halmashauri ya Wilaya ya Busokelo",
      "Halmashauri ya Wilaya ya Chunya",
      "Halmashauri ya Wilaya ya Kyela",
      "Halmashauri ya Wilaya ya Mbarali",
      "Halmashauri ya Wilaya ya Mbeya",
      "Halmashauri ya Wilaya ya Rungwe",
    ],
  },
  {
    mkoa: "Morogoro",
    halmashauri: [
      "Halmashauri ya Manispaa ya Morogoro",
      "Halmashauri ya Mji Ifakara",
      "Halmashauri ya Wilaya ya Gairo",
      "Halmashauri ya Wilaya ya Kilosa",
      "Halmashauri ya Wilaya ya Malinyi",
      "Halmashauri ya Wilaya ya Mlimba/Kilombero",
      "Halmashauri ya Wilaya ya Morogoro",
      "Halmashauri ya Wilaya ya Mvomero",
      "Halmashauri ya Wilaya ya Ulanga",
    ],
  },
  {
    mkoa: "Mtwara",
    halmashauri: [
      "Halmashauri ya Mji Newala",
      "Halmashauri ya Wilaya ya Newala",
      "Halmashauri ya Wilaya ya Tandahimba",
    ],
  },
  { mkoa: "Mwanza", halmashauri: [] },
  { mkoa: "Njombe", halmashauri: [] },
  { mkoa: "Pwani", halmashauri: [] },
  { mkoa: "Rukwa", halmashauri: [] },
  { mkoa: "Ruvuma", halmashauri: [] },
  { mkoa: "Shinyanga", halmashauri: [] },
  { mkoa: "Simiyu", halmashauri: [] },
  { mkoa: "Singida", halmashauri: [] },
  { mkoa: "Songwe", halmashauri: [] },
  { mkoa: "Tabora", halmashauri: [] },
  { mkoa: "Tanga", halmashauri: [] },
];

export const MIKOA = PLACES.map((place) => place.mkoa);

const councilsByMkoa = new Map(PLACES.map((place) => [place.mkoa, place.halmashauri]));

export function isMkoa(value: string): boolean {
  return councilsByMkoa.has(value);
}

export function councilsFor(mkoa: string): string[] {
  return councilsByMkoa.get(mkoa) ?? [];
}

export function isHalmashauriOf(mkoa: string, halmashauri: string): boolean {
  return councilsFor(mkoa).includes(halmashauri);
}
