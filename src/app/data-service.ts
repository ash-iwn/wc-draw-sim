import { Injectable } from '@angular/core';
import { Team } from './model';

@Injectable({ providedIn: 'root' })
export class DataService {
  CONFEDERATIONS = {
    AFC: { name: 'AFC', fullName: 'Asian Football Confederation', color: '#FF6B35', maxPerGroup: 1, logo: '🌏' },
    CAF: { name: 'CAF', fullName: 'Confederation of African Football', color: '#F4D03F', maxPerGroup: 1, logo: '🌍' },
    CONCACAF: { name: 'CONCACAF', fullName: 'North American Football Confederation', color: '#85C1E9', maxPerGroup: 1, logo: '🌎' },
    CONMEBOL: { name: 'CONMEBOL', fullName: 'South American Football Confederation', color: '#82E0AA', maxPerGroup: 1, logo: '🌎' },
    OFC: { name: 'OFC', fullName: 'Oceania Football Confederation', color: '#D7BDE2', maxPerGroup: 1, logo: '🌊' },
    UEFA: { name: 'UEFA', fullName: 'Union of European Football Associations', color: '#F8C471', maxPerGroup: 2, logo: '🇪🇺' }
  };

//   QUALIFIED_TEAMS = [
//     // CONCACAF Hosts + Direct Qualifiers (6 total)
//     { name: 'Canada', confederation: 'CONCACAF', points: 1558.04, qualified: true, host: true, flag: '🇨🇦' },
//     { name: 'Mexico', confederation: 'CONCACAF', points: 1688.38, qualified: true, host: true, flag: '🇲🇽' },
//     { name: 'United States', confederation: 'CONCACAF', points: 1670.04, qualified: true, host: true, flag: '🇺🇸' },
//     { name: 'Honduras', confederation: 'CONCACAF', points: 1383.98, qualified: true, flag: '🇭🇳' },
//     { name: 'Jamaica', confederation: 'CONCACAF', points: 1377.22, qualified: true, flag: '🇯🇲' },
//     { name: 'Suriname', confederation: 'CONCACAF', points: 1465.02, qualified: true, flag: '🇸🇷' },

    
//     // AFC Direct Qualifiers (8 total)
//     { name: 'Iran', confederation: 'AFC', points: 1622.61, qualified: true, flag: '🇮🇷' },
//     { name: 'Japan', confederation: 'AFC', points: 1640.47, qualified: true, flag: '🇯🇵' },
//     { name: 'South Korea', confederation: 'AFC', points: 1593.19, qualified: true, flag: '🇰🇷' },
//     { name: 'Australia', confederation: 'AFC', points: 1583.49, qualified: true, flag: '🇦🇺' },
//     { name: 'Jordan', confederation: 'AFC', points: 1391.33, qualified: true, flag: '🇯🇴' },
//     { name: 'Uzbekistan', confederation: 'AFC', points: 1453.31, qualified: true, flag: '🇺🇿' },
//     { name: 'Qatar', confederation: 'AFC', points: 1453.65, qualified: true, flag: '🇶🇦' },
//     { name: 'Saudi Arabia', confederation: 'AFC', points: 1420.65, qualified: true, flag: '🇸🇦' },
    
//     // CAF Direct Qualifiers (9 total)
//     { name: 'Egypt', confederation: 'CAF', points: 1519.18, qualified: true, flag: '🇪🇬' },
//     { name: 'Senegal', confederation: 'CAF', points: 1645.23, qualified: true, flag: '🇸🇳' },
//     { name: 'South Africa', confederation: 'CAF', points: 1448.67, qualified: true, flag: '🇿🇦' },
//     { name: 'Cape Verde', confederation: 'CAF', points: 1363.21, qualified: true, flag: '🇨🇻' },
//     { name: 'Morocco', confederation: 'CAF', points: 1706.27, qualified: true, flag: '🇲🇦' },
//     { name: 'Ivory Coast', confederation: 'CAF', points: 1483.90, qualified: true, flag: '🇨🇮' },
//     { name: 'Algeria', confederation: 'CAF', points: 1500.74, qualified: true, flag: '🇩🇿' },
//     { name: 'Tunisia', confederation: 'CAF', points: 1483.02, qualified: true, flag: '🇹🇳' },
//     { name: 'Ghana', confederation: 'CAF', points: 1340.84, qualified: true, flag: '🇬🇭' },
    
//     // CONMEBOL Direct Qualifiers (6 total)
//     { name: 'Argentina', confederation: 'CONMEBOL', points: 1870.32, qualified: true, flag: '🇦🇷' },
//     { name: 'Ecuador', confederation: 'CONMEBOL', points: 1588.04, qualified: true, flag: '🇪🇨' },
//     { name: 'Brazil', confederation: 'CONMEBOL', points: 1761.60, qualified: true, flag: '🇧🇷' },
//     { name: 'Uruguay', confederation: 'CONMEBOL', points: 1673.65, qualified: true, flag: '🇺🇾' },
//     { name: 'Paraguay', confederation: 'CONMEBOL', points: 1501.01, qualified: true, flag: '🇵🇾' },
//     { name: 'Colombia', confederation: 'CONMEBOL', points: 1692.10, qualified: true, flag: '🇨🇴' },
    
//     // OFC Direct Qualifiers (1 total)
//     { name: 'New Zealand', confederation: 'OFC', points: 1283.94, qualified: true, flag: '🇳🇿' },
    
//     // UEFA Direct Qualifiers (12 total)
//     { name: 'Spain', confederation: 'UEFA', points: 1875.37, qualified: true, flag: '🇪🇸' },
//     { name: 'France', confederation: 'UEFA', points: 1870.92, qualified: true, flag: '🇫🇷' },
//     { name: 'England', confederation: 'UEFA', points: 1820.44, qualified: true, flag: '🏴' },
//     { name: 'Portugal', confederation: 'UEFA', points: 1779.55, qualified: true, flag: '🇵🇹' },
//     { name: 'Netherlands', confederation: 'UEFA', points: 1754.17, qualified: true, flag: '🇳🇱' },
//     { name: 'Belgium', confederation: 'UEFA', points: 1739.54, qualified: true, flag: '🇧🇪' },
//     { name: 'Slovakia', confederation: 'UEFA', points: 1491.87, qualified: true, flag: '🇸🇰' },
//     { name: 'Croatia', confederation: 'UEFA', points: 1714.20, qualified: true, flag: '🇭🇷' },
//     { name: 'Switzerland', confederation: 'UEFA', points: 1648.30, qualified: true, flag: '🇨🇭' },
//     { name: 'Denmark', confederation: 'UEFA', points: 1627.64, qualified: true, flag: '🇩🇰' },
//     { name: 'Norway', confederation: 'UEFA', points: 1526.23, qualified: true, flag: '🇳🇴' },
//     { name: 'Bosnia and Herzegovina', confederation: 'UEFA', points: 1349.00, qualified: true, flag: '🇧🇦' }
// ];

