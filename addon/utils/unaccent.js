// same as vendor/postgres/unaccent.rules
const RULES = {
  '©':'(C)','«':'<<','­':'-','®':'(R)','»':'>>','¼':' 1/4','½':' 1/2','¾':' 3/4','À':'A',
  'Á':'A','Â':'A','Ã':'A','Ä':'A','Å':'A','Æ':'AE','Ç':'C','È':'E','É':'E','Ê':'E',
  'Ë':'E','Ì':'I','Í':'I','Î':'I','Ï':'I','Ð':'D','Ñ':'N','Ò':'O','Ó':'O','Ô':'O',
  'Õ':'O','Ö':'O','×':'*','Ø':'O','Ù':'U','Ú':'U','Û':'U','Ü':'U','Ý':'Y','Þ':'TH',
  'ß':'ss','à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a','æ':'ae','ç':'c','è':'e',
  'é':'e','ê':'e','ë':'e','ì':'i','í':'i','î':'i','ï':'i','ð':'d','ñ':'n','ò':'o',
  'ó':'o','ô':'o','õ':'o','ö':'o','÷':'/','ø':'o','ù':'u','ú':'u','û':'u','ü':'u',
  'ý':'y','þ':'th','ÿ':'y','Ā':'A','ā':'a','Ă':'A','ă':'a','Ą':'A','ą':'a','Ć':'C',
  'ć':'c','Ĉ':'C','ĉ':'c','Ċ':'C','ċ':'c','Č':'C','č':'c','Ď':'D','ď':'d','Đ':'D',
  'đ':'d','Ē':'E','ē':'e','Ĕ':'E','ĕ':'e','Ė':'E','ė':'e','Ę':'E','ę':'e','Ě':'E',
  'ě':'e','Ĝ':'G','ĝ':'g','Ğ':'G','ğ':'g','Ġ':'G','ġ':'g','Ģ':'G','ģ':'g','Ĥ':'H',
  'ĥ':'h','Ħ':'H','ħ':'h','Ĩ':'I','ĩ':'i','Ī':'I','ī':'i','Ĭ':'I','ĭ':'i','Į':'I',
  'į':'i','İ':'I','ı':'i','Ĳ':'IJ','ĳ':'ij','Ĵ':'J','ĵ':'j','Ķ':'K','ķ':'k','ĸ':'q',
  'Ĺ':'L','ĺ':'l','Ļ':'L','ļ':'l','Ľ':'L','ľ':'l','Ŀ':'L','ŀ':'l','Ł':'L','ł':'l',
  'Ń':'N','ń':'n','Ņ':'N','ņ':'n','Ň':'N','ň':'n','ŉ':'\'n','Ŋ':'N','ŋ':'n','Ō':'O',
  'ō':'o','Ŏ':'O','ŏ':'o','Ő':'O','ő':'o','Œ':'OE','œ':'oe','Ŕ':'R','ŕ':'r','Ŗ':'R',
  'ŗ':'r','Ř':'R','ř':'r','Ś':'S','ś':'s','Ŝ':'S','ŝ':'s','Ş':'S','ş':'s','Š':'S',
  'š':'s','Ţ':'T','ţ':'t','Ť':'T','ť':'t','Ŧ':'T','ŧ':'t','Ũ':'U','ũ':'u','Ū':'U',
  'ū':'u','Ŭ':'U','ŭ':'u','Ů':'U','ů':'u','Ű':'U','ű':'u','Ų':'U','ų':'u','Ŵ':'W',
  'ŵ':'w','Ŷ':'Y','ŷ':'y','Ÿ':'Y','Ź':'Z','ź':'z','Ż':'Z','ż':'z','Ž':'Z','ž':'z',
  'ſ':'s','ƀ':'b','Ɓ':'B','Ƃ':'B','ƃ':'b','Ƈ':'C','ƈ':'c','Ɖ':'D','Ɗ':'D','Ƌ':'D',
  'ƌ':'d','Ɛ':'E','Ƒ':'F','ƒ':'f','Ɠ':'G','ƕ':'hv','Ɩ':'I','Ɨ':'I','Ƙ':'K','ƙ':'k',
  'ƚ':'l','Ɲ':'N','ƞ':'n','Ơ':'O','ơ':'o','Ƣ':'OI','ƣ':'oi','Ƥ':'P','ƥ':'p','ƫ':'t',
  'Ƭ':'T','ƭ':'t','Ʈ':'T','Ư':'U','ư':'u','Ʋ':'V','Ƴ':'Y','ƴ':'y','Ƶ':'Z','ƶ':'z',
  'Ǆ':'DZ','ǅ':'Dz','ǆ':'dz','Ǉ':'LJ','ǈ':'Lj','ǉ':'lj','Ǌ':'NJ','ǋ':'Nj','ǌ':'nj',
  'Ǎ':'A','ǎ':'a','Ǐ':'I','ǐ':'i','Ǒ':'O','ǒ':'o','Ǔ':'U','ǔ':'u','Ǥ':'G','ǥ':'g',
  'Ǧ':'G','ǧ':'g','Ǩ':'K','ǩ':'k','Ǫ':'O','ǫ':'o','ǰ':'j','Ǳ':'DZ','ǲ':'Dz','ǳ':'dz',
  'Ǵ':'G','ǵ':'g','Ǹ':'N','ǹ':'n','Ȁ':'A','ȁ':'a','Ȃ':'A','ȃ':'a','Ȅ':'E','ȅ':'e','Ȇ':'E',
  'ȇ':'e','Ȉ':'I','ȉ':'i','Ȋ':'I','ȋ':'i','Ȍ':'O','ȍ':'o','Ȏ':'O','ȏ':'o','Ȑ':'R','ȑ':'r',
  'Ȓ':'R','ȓ':'r','Ȕ':'U','ȕ':'u','Ȗ':'U','ȗ':'u','Ș':'S','ș':'s','Ț':'T','ț':'t','Ȟ':'H',
  'ȟ':'h','ȡ':'d','Ȥ':'Z','ȥ':'z','Ȧ':'A','ȧ':'a','Ȩ':'E','ȩ':'e','Ȯ':'O','ȯ':'o','Ȳ':'Y',
  'ȳ':'y','ȴ':'l','ȵ':'n','ȶ':'t','ȷ':'j','ȸ':'db','ȹ':'qp','Ⱥ':'A','Ȼ':'C','ȼ':'c',
  'Ƚ':'L','Ⱦ':'T','ȿ':'s','ɀ':'z','Ƀ':'B','Ʉ':'U','Ɇ':'E','ɇ':'e','Ɉ':'J','ɉ':'j','Ɍ':'R',
  'ɍ':'r','Ɏ':'Y','ɏ':'y','ɓ':'b','ɕ':'c','ɖ':'d','ɗ':'d','ɛ':'e','ɟ':'j','ɠ':'g','ɡ':'g',
  'ɢ':'G','ɦ':'h','ɧ':'h','ɨ':'i','ɪ':'I','ɫ':'l','ɬ':'l','ɭ':'l','ɱ':'m','ɲ':'n','ɳ':'n',
  'ɴ':'N','ɶ':'OE','ɼ':'r','ɽ':'r','ɾ':'r','ʀ':'R','ʂ':'s','ʈ':'t','ʉ':'u','ʋ':'v',
  'ʏ':'Y','ʐ':'z','ʑ':'z','ʙ':'B','ʛ':'G','ʜ':'H','ʝ':'j','ʟ':'L','ʠ':'q','ʣ':'dz',
  'ʥ':'dz','ʦ':'ts','ʪ':'ls','ʫ':'lz','Ё':'Е','ё':'е','ᴀ':'A','ᴁ':'AE','ᴃ':'B','ᴄ':'C',
  'ᴅ':'D','ᴆ':'D','ᴇ':'E','ᴊ':'J','ᴋ':'K','ᴌ':'L','ᴍ':'M','ᴏ':'O','ᴘ':'P','ᴛ':'T','ᴜ':'U',
  'ᴠ':'V','ᴡ':'W','ᴢ':'Z','ᵫ':'ue','ᵬ':'b','ᵭ':'d','ᵮ':'f','ᵯ':'m','ᵰ':'n','ᵱ':'p',
  'ᵲ':'r','ᵳ':'r','ᵴ':'s','ᵵ':'t','ᵶ':'z','ᵺ':'th','ᵻ':'I','ᵽ':'p','ᵾ':'U','ᶀ':'b',
  'ᶁ':'d','ᶂ':'f','ᶃ':'g','ᶄ':'k','ᶅ':'l','ᶆ':'m','ᶇ':'n','ᶈ':'p','ᶉ':'r','ᶊ':'s','ᶌ':'v',
  'ᶍ':'x','ᶎ':'z','ᶏ':'a','ᶑ':'d','ᶒ':'e','ᶓ':'e','ᶖ':'i','ᶙ':'u','Ḁ':'A','ḁ':'a','Ḃ':'B',
  'ḃ':'b','Ḅ':'B','ḅ':'b','Ḇ':'B','ḇ':'b','Ḋ':'D','ḋ':'d','Ḍ':'D','ḍ':'d','Ḏ':'D','ḏ':'d',
  'Ḑ':'D','ḑ':'d','Ḓ':'D','ḓ':'d','Ḙ':'E','ḙ':'e','Ḛ':'E','ḛ':'e','Ḟ':'F','ḟ':'f','Ḡ':'G',
  'ḡ':'g','Ḣ':'H','ḣ':'h','Ḥ':'H','ḥ':'h','Ḧ':'H','ḧ':'h','Ḩ':'H','ḩ':'h','Ḫ':'H','ḫ':'h',
  'Ḭ':'I','ḭ':'i','Ḱ':'K','ḱ':'k','Ḳ':'K','ḳ':'k','Ḵ':'K','ḵ':'k','Ḷ':'L','ḷ':'l','Ḻ':'L',
  'ḻ':'l','Ḽ':'L','ḽ':'l','Ḿ':'M','ḿ':'m','Ṁ':'M','ṁ':'m','Ṃ':'M','ṃ':'m','Ṅ':'N','ṅ':'n',
  'Ṇ':'N','ṇ':'n','Ṉ':'N','ṉ':'n','Ṋ':'N','ṋ':'n','Ṕ':'P','ṕ':'p','Ṗ':'P','ṗ':'p','Ṙ':'R',
  'ṙ':'r','Ṛ':'R','ṛ':'r','Ṟ':'R','ṟ':'r','Ṡ':'S','ṡ':'s','Ṣ':'S','ṣ':'s','Ṫ':'T','ṫ':'t',
  'Ṭ':'T','ṭ':'t','Ṯ':'T','ṯ':'t','Ṱ':'T','ṱ':'t','Ṳ':'U','ṳ':'u','Ṵ':'U','ṵ':'u','Ṷ':'U',
  'ṷ':'u','Ṽ':'V','ṽ':'v','Ṿ':'V','ṿ':'v','Ẁ':'W','ẁ':'w','Ẃ':'W','ẃ':'w','Ẅ':'W','ẅ':'w',
  'Ẇ':'W','ẇ':'w','Ẉ':'W','ẉ':'w','Ẋ':'X','ẋ':'x','Ẍ':'X','ẍ':'x','Ẏ':'Y','ẏ':'y','Ẑ':'Z',
  'ẑ':'z','Ẓ':'Z','ẓ':'z','Ẕ':'Z','ẕ':'z','ẖ':'h','ẗ':'t','ẘ':'w','ẙ':'y','ẚ':'a','ẜ':'s',
  'ẝ':'s','ẞ':'SS','Ạ':'A','ạ':'a','Ả':'A','ả':'a','Ẹ':'E','ẹ':'e','Ẻ':'E','ẻ':'e',
  'Ẽ':'E','ẽ':'e','Ỉ':'I','ỉ':'i','Ị':'I','ị':'i','Ọ':'O','ọ':'o','Ỏ':'O','ỏ':'o','Ụ':'U',
   'ụ':'u','Ủ':'U','ủ':'u','Ỳ':'Y','ỳ':'y','Ỵ':'Y','ỵ':'y','Ỷ':'Y','ỷ':'y','Ỹ':'Y',
   'ỹ':'y','Ỻ':'LL','ỻ':'ll','Ỽ':'V','ỽ':'v','Ỿ':'Y','ỿ':'y','‐':'-','‑':'-','‒':'-',
   '–':'-','—':'-','―':'-','‖':'||','‘':'\'','’':'\'','‚':',','‛':'\'','“':'"','”':'"',
   '„':',,','‟':'"','․':'.','‥':'..','…':'...','′':'\'','″':'"','‹':'<','›':'>','‼':'!!',
   '⁄':'/','⁅':'[','⁆':']','⁇':'??','⁈':'?!','⁉':'!?','⁎':'*','₠':'CE','₢':'Cr','₣':'Fr.',
   '₤':'L.','₧':'Pts','₹':'Rs','₺':'TL','℀':'a/c','℁':'a/s','ℂ':'C','℃':'°C','℅':'c/o',
   '℆':'c/u','℉':'°F','ℊ':'g','ℋ':'H','ℌ':'x','ℍ':'H','ℎ':'h','ℐ':'I','ℑ':'I','ℒ':'L',
   'ℓ':'l','ℕ':'N','№':'No','℗':'(P)','ℙ':'P','ℚ':'Q','ℛ':'R','ℜ':'R','ℝ':'R','℞':'Rx',
   '℡':'TEL','ℤ':'Z','ℨ':'Z','ℬ':'B','ℭ':'C','ℯ':'e','ℰ':'E','ℱ':'F','ℳ':'M','ℴ':'o',
   'ℹ':'i','℻':'FAX','ⅅ':'D','ⅆ':'d','ⅇ':'e','ⅈ':'i','ⅉ':'j','⅓':' 1/3','⅔':' 2/3',
   '⅕':' 1/5','⅖':' 2/5','⅗':' 3/5','⅘':' 4/5','⅙':' 1/6','⅚':' 5/6','⅛':' 1/8','⅜':' 3/8',
   '⅝':' 5/8','⅞':' 7/8','⅟':' 1/','Ⅰ':'I','Ⅱ':'II','Ⅲ':'III','Ⅳ':'IV','Ⅴ':'V','Ⅵ':'VI',
   'Ⅶ':'VII','Ⅷ':'VIII','Ⅸ':'IX','Ⅹ':'X','Ⅺ':'XI','Ⅻ':'XII','Ⅼ':'L','Ⅽ':'C','Ⅾ':'D',
   'Ⅿ':'M','ⅰ':'i','ⅱ':'ii','ⅲ':'iii','ⅳ':'iv','ⅴ':'v','ⅵ':'vi','ⅶ':'vii','ⅷ':'viii',
   'ⅸ':'ix','ⅹ':'x','ⅺ':'xi','ⅻ':'xii','ⅼ':'l','ⅽ':'c','ⅾ':'d','ⅿ':'m','−':'-','∕':'/',
   '∖':'\\','∣':'|','∥':'||','≪':'<<','≫':'>>','⑴':'(1)','⑵':'(2)','⑶':'(3)','⑷':'(4)',
   '⑸':'(5)','⑹':'(6)','⑺':'(7)','⑻':'(8)','⑼':'(9)','⑽':'(10)','⑾':'(11)','⑿':'(12)',
   '⒀':'(13)','⒁':'(14)','⒂':'(15)','⒃':'(16)','⒄':'(17)','⒅':'(18)','⒆':'(19)','⒇':'(20)',
   '⒈':'1.','⒉':'2.','⒊':'3.','⒋':'4.','⒌':'5.','⒍':'6.','⒎':'7.','⒏':'8.','⒐':'9.',
   '⒑':'10.','⒒':'11.','⒓':'12.','⒔':'13.','⒕':'14.','⒖':'15.','⒗':'16.','⒘':'17.',
   '⒙':'18.','⒚':'19.','⒛':'20.','⒜':'(a)','⒝':'(b)','⒞':'(c)','⒟':'(d)','⒠':'(e)',
   '⒡':'(f)','⒢':'(g)','⒣':'(h)','⒤':'(i)','⒥':'(j)','⒦':'(k)','⒧':'(l)','⒨':'(m)',
   '⒩':'(n)','⒪':'(o)','⒫':'(p)','⒬':'(q)','⒭':'(r)','⒮':'(s)','⒯':'(t)','⒰':'(u)',
   '⒱':'(v)','⒲':'(w)','⒳':'(x)','⒴':'(y)','⒵':'(z)','⦅':'((','⦆':'))','⩴':'::=','⩵':'==',
   '⩶':'===','、':',','。':'.','〇':'0','〈':'<','〉':'>','《':'<<','》':'>>','〔':'[','〕':']',
   '〘':'[','〙':']','〚':'[','〛':']','〝':'"','〞':'"','㍱':'hPa','㍲':'da','㍳':'AU','㍴':'bar',
   '㍵':'oV','㍶':'pc','㍷':'dm','㍺':'IU','㎀':'pA','㎁':'nA','㎃':'mA','㎄':'kA','㎅':'KB',
   '㎆':'MB','㎇':'GB','㎈':'cal','㎉':'kcal','㎊':'pF','㎋':'nF','㎎':'mg','㎏':'kg','㎐':'Hz',
   '㎑':'kHz','㎒':'MHz','㎓':'GHz','㎔':'THz','㎙':'fm','㎚':'nm','㎜':'mm','㎝':'cm','㎞':'km',
   '㎧':'m/s','㎩':'Pa','㎪':'kPa','㎫':'MPa','㎬':'GPa','㎭':'rad','㎮':'rad/s','㎰':'ps','㎱':'ns',
   '㎳':'ms','㎴':'pV','㎵':'nV','㎷':'mV','㎸':'kV','㎹':'MV','㎺':'pW','㎻':'nW','㎽':'mW',
   '㎾':'kW','㎿':'MW','㏂':'a.m.','㏃':'Bq','㏄':'cc','㏅':'cd','㏆':'C/kg','㏇':'Co.','㏈':'dB',
   '㏉':'Gy','㏊':'ha','㏋':'HP','㏌':'in','㏍':'KK','㏎':'KM','㏏':'kt','㏐':'lm','㏑':'ln',
   '㏒':'log','㏓':'lx','㏔':'mb','㏕':'mil','㏖':'mol','㏗':'pH','㏘':'p.m.','㏙':'PPM','㏚':'PR',
   '㏛':'sr','㏜':'Sv','㏝':'Wb','㏞':'V/m','㏟':'A/m','ﬀ':'ff','ﬁ':'fi','ﬂ':'fl','ﬃ':'ffi',
   'ﬄ':'ffl','ﬅ':'st','ﬆ':'st','︐':',','︑':',','︒':'.','︓':':','︔':';','︕':'!','︖':'?',
   '︙':'...','︰':'..','︱':'-','︲':'-','︵':'(','︶':')','︷':'{','︸':'}','︹':'[','︺':']',
   '︽':'<<','︾':'>>','︿':'<','﹀':'>','﹇':'[','﹈':']','﹐':',','﹑':',','﹒':'.','﹔':';',
   '﹕':':','﹖':'?','﹗':'!','﹘':'-','﹙':'(','﹚':')','﹛':'{','﹜':'}','﹝':'[','﹞':']',
   '﹟':'#','﹠':'&','﹡':'*','﹢':'+','﹣':'-','﹤':'<','﹥':'>','﹦':'=','﹨':'\\','﹩':'$',
   '﹪':'%','﹫':'@','！':'!','＂':'"','＃':'#','＄':'$','％':'%','＆':'&','＇':'\'','（':'(',
   '）':')','＊':'*','＋':'+','，':',','－':'-','．':'.','／':'/','０':'0','１':'1','２':'2',
   '３':'3','４':'4','５':'5','６':'6','７':'7','８':'8','９':'9','：':':','；':';','＜':'<',
   '＝':'=','＞':'>','？':'?','＠':'@','Ａ':'A','Ｂ':'B','Ｃ':'C','Ｄ':'D','Ｅ':'E','Ｆ':'F',
   'Ｇ':'G','Ｈ':'H','Ｉ':'I','Ｊ':'J','Ｋ':'K','Ｌ':'L','Ｍ':'M','Ｎ':'N','Ｏ':'O','Ｐ':'P',
   'Ｑ':'Q','Ｒ':'R','Ｓ':'S','Ｔ':'T','Ｕ':'U','Ｖ':'V','Ｗ':'W','Ｘ':'X','Ｙ':'Y','Ｚ':'Z',
   '［':'[','＼':'\\','］':']','＾':'^','＿':'_','｀':'`','ａ':'a','ｂ':'b','ｃ':'c','ｄ':'d',
   'ｅ':'e','ｆ':'f','ｇ':'g','ｈ':'h','ｉ':'i','ｊ':'j','ｋ':'k','ｌ':'l','ｍ':'m','ｎ':'n',
   'ｏ':'o','ｐ':'p','ｑ':'q','ｒ':'r','ｓ':'s','ｔ':'t','ｕ':'u','ｖ':'v','ｗ':'w','ｘ':'x',
   'ｙ':'y','ｚ':'z','｛':'{','｜':'|','｝':'}','～':'~','｟':'((','｠':'))','｡':'.','､':',' };

export default function unaccent(string) {
  return string.replace(/./g, function(char) { return RULES[char] || char; });
}