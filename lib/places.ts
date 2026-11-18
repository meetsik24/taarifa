/**
 * Kanda come from the zone list used on the form.
 * Mikoa are grouped under those zones.
 * Councils already published on
 * https://www.tanzania.go.tz/directories/local-government stay as listed there.
 * Councils missing from that page are the 2022 census councils (NBS)
 * for the same region, written in the same Halmashauri style.
 */

type Place = { mkoa: string; halmashauri: string[] };

export const ZONES: { kanda: string; mikoa: Place[] }[] = [
  {
    kanda: "Kanda ya Mashariki",
    mikoa: [
      {
        mkoa: "Pwani",
        halmashauri: [
          "Halmashauri ya Mji Kibaha",
          "Halmashauri ya Wilaya ya Bagamoyo",
          "Halmashauri ya Wilaya ya Chalinze",
          "Halmashauri ya Wilaya ya Kibaha",
          "Halmashauri ya Wilaya ya Kibiti",
          "Halmashauri ya Wilaya ya Kisarawe",
          "Halmashauri ya Wilaya ya Mafia",
          "Halmashauri ya Wilaya ya Mkuranga",
          "Halmashauri ya Wilaya ya Rufiji",
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
        mkoa: "Morogoro",
        halmashauri: [
          "Halmashauri ya Manispaa ya Morogoro",
          "Halmashauri ya Mji Ifakara",
          "Halmashauri ya Wilaya ya Gairo",
          "Halmashauri ya Wilaya ya Kilosa",
          "Halmashauri ya Wilaya ya Malinyi",
          "Halmashauri ya Wilaya ya Mlimba",
          "Halmashauri ya Wilaya ya Morogoro",
          "Halmashauri ya Wilaya ya Mvomero",
          "Halmashauri ya Wilaya ya Ulanga",
        ],
      },
    ],
  },
  {
    kanda: "Kanda ya Kaskazini",
    mikoa: [
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
        mkoa: "Tanga",
        halmashauri: [
          "Halmashauri ya Jiji la Tanga",
          "Halmashauri ya Mji Handeni",
          "Halmashauri ya Mji Korogwe",
          "Halmashauri ya Wilaya ya Bumbuli",
          "Halmashauri ya Wilaya ya Handeni",
          "Halmashauri ya Wilaya ya Kilindi",
          "Halmashauri ya Wilaya ya Korogwe",
          "Halmashauri ya Wilaya ya Lushoto",
          "Halmashauri ya Wilaya ya Mkinga",
          "Halmashauri ya Wilaya ya Muheza",
          "Halmashauri ya Wilaya ya Pangani",
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
    ],
  },
  {
    kanda: "Kanda ya Ziwa",
    mikoa: [
      {
        mkoa: "Mwanza",
        halmashauri: [
          "Halmashauri ya Jiji la Mwanza",
          "Halmashauri ya Manispaa ya Ilemela",
          "Halmashauri ya Wilaya ya Buchosa",
          "Halmashauri ya Wilaya ya Kwimba",
          "Halmashauri ya Wilaya ya Magu",
          "Halmashauri ya Wilaya ya Misungwi",
          "Halmashauri ya Wilaya ya Sengerema",
          "Halmashauri ya Wilaya ya Ukerewe",
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
    ],
  },
  {
    kanda: "Kanda ya Kusini",
    mikoa: [
      {
        mkoa: "Ruvuma",
        halmashauri: [
          "Halmashauri ya Manispaa ya Songea",
          "Halmashauri ya Mji Mbinga",
          "Halmashauri ya Wilaya ya Madaba",
          "Halmashauri ya Wilaya ya Mbinga",
          "Halmashauri ya Wilaya ya Namtumbo",
          "Halmashauri ya Wilaya ya Nyasa",
          "Halmashauri ya Wilaya ya Songea",
          "Halmashauri ya Wilaya ya Tunduru",
        ],
      },
      {
        mkoa: "Mtwara",
        halmashauri: [
          "Halmashauri ya Manispaa ya Mtwara",
          "Halmashauri ya Mji Masasi",
          "Halmashauri ya Mji Nanyamba",
          "Halmashauri ya Mji Newala",
          "Halmashauri ya Wilaya ya Masasi",
          "Halmashauri ya Wilaya ya Mtwara",
          "Halmashauri ya Wilaya ya Nanyumbu",
          "Halmashauri ya Wilaya ya Newala",
          "Halmashauri ya Wilaya ya Tandahimba",
        ],
      },
      {
        mkoa: "Lindi",
        halmashauri: [
          "Halmashauri ya Manispaa ya Lindi",
          "Halmashauri ya Wilaya ya Kilwa",
          "Halmashauri ya Wilaya ya Mtama",
          "Halmashauri ya Wilaya ya Liwale",
          "Halmashauri ya Wilaya ya Nachingwea",
          "Halmashauri ya Wilaya ya Ruangwa",
        ],
      },
    ],
  },
  {
    kanda: "Kanda ya Magharibi",
    mikoa: [
      {
        mkoa: "Shinyanga",
        halmashauri: [
          "Halmashauri ya Manispaa ya Kahama",
          "Halmashauri ya Manispaa ya Shinyanga",
          "Halmashauri ya Wilaya ya Kishapu",
          "Halmashauri ya Wilaya ya Msalala",
          "Halmashauri ya Wilaya ya Shinyanga",
          "Halmashauri ya Wilaya ya Ushetu",
        ],
      },
      {
        mkoa: "Tabora",
        halmashauri: [
          "Halmashauri ya Manispaa ya Tabora",
          "Halmashauri ya Mji Nzega",
          "Halmashauri ya Wilaya ya Igunga",
          "Halmashauri ya Wilaya ya Kaliua",
          "Halmashauri ya Wilaya ya Nzega",
          "Halmashauri ya Wilaya ya Sikonge",
          "Halmashauri ya Wilaya ya Urambo",
          "Halmashauri ya Wilaya ya Uyui",
        ],
      },
      {
        mkoa: "Simiyu",
        halmashauri: [
          "Halmashauri ya Mji Bariadi",
          "Halmashauri ya Wilaya ya Bariadi",
          "Halmashauri ya Wilaya ya Busega",
          "Halmashauri ya Wilaya ya Itilima",
          "Halmashauri ya Wilaya ya Maswa",
          "Halmashauri ya Wilaya ya Meatu",
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
    ],
  },
  {
    kanda: "Kanda ya Nyanda za Juu Kusini",
    mikoa: [
      {
        mkoa: "Rukwa",
        halmashauri: [
          "Halmashauri ya Manispaa ya Sumbawanga",
          "Halmashauri ya Wilaya ya Kalambo",
          "Halmashauri ya Wilaya ya Nkasi",
          "Halmashauri ya Wilaya ya Sumbawanga",
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
        mkoa: "Songwe",
        halmashauri: [
          "Halmashauri ya Mji Tunduma",
          "Halmashauri ya Wilaya ya Ileje",
          "Halmashauri ya Wilaya ya Mbozi",
          "Halmashauri ya Wilaya ya Momba",
          "Halmashauri ya Wilaya ya Songwe",
        ],
      },
      {
        mkoa: "Njombe",
        halmashauri: [
          "Halmashauri ya Mji Makambako",
          "Halmashauri ya Mji Njombe",
          "Halmashauri ya Wilaya ya Ludewa",
          "Halmashauri ya Wilaya ya Makete",
          "Halmashauri ya Wilaya ya Njombe",
          "Halmashauri ya Wilaya ya Wanging'ombe",
        ],
      },
    ],
  },
  {
    kanda: "Kanda ya Kati",
    mikoa: [
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
        mkoa: "Singida",
        halmashauri: [
          "Halmashauri ya Manispaa ya Singida",
          "Halmashauri ya Wilaya ya Ikungi",
          "Halmashauri ya Wilaya ya Iramba",
          "Halmashauri ya Wilaya ya Itigi",
          "Halmashauri ya Wilaya ya Manyoni",
          "Halmashauri ya Wilaya ya Mkalama",
          "Halmashauri ya Wilaya ya Singida",
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
    ],
  },
];

export const KANDA = ZONES.map((zone) => zone.kanda);

const zoneByName = new Map(ZONES.map((zone) => [zone.kanda, zone]));
const placeByMkoa = new Map(
  ZONES.flatMap((zone) => zone.mikoa.map((place) => [place.mkoa, place] as const)),
);
const kandaByMkoa = new Map(
  ZONES.flatMap((zone) => zone.mikoa.map((place) => [place.mkoa, zone.kanda] as const)),
);

export function isKanda(value: string): boolean {
  return zoneByName.has(value);
}

export function mikoaFor(kanda: string): string[] {
  return zoneByName.get(kanda)?.mikoa.map((place) => place.mkoa) ?? [];
}

export function isMkoa(value: string): boolean {
  return placeByMkoa.has(value);
}

export function isMkoaOf(kanda: string, mkoa: string): boolean {
  return kandaByMkoa.get(mkoa) === kanda;
}

export function councilsFor(mkoa: string): string[] {
  return placeByMkoa.get(mkoa)?.halmashauri ?? [];
}

export function isHalmashauriOf(mkoa: string, halmashauri: string): boolean {
  return councilsFor(mkoa).includes(halmashauri);
}