  public QUALIFIED_TEAMS:Team[] = [];

  PROJECTED_QUALIFIERS:Team[] = [];


  ALL_TEAMS_DATA: Team[] = [{
    "name": "Japan",
    "confederation": "AFC",
    "points": 1640.47,
    "flag": "🇯🇵"
  }, {
    "name": "Iran",
    "confederation": "AFC",
    "points": 1622.61,
    "flag": "🇮🇷"
  }, {
    "name": "South Korea",
    "confederation": "AFC",
    "points": 1593.19,
    "flag": "🇰🇷"
  }, {
    "name": "Australia",
    "confederation": "AFC",
    "points": 1583.49,
    "flag": "🇦🇺"
  }, {
    "name": "Uzbekistan",
    "confederation": "AFC",
    "points": 1453.31,
    "flag": "🇺🇿"
  }, {
    "name": "Jordan",
    "confederation": "AFC",
    "points": 1391.33,
    "flag": "🇯🇴"
  }, {
    "name": "Saudi Arabia",
    "confederation": "AFC",
    "points": 1420.65,
    "qGroup": 'B',
    "flag": "🇸🇦"
  }, {
    "name": "Iraq",
    "confederation": "AFC",
    "points": 1422.20,
    "qGroup": 'B',
    "flag": "🇮🇶"
  }, {
    "name": "Indonesia",
    "confederation": "AFC",
    "points": 1157.94,
    "qGroup": 'B',
    "flag": "🇮🇩"
  }, 
  {
    "name": "Qatar",
    "confederation": "AFC",
    "points": 1453.65,
    "qGroup": 'A',
    "flag": "🇶🇦"
  }, {
    "name": "UAE",
    "confederation": "AFC",
    "points": 1379.86,
    "qGroup": 'A',
    "flag": "🇦🇪"
  }, {
    "name": "Oman",
    "confederation": "AFC",
    "points": 1320.34,
    "qGroup": 'A',
    "flag": "🇴🇲"
  }, {
    "name": "Egypt",
    "qGroup":"A",
    "confederation": "CAF",
    "points": 1519.18,
    "flag": "🇪🇬"
  }, {
    "name": "Burkina Faso",
      "qGroup":"A",
    "confederation": "CAF",
    "points": 1385.37,
    "flag": "🇧🇫"
  }, {
    "name": "Sierra Leone",
      "qGroup":"A",
    "confederation": "CAF",
    "points": 1150.1,
    "flag": "🇸🇱"
  }, {
    "name": "Guinea-Bissau",
      "qGroup":"A",
    "confederation": "CAF",
    "points": 1126.81,
    "flag": "🇬🇼"
  }, {
    "name": "Senegal",
      "qGroup":"B",
    "confederation": "CAF",
    "points": 1645.23,
    "flag": "🇸🇳"
  },
  {
    "name": "DR Congo",
    "qGroup":"B",
    "confederation": "CAF",
    "points": 1407.6,
    "flag": "🇨🇩"
  },
  {
    "name": "Sudan",
    "qGroup":"B",
    "confederation": "CAF",
    "points": 1163.56,
    "flag": "🇸🇩"
  },
  {
    "name": "Benin",
    "qGroup":"C",
    "confederation": "CAF",
    "points": 1257.3,
    "flag": "🇧🇯"
  },  
  {
    "name": "South Africa",
    "qGroup":"C",
    "confederation": "CAF",
    "points": 1448.67,
    "flag": "🇿🇦"
  }, {
    "name": "Nigeria",
    "qGroup":"C",
    "confederation": "CAF",
    "points": 1483.86,
    "flag": "🇳🇬"
  },
  {
    "name": "Rwanda",
    "qGroup":"C",
    "confederation": "CAF",
    "points": 1133.5,
    "flag": "RW"
  },
  {
    "name": "Lesotho",
    "qGroup":"C",
    "confederation": "CAF",
    "points": 1034.1,
    "flag": "LS"
  },  
  {
    "name": "Cape Verde",
    "qGroup":"D",
    "confederation": "CAF",
    "points": 1363.21,
    "flag": "🇨🇻"
  }, {
    "name": "Cameroon",
    "qGroup":"D",
    "confederation": "CAF",
    "points": 1455.42,
    "flag": "🇨🇲"
  }, {
    "name": "Libya",
    "qGroup":"D",
    "confederation": "CAF",
    "points": 1179.57,
    "flag": "🇱🇾"
  }, {
    "name": "Angola",
    "qGroup":"D",
    "confederation": "CAF",
    "points": 1268.72,
    "flag": "🇱🇾"
  }, {
    "name": "Morocco",
    "qGroup":"E",
    "confederation": "CAF",
    "points": 1706.27,
    "flag": "🇲🇦"
  },{
    "name": "Tanzania",
    "qGroup":"E",
    "confederation": "CAF",
    "points": 1199.45,
    "flag": "🇲🇦"
  }, {
    "name": "Niger",
    "qGroup":"E",
    "confederation": "CAF",
    "points": 1160.33,
    "flag": "🇲🇦"
  }, {
    "name": "Zambia",
    "qGroup":"E",
    "confederation": "CAF",
    "points": 1706.27,
    "flag": "🇲🇦"
  }, {
    "name": "Ivory Coast",
    "qGroup":"F",
    "confederation": "CAF",
    "points": 1273,
    "flag": "🇨🇮"
  }, {
    "name": "Gabon",
    "qGroup":"F",
    "confederation": "CAF",
    "points": 1314.06,
    "flag": "🇬🇦"
  }, {
    "name": "Algeria",
    "qGroup":"G",
    "confederation": "CAF",
    "points": 1500.74,
    "flag": "🇩🇿"
  }, {
    "name": "Uganda",
    "qGroup":"G",
    "confederation": "CAF",
    "points": 1287.61,
    "flag": "🇺🇬"
  }, {
    "name": "Mozambique",
    "qGroup":"G",
    "confederation": "CAF",
    "points": 1234.04,
    "flag": "🇲🇿"
  }, {
    "name": "Guinea",
    "qGroup":"G",
    "confederation": "CAF",
    "points": 1299.49,
    "flag": "🇬🇳"
  },  {
    "name": "Botswana",
    "qGroup":"G",
    "confederation": "CAF",
    "points": 1087.27,
    "flag": "🇧🇼"
  },{
    "name": "Tunisia",
    "qGroup":"H",
    "confederation": "CAF",
    "points": 1483.02,
    "flag": "🇹🇳"
  }, {
    "name": "Namibia",
    "qGroup":"H",
    "confederation": "CAF",
    "points": 1183.8,
    "flag": "🇳🇦"
  }, {
    "name": "Liberia",
    "qGroup":"H",
    "confederation": "CAF",
    "points": 1065.62,
    "flag": "🇹🇳"
  }, {
    "name": "Malawi",
    "qGroup":"H",
    "confederation": "CAF",
    "points": 1133.6,
    "flag": "🇲🇼"
  }, {
    "name": "Equatorial Guinea",
    "qGroup":"H",
    "confederation": "CAF",
    "points": 1248.68,
    "flag": "🇬🇶"
  }, {
    "name": "Ghana",
    "qGroup":"I",
    "confederation": "CAF",
    "points": 1340.84,
    "flag": "🇬🇭"
  }, {
    "name": "Madagascar",
    "qGroup":"I",
    "confederation": "CAF",
    "points": 1187.59,
    "flag": "🇲🇬"
  }, {
    "name": "Comoros",
    "qGroup":"I",
    "confederation": "CAF",
    "points": 1201.83,
    "flag": "🇰🇲"
  },{
    "name": "Mali",
    "qGroup":"I",
    "confederation": "CAF",
    "points": 1445.83,
    "flag": "🇲🇱"
  },  {
    "name": "Mexico",
    "confederation": "CONCACAF",
    "points": 1688.38,
    host: true,
    "flag": "🇲🇽"
  }, {
    "name": "United States",
    "confederation": "CONCACAF",
    "points": 1670.04,
    host: true,
    "flag": "🇺🇸"
  }, {
    "name": "Canada",
    "confederation": "CONCACAF",
    "points": 1558.04,
    host: true,
    "flag": "🇨🇦"
  }, 
  {
    "name": "Suriname",
    "confederation": "CONCACAF",
    "qGroup": "A",
    "points": 1125.21,
    "flag": "🇸🇷"
  }, 
  {
    "name": "El Salvador",
    "confederation": "CONCACAF",
    "qGroup": "A",
    "points": 1267.75,
    "flag": "🇵🇦"
  },
  {
    "name": "Panama",
    "confederation": "CONCACAF",
    "qGroup": "A",
    "points": 1529.71,
    "flag": "🇵🇦"
  },
  {
    "name": "Guatemala",
    "confederation": "CONCACAF",
    "qGroup": "A",
    "points": 1230.73,
    "flag": "🇬🇹"
  }, {
    "name": "Jamaica",
    "confederation": "CONCACAF",
    "qGroup": "B",
    "points": 1377.22,
    "flag": "🇯🇲"
  }, {
    "name": "Curaçao",
    "qGroup": "B",
    "confederation": "CONCACAF",
    "points": 1282.42,
    "flag": "🇨🇼"
  }, {
    "name": "Trinidad and Tobago",
    "confederation": "CONCACAF",
    "qGroup": "B",
    "points": 1220.99,
    "flag": "🇹🇹"
  },
  {
    "name": "Bermuda",
    "confederation": "CONCACAF",
    "qGroup": "B",
    "points": 988.72,
    "flag": "🇹🇹"
  }, {
    "name": "Costa Rica",
    "confederation": "CONCACAF",
    "qGroup": "C",
    "points": 1481.13,
    "flag": "🇨🇷"
  }, {
    "name": "Honduras",
    "confederation": "CONCACAF",
    "points": 1383.98,
    "qGroup": "C",
    "flag": "🇭🇳"
  }, {
    "name": "Haiti",
    "confederation": "CONCACAF",
    "points": 1269.24,
    "qGroup": "C",
    "flag": "🇭🇹"
  }, {
    "name": "Nicaragua",
    "confederation": "CONCACAF",
    "qGroup": "C",
    "points": 1120.78,
    "flag": "🇳🇮"
  }, {
    "name": "Argentina",
    "confederation": "CONMEBOL",
    "points": 1870.32,
    "flag": "🇦🇷"
  }, {
    "name": "Brazil",
    "confederation": "CONMEBOL",
    "points": 1761.6,
    "flag": "🇧🇷"
  }, {
    "name": "Colombia",
    "confederation": "CONMEBOL",
    "points": 1692.1,
    "flag": "🇨🇴"
  }, {
    "name": "Uruguay",
    "confederation": "CONMEBOL",
    "points": 1673.65,
    "flag": "🇺🇾"
  }, {
    "name": "Ecuador",
    "confederation": "CONMEBOL",
    "points": 1588.04,
    "flag": "🇪🇨"
  }, {
    "name": "Paraguay",
    "confederation": "CONMEBOL",
    "points": 1501.01,
    "flag": "🇵🇾"
  }, {
    "name": "Bolivia",
    "confederation": "CONMEBOL",
    "points": 1332.24,
    "flag": "🇧🇴"
  }, {
    "name": "New Zealand",
    "confederation": "OFC",
    "points": 1283.94,
    "flag": "🇳🇿"
  },
  {
    "name": "Slovakia",
    "confederation": "UEFA",
    "qGroup": "A",
    "points": 1491.87,
    "flag": "🇸🇰"
  }, {
    "name": "Northern Ireland",
    "confederation": "UEFA",
    "qGroup": "A",
    "points": 1355.98,
    "flag": "🇳🇮"
  }, 
  {
    "name": "Germany",
    "confederation": "UEFA",
    "qGroup": "A",
    "points": 1704.27,
    "flag": "🇩🇪"
  }, 
  {
    "name": "Luxembourg",
    "confederation": "UEFA",
    "qGroup": "A",
    "points": 1242.61,
    "flag": "🇱🇺"
  }, 
  {
    "name": "Switzerland",
    "confederation": "UEFA",
    "points": 1648.3,
    "qGroup": "B",
    "flag": "🇨🇭"
  },  {
    "name": "Kosovo",
    "confederation": "UEFA",
    "points": 1262.1,
    "qGroup": "B",
    "flag": "🇽🇰"
  },
  {
    "name": "Sweden",
    "confederation": "UEFA",
    "points": 1524.62,
    "qGroup": "B",
    "flag": "🇸🇪"
  },
  {
    "name": "Slovenia",
    "confederation": "UEFA",
    "points": 1462.96,
    "qGroup": "B",
    "flag": "🇸🇮"
  },
  {
    "name": "Denmark",
    "confederation": "UEFA",
    "points": 1627.64,
    "qGroup": "C",
    "flag": "🇩🇰"
  },
  {
    "name": "Scotland",
    "confederation": "UEFA",
    "points": 1485.08,
    "qGroup": "C",
    "flag": "🏴"
  }, {
    "name": "Greece",
    "confederation": "UEFA",
    "points": 1494.72,
    "qGroup": "C",
    "flag": "🇬🇷"
  }, 
  {
    "name": "Belarus",
    "confederation": "UEFA",
    "points": 1223.54,
    "qGroup": "C",
    "flag": "🇧🇾"
  },  
  {
    "name": "France",
    "confederation": "UEFA",
    "points": 1870.92,
    "qGroup": "D",
    "flag": "🇫🇷"
  }, 
  {
    "name": "Iceland",
    "confederation": "UEFA",
    "points": 1343.09,
    "qGroup": "D",
    "flag": "🇮🇸"
  }, 
  {
    "name": "Ukraine",
    "confederation": "UEFA",
    "points": 1543.06,
      "qGroup": "D",
    "flag": "🇺🇦"
  },
  {
    "name": "Azerbaijan",
    "confederation": "UEFA",
    "points": 1148.09,
    "qGroup": "D",
    "flag": "🇦🇿"
  }, 
  {
    "name": "Spain",
    "confederation": "UEFA",
    "points": 1875.37,
    "qGroup": "E",
    "flag": "🇪🇸"
  },
  {
    "name": "Georgia",
    "confederation": "UEFA",
    "qGroup": "E",
    "points": 1377.32,
    "flag": "🇬🇪"
  },

  {
    "name": "Türkiye",
    "confederation": "UEFA",
    "qGroup": "E",
    "points": 1555.72,
    "flag": "🇹🇷"
  }, 
  {
    "name": "Bulgaria",
    "confederation": "UEFA",
    "points": 1271.52,
    "qGroup": "E",
    "flag": "🇮🇸"
  }, 
  {
    "name": "Portugal",
    "confederation": "UEFA",
    "points": 1779.55,
    "qGroup": "F",
    "flag": "🇵🇹"
  }, 
  {
    "name": "Armenia",
    "confederation": "UEFA",
    "points": 1219.55,
    "qGroup": "F",
    "flag": "🇦🇲"
  },
  {
    "name": "Hungary",
    "confederation": "UEFA",
    "points": 1492.18,
    "qGroup": "F",
    "flag": "🇭🇺"
  },
  {
    "name": "Republic of Ireland",
    "confederation": "UEFA",
    "points": 1397.52,
    "qGroup": "F",
    "flag": "🇮🇪"
  }, 
  {
    "name": "Netherlands",
    "confederation": "UEFA",
    "points": 1754.17,
    "qGroup": "G",
    "flag": "🇳🇱"
  },  {
    "name": "Poland",
    "confederation": "UEFA",
    "points": 1517.3,
    "qGroup": "G",
    "flag": "🇵🇱"
  }, 
  {
    "name": "Finland",
    "confederation": "UEFA",
    "points": 1358.72,
    "qGroup": "G",
    "flag": "🇫🇮"
  },
  {
    "name": "Lithuania",
    "confederation": "UEFA",
    "points": 1065.34,
    "qGroup": "G",
    "flag": "🇱🇹"
  },
  {
    "name": "Malta",
    "confederation": "UEFA",
    "points": 982.43,
    "qGroup": "G",
    "flag": "🇲🇹"
  },
  {
    "name": "Bosnia and Herzegovina",
    "confederation": "UEFA",
    "points": 1344.25,
    "qGroup": "H",
    "flag": "🇧🇦"
  },
  {
    "name": "Austria",
    "confederation": "UEFA",
    "points": 1601.86,
    "qGroup": "H",
    "flag": "🇦🇹"
  },
  {
    "name": "Romania",
    "confederation": "UEFA",
    "points": 1462.85,
    "qGroup": "H",
    "flag": "🇷🇴"
  }, 
  {
    "name": "Cyprus",
    "confederation": "UEFA",
    "points": 1128.1,
    "qGroup": "H",
    "flag": "🇨🇾"
  },
  {
    "name": "San Marino",
    "confederation": "UEFA",
    "points": 733.23,
    "qGroup": "H",
    "flag": "🇸🇲"
  }, 
  {
    "name": "Norway",
    "confederation": "UEFA",
    "points": 1526.23,
    "qGroup": "I",
    "flag": "🇳🇴"
  },
  {
    "name": "Italy",
    "confederation": "UEFA",
    "points": 1710.06,
    "qGroup": "I",
    "flag": "🇮🇹"
  }, {
    "name": "Israel",
    "confederation": "UEFA",
    "points": 1337.4,
    "qGroup": "I",
    "flag": "🇮🇱"
  },
  {
    "name": "Estonia",
    "confederation": "UEFA",
    "points": 1127.2,
    "qGroup": "I",
    "flag": "🇪🇪"
  },
  {
    "name": "Moldova",
    "confederation": "UEFA",
    "points": 1127.2,
    "qGroup": "I",
    "flag": "🇲🇩"
  },
  {
    "name": "North Macedonia",
    "confederation": "UEFA",
    "points": 1388.5,
    "qGroup": "J",
    "flag": "🇲🇰"
  },
  {
    "name": "Belgium",
    "confederation": "UEFA",
    "points": 1739.54,
    "qGroup": "J",
    "flag": "🇧🇪"
  },
  {
    "name": "Wales",
    "confederation": "UEFA",
    "points": 1529.09,
    "qGroup": "J",
    "flag": "🏴"
  },
  {
    "name": "Kazakhstan",
    "confederation": "UEFA",
    "points": 1158.06,
    "qGroup": "J",
    "flag": "🇰🇿"
  }, 
  {
    "name": "England",
    "confederation": "UEFA",
    "points": 1820.44,
    "qGroup": "K",
    "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿"
  }, {
    "name": "Albania",
    "confederation": "UEFA",
    "points": 1380.66,
    "qGroup": "K",
    "flag": "🇦🇱"
  }, {
    "name": "Serbia",
    "confederation": "UEFA",
    "points": 1520.9,
      "qGroup": "K",
    "flag": "🇷🇸"
  }, {
    "name": "Latvia",
    "confederation": "UEFA",
    "points": 1088.8,
    "qGroup": "K",
    "flag": ""
  }, {
    "name": "Andorra",
    "confederation": "UEFA",
    "points": 954.68,
    "qGroup": "K",
    "flag": "🇦🇩"
  },  {
    "name": "Croatia",
    "confederation": "UEFA",
    "points": 1714.2,
    "qGroup": "L",
    "flag": "🇭🇷"
  },
  {
    "name": "Czechia",
    "confederation": "UEFA",
    "points": 1500.29,
    "qGroup": "L",
    "flag": "🇨🇿"
  },
  {
    "name": "Faroe Islands",
    "confederation": "UEFA",
    "points": 1094.46,
    "qGroup": "L",
    "flag": "🇫🇴"
  }, {
    "name": "Montenegro",
    "confederation": "UEFA",
    "points": 1314.05,
    "qGroup": "L",
    "flag": "🇲🇪"
  }];

