# NTPSearch

Az eddigiek alapján tehát készítsétek el a következő feladatokat:
A weboldal egy játék-kereső legyen, ahol a keresett név-részleteket be lehet írni valahova, és az oldal kilistáz minden megtalált játékot.1000|2 pont
A találatok kerüljenek be egy listába, amiből később ki lehet majd választani egy elemet.1000|2 pont
A lista egy elemét kiválasztva, annak az adatait a játék-adatokat lekérő kéréssel kérje le és gyűjtse ki az oldal.100 0000|2 pont
  Minden korábban említett adat strukturált, áttekinthető formában jelenjen meg az oldalon úgy, hogy a találatok listája nem tűnik el.
  A megjelenítés legyen szebb, mint egy egyszerű szöveg, pl. látszódjon a kép, az értékelés lehet valami csillagos skála, stb.
Az oldalon legyen egy olyan rész is, ahol egy felhasználó gyűjteményét lehet megnézni.10 0000|2 pont
  A szűréshez lehessen megadni egy felhasználónevet szövegként, kiválasztani listából a szűrés típusát (vagy semmit),
  valamint hogy a 0 vagy az 1 értékekre szűrjünk. A szűrés típusához nem kell az összes lehetőséget kezelni, elég az API által felsorolt első 8-at (a wishlist-ig).
  Ha a teszteléshez több felhasználónév is kell, akkor itt lehet keresni.
A weboldal kezelje le azt, ha a választ nem kapja meg egyből a szervertől.100 0000|2 pont
  Ilyen esetben nem szabad a korábban mutatott kicsi XML-t válaszként feldolgozni, hiszen az csak türelemre int.
  Ekkor a böngészőnek várnia kell egy kicsit, és 5 másodperc múlva újra elküldeni a kérést abban a reményben, hogy ezúttal rendes választ kap.
  A próbálkozást csak akkor szabad abbahagyni, ha már 4 egymás után próba is után sincs rendes válasz.
  Ekkor ki kell jelezni, hogy a szerver nem tudott időben választ adni a kérdésre.
Összesen 1011 0000|2 pont