// Numeric-only answers have no linguistic cue for a generative speech model.
// Expand operators for speech only; never alter the displayed/saved answer.
const mathWords: Record<string,readonly string[]> = {
 fr:['Calcul :','Résultat :','plus','moins','fois','divisé par','égale','pour cent'],
 en:['Calculation:','Result:','plus','minus','times','divided by','equals','percent'],
 es:['Cálculo:','Resultado:','más','menos','por','dividido entre','igual a','por ciento'],
 de:['Rechnung:','Ergebnis:','plus','minus','mal','geteilt durch','ist gleich','Prozent'],
 it:['Calcolo:','Risultato:','più','meno','per','diviso','uguale','per cento'],
 pt:['Cálculo:','Resultado:','mais','menos','vezes','dividido por','igual a','por cento'],
 nl:['Berekening:','Resultaat:','plus','min','maal','gedeeld door','is gelijk aan','procent'],
 da:['Beregning:','Resultat:','plus','minus','gange','divideret med','er lig med','procent'],
 fi:['Laskutoimitus:','Tulos:','plus','miinus','kertaa','jaettuna','on yhtä kuin','prosenttia'],
 sv:['Beräkning:','Resultat:','plus','minus','gånger','delat med','är lika med','procent'],
 pl:['Obliczenie:','Wynik:','plus','minus','razy','podzielone przez','równa się','procent'],
 tr:['Hesaplama:','Sonuç:','artı','eksi','çarpı','bölü','eşittir','yüzde'],
 el:['Υπολογισμός:','Αποτέλεσμα:','συν','μείον','επί','διά','ίσον','τοις εκατό'],
 ar:['الحساب:','النتيجة:','زائد','ناقص','ضرب','مقسوم على','يساوي','بالمئة'],
 he:['חישוב:','תוצאה:','ועוד','פחות','כפול','חלקי','שווה','אחוז'],
 ja:['計算：','結果：','たす','ひく','かける','わる','イコール','パーセント'],
 ko:['계산:','결과:','더하기','빼기','곱하기','나누기','는','퍼센트'],
 zh:['计算：','结果：','加','减','乘','除以','等于','百分之'],
}
const frenchDigits=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf','vingt']
export function spokenMath(text:string,locale:string):string {
 const value=text.trim().replace(/[.!?]$/,'')
 if(!/^[\d\s.,+\-−×*÷/=()%]+$/.test(value)||!/[\d]/.test(value))return text
 const formula=/[+\-−×*÷=]|\s\/\s/.test(value)
 if(!formula&&!/^\d+(?:[.,]\d+)?%?$/.test(value))return text
 const language=locale.toLowerCase().split('-')[0],words=mathWords[language]
 if(!words)return text
 const operators:Record<string,string>={'+':words[2],'-':words[3],'−':words[3],'×':words[4],'*':words[4],'÷':words[5],'/':words[5],'=':words[6],'%':words[7]}
 let spoken=value.replace(/[+\-−×*÷/=%]/g,symbol=>` ${operators[symbol]} `)
 if(language==='fr')spoken=spoken.replace(/\d+(?:[.,]\d+)?/g,digits=>/^\d+$/.test(digits)?frenchDigits[Number(digits)]??digits:digits)
 return `${words[formula?0:1]} ${spoken.replace(/\s+/g,' ').trim()}.`
}