  UEFA_PLAYOFF_TEAMS: Team[] = [
      // Group runners-up (12 teams)
      // { name: 'Germany', confederation: 'UEFA', points: 1704.27, flag: '🇩🇪', playoffStatus: 'Group runner-up' },
      // { name: 'Kosovo', confederation: 'UEFA', points: 1337.40, flag: '🇽🇰', playoffStatus: 'Group runner-up' },
      // { name: 'Scotland', confederation: 'UEFA', points: 1485.08, flag: '🏴', playoffStatus: 'Group runner-up' },
      // { name: 'Iceland', confederation: 'UEFA', points: 1338.00, flag: '🇮🇸', playoffStatus: 'Group runner-up' },
      // { name: 'Turkey', confederation: 'UEFA', points: 1555.72, flag: '🇹🇷', playoffStatus: 'Group runner-up' },
      // { name: 'Armenia', confederation: 'UEFA', points: 1373.00, flag: '🇦🇲', playoffStatus: 'Group runner-up' },
      // { name: 'Poland', confederation: 'UEFA', points: 1517.30, flag: '🇵🇱', playoffStatus: 'Group runner-up' },
      // { name: 'Austria', confederation: 'UEFA', points: 1601.86, flag: '🇦🇹', playoffStatus: 'Group runner-up' },
      // { name: 'Italy', confederation: 'UEFA', points: 1710.06, flag: '🇮🇹', playoffStatus: 'Group runner-up' },
      // { name: 'North Macedonia', confederation: 'UEFA', points: 1391.00, flag: '🇲🇰', playoffStatus: 'Group runner-up' },
      // { name: 'Albania', confederation: 'UEFA', points: 1380.66, flag: '🇦🇱', playoffStatus: 'Group runner-up' },
      // { name: 'Czech Republic', confederation: 'UEFA', points: 1500.29, flag: '🇨🇿', playoffStatus: 'Group runner-up' },

      // // Nations League backups (4 teams)
      // { name: 'Hungary', confederation: 'UEFA', points: 1492.18, flag: '🇭🇺', playoffStatus: 'Nations League backup' },
      // { name: 'Wales', confederation: 'UEFA', points: 1529.09, flag: '🏴', playoffStatus: 'Nations League backup' },
      // { name: 'Romania', confederation: 'UEFA', points: 1462.85, flag: '🇷🇴', playoffStatus: 'Nations League backup' },
      // { name: 'Slovenia', confederation: 'UEFA', points: 1462.96, flag: '🇸🇮', playoffStatus: 'Nations League backup' }
  ];


