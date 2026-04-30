import Anthropic from "@anthropic-ai/sdk";
import { PARTICIPANTS, HORSES } from "@/lib/horses";

export interface Ad {
  participant: string;
  horse: string;
  product: string;
  headline: string;
  tagline: string;
  cta: string;
  url: string;
}

const FALLBACK_ADS: Ad[] = [
  { participant: "Tony",    horse: "Great White",    product: "TONY'S GREAT WHITE INTERNET SECURITY 2000",  headline: "ELIMINATE ALL Y2K BUGS!!",             tagline: "Powered by GREAT WHITE shark technology!",    cta: "PROTECT ME NOW!!",   url: "www.tony-greatwhite2000.net"   },
  { participant: "Don",     horse: "Potente",        product: "DON'S POTENTE POWER SOLUTIONS",              headline: "IL PODEROSO Y2K FIX!!",                tagline: "Most POWERFUL PC optimizer on the web!",       cta: "DOWNLOAD FREE!!",    url: "www.donpotente2000.com"        },
  { participant: "Nick",    horse: "Chief Wallabee", product: "CHIEF WALLABEE DOWNLOAD ACCELERATOR PRO",    headline: "HOP TO BLAZING 56K SPEEDS!!",           tagline: "Chief of the Information Superhighway!!",     cta: "GET IT FREE!!",      url: "www.chiefwallabee.net"         },
  { participant: "Scott",   horse: "Further Ado",    product: "SCOTT'S FURTHER ADO ANTI-VIRUS 2000",        headline: "WITHOUT FURTHER ADO: PROTECT YOUR PC!!", tagline: "No more viruses — no more ADO about nothing!", cta: "SCAN NOW FREE!!",    url: "www.furtherADO2000.com"        },
  { participant: "David",   horse: "Six Speed",      product: "DAVID'S SIX SPEED BROADBAND TURBO",          headline: "6X FASTER INTERNET GUARANTEED!!",       tagline: "Shift into SIX SPEED on the web!!",           cta: "TURBO CHARGE!!",     url: "www.sixspeednet2000.com"       },
  { participant: "Brad",    horse: "The Puma",       product: "BRAD'S PUMA SCREENSAVER MEGA PACK 2000",     headline: "1000+ FREE PUMA SCREENSAVERS!!",        tagline: "Stalk the web with PUMA-powered speed!!",     cta: "DOWNLOAD 1000!!",    url: "www.pumascreen2000.net"        },
  { participant: "Ty",      horse: "So Happy",       product: "TY'S SO HAPPY DANCING CURSOR PACK",          headline: "YOU WILL BE SO HAPPY!! FREE!!",         tagline: "500 animated cursors — SO HAPPY guaranteed!!", cta: "MAKE ME HAPPY!!",    url: "www.sohappycursors.com"        },
  { participant: "Jay",     horse: "Litmus Test",    product: "JAY'S LITMUS TEST Y2K COMPLIANCE CHECKER",   headline: "IS YOUR PC Y2K READY?? TEST NOW!!",     tagline: "The DEFINITIVE litmus test for your computer!", cta: "TEST MY PC FREE!!",  url: "www.litmustesty2k.net"         },
  { participant: "Chris",   horse: "Renegade",       product: "CHRIS'S RENEGADE BROWSER TOOLBAR 2000",      headline: "GO RENEGADE — SURF 10X FASTER!!",       tagline: "Break free from SLOW INTERNET forever!!",     cta: "ADD TO IE NOW!!",    url: "www.renegadetoolbar.com"       },
  { participant: "Brendan", horse: "Commandment",    product: "BRENDAN'S COMMANDMENT FIREWALL SUITE",       headline: "THE 10 COMMANDMENTS OF PC SECURITY!!",  tagline: "THOU SHALT NOT get a virus ever again!!",     cta: "OBEY THE LAW!!",     url: "www.commandmentfw2000.com"     },
];

const SYSTEM_PROMPT = `You write parody Y2K-era internet pop-up advertisements for participants in a Kentucky Derby pool. For each participant provided, write one over-the-top advertisement for a fake product or service named after them and cleverly referencing their horse pick.

Style guide — circa 1999-2002 internet ads:
- ALL CAPS for key phrases, excessive exclamation marks
- Reference "FREE DOWNLOAD", "YOU'VE WON!", "CLICK HERE", Millennium/Y2K/2000 branding
- Products should be fake software, toolbars, screensaver packs, internet utilities, or dial-up services
- Be punny: work the horse name into the product, headline, or tagline creatively
- Fake URLs should use formats like www.name-horse2000.com or www.nameproduct.net
- Keep each ad short and punchy

Return ONLY a valid JSON array of Ad objects. No markdown, no explanation, just the JSON.

Each Ad object must have these exact fields:
- participant: string (participant's name)
- horse: string (their horse pick)
- product: string (fake product/service name)
- headline: string (main ALL CAPS headline)
- tagline: string (secondary punny line)
- cta: string (call to action button text)
- url: string (fake URL)`;

export async function GET() {
  try {
    const client = new Anthropic();

    const participantList = PARTICIPANTS.map((p) => {
      const horse = HORSES.find((h) => h.name === p.horse);
      return `- ${p.name} is rooting for ${p.horse} (post ${horse?.post}, odds ${horse?.odds})`;
    }).join("\n");

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Generate Y2K pop-up ads for these Kentucky Derby pool participants:\n\n${participantList}\n\nReturn a JSON array of 10 Ad objects, one per participant.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const text = content.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in response");

    const ads: Ad[] = JSON.parse(jsonMatch[0]);
    return Response.json(ads);
  } catch (err) {
    console.error("Ad generation failed, using fallback:", err);
    return Response.json(FALLBACK_ADS);
  }
}
