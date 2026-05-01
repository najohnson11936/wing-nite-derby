export interface Horse {
  post: number;
  name: string;
  jockey: string;
  trainer: string;
  odds: string;
  oddsNum: number;
}

export interface Participant {
  name: string;
  horse: string;
}

export const HORSES: Horse[] = [
  { post: 1,  name: "Renegade",        jockey: "Irad Ortiz Jr.",        trainer: "Todd Pletcher",    odds: "5-1",  oddsNum: 5   },
  { post: 2,  name: "Albus",           jockey: "Manuel Franco",         trainer: "Riley Mott",       odds: "51-1", oddsNum: 51  },
  { post: 3,  name: "Intrepido",       jockey: "Hector Berrios",        trainer: "Jeff Mullins",     odds: "54-1", oddsNum: 54  },
  { post: 4,  name: "Litmus Test",     jockey: "Martin Garcia",         trainer: "Bob Baffert",      odds: "34-1", oddsNum: 34  },
  { post: 5,  name: "Right to Party",  jockey: "Chris Elliott",         trainer: "Kenny McPeek",     odds: "26-1", oddsNum: 26  },
  { post: 6,  name: "Commandment",     jockey: "Luis Saez",             trainer: "Brad Cox",         odds: "7-1",  oddsNum: 7   },
  { post: 7,  name: "Danon Bourbon",   jockey: "Atsuya Nishimura",      trainer: "Manabu Ikezoe",    odds: "15-1", oddsNum: 15  },
  { post: 8,  name: "So Happy",        jockey: "Mike Smith",            trainer: "Mark Glatt",       odds: "6-1",  oddsNum: 6   },
  { post: 9,  name: "The Puma",        jockey: "Javier Castellano",     trainer: "Gustavo Delgado",  odds: "8-1",  oddsNum: 8   },
  { post: 10, name: "Wonder Dean",     jockey: "Ryusei Sakai",          trainer: "Daisuke Takayanagi", odds: "21-1", oddsNum: 21 },
  { post: 11, name: "Incredibolt",     jockey: "Jaime Torres",          trainer: "Riley Mott",       odds: "27-1", oddsNum: 27  },
  { post: 12, name: "Chief Wallabee",  jockey: "Junior Alvarado",       trainer: "Bill Mott",        odds: "9-1",  oddsNum: 9   },
  { post: 14, name: "Potente",         jockey: "Juan Hernandez",        trainer: "Bob Baffert",      odds: "23-1", oddsNum: 23  },
  { post: 15, name: "Emerging Market", jockey: "Flavien Prat",          trainer: "Chad Brown",       odds: "11-1", oddsNum: 11  },
  { post: 16, name: "Pavlovian",       jockey: "Edwin Maldonado",       trainer: "Doug O'Neill",     odds: "51-1", oddsNum: 51  },
  { post: 17, name: "Six Speed",       jockey: "Brian Hernandez Jr.",   trainer: "Bhupat Seemar",    odds: "39-1", oddsNum: 39  },
  { post: 18, name: "Further Ado",     jockey: "John Velazquez",        trainer: "Brad Cox",         odds: "7-1",  oddsNum: 7   },
  { post: 19, name: "Golden Tempo",    jockey: "Jose Ortiz",            trainer: "Cherie Devaux",    odds: "36-1", oddsNum: 36  },
  { post: 21, name: "Great White",     jockey: "Alex Achard",           trainer: "John Ennis",       odds: "30-1", oddsNum: 30  },
  { post: 22, name: "Ocelli",          jockey: "Joseph Ramos",          trainer: "D.W. Beckman",     odds: "50-1", oddsNum: 50  },
  { post: 23, name: "Robusta",         jockey: "Emisael Jaramillo",     trainer: "Doug O'Neill",     odds: "50-1", oddsNum: 50  },
  { post: 24, name: "Corona De Oro",   jockey: "Brian Hernandez Jr.",   trainer: "Dallas Stewart",   odds: "50-1", oddsNum: 50  },
];

export const PARTICIPANTS: Participant[] = [
  { name: "Tony",    horse: "Great White"    },
  { name: "Don",     horse: "Potente"        },
  { name: "Nick",    horse: "Chief Wallabee" },
  { name: "Scott",   horse: "Further Ado"    },
  { name: "David",   horse: "Six Speed"      },
  { name: "Brad",    horse: "The Puma"       },
  { name: "Ty",      horse: "So Happy"       },
  { name: "Jay",     horse: "Litmus Test"    },
  { name: "Chris",   horse: "Renegade"       },
  { name: "Brendan", horse: "Commandment"    },
];

export const ODDS_LAST_UPDATED = "May 1, 2026 — 9:00 AM ET";

export const TOTAL_POT = 100;

export const PAYOUTS: Record<number, number> = {
  1: 70,
  2: 20,
  3: 10,
};