  AFC_PLAYOFF_TEAMS:Team[] = [];


  UEFA_NATIONS_LEAGUE_PRIORITY = [
    'Spain',
    'Germany',
    'Portugal',
    'France',
    'England',
    'Norway',
    'Wales',
    'Czechia',
    'Romania',
    'Sweden',
    'North Macedonia',
    'Northern Ireland',
    'Moldova',
    'San Marino',
    'Italy',
    'Netherlands',
    'Denmark',
    'Croatia',
    'Scotland',
    'Serbia',
    'Hungary',
    'Belgium',
    'Poland',
    'Israel'
  ]

  INTERCONTINENTAL_PLAYOFF_TEAMS:Team[] = [
      // { name: 'DR Congo', confederation: 'CAF', points: 1407.60, flag: '🇨🇩', playoffSlot: 'CAF playoff winner' },
      { name: 'Bolivia', confederation: 'CONMEBOL', points: 1332.24, flag: '🇧🇴', playoffSlot: 'CONMEBOL 7th place' },
      // { name: 'UAE', confederation: 'AFC', points: 1379.86, flag: '🇦🇪', playoffSlot: 'AFC playoff winner' },
      // { name: 'Curaçao', confederation: 'CONCACAF', points: 1282.42, flag: '🇨🇼', playoffSlot: 'CONCACAF playoff' },
      // { name: 'El Salvador', confederation: 'CONCACAF', points: 1468.11, flag: '🇸🇻', playoffSlot: 'CONCACAF playoff' },
      { name: 'New Caledonia', confederation: 'OFC', points: 1039.55, flag: '🇳🇨', playoffSlot: 'OFC runner-up' }
  ];

