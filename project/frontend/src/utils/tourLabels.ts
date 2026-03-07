// ─── Tour Labels Utility ───────────────────────────────────────────────────────
// Central place for English enum → Thai display label mappings.
// API calls always use the English enum values; only display labels are Thai.

export const CATEGORY_OPTIONS = [
  { value: "Sea", label: "ทะเล" },
  { value: "Mountain", label: "ภูเขา" },
  { value: "Nature", label: "ธรรมชาติ" },
  { value: "Cultural", label: "วัฒนธรรม" },
  { value: "City", label: "ในเมือง" },
  { value: "Adventure", label: "ผจญภัย" },
];

export const REGION_OPTIONS = [
  { value: "North", label: "ภาคเหนือ" },
  { value: "Central", label: "ภาคกลาง" },
  { value: "Northeast", label: "ภาคอีสาน" },
  { value: "West", label: "ภาคตะวันตก" },
  { value: "East", label: "ภาคตะวันออก" },
  { value: "South", label: "ภาคใต้" },
];

export const DURATION_OPTIONS = [
  { value: "1 day", label: "1 วัน" },
  { value: "1 day 1 night", label: "1 วัน 1 คืน" },
  { value: "2 days 1 night", label: "2 วัน 1 คืน" },
  { value: "2 days 2 nights", label: "2 วัน 2 คืน" },
  { value: "3 days 2 nights", label: "3 วัน 2 คืน" },
  { value: "3 days 3 nights", label: "3 วัน 3 คืน" },
  { value: "4 days 3 nights", label: "4 วัน 3 คืน" },
  { value: "4 days 4 nights", label: "4 วัน 4 คืน" },
  { value: "5 days 4 nights", label: "5 วัน 4 คืน" },
  { value: "5 days 5 nights", label: "5 วัน 5 คืน" },
];

export function getCategoryLabel(value: string): string {
  return CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getDurationLabel(value: string): string {
  return DURATION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getRegionLabel(value: string): string {
  return REGION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

const PROVINCE_LABELS: Record<string, string> = {
  amnatcharoen: "อำนาจเจริญ",
  angthong: "อ่างทอง",
  ayutthaya: "พระนครศรีอยุธยา",
  bangkok: "กรุงเทพมหานคร",
  buengkan: "บึงกาฬ",
  buriram: "บุรีรัมย์",
  chachoengsao: "ฉะเชิงเทรา",
  chaengsao: "ฉะเชิงเทรา",
  chainat: "ชัยนาท",
  chaiyaphum: "ชัยภูมิ",
  chanthaburi: "จันทบุรี",
  chiangmai: "เชียงใหม่",
  chiangrai: "เชียงราย",
  chonburi: "ชลบุรี",
  chumphon: "ชุมพร",
  kalasin: "กาฬสินธุ์",
  kamphaengphet: "กำแพงเพชร",
  kanchanaburi: "กาญจนบุรี",
  khonkaen: "ขอนแก่น",
  krabi: "กระบี่",
  lampang: "ลำปาง",
  lamphun: "ลำพูน",
  loei: "เลย",
  lopburi: "ลพบุรี",
  maehongson: "แม่ฮ่องสอน",
  mahasarakham: "มหาสารคาม",
  mukdahan: "มุกดาหาร",
  nakhonnayok: "นครนายก",
  nakhonpathom: "นครปฐม",
  nakhonphanom: "นครพนม",
  nakhonratchasima: "นครราชสีมา",
  nakhonrachasima: "นครราชสีมา",
  nakhonsawan: "นครสวรรค์",
  nakhonsithammarat: "นครศรีธรรมราช",
  nan: "น่าน",
  narathiwat: "นราธิวาส",
  nongbualamphu: "หนองบัวลำภู",
  nongkhai: "หนองคาย",
  nonthaburi: "นนทบุรี",
  pathumthani: "ปทุมธานี",
  pattani: "ปัตตานี",
  phangnga: "พังงา",
  phatthalung: "พัทลุง",
  phayao: "พะเยา",
  phetchabun: "เพชรบูรณ์",
  phetchaburi: "เพชรบุรี",
  phichit: "พิจิตร",
  phitsanulok: "พิษณุโลก",
  phranakhonsiayutthaya: "พระนครศรีอยุธยา",
  phrae: "แพร่",
  phuket: "ภูเก็ต",
  prachinburi: "ปราจีนบุรี",
  prachuapkhirikhan: "ประจวบคีรีขันธ์",
  ranong: "ระนอง",
  ratchaburi: "ราชบุรี",
  rayong: "ระยอง",
  roiet: "ร้อยเอ็ด",
  sakaeo: "สระแก้ว",
  sakonnakhon: "สกลนคร",
  samutprakarn: "สมุทรปราการ",
  samutprakan: "สมุทรปราการ",
  samutsakhon: "สมุทรสาคร",
  samutsongkhram: "สมุทรสงคราม",
  saraburi: "สระบุรี",
  satun: "สตูล",
  sisaket: "ศรีสะเกษ",
  singburi: "สิงห์บุรี",
  songkhla: "สงขลา",
  sukhothai: "สุโขทัย",
  suphanburi: "สุพรรณบุรี",
  suratthani: "สุราษฎร์ธานี",
  surin: "สุรินทร์",
  tak: "ตาก",
  trang: "ตรัง",
  trat: "ตราด",
  ubonratchathani: "อุบลราชธานี",
  udonthani: "อุดรธานี",
  uthaithani: "อุทัยธานี",
  uttaradit: "อุตรดิตถ์",
  yala: "ยะลา",
  yasothon: "ยโสธร",
};

function normalizeProvinceKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getProvinceLabel(value: string): string {
  if (!value) return value;
  if (/[\u0E00-\u0E7F]/.test(value)) return value;
  return PROVINCE_LABELS[normalizeProvinceKey(value)] ?? value;
}