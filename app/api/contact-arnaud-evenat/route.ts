const vcardLines = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "PRODID:-//Apple Inc.//iPhone OS 26.1//EN",
  "N:Evenat;Arnaud;;;",
  "FN:Arnaud Evenat",
  "ORG:Responsable d'agence - ALV Immobilier Pleyben;",
  "TITLE:Responsable d'agence - ALV Immobilier Pleyben",
  "EMAIL;type=INTERNET;type=WORK;type=pref:contact@alvimobilier.bzh",
  "TEL;type=WORK;type=VOICE;type=pref:+33 2 98 26 71 47",
  "TEL;type=CELL;type=VOICE:+33659850662",
  "item1.ADR;type=WORK;type=pref:;;19 Pl. Charles de Gaulle;Pleyben;;29190;France",
  "item1.X-ABADR:fr",
  "item2.URL;type=pref:http://alvimmobilier.bzh",
  "item2.X-ABLabel:_$!<HomePage>!$_",
  "END:VCARD",
];

const vcardContent = `${vcardLines.join("\r\n")}\r\n`;

export async function GET() {
  return new Response(vcardContent, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="arnaud-evenat.vcf"',
      "Cache-Control": "public, max-age=3600, immutable",
    },
  });
}

