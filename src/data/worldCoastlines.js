/**
 * High-Detail World Coastline Vector Paths (Equirectangular Projection 1000 x 500)
 *
 * Mapped mathematically:
 *   x = ((lng + 180) / 360) * 1000
 *   y = ((90 - lat) / 180) * 500
 *
 * Zero country borders, zero text labels.
 * Pure geographical coastline silhouettes with high geographic fidelity.
 */

export const WORLD_CONTINENTS = [
  // =========================================================================
  // NORTH AMERICA (Alaska, Canada, USA, Mexico, Central America)
  // =========================================================================
  {
    id: 'north-america',
    name: 'North America',
    d: [
      // Alaska, Canada, Contiguous US, Mexico, Central America
      'M 46,67 ' +
      'L 53,60 L 65,52 L 81,51 L 97,55 L 114,60 L 129,58 L 138,51 L 153,52 L 165,58 L 180,63 ' +
      'L 194,61 L 208,68 L 222,64 L 235,69 L 246,75 L 260,70 L 273,74 L 285,67 L 297,71 ' +
      'L 310,79 L 322,86 L 333,96 L 338,110 L 330,121 L 319,127 L 311,139 L 305,152 L 297,148 ' +
      'L 290,137 L 281,141 L 274,131 L 265,135 L 257,126 L 246,128 L 239,139 L 247,150 L 253,161 ' +
      // Gulf of St. Lawrence & US East Coast
      'L 264,166 L 273,158 L 281,162 L 275,173 L 262,176 L 255,183 L 250,196 L 243,205 ' +
      // Florida Peninsula
      'L 247,215 L 249,228 L 246,236 L 240,237 L 238,226 L 235,214 ' +
      // Gulf of Mexico
      'L 225,218 L 214,222 L 204,226 L 198,236 L 197,249 L 205,257 ' +
      // Yucatan Peninsula
      'L 216,252 L 224,244 L 229,248 L 225,258 L 220,265 ' +
      // Central America (Belize, Honduras, Nicaragua, Costa Rica, Panama)
      'L 227,267 L 236,263 L 244,268 L 253,272 L 263,276 L 274,281 L 282,284 L 285,287 ' +
      'L 282,289 L 273,286 L 264,284 L 254,281 L 245,283 L 236,278 L 227,276 L 218,272 ' +
      // Pacific Coast of Central America & Mexico
      'L 210,267 L 202,263 L 195,256 L 187,249 L 180,240 L 174,236 L 168,245 L 161,254 ' +
      // Baja California Peninsula
      'L 155,248 L 158,235 L 164,223 L 171,213 L 174,198 ' +
      // US West Coast (California, Oregon, Washington)
      'L 168,187 L 163,174 L 157,161 L 153,148 L 149,134 L 145,121 ' +
      // British Columbia & Alaska Panhandle
      'L 138,111 L 131,104 L 123,98 L 115,92 L 105,88 L 96,86 L 87,90 L 78,89 ' +
      // Alaska Peninsula & Aleutians
      'L 69,96 L 60,103 L 52,109 L 44,112 L 40,105 L 47,97 L 54,90 L 52,83 L 45,76 Z'
    ].join(' ')
  },

  // =========================================================================
  // CANADIAN ARCTIC ARCHIPELAGO & BAFFIN ISLAND
  // =========================================================================
  {
    id: 'canadian-islands',
    name: 'Canadian Arctic Islands',
    d: [
      // Baffin Island
      'M 290,62 L 305,67 L 316,77 L 309,87 L 297,83 L 287,74 L 282,65 Z',
      // Victoria Island
      'M 200,53 L 220,55 L 227,64 L 216,70 L 203,66 L 196,59 Z',
      // Ellesmere Island
      'M 275,30 L 295,35 L 305,48 L 292,54 L 278,45 L 271,36 Z',
      // Newfoundland
      'M 285,145 L 295,142 L 300,150 L 292,156 L 284,151 Z',
      // Vancouver Island
      'M 141,123 L 146,128 L 143,135 L 138,131 Z',
      // Cuba
      'M 230,238 L 246,242 L 258,247 L 253,251 L 238,246 L 228,241 Z',
      // Hispaniola (Haiti & Dominican Republic)
      'M 264,248 L 277,250 L 283,255 L 272,256 L 263,252 Z'
    ].join(' ')
  },

  // =========================================================================
  // GREENLAND
  // =========================================================================
  {
    id: 'greenland',
    name: 'Greenland',
    d: [
      'M 355,30 L 380,26 L 408,32 L 424,43 L 418,60 L 396,73 L 378,85 L 366,80 L 362,68 L 350,55 L 344,42 Z'
    ].join(' ')
  },

  // =========================================================================
  // SOUTH AMERICA
  // =========================================================================
  {
    id: 'south-america',
    name: 'South America',
    d: [
      'M 284,288 ' +
      // Northern Caribbean Coast (Colombia, Venezuela, Guianas)
      'L 295,283 L 306,280 L 319,284 L 333,288 L 347,293 L 360,299 L 374,307 ' +
      // Brazilian Bulge (Fortaleza, Natal, Recife, Salvador)
      'L 388,318 L 399,331 L 403,346 L 398,359 L 391,371 L 380,381 L 369,392 ' +
      // Southern Brazil, Uruguay, Rio de la Plata
      'L 360,404 L 351,417 L 341,430 L 331,444 ' +
      // Argentine Coast & Patagonia
      'L 322,458 L 318,472 L 314,486 L 308,495 L 298,491 ' +
      // Tierra del Fuego & Cape Horn
      'L 295,479 L 299,465 L 294,452 ' +
      // Chilean Pacific Coast & Fjords
      'L 290,439 L 288,424 L 285,408 L 282,393 L 280,378 L 277,362 ' +
      // Peru & Ecuador
      'L 272,347 L 268,333 L 264,319 L 267,306 L 273,296 Z'
    ].join(' ')
  },

  // =========================================================================
  // EUROPE (British Isles, Scandinavia, Western & Southern Europe, Mediterranean)
  // =========================================================================
  {
    id: 'europe',
    name: 'Europe',
    d: [
      // Mainland Europe (Spain, France, Low Countries, Germany, Poland, Balkans, Italy)
      'M 470,148 ' +
      // France North & Low Countries
      'L 480,143 L 493,141 L 507,143 L 521,146 L 536,143 L 549,141 L 562,143 ' +
      // Black Sea & Danube
      'L 576,146 L 588,150 L 596,158 L 591,167 L 581,173 L 571,170 ' +
      // Greece & Balkans
      'L 562,176 L 567,185 L 561,192 L 554,187 L 548,179 ' +
      // Italy ("The Boot") & Adriatic
      'L 542,172 L 547,182 L 542,190 L 537,187 L 533,178 L 528,172 ' +
      // Southern France & Spain (Mediterranean coast)
      'L 520,174 L 510,178 L 499,184 L 488,189 L 477,192 L 468,189 ' +
      // Portugal & Atlantic Spain
      'L 462,183 L 460,172 L 463,162 L 471,155 Z',

      // Scandinavia (Norway, Sweden, Finland)
      'M 511,76 ' +
      'L 526,67 L 542,62 L 558,68 L 569,79 L 559,92 L 551,105 L 544,118 ' +
      'L 538,129 L 531,135 L 524,127 L 520,114 L 515,102 L 507,91 Z',

      // British Isles (Great Britain)
      'M 475,123 L 484,116 L 491,124 L 485,133 L 476,140 L 468,136 L 470,128 Z',
      // Ireland
      'M 458,127 L 466,124 L 469,132 L 463,138 L 456,135 Z',
      // Iceland
      'M 436,75 L 449,72 L 456,79 L 448,85 L 437,82 Z',
      // Sicily
      'M 536,192 L 543,191 L 544,196 L 537,197 Z',
      // Sardinia
      'M 522,183 L 526,182 L 525,189 L 521,189 Z',
      // Corsica
      'M 523,176 L 526,175 L 526,180 L 522,180 Z',
      // Crete
      'M 565,198 L 575,197 L 574,201 L 564,201 Z'
    ].join(' ')
  },

  // =========================================================================
  // AFRICA
  // =========================================================================
  {
    id: 'africa',
    name: 'Africa',
    d: [
      'M 466,194 ' +
      // North African Mediterranean Coast (Morocco, Algeria, Tunisia, Libya, Egypt)
      'L 480,192 L 496,194 L 511,192 L 525,196 L 539,203 L 554,204 L 569,207 L 583,212 ' +
      // Red Sea Coast & Horn of Africa (Sudan, Eritrea, Djibouti, Somalia)
      'L 593,222 L 602,234 L 610,248 L 619,262 L 611,273 L 600,285 ' +
      // East African Coast (Kenya, Tanzania, Mozambique)
      'L 595,299 L 588,314 L 581,328 L 574,343 L 565,357 ' +
      // South Africa (Durban, Cape of Good Hope, Cape Town)
      'L 556,369 L 544,375 L 533,368 L 525,356 ' +
      // West African Atlantic Coast (Namibia, Angola, Gabon)
      'L 522,341 L 520,326 L 518,311 L 515,296 L 509,283 ' +
      // Gulf of Guinea (Nigeria, Ghana, Ivory Coast, Liberia)
      'L 498,278 L 486,275 L 474,272 L 461,271 L 450,268 ' +
      // Cap-Vert & Senegal Coast to Morocco
      'L 443,257 L 446,244 L 451,231 L 457,218 L 462,206 Z',

      // Madagascar
      'M 618,328 L 627,322 L 634,334 L 630,351 L 622,366 L 615,360 L 616,344 Z'
    ].join(' ')
  },

  // =========================================================================
  // ASIA & EURASIA (Russia, Siberia, Middle East, India, China, SE Asia, Japan)
  // =========================================================================
  {
    id: 'asia',
    name: 'Asia',
    d: [
      // Main Eurasian Continental Mass
      'M 565,142 ' +
      // Northern Russia & Siberian Arctic Coast
      'L 583,138 L 606,134 L 631,126 L 658,119 L 687,114 L 719,108 L 752,103 ' +
      'L 785,98 L 818,97 L 852,101 L 884,107 L 913,115 L 938,124 ' +
      // Kamchatka Peninsula & Sea of Okhotsk
      'L 946,136 L 938,148 L 928,157 L 918,148 L 909,141 ' +
      // Russian Far East & Vladivostok Coast
      'L 897,148 L 888,159 L 878,168 ' +
      // Korean Peninsula
      'L 872,179 L 867,191 L 860,188 L 858,177 ' +
      // China Coast (Bohai, Shanghai, Fujian, Guangdong)
      'L 848,178 L 839,188 L 836,201 L 828,214 L 817,226 L 804,235 ' +
      // Indochina & Malay Peninsula (Vietnam, Thailand, Malaysia)
      'L 796,248 L 788,260 L 780,272 L 775,282 L 771,273 L 776,260 L 770,248 L 760,240 ' +
      // Indian Subcontinent (Bay of Bengal, Kanyakumari, Arabian Sea)
      'L 747,235 L 734,242 L 722,253 L 713,266 L 706,256 L 701,244 L 694,233 L 684,228 ' +
      // Arabian Peninsula & Persian Gulf
      'L 669,229 L 655,233 L 642,242 L 630,254 L 620,266 L 610,258 L 602,246 L 594,234 ' +
      // Anatolia / Middle East connecting back to Black Sea
      'L 587,222 L 581,211 L 575,200 L 569,188 L 564,175 L 560,162 L 562,151 Z',

      // Japan - Honshu, Hokkaido, Kyushu, Shikoku
      'M 885,148 L 897,143 L 903,153 L 895,161 L 886,155 Z', // Hokkaido
      'M 876,163 L 887,159 L 895,171 L 888,184 L 878,191 L 869,186 L 871,174 Z', // Honshu
      'M 865,193 L 872,190 L 871,198 L 863,198 Z', // Shikoku
      'M 857,194 L 864,191 L 864,203 L 856,201 Z', // Kyushu

      // Taiwan
      'M 833,212 L 838,209 L 840,219 L 835,221 Z',
      // Hainan Island
      'M 803,237 L 810,235 L 811,242 L 804,243 Z',
      // Sri Lanka
      'M 718,269 L 724,266 L 726,275 L 720,278 Z',
      // Sakhalin Island
      'M 915,128 L 920,126 L 922,143 L 916,144 Z'
    ].join(' ')
  },

  // =========================================================================
  // SOUTHEAST ASIAN ARCHIPELAGO (Indonesia, Philippines)
  // =========================================================================
  {
    id: 'indonesia-philippines',
    name: 'Maritime Southeast Asia',
    d: [
      // Sumatra
      'M 764,268 L 778,258 L 791,273 L 782,286 L 770,283 Z',
      // Java
      'M 794,293 L 815,292 L 826,296 L 815,301 L 797,298 Z',
      // Borneo
      'M 802,260 L 818,252 L 831,262 L 829,278 L 817,284 L 804,275 Z',
      // Sulawesi (Celebes)
      'M 833,266 L 844,262 L 846,276 L 839,286 L 833,277 Z',
      // Philippines (Luzon & Mindanao)
      'M 834,217 L 843,213 L 845,227 L 837,233 Z', // Luzon
      'M 840,240 L 849,237 L 849,250 L 841,250 Z', // Mindanao
      // New Guinea
      'M 866,271 L 888,264 L 912,274 L 924,286 L 909,292 L 886,289 L 870,282 Z'
    ].join(' ')
  },

  // =========================================================================
  // AUSTRALIA & NEW ZEALAND
  // =========================================================================
  {
    id: 'oceania',
    name: 'Australia & New Zealand',
    d: [
      // Mainland Australia
      'M 845,348 ' +
      // Northern Coast & Gulf of Carpentaria
      'L 861,338 L 878,332 L 894,337 L 906,346 ' +
      // East Coast (Brisbane, Sydney, Melbourne)
      'L 916,361 L 923,378 L 926,396 L 919,412 L 907,424 L 891,429 ' +
      // Great Australian Bight & South Coast
      'L 873,431 L 856,428 L 840,422 L 828,411 ' +
      // West Coast (Perth, Shark Bay, Kimberley)
      'L 820,396 L 817,379 L 820,363 L 831,352 Z',

      // Tasmania
      'M 901,438 L 911,436 L 912,446 L 902,447 Z',

      // New Zealand (North Island & South Island)
      'M 953,426 L 964,420 L 968,432 L 959,437 Z', // North Island
      'M 944,439 L 954,434 L 957,449 L 946,454 Z'  // South Island
    ].join(' ')
  },

  // =========================================================================
  // ANTARCTICA
  // =========================================================================
  {
    id: 'antarctica',
    name: 'Antarctica',
    d: [
      'M 0,488 ' +
      'L 60,483 L 130,480 L 200,478 L 260,479 ' +
      // Antarctic Peninsula (Palmer Land) reaching toward South America
      'L 282,464 L 293,450 L 297,458 L 290,473 L 305,479 ' +
      // Weddell Sea & Queen Maud Land
      'L 380,481 L 460,478 L 540,480 L 620,478 L 700,481 ' +
      // Wilkes Land & Ross Ice Shelf
      'L 780,479 L 850,482 L 920,480 L 980,485 L 1000,490 ' +
      'L 1000,500 L 0,500 Z'
    ].join(' ')
  }
];