  PLAYOFF_TEAMS:Team[] = [
      { name: 'UEFA Playoff Winner 1', confederation: 'UEFA', points: 0, qualified: false, placeholder: true, flag: '🇪🇺', description: 'From Path A/B/C/D' },
      { name: 'UEFA Playoff Winner 2', confederation: 'UEFA', points: 0, qualified: false, placeholder: true, flag: '🇪🇺', description: 'From Path A/B/C/D' },
      { name: 'UEFA Playoff Winner 3', confederation: 'UEFA', points: 0, qualified: false, placeholder: true, flag: '🇪🇺', description: 'From Path A/B/C/D' },
      { name: 'UEFA Playoff Winner 4', confederation: 'UEFA', points: 0, qualified: false, placeholder: true, flag: '🇪🇺', description: 'From Path A/B/C/D' },
      { name: 'Inter-confederation Winner 1', confederation: 'PLAYOFF', points: 0, qualified: false, placeholder: true, flag: '🌍', description: 'From 6-team playoff' },
      { name: 'Inter-confederation Winner 2', confederation: 'PLAYOFF', points: 0, qualified: false, placeholder: true, flag: '🌍', description: 'From 6-team playoff' }
  ];

  VENUES = {
      'Estadio Azteca': { city: 'Mexico City', country: 'Mexico' },
      'Estadio Akron': { city: 'Zapopan', country: 'Mexico' },
      'Estadio BBVA': { city: 'Guadalupe', country: 'Mexico' },
      'BMO Field': { city: 'Toronto', country: 'Canada' },
      'BC Place': { city: 'Vancouver', country: 'Canada' },
      'SoFi Stadium': { city: 'Inglewood', country: 'USA' },
      'Levi\'s Stadium': { city: 'Santa Clara', country: 'USA' },
      'Lumen Field': { city: 'Seattle', country: 'USA' },
      'MetLife Stadium': { city: 'East Rutherford', country: 'USA' },
      'Gillette Stadium': { city: 'Foxborough', country: 'USA' },
      'Lincoln Financial Field': { city: 'Philadelphia', country: 'USA' },
      'Hard Rock Stadium': { city: 'Miami Gardens', country: 'USA' },
      'Mercedes-Benz Stadium': { city: 'Atlanta', country: 'USA' },
      'NRG Stadium': { city: 'Houston', country: 'USA' },
      'Arrowhead Stadium': { city: 'Kansas City', country: 'USA' },
      'AT&T Stadium': { city: 'Arlington', country: 'USA' }
  };


  GROUP_MATCHES = {
      'A': [
          { date: 'June 11, 2026', match: 1, team1: 'Mexico', team2: 'A2', venue: 'Estadio Azteca' },
          { date: 'June 11, 2026', match: 2, team1: 'A3', team2: 'A4', venue: 'Estadio Akron' },
          { date: 'June 18, 2026', match: 25, team1: 'A4', team2: 'A2', venue: 'Mercedes-Benz Stadium' },
          { date: 'June 18, 2026', match: 28, team1: 'Mexico', team2: 'A3', venue: 'Estadio Akron' },
          { date: 'June 24, 2026', match: 53, team1: 'A4', team2: 'Mexico', venue: 'Estadio Azteca' },
          { date: 'June 24, 2026', match: 54, team1: 'A2', team2: 'A3', venue: 'Estadio BBVA' }
      ],
      'B': [
          { date: 'June 12, 2026', match: 3, team1: 'Canada', team2: 'B2', venue: 'BMO Field' },
          { date: 'June 13, 2026', match: 8, team1: 'B3', team2: 'B4', venue: 'Levi\'s Stadium' },
          { date: 'June 18, 2026', match: 26, team1: 'B4', team2: 'B2', venue: 'SoFi Stadium' },
          { date: 'June 18, 2026', match: 27, team1: 'Canada', team2: 'B3', venue: 'BC Place' },
          { date: 'June 24, 2026', match: 51, team1: 'B4', team2: 'Canada', venue: 'BC Place' },
          { date: 'June 24, 2026', match: 52, team1: 'B2', team2: 'B3', venue: 'Lumen Field' }
      ],
      'C': [
          { date: 'June 13, 2026', match: 5, team1: 'C1', team2: 'C2', venue: 'Gillette Stadium' },
          { date: 'June 13, 2026', match: 7, team1: 'C3', team2: 'C4', venue: 'MetLife Stadium' },
          { date: 'June 19, 2026', match: 29, team1: 'C4', team2: 'C2', venue: 'Lincoln Financial Field' },
          { date: 'June 19, 2026', match: 30, team1: 'C1', team2: 'C3', venue: 'Gillette Stadium' },
          { date: 'June 24, 2026', match: 49, team1: 'C4', team2: 'C1', venue: 'Hard Rock Stadium' },
          { date: 'June 24, 2026', match: 50, team1: 'C2', team2: 'C3', venue: 'Mercedes-Benz Stadium' }
      ],
      'D': [
          { date: 'June 12, 2026', match: 4, team1: 'United States', team2: 'D2', venue: 'SoFi Stadium' },
          { date: 'June 13, 2026', match: 6, team1: 'D3', team2: 'D4', venue: 'BC Place' },
          { date: 'June 19, 2026', match: 31, team1: 'D4', team2: 'D2', venue: 'Levi\'s Stadium' },
          { date: 'June 19, 2026', match: 32, team1: 'United States', team2: 'D3', venue: 'Lumen Field' },
          { date: 'June 25, 2026', match: 59, team1: 'D4', team2: 'United States', venue: 'SoFi Stadium' },
          { date: 'June 25, 2026', match: 60, team1: 'D2', team2: 'D3', venue: 'Levi\'s Stadium' }
      ],
      'E': [
          { date: 'June 14, 2026', match: 9, team1: 'E1', team2: 'E2', venue: 'Lincoln Financial Field' },
          { date: 'June 14, 2026', match: 10, team1: 'E3', team2: 'E4', venue: 'NRG Stadium' },
          { date: 'June 20, 2026', match: 33, team1: 'E4', team2: 'E2', venue: 'BMO Field' },
          { date: 'June 20, 2026', match: 34, team1: 'E1', team2: 'E3', venue: 'Arrowhead Stadium' },
          { date: 'June 25, 2026', match: 55, team1: 'E4', team2: 'E1', venue: 'Lincoln Financial Field' },
          { date: 'June 25, 2026', match: 56, team1: 'E2', team2: 'E3', venue: 'MetLife Stadium' }
      ],
      'F': [
          { date: 'June 14, 2026', match: 11, team1: 'F1', team2: 'F2', venue: 'AT&T Stadium' },
          { date: 'June 14, 2026', match: 12, team1: 'F3', team2: 'F4', venue: 'Estadio BBVA' },
          { date: 'June 20, 2026', match: 35, team1: 'F4', team2: 'F2', venue: 'NRG Stadium' },
          { date: 'June 20, 2026', match: 36, team1: 'F1', team2: 'F3', venue: 'Estadio BBVA' },
          { date: 'June 25, 2026', match: 57, team1: 'F4', team2: 'F1', venue: 'AT&T Stadium' },
          { date: 'June 25, 2026', match: 58, team1: 'F2', team2: 'F3', venue: 'Arrowhead Stadium' }
      ],
      'G': [
          { date: 'June 15, 2026', match: 15, team1: 'G1', team2: 'G2', venue: 'SoFi Stadium' },
          { date: 'June 15, 2026', match: 16, team1: 'G3', team2: 'G4', venue: 'Lumen Field' },
          { date: 'June 21, 2026', match: 39, team1: 'G4', team2: 'G2', venue: 'SoFi Stadium' },
          { date: 'June 21, 2026', match: 40, team1: 'G1', team2: 'G3', venue: 'BC Place' },
          { date: 'June 26, 2026', match: 63, team1: 'G4', team2: 'G1', venue: 'Lumen Field' },
          { date: 'June 26, 2026', match: 64, team1: 'G2', team2: 'G3', venue: 'BC Place' }
      ],
      'H': [
          { date: 'June 15, 2026', match: 13, team1: 'H1', team2: 'H2', venue: 'Hard Rock Stadium' },
          { date: 'June 15, 2026', match: 14, team1: 'H3', team2: 'H4', venue: 'Mercedes-Benz Stadium' },
          { date: 'June 21, 2026', match: 37, team1: 'H4', team2: 'H2', venue: 'Hard Rock Stadium' },
          { date: 'June 21, 2026', match: 38, team1: 'H1', team2: 'H3', venue: 'Mercedes-Benz Stadium' },
          { date: 'June 26, 2026', match: 65, team1: 'H4', team2: 'H1', venue: 'NRG Stadium' },
          { date: 'June 26, 2026', match: 66, team1: 'H2', team2: 'H3', venue: 'Estadio Akron' }
      ],
      'I': [
          { date: 'June 16, 2026', match: 17, team1: 'I1', team2: 'I2', venue: 'MetLife Stadium' },
          { date: 'June 16, 2026', match: 18, team1: 'I3', team2: 'I4', venue: 'Gillette Stadium' },
          { date: 'June 22, 2026', match: 41, team1: 'I4', team2: 'I2', venue: 'MetLife Stadium' },
          { date: 'June 22, 2026', match: 42, team1: 'I1', team2: 'I3', venue: 'Lincoln Financial Field' },
          { date: 'June 26, 2026', match: 61, team1: 'I4', team2: 'I1', venue: 'Gillette Stadium' },
          { date: 'June 26, 2026', match: 62, team1: 'I2', team2: 'I3', venue: 'BMO Field' }
      ],
      'J': [
          { date: 'June 16, 2026', match: 19, team1: 'J1', team2: 'J2', venue: 'Arrowhead Stadium' },
          { date: 'June 16, 2026', match: 20, team1: 'J3', team2: 'J4', venue: 'Levi\'s Stadium' },
          { date: 'June 22, 2026', match: 43, team1: 'J4', team2: 'J2', venue: 'AT&T Stadium' },
          { date: 'June 22, 2026', match: 44, team1: 'J1', team2: 'J3', venue: 'Levi\'s Stadium' },
          { date: 'June 27, 2026', match: 69, team1: 'J4', team2: 'J1', venue: 'Arrowhead Stadium' },
          { date: 'June 27, 2026', match: 70, team1: 'J2', team2: 'J3', venue: 'AT&T Stadium' }
      ],
      'K': [
          { date: 'June 17, 2026', match: 23, team1: 'K1', team2: 'K2', venue: 'NRG Stadium' },
          { date: 'June 17, 2026', match: 24, team1: 'K3', team2: 'K4', venue: 'Estadio Azteca' },
          { date: 'June 23, 2026', match: 47, team1: 'K4', team2: 'K2', venue: 'NRG Stadium' },
          { date: 'June 23, 2026', match: 48, team1: 'K1', team2: 'K3', venue: 'Estadio Akron' },
          { date: 'June 27, 2026', match: 71, team1: 'K4', team2: 'K1', venue: 'Hard Rock Stadium' },
          { date: 'June 27, 2026', match: 72, team1: 'K2', team2: 'K3', venue: 'Mercedes-Benz Stadium' }
      ],
      'L': [
          { date: 'June 17, 2026', match: 21, team1: 'L1', team2: 'L2', venue: 'BMO Field' },
          { date: 'June 17, 2026', match: 22, team1: 'L3', team2: 'L4', venue: 'AT&T Stadium' },
          { date: 'June 23, 2026', match: 45, team1: 'L4', team2: 'L2', venue: 'Gillette Stadium' },
          { date: 'June 23, 2026', match: 46, team1: 'L1', team2: 'L3', venue: 'BMO Field' },
          { date: 'June 27, 2026', match: 67, team1: 'L4', team2: 'L1', venue: 'MetLife Stadium' },
          { date: 'June 27, 2026', match: 68, team1: 'L2', team2: 'L3', venue: 'Lincoln Financial Field' }
      ]
  };


  // remove qualified/playoff/interconf entries for a confederation
  resetConfederationQualifiedTeams(conf: string): void {
    // remove qualified teams for this confederation but KEEP hosts (host === true)
    this.PROJECTED_QUALIFIERS = this.PROJECTED_QUALIFIERS.filter(t => t.confederation !== conf);

    // remove interconf entries for this confederation but keep truly qualified markers and hosts
    this.INTERCONTINENTAL_PLAYOFF_TEAMS = this.INTERCONTINENTAL_PLAYOFF_TEAMS
      .filter(t => t.confederation !== conf || (t as any).qualified === true || (t as any).host === true);
 
     // special-case UEFA playoff list
     if (conf === 'UEFA') {
       this.UEFA_PLAYOFF_TEAMS = [];
     }
     // add other conf-specific resets here if needed
   }
}